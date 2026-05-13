import type {
  DamagePacket,
  DefenseProfile,
  CombatResult,
  DamageType,
  StatusEffect,
} from "../../types/combat";
import { clamp, productOf, sumOf } from "../utils/mathHelpers";
import { BALANCE } from "../../constants/gameBalance";

// ─── MAIN ENTRY POINT ───────────────────────────────────────────────────────

export function resolveDamage(
  packet: DamagePacket,
  defense: DefenseProfile,
  random: () => number = Math.random
): CombatResult {
  // DoT path: skip stages 4 and 5
  if (packet.isDoT) {
    return resolveDoTDamage(packet, defense);
  }

  // Stage 1 — Base Construction
  const base = buildBase(packet);

  // Stage 2 — Type Conversion
  const { primaryDmg, convertedDmg, convertedType } = convertDamage(base, packet);

  // Stage 3 — Offensive Scaling (run once per damage portion)
  const scaledPrimary = scaleOffensive(primaryDmg, packet);
  const scaledConverted = convertedDmg > 0 ? scaleOffensive(convertedDmg, packet) : 0;

  const scaledTotal = scaledPrimary + scaledConverted;

  // Stage 4 — Crit Resolution
  const { afterCrit, isCrit } = resolveCrit(scaledTotal, packet, random);

  // Stage 5 — Hit Outcome
  const hitResult = resolveHitOutcome(defense, random);
  if (!hitResult.isHit) {
    return buildMissResult(hitResult.isDodge);
  }

  // Stage 6 — Defense Mitigation
  // Primary portion uses its own armor/resist bucket
  const mitigatedPrimary = applyDefenses(
    afterCrit * (scaledPrimary / scaledTotal),
    packet.damageType,
    defense
  );
  // Converted portion uses converted type's resist bucket
  const mitigatedConverted =
    convertedDmg > 0 && convertedType != null
      ? applyDefenses(
          afterCrit * (scaledConverted / scaledTotal),
          convertedType,
          defense
        )
      : 0;

  const totalMitigated = mitigatedPrimary + mitigatedConverted;

  // Apply to Barrier → HP
  const { barrierDamage, hpDamage } = applyToResources(totalMitigated, defense, packet);

  // Status procs (fire after damage is confirmed)
  const statusProcs = resolveStatusProcs(packet, random);

  // Lifesteal (% of damage dealt to HP)
  const lifeStealAmount = hpDamage * (packet.lifeStealPercent ?? 0);

  return {
    missed: false,
    dodged: false,
    isCrit,
    rawDamage: afterCrit,
    mitigatedDamage: totalMitigated,
    barrierDamage,
    hpDamage,
    statusProcs,
    lifeStealAmount,
  };
}


// ─── STAGE 1: BASE CONSTRUCTION ─────────────────────────────────────────────

export function buildBase(packet: DamagePacket): number {
  return packet.skillCoef * packet.sourceDamage + (packet.flatDamage ?? 0);
}


// ─── STAGE 2: TYPE CONVERSION ────────────────────────────────────────────────

export function convertDamage(
  base: number,
  packet: DamagePacket
): { primaryDmg: number; convertedDmg: number; convertedType?: DamageType } {
  const conv = clamp(packet.conversionPercent ?? 0, 0, 1);
  if (conv === 0 || !packet.convertToType) {
    return { primaryDmg: base, convertedDmg: 0 };
  }
  return {
    primaryDmg: base * (1 - conv),
    convertedDmg: base * conv,
    convertedType: packet.convertToType,
  };
}


// ─── STAGE 3: OFFENSIVE SCALING ──────────────────────────────────────────────

export function scaleOffensive(damage: number, packet: DamagePacket): number {
  // ADDITIVE bucket: all % increases sum first, then apply once
  const additiveFactor = 1 + sumOf(packet.additiveIncreases);

  // MULTIPLICATIVE bucket: each amplifier applies independently
  const multiplicativeFactor = productOf(
    packet.multiplicativeAmplifiers.map((a) => 1 + a)
  );

  return damage * additiveFactor * multiplicativeFactor;
}


// ─── STAGE 4: CRIT RESOLUTION ────────────────────────────────────────────────

export function resolveCrit(
  scaledDamage: number,
  packet: DamagePacket,
  random: () => number
): { afterCrit: number; isCrit: boolean } {
  const critChance = clamp(packet.critChance, 0, 1);
  const critMulti = clamp(1 + packet.critBonus, 1, BALANCE.CRIT_DAMAGE_CAP);

  const isCrit = random() < critChance;
  return {
    afterCrit: isCrit ? scaledDamage * critMulti : scaledDamage,
    isCrit,
  };
}


// ─── STAGE 5: HIT OUTCOME ────────────────────────────────────────────────────

export function resolveHitOutcome(
  defense: DefenseProfile,
  random: () => number
): { isHit: boolean; isDodge: boolean } {
  const dodge = clamp(defense.dodgeChance, 0, 0.80);
  if (random() < dodge) {
    return { isHit: false, isDodge: true };
  }
  return { isHit: true, isDodge: false };
}


// ─── STAGE 6: DEFENSE MITIGATION ─────────────────────────────────────────────

export function applyDefenses(
  damage: number,
  damageType: DamageType,
  defense: DefenseProfile
): number {
  let d = damage;

  // Physical portion → Armor mitigation
  if (damageType === "Physical") {
    const armorMit = clamp(defense.armor, 0, BALANCE.ARMOR_MITIGATION_CAP);
    d *= 1 - armorMit;
  }

  // Elemental portion → Resistance mitigation
  if (damageType !== "Physical" && damageType !== "Chaos") {
    const resMit = clamp(
      defense.elementalResistances[damageType] ?? 0,
      0,
      BALANCE.RESISTANCE_CAP
    );
    d *= 1 - resMit;
  }

  // Chaos / True damage: bypasses armor AND elemental resist entirely

  // Additive DamageTaken decreases
  const dtFactor = 1 - clamp(sumOf(defense.damageTakenDecrease), 0, 0.80);
  d *= dtFactor;

  // Multiplicative dampening
  d *= productOf(defense.dampening.map((x) => 1 - x));

  return Math.max(0, Math.floor(d));
}


// ─── STAGE 6 CONTINUED: APPLY TO RESOURCES ───────────────────────────────────

export function applyToResources(
  damage: number,
  defense: DefenseProfile,
  packet: DamagePacket
): { barrierDamage: number; hpDamage: number } {
  if (packet.bypassShield || defense.barrierCurrent <= 0) {
    return { barrierDamage: 0, hpDamage: damage };
  }

  const barrierAbsorbed = Math.min(damage, defense.barrierCurrent);
  const remainder = damage - barrierAbsorbed;
  return { barrierDamage: barrierAbsorbed, hpDamage: remainder };
}


// ─── DOT PATH ────────────────────────────────────────────────────────────────

function resolveDoTDamage(
  packet: DamagePacket,
  defense: DefenseProfile
): CombatResult {
  // DoT skips: Stage 4 (crit), Stage 5 (hit/dodge)
  const base = buildBase(packet);
  const { primaryDmg } = convertDamage(base, packet);
  const scaled = scaleOffensive(primaryDmg, packet);

  // DoT-specific defense (Bleed bypasses armor; Poison bypasses armor partially)
  let mitigated = scaled;
  if (!packet.bypassArmor) {
    const armorMit = clamp(defense.armor, 0, BALANCE.ARMOR_MITIGATION_CAP);
    mitigated *= 1 - armorMit;
  }
  if (packet.damageType !== "Physical" && packet.damageType !== "Chaos") {
    const resMit = clamp(
      defense.elementalResistances[packet.damageType] ?? 0,
      0,
      BALANCE.RESISTANCE_CAP
    );
    mitigated *= 1 - resMit;
  }

  const final = Math.max(0, Math.floor(mitigated));
  // DamageTakenDecrease and dampening apply to DoTs as well
  let finalWithReductions = final;
  const dtFactor = 1 - clamp(sumOf(defense.damageTakenDecrease), 0, 0.80);
  finalWithReductions = Math.max(0, Math.floor(finalWithReductions * dtFactor));
  finalWithReductions = Math.max(
    0,
    Math.floor(finalWithReductions * productOf(defense.dampening.map((x) => 1 - x)))
  );
  const { barrierDamage, hpDamage } = applyToResources(finalWithReductions, defense, packet);

  return {
    missed: false,
    dodged: false,
    isCrit: false,
    rawDamage: scaled,
    mitigatedDamage: finalWithReductions,
    barrierDamage,
    hpDamage,
    statusProcs: [],
    lifeStealAmount: 0,
  };
}


// ─── HELPERS ─────────────────────────────────────────────────────────────────

function resolveStatusProcs(
  packet: DamagePacket,
  random: () => number
): StatusEffect[] {
  const procs: StatusEffect[] = [];
  if (!packet.statusProcChances) return procs;
  for (const [status, chance] of Object.entries(packet.statusProcChances)) {
    if (random() < (chance as number)) {
      procs.push(status as StatusEffect);
    }
  }
  return procs;
}

function buildMissResult(isDodge: boolean): CombatResult {
  return {
    missed: !isDodge,
    dodged: isDodge,
    isCrit: false,
    rawDamage: 0,
    mitigatedDamage: 0,
    barrierDamage: 0,
    hpDamage: 0,
    statusProcs: [],
    lifeStealAmount: 0,
  };
}

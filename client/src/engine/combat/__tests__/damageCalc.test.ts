import { describe, it, expect } from "vitest";
import { resolveDamage } from "../damageCalc";
import { tickDoT, applyDoT, ActiveDoT } from "../dotEngine";
import type { DamagePacket, DefenseProfile } from "../../../types/combat";

// Deterministic random factories
const makeRandom = (...vals: number[]) => {
  let i = 0;
  return () => vals[i++];
};

const baseDefense: DefenseProfile = {
  armor: 0.15,
  elementalResistances: {
    Physical: 0,
    Fire: 0.25,
    Cold: 0,
    Lightning: 0,
    Poison: 0,
    Bleed: 0,
    Holy: 0,
    Chaos: 0,
  },
  dodgeChance: 0.08,
  barrierCurrent: 0,
  barrierMax: 0,
  hpCurrent: 200,
  hpMax: 200,
  damageTakenDecrease: [],
  dampening: [],
};

const basePacket: DamagePacket = {
  skillId: "test_slash",
  skillCoef: 1.4,
  sourceDamage: 38,
  flatDamage: 5,
  damageType: "Physical",
  deliveryMode: "Strike",
  conversionPercent: 0,
  additiveIncreases: [],
  multiplicativeAmplifiers: [],
  critChance: 0.05,
  critBonus: 0.5,
  isDoT: false,
  bypassDodge: false,
  bypassArmor: false,
  bypassShield: false,
};

// ─── Vector 1: Early game basic physical strike (no crit, no special) ────────

describe("Vector 1 — Basic physical strike (no crit, hit)", () => {
  it("deals correct HP damage after armor mitigation", () => {
    // random → 0.20 (no crit), 0.10 (hit: dodge = 0.08)
    const result = resolveDamage(basePacket, baseDefense, makeRandom(0.20, 0.10));
    expect(result.isCrit).toBe(false);
    expect(result.dodged).toBe(false);
    expect(result.missed).toBe(false);
    expect(result.hpDamage).toBe(49);
    expect(result.barrierDamage).toBe(0);
  });
});

// ─── Vector 2: Mid game fire skill with additive + multiplicative + crit ─────

describe("Vector 2 — Fire skill with scaling and crit", () => {
  it("applies additive, multiplicative, crit and fire resistance correctly", () => {
    const packet: DamagePacket = {
      skillId: "flame_burst",
      skillCoef: 1.8,
      sourceDamage: 75,
      flatDamage: 20,
      damageType: "Fire",
      deliveryMode: "Strike",
      conversionPercent: 0,
      additiveIncreases: [0.30, 0.15],
      multiplicativeAmplifiers: [0.20],
      critChance: 0.25,
      critBonus: 0.80,
      isDoT: false,
      bypassDodge: false,
      bypassArmor: false,
      bypassShield: false,
    };

    const defense: DefenseProfile = {
      armor: 0.20,
      elementalResistances: {
        Physical: 0,
        Fire: 0.25,
        Cold: 0,
        Lightning: 0,
        Poison: 0,
        Bleed: 0,
        Holy: 0,
        Chaos: 0,
      },
      dodgeChance: 0.10,
      barrierCurrent: 300,
      barrierMax: 300,
      hpCurrent: 1200,
      hpMax: 1200,
      damageTakenDecrease: [],
      dampening: [],
    };

    // random → 0.18 (crit: < 0.25), 0.15 (hit: >= 0.10)
    const result = resolveDamage(packet, defense, makeRandom(0.18, 0.15));
    expect(result.isCrit).toBe(true);
    expect(result.dodged).toBe(false);
    expect(result.mitigatedDamage).toBe(364);
    expect(result.barrierDamage).toBe(300);
    expect(result.hpDamage).toBe(64);
  });
});

// ─── Vector 3: Dodge outcome ──────────────────────────────────────────────────

describe("Vector 3 — Dodge outcome", () => {
  it("returns dodged=true and zero damage when dodge check passes", () => {
    const defense: DefenseProfile = {
      ...baseDefense,
      dodgeChance: 0.10,
    };
    // random → 0.20 (no crit), 0.05 (dodge: 0.05 < 0.10)
    const result = resolveDamage(basePacket, defense, makeRandom(0.20, 0.05));
    expect(result.dodged).toBe(true);
    expect(result.hpDamage).toBe(0);
    expect(result.rawDamage).toBe(0);
  });
});

// ─── Vector 4: Bleed DoT tick (bypasses armor) ───────────────────────────────

describe("Vector 4 — Bleed DoT tick bypasses armor", () => {
  it("deals correct damage ignoring armor and going directly to HP", () => {
    const dotInstance: ActiveDoT = {
      instanceId: "bleed_01",
      type: "Bleed",
      damagePerTick: 30,
      ticksRemaining: 3,
      bypassArmor: true,
      bypassShield: true,
      sourceSkillId: "shadow_slash",
    };

    const defense: DefenseProfile = {
      armor: 0.30,
      elementalResistances: {
        Physical: 0,
        Fire: 0,
        Cold: 0,
        Lightning: 0,
        Poison: 0,
        Bleed: 0,
        Holy: 0,
        Chaos: 0,
      },
      dodgeChance: 0,
      barrierCurrent: 150,
      barrierMax: 150,
      hpCurrent: 500,
      hpMax: 500,
      damageTakenDecrease: [0.10],
      dampening: [],
    };

    const { result, expired } = tickDoT(dotInstance, defense);
    expect(result.barrierDamage).toBe(0);
    expect(result.hpDamage).toBe(27);
    expect(result.mitigatedDamage).toBe(27);
    expect(expired).toBe(false);
    expect(dotInstance.ticksRemaining).toBe(2);
  });
});

// ─── Vector 5: Partial type conversion (Physical → Fire) ─────────────────────

describe("Vector 5 — Partial type conversion (Physical → Fire)", () => {
  it("splits damage correctly between physical and fire portions", () => {
    const packet: DamagePacket = {
      skillId: "infused_slash",
      skillCoef: 1.5,
      sourceDamage: 60,
      flatDamage: 0,
      damageType: "Physical",
      deliveryMode: "Strike",
      conversionPercent: 0.50,
      convertToType: "Fire",
      additiveIncreases: [0.20],
      multiplicativeAmplifiers: [],
      critChance: 0.10,
      critBonus: 0.50,
      isDoT: false,
      bypassDodge: false,
      bypassArmor: false,
      bypassShield: false,
    };

    const defense: DefenseProfile = {
      armor: 0.35,
      elementalResistances: {
        Physical: 0,
        Fire: 0.10,
        Cold: 0,
        Lightning: 0,
        Poison: 0,
        Bleed: 0,
        Holy: 0,
        Chaos: 0,
      },
      dodgeChance: 0.10,
      barrierCurrent: 0,
      barrierMax: 0,
      hpCurrent: 800,
      hpMax: 800,
      damageTakenDecrease: [],
      dampening: [],
    };

    // random → 0.50 (no crit), 0.30 (hit: >= 0.10)
    const result = resolveDamage(packet, defense, makeRandom(0.50, 0.30));
    expect(result.isCrit).toBe(false);
    expect(result.dodged).toBe(false);
    expect(result.mitigatedDamage).toBe(83);
    expect(result.barrierDamage).toBe(0);
    expect(result.hpDamage).toBe(83);
  });
});

// ─── DoT stacking rules ───────────────────────────────────────────────────────

describe("DoT stacking rules", () => {
  it("stacks Poison independently", () => {
    const poison1: ActiveDoT = {
      instanceId: "p1",
      type: "Poison",
      damagePerTick: 10,
      ticksRemaining: 4,
      bypassArmor: true,
      bypassShield: false,
      sourceSkillId: "s1",
    };
    const poison2: ActiveDoT = {
      instanceId: "p2",
      type: "Poison",
      damagePerTick: 15,
      ticksRemaining: 4,
      bypassArmor: true,
      bypassShield: false,
      sourceSkillId: "s1",
    };
    const result = applyDoT([poison1], poison2);
    expect(result).toHaveLength(2);
  });

  it("replaces Bleed with stronger instance", () => {
    const bleed1: ActiveDoT = {
      instanceId: "b1",
      type: "Bleed",
      damagePerTick: 20,
      ticksRemaining: 4,
      bypassArmor: true,
      bypassShield: true,
      sourceSkillId: "s1",
    };
    const bleed2: ActiveDoT = {
      instanceId: "b2",
      type: "Bleed",
      damagePerTick: 30,
      ticksRemaining: 4,
      bypassArmor: true,
      bypassShield: true,
      sourceSkillId: "s1",
    };
    const result = applyDoT([bleed1], bleed2);
    expect(result).toHaveLength(1);
    expect(result[0].damagePerTick).toBe(30);
  });

  it("keeps existing Bleed if it is stronger", () => {
    const bleed1: ActiveDoT = {
      instanceId: "b1",
      type: "Bleed",
      damagePerTick: 40,
      ticksRemaining: 4,
      bypassArmor: true,
      bypassShield: true,
      sourceSkillId: "s1",
    };
    const bleed2: ActiveDoT = {
      instanceId: "b2",
      type: "Bleed",
      damagePerTick: 20,
      ticksRemaining: 4,
      bypassArmor: true,
      bypassShield: true,
      sourceSkillId: "s1",
    };
    const result = applyDoT([bleed1], bleed2);
    expect(result).toHaveLength(1);
    expect(result[0].damagePerTick).toBe(40);
  });
});

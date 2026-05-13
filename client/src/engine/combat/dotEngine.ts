import { DoTInstance, DefenseProfile, CombatResult } from "../../types/combat";
import { resolveDamage } from "./damageCalc";

export interface ActiveDoT extends DoTInstance {
  instanceId: string;
}

/**
 * Called once per combat tick for every active DoT on a target.
 * Returns the tick result and decrements ticksRemaining.
 */
export function tickDoT(
  dot: ActiveDoT,
  defense: DefenseProfile
): { result: CombatResult; expired: boolean } {
  const packet = {
    skillId: dot.sourceSkillId,
    skillCoef: 1.0,
    sourceDamage: dot.damagePerTick,
    flatDamage: 0,
    damageType: dot.type,
    deliveryMode: "DoT" as const,
    additiveIncreases: [],
    multiplicativeAmplifiers: [],
    critChance: 0,
    critBonus: 0,
    isDoT: true,
    bypassDodge: true,
    bypassArmor: dot.bypassArmor,
    bypassShield: dot.bypassShield,
  };

  const result = resolveDamage(packet, defense);
  dot.ticksRemaining -= 1;

  return { result, expired: dot.ticksRemaining <= 0 };
}

/**
 * Stacking rule: Poison stacks independently (multiple instances allowed).
 * Bleed refreshes duration if new application is higher damage.
 * Burn replaces if new application deals more per tick.
 */
export function applyDoT(existing: ActiveDoT[], incoming: ActiveDoT): ActiveDoT[] {
  if (incoming.type === "Poison") {
    // Poison stacks — always add new instance
    return [...existing, incoming];
  }
  const same = existing.filter((d) => d.type === incoming.type);
  const others = existing.filter((d) => d.type !== incoming.type);
  if (same.length === 0) return [...existing, incoming];

  // Bleed / Burn: keep strongest instance, refresh ticks if new is stronger
  const strongest = same.reduce((a, b) =>
    a.damagePerTick >= b.damagePerTick ? a : b
  );
  if (incoming.damagePerTick >= strongest.damagePerTick) {
    return [...others, incoming];
  }
  return existing;
}

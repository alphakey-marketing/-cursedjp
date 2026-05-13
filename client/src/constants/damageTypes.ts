import type { DamageType } from "../types/combat";

export const DAMAGE_TYPES: DamageType[] = [
  "Physical",
  "Fire",
  "Cold",
  "Lightning",
  "Poison",
  "Bleed",
  "Holy",
  "Chaos",
];

export const ELEMENTAL_DAMAGE_TYPES: DamageType[] = [
  "Fire",
  "Cold",
  "Lightning",
  "Poison",
  "Holy",
];

export const DEFAULT_ELEMENTAL_RESISTANCES: Record<DamageType, number> = {
  Physical: 0,
  Fire: 0,
  Cold: 0,
  Lightning: 0,
  Poison: 0,
  Bleed: 0,
  Holy: 0,
  Chaos: 0,
};

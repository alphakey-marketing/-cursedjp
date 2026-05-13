import type { DamageType } from "./combat";
import type { ItemSlot, AnyItem } from "./item";
import type { EquippedSkillSlot, AnyRune } from "./rune";
import type { PassiveWebState } from "./passive";

export interface CharacterStats {
  // Core attributes
  strength: number;
  dexterity: number;
  intelligence: number;

  // Offensive
  baseAttackMin: number;
  baseAttackMax: number;
  attackSpeed: number;
  critChance: number;
  critBonus: number;
  additiveIncreases: number;
  multiplicativeAmplifiers: number[];

  // Defensive
  maxHP: number;
  currentHP: number;
  maxBarrier: number;
  currentBarrier: number;
  armor: number;
  dodgeChance: number;
  elementalResistances: Record<DamageType, number>;

  // Resources
  maxResource: number;
  currentResource: number;
  resourceRegen: number;

  // Progression
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  originCosmetic: string;
  stats: CharacterStats;
  equippedItems: Partial<Record<ItemSlot, AnyItem>>;
  skillSlots: EquippedSkillSlot[];
  passiveWeb: PassiveWebState;
  inventory: AnyItem[];
  runeInventory: AnyRune[];
  currency: {
    gold: number;
    runeDust: number;
    essences: Record<string, number>;
  };
}

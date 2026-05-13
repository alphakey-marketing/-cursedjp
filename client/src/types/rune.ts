import type { DamageType, DeliveryMode } from "./combat";
import type { WeaponFamily } from "./item";

export type RuneCategory = "Skill" | "Link" | "Support";

export interface SkillRune {
  id: string;
  name: string;
  category: "Skill";
  damageType: DamageType;
  deliveryMode: DeliveryMode;
  skillCoef: number;
  baseCooldown: number;
  resourceCost: number;
  maxSupportLinks: number;
  weaponFamilyRestriction?: WeaponFamily[];
  tags: string[];
  description: string;
  iconId: string;
  dropSourceIds: string[];
}

export interface LinkRune {
  id: string;
  name: string;
  category: "Link" | "Support";
  modifiesTag?: string;
  effectType:
    | "AddedDamage"
    | "IncreasedAoE"
    | "AddedDoT"
    | "ConvertDamage"
    | "OnHitEffect"
    | "CooldownReduction"
    | "ResourceLeech"
    | "ExtraProjectile"
    | "BurstMultiplier";
  params: Record<string, number | string>;
  dropSourceIds: string[];
  iconId: string;
  description: string;
}

export type AnyRune = SkillRune | LinkRune;

export interface EquippedSkillSlot {
  slotIndex: number;
  skillRuneId: string | null;
  linkRuneIds: string[];
}

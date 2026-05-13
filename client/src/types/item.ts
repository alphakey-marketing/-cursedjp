import { DamageType } from "./combat";

export type ItemGrade = "Normal" | "Magic" | "Rare" | "Legendary" | "Unique" | "Holy";
export type ItemSlot =
  | "Weapon"
  | "OffHand"
  | "Helmet"
  | "Chest"
  | "Gloves"
  | "Boots"
  | "Ring1"
  | "Ring2"
  | "Amulet"
  | "Charm";
export type WeaponFamily =
  | "Katana"
  | "Nodachi"
  | "Tanto"
  | "Naginata"
  | "Yumi"
  | "Staff"
  | "Ofuda";
export type DefenseStat = "Armor" | "Dodge" | "Barrier";

export interface AffixDefinition {
  id: string;
  label: string;
  bucket: "Additive" | "Multiplicative" | "Utility" | "Exclusive";
  statKey: string;
  minValue: number;
  maxValue: number;
  allowedGrades: ItemGrade[];
  allowedSlots?: ItemSlot[];
  allowedWeaponFamilies?: WeaponFamily[];
  damageTypeTag?: DamageType;
}

export interface ItemAffix {
  affixId: string;
  value: number;
  tier: number;
}

export interface RuneSocket {
  socketIndex: number;
  linkedRuneId: string | null;
  socketType: "Skill" | "Link";
}

export interface BaseItem {
  instanceId: string;
  templateId: string;
  name: string;
  slot: ItemSlot;
  grade: ItemGrade;
  itemLevel: number;
  quality: number;
  prefixes: ItemAffix[];
  suffixes: ItemAffix[];
  sockets: RuneSocket[];
  isIdentified: boolean;
  isCursed: boolean;
  isLocked: boolean;
}

export interface WeaponItem extends BaseItem {
  slot: "Weapon";
  weaponFamily: WeaponFamily;
  baseDamageMin: number;
  baseDamageMax: number;
  attackSpeed: number;
  critBaseChance: number;
  exclusiveRuneIds: string[];
}

export interface ArmorItem extends BaseItem {
  primaryDefenseStat: DefenseStat;
  baseDefenseValue: number;
  attributeRequirement: {
    Strength?: number;
    Dexterity?: number;
    Intelligence?: number;
  };
}

export type AnyItem = WeaponItem | ArmorItem | BaseItem;

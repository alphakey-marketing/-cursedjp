export type DamageType =
  | "Physical"
  | "Fire"
  | "Cold"
  | "Lightning"
  | "Poison"
  | "Bleed"
  | "Holy"
  | "Chaos";

export type DeliveryMode = "Strike" | "Projectile" | "DoT" | "AoE";

export type StatusEffect =
  | "Burn"
  | "Chill"
  | "Freeze"
  | "Shock"
  | "Stun"
  | "Poison"
  | "Bleed"
  | "Blind"
  | "Slow"
  | "Weaken";

export interface DamagePacket {
  skillId: string;
  skillCoef: number;
  sourceDamage: number;
  flatDamage: number;
  damageType: DamageType;
  deliveryMode: DeliveryMode;
  conversionPercent?: number;
  convertToType?: DamageType;
  additiveIncreases: number[];
  multiplicativeAmplifiers: number[];
  critChance: number;
  critBonus: number;
  isDoT: boolean;
  bypassDodge: boolean;
  bypassArmor: boolean;
  bypassShield: boolean;
  statusProcChances?: Partial<Record<StatusEffect, number>>;
  lifeStealPercent?: number;
}

export interface DefenseProfile {
  armor: number;
  elementalResistances: Record<DamageType, number>;
  dodgeChance: number;
  barrierCurrent: number;
  barrierMax: number;
  hpCurrent: number;
  hpMax: number;
  damageTakenDecrease: number[];
  dampening: number[];
}

export interface CombatResult {
  missed: boolean;
  dodged: boolean;
  isCrit: boolean;
  rawDamage: number;
  mitigatedDamage: number;
  barrierDamage: number;
  hpDamage: number;
  statusProcs: StatusEffect[];
  lifeStealAmount: number;
}

export interface DoTInstance {
  type: DamageType;
  damagePerTick: number;
  ticksRemaining: number;
  bypassArmor: boolean;
  bypassShield: boolean;
  sourceSkillId: string;
}

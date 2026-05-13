import { DamageType, StatusEffect, DefenseProfile, DamagePacket } from "./combat";
import { CharacterStats } from "./character";

export interface EnemyTemplate {
  id: string;
  name: string;
  tier: "Common" | "Elite" | "Miniboss" | "Boss";
  regionIds: string[];
  level: number;
  baseHP: number;
  defenseProfile: Omit<DefenseProfile, "hpCurrent" | "barrierCurrent">;
  attackDamageMin: number;
  attackDamageMax: number;
  attackSpeed: number;
  damageType: DamageType;
  statusProcChance: Partial<Record<StatusEffect, number>>;
  expReward: number;
  dropTableId: string;
  spriteId: string;
}

export interface BossTemplate extends EnemyTemplate {
  tier: "Boss";
  phases: BossPhase[];
  telegraphAttacks: TelegraphAttack[];
  signatureDrops: SignatureDrop[];
  lootTableId: string;
}

export interface BossPhase {
  phaseIndex: number;
  hpThreshold: number;
  behaviorModifier: string;
  statMultipliers: Partial<CharacterStats>;
}

export interface TelegraphAttack {
  id: string;
  name: string;
  warningDurationTicks: number;
  damagePacket: Partial<DamagePacket>;
  description: string;
}

export interface SignatureDrop {
  runeId?: string;
  itemTemplateId?: string;
  dropChance: number;
  isGuaranteedFirstKill: boolean;
}

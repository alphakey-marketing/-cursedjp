import type { CharacterStats } from "./character";

export type PassiveNodeType = "StatNode" | "Keystone" | "SkillCluster" | "NotableNode";

export interface PassiveNodeDefinition {
  id: string;
  label: string;
  type: PassiveNodeType;
  position: { x: number; y: number };
  connectedNodeIds: string[];
  cost: number;
  stats?: Partial<CharacterStats>;
  keystoneEffect?: string;
  requiredNodeIds?: string[];
}

export interface PassiveWebState {
  allocatedNodeIds: string[];
  totalPointsSpent: number;
  totalPointsAvailable: number;
}

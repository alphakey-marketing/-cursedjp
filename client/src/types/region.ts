export type NodeType = "EnemyCamp" | "Shrine" | "Miniboss" | "BossArena" | "Passage" | "Event";

export interface MapNode {
  id: string;
  regionId: string;
  label: string;
  type: NodeType;
  position: { x: number; y: number };
  connectedNodeIds: string[];
  enemyIds?: string[];
  bossId?: string;
  recommendedPower: number;
  isDiscovered: boolean;
  isCleared: boolean;
}

export interface Region {
  id: string;
  name: string;
  theme: string;
  chapterId: string;
  nodes: MapNode[];
  ambientEnemyPool: string[];
  offlineRateMultiplier: number;
  backgroundAssetId: string;
}

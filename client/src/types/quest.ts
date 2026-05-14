export type QuestType = 'chapter' | 'side' | 'daily';
export type QuestStatus = 'locked' | 'active' | 'completed';
export type QuestObjectiveType = 'kill_enemy' | 'kill_boss' | 'acquire_item' | 'equip_rune' | 'clear_node' | 'reach_level';

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  description: string;
  targetId?: string;       // enemyId, bossId, itemTemplateId, runeId, nodeId
  targetCount: number;
  currentCount: number;    // tracked in store
}

export interface QuestReward {
  gold?: number;
  craftingMaterials?: Array<{ name: string; qty: number }>;
  runeId?: string;           // guaranteed rune unlock
  passiveRespecPoints?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  chapterId?: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  reward: QuestReward;
  unlockCondition?: string;  // e.g. 'chapter_1_complete', always active if omitted
}

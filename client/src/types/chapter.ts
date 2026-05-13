export interface ChapterDialogue {
  dialogueId: string;
  speakerName: string;
  speakerPortraitId: string;
  lines: string[];
  triggerCondition: "ChapterStart" | "BossKill" | "RegionDiscover" | "Custom";
}

export interface Chapter {
  id: string;
  index: number;
  title: string;
  regionIds: string[];
  chapterBossId: string;
  unlockCondition: {
    requiredChapterId?: string;
    requiredLevel?: number;
  };
  dialogues: ChapterDialogue[];
  isCompleted: boolean;
}

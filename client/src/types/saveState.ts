import type { PlayerCharacter } from "./character";

export interface SaveState {
  version: string;
  savedAt: number;
  player: PlayerCharacter;
  mapProgress: {
    discoveredNodeIds: string[];
    clearedNodeIds: string[];
    currentRegionId: string;
    currentNodeId: string;
  };
  chapterProgress: {
    completedChapterIds: string[];
    killedBossIds: string[];
    unlockedDialogueIds: string[];
  };
  offlineData: {
    lastOnlineTimestamp: number;
    pendingExp: number;
    pendingMaterials: Record<string, number>;
  };
  settings: {
    autoFarmEnabled: boolean;
    battleSpeed: number;
    sfxVolume: number;
    bgmVolume: number;
  };
}

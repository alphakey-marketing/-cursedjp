import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChapterStore {
  completedChapterIds: string[];
  killedBossIds: string[];
  unlockedDialogueIds: string[];

  completeChapter: (chapterId: string) => void;
  recordBossKill: (bossId: string) => void;
  unlockDialogue: (dialogueId: string) => void;
  isChapterCompleted: (chapterId: string) => boolean;
  isBossKilled: (bossId: string) => boolean;
  isDialogueUnlocked: (dialogueId: string) => boolean;
}

export const useChapterStore = create<ChapterStore>()(
  persist(
    (set, get) => ({
      completedChapterIds: [],
      killedBossIds: [],
      unlockedDialogueIds: [],

      completeChapter: (chapterId) =>
        set((state) => {
          if (state.completedChapterIds.includes(chapterId)) return state;
          return {
            completedChapterIds: [...state.completedChapterIds, chapterId],
          };
        }),

      recordBossKill: (bossId) =>
        set((state) => {
          if (state.killedBossIds.includes(bossId)) return state;
          return { killedBossIds: [...state.killedBossIds, bossId] };
        }),

      unlockDialogue: (dialogueId) =>
        set((state) => {
          if (state.unlockedDialogueIds.includes(dialogueId)) return state;
          return {
            unlockedDialogueIds: [...state.unlockedDialogueIds, dialogueId],
          };
        }),

      isChapterCompleted: (chapterId) =>
        get().completedChapterIds.includes(chapterId),

      isBossKilled: (bossId) => get().killedBossIds.includes(bossId),

      isDialogueUnlocked: (dialogueId) =>
        get().unlockedDialogueIds.includes(dialogueId),
    }),
    { name: "cursed-japan-chapters" }
  )
);

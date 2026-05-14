import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Quest, QuestObjectiveType } from '../types/quest'

interface QuestStore {
  quests: Quest[]
  claimedQuestIds: string[]

  loadQuests: (quests: Quest[]) => void
  updateKillCount: (enemyId: string, count?: number) => void
  updateBossKill: (bossId: string) => void
  updateItemAcquired: (targetId: string, qty?: number) => void
  updateRuneEquipped: (runeId: string) => void
  updateNodeCleared: (nodeId: string) => void
  updateLevelReached: (level: number) => void
  completeQuest: (questId: string) => void
  claimReward: (questId: string) => Quest | null
  unlockQuestsForCondition: (condition: string) => void
}

function advanceObjective(
  quests: Quest[],
  objectiveType: QuestObjectiveType,
  targetId: string | undefined,
  increment: number
): Quest[] {
  return quests.map((quest) => {
    if (quest.status !== 'active') return quest
    const updatedObjectives = quest.objectives.map((obj) => {
      if (obj.type !== objectiveType) return obj
      if (targetId !== undefined && obj.targetId !== targetId) return obj
      const newCount = Math.min(obj.currentCount + increment, obj.targetCount)
      return { ...obj, currentCount: newCount }
    })
    const allDone = updatedObjectives.every((o) => o.currentCount >= o.targetCount)
    return {
      ...quest,
      objectives: updatedObjectives,
      status: allDone ? ('completed' as const) : quest.status,
    }
  })
}

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      quests: [],
      claimedQuestIds: [],

      loadQuests: (quests) => {
        const existing = get().quests
        if (existing.length === 0) {
          set({ quests })
        } else {
          // Merge: preserve runtime progress for existing quests, add new ones
          const existingIds = new Set(existing.map((q) => q.id))
          const incoming = quests.filter((q) => !existingIds.has(q.id))
          set({ quests: [...existing, ...incoming] })
        }
      },

      updateKillCount: (enemyId, count = 1) =>
        set((state) => ({
          quests: advanceObjective(state.quests, 'kill_enemy', enemyId, count),
        })),

      updateBossKill: (bossId) =>
        set((state) => ({
          quests: advanceObjective(state.quests, 'kill_boss', bossId, 1),
        })),

      updateItemAcquired: (targetId, qty = 1) =>
        set((state) => ({
          quests: advanceObjective(state.quests, 'acquire_item', targetId, qty),
        })),

      updateRuneEquipped: (runeId) =>
        set((state) => {
          // equip_rune objectives with a specific targetId match on runeId;
          // objectives without targetId (e.g. "acquire any 3 runes") increment freely
          let updated = advanceObjective(state.quests, 'equip_rune', runeId, 1)
          updated = advanceObjective(updated, 'equip_rune', undefined, 1)
          return { quests: updated }
        }),

      updateNodeCleared: (nodeId) =>
        set((state) => {
          // Advance objectives that match a specific nodeId AND wildcard objectives (no targetId)
          let updated = advanceObjective(state.quests, 'clear_node', nodeId, 1)
          updated = advanceObjective(updated, 'clear_node', undefined, 1)
          return { quests: updated }
        }),

      updateLevelReached: (level) =>
        set((state) => ({
          quests: state.quests.map((quest) => {
            if (quest.status !== 'active') return quest
            const updatedObjectives = quest.objectives.map((obj) => {
              if (obj.type !== 'reach_level') return obj
              // reach_level objectives complete when currentCount reaches targetCount
              const target = obj.targetCount
              const newCount = Math.max(obj.currentCount, level >= target ? target : level)
              return { ...obj, currentCount: newCount }
            })
            const allDone = updatedObjectives.every((o) => o.currentCount >= o.targetCount)
            return { ...quest, objectives: updatedObjectives, status: allDone ? ('completed' as const) : quest.status }
          }),
        })),

      completeQuest: (questId) =>
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === questId ? { ...q, status: 'completed' as const } : q
          ),
        })),

      claimReward: (questId) => {
        const quest = get().quests.find((q) => q.id === questId)
        if (!quest || quest.status !== 'completed') return null
        if (get().claimedQuestIds.includes(questId)) return null
        set((state) => ({
          claimedQuestIds: [...state.claimedQuestIds, questId],
        }))
        return quest
      },

      unlockQuestsForCondition: (condition) =>
        set((state) => ({
          quests: state.quests.map((q) =>
            q.status === 'locked' && q.unlockCondition === condition
              ? { ...q, status: 'active' as const }
              : q
          ),
        })),
    }),
    { name: 'cursed-japan-quests' }
  )
)

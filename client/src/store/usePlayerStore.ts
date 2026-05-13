import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CharacterStats, PlayerCharacter } from "../types/character";
import type { ItemSlot, AnyItem } from "../types/item";
import type { EquippedSkillSlot } from "../types/rune";
import { DEFAULT_ELEMENTAL_RESISTANCES } from "../constants/damageTypes";

const DEFAULT_STATS: CharacterStats = {
  strength: 10,
  dexterity: 10,
  intelligence: 10,

  baseAttackMin: 30,
  baseAttackMax: 42,
  attackSpeed: 1.1,
  critChance: 0.05,
  critBonus: 0.5,
  additiveIncreases: 0,
  multiplicativeAmplifiers: [],

  maxHP: 300,
  currentHP: 300,
  maxBarrier: 0,
  currentBarrier: 0,
  armor: 0.10,
  dodgeChance: 0.05,
  elementalResistances: { ...DEFAULT_ELEMENTAL_RESISTANCES },

  maxResource: 100,
  currentResource: 100,
  resourceRegen: 5,

  level: 1,
  experience: 0,
  experienceToNextLevel: 200,
};

const DEFAULT_SKILL_SLOTS: EquippedSkillSlot[] = [
  { slotIndex: 0, skillRuneId: "skill_rune_shadowslash", linkRuneIds: [] },
  { slotIndex: 1, skillRuneId: "skill_rune_stormstep", linkRuneIds: [] },
  { slotIndex: 2, skillRuneId: null, linkRuneIds: [] },
  { slotIndex: 3, skillRuneId: null, linkRuneIds: [] },
];

interface PlayerStore {
  character: PlayerCharacter;
  setCharacter: (character: PlayerCharacter) => void;
  updateStats: (partial: Partial<CharacterStats>) => void;
  takeDamage: (hpDamage: number, barrierDamage: number) => void;
  heal: (amount: number) => void;
  restoreResource: (amount: number) => void;
  spendResource: (amount: number) => boolean;
  gainExp: (amount: number) => void;
  equipItem: (slot: ItemSlot, item: AnyItem) => void;
  unequipItem: (slot: ItemSlot) => void;
  setSkillSlots: (slots: EquippedSkillSlot[]) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  resetToShrine: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      character: {
        id: "player_01",
        name: "Wanderer",
        originCosmetic: "default",
        stats: { ...DEFAULT_STATS },
        equippedItems: {
          Weapon: {
            instanceId: "starter_katana_01",
            templateId: "weapon_starter_katana",
            name: "Iron Katana",
            slot: "Weapon",
            weaponFamily: "Katana",
            grade: "Normal",
            itemLevel: 1,
            quality: 0,
            prefixes: [],
            suffixes: [],
            sockets: [],
            isIdentified: true,
            isCursed: false,
            isLocked: true,
            baseDamageMin: 30,
            baseDamageMax: 42,
            attackSpeed: 1.1,
            critBaseChance: 0.05,
            exclusiveRuneIds: [],
          },
        },
        skillSlots: DEFAULT_SKILL_SLOTS,
        passiveWeb: {
          allocatedNodeIds: ["node_start"],
          totalPointsSpent: 0,
          totalPointsAvailable: 0,
        },
        inventory: [],
        runeInventory: [],
        currency: { gold: 0, runeDust: 0, essences: {} },
      },

      setCharacter: (character) => set({ character }),

      updateStats: (partial) =>
        set((state) => ({
          character: {
            ...state.character,
            stats: { ...state.character.stats, ...partial },
          },
        })),

      takeDamage: (hpDamage, barrierDamage) =>
        set((state) => {
          const stats = state.character.stats;
          const newBarrier = Math.max(0, stats.currentBarrier - barrierDamage);
          const newHP = Math.max(0, stats.currentHP - hpDamage);
          return {
            character: {
              ...state.character,
              stats: { ...stats, currentBarrier: newBarrier, currentHP: newHP },
            },
          };
        }),

      heal: (amount) =>
        set((state) => {
          const stats = state.character.stats;
          const newHP = Math.min(stats.maxHP, stats.currentHP + amount);
          return {
            character: {
              ...state.character,
              stats: { ...stats, currentHP: newHP },
            },
          };
        }),

      restoreResource: (amount) =>
        set((state) => {
          const stats = state.character.stats;
          const newResource = Math.min(stats.maxResource, stats.currentResource + amount);
          return {
            character: {
              ...state.character,
              stats: { ...stats, currentResource: newResource },
            },
          };
        }),

      spendResource: (amount) => {
        const stats = get().character.stats;
        if (stats.currentResource < amount) return false;
        set((state) => ({
          character: {
            ...state.character,
            stats: { ...state.character.stats, currentResource: stats.currentResource - amount },
          },
        }));
        return true;
      },

      gainExp: (amount) =>
        set((state) => {
          const stats = state.character.stats;
          let exp = stats.experience + amount;
          let level = stats.level;
          let expToNext = stats.experienceToNextLevel;

          while (exp >= expToNext) {
            exp -= expToNext;
            level += 1;
            // EXP to next level grows with each level
            expToNext = Math.floor(expToNext * 1.3);
          }

          return {
            character: {
              ...state.character,
              stats: {
                ...stats,
                experience: exp,
                level,
                experienceToNextLevel: expToNext,
                // Grant stat gains on level up
                maxHP: stats.maxHP + (level - stats.level) * 20,
                currentHP: stats.maxHP + (level - stats.level) * 20,
                maxResource: stats.maxResource + (level - stats.level) * 5,
              },
            },
          };
        }),

      equipItem: (slot, item) =>
        set((state) => ({
          character: {
            ...state.character,
            equippedItems: { ...state.character.equippedItems, [slot]: item },
          },
        })),

      unequipItem: (slot) =>
        set((state) => {
          const equippedItems = { ...state.character.equippedItems };
          delete equippedItems[slot];
          return { character: { ...state.character, equippedItems } };
        }),

      setSkillSlots: (slots) =>
        set((state) => ({
          character: { ...state.character, skillSlots: slots },
        })),

      addGold: (amount) =>
        set((state) => ({
          character: {
            ...state.character,
            currency: {
              ...state.character.currency,
              gold: state.character.currency.gold + amount,
            },
          },
        })),

      spendGold: (amount) => {
        const gold = get().character.currency.gold;
        if (gold < amount) return false;
        set((state) => ({
          character: {
            ...state.character,
            currency: { ...state.character.currency, gold: gold - amount },
          },
        }));
        return true;
      },

      resetToShrine: () =>
        set((state) => ({
          character: {
            ...state.character,
            stats: {
              ...state.character.stats,
              currentHP: state.character.stats.maxHP,
              currentBarrier: 0,
              currentResource: state.character.stats.maxResource,
            },
          },
        })),
    }),
    { name: "cursed-japan-player" }
  )
);

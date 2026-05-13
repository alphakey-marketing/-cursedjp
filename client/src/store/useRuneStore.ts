import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnyRune, SkillRune, EquippedSkillSlot } from "../types/rune";

interface RuneStore {
  ownedRunes: AnyRune[];
  skillSlots: EquippedSkillSlot[];
  addRune: (rune: AnyRune) => void;
  removeRune: (runeId: string) => void;
  equipSkillRune: (slotIndex: number, runeId: string) => boolean;
  unequipSkillRune: (slotIndex: number) => void;
  equipLinkRune: (slotIndex: number, runeId: string) => boolean;
  unequipLinkRune: (slotIndex: number, linkRuneId: string) => void;
  getSkillRune: (slotIndex: number) => SkillRune | null;
}

const DEFAULT_SLOTS: EquippedSkillSlot[] = [
  { slotIndex: 0, skillRuneId: "skill_rune_shadowslash", linkRuneIds: [] },
  { slotIndex: 1, skillRuneId: "skill_rune_stormstep", linkRuneIds: [] },
  { slotIndex: 2, skillRuneId: null, linkRuneIds: [] },
  { slotIndex: 3, skillRuneId: null, linkRuneIds: [] },
];

const DEFAULT_OWNED_RUNES: AnyRune[] = [
  {
    id: "skill_rune_shadowslash",
    name: "Shadow Slash",
    category: "Skill",
    damageType: "Physical",
    deliveryMode: "Strike",
    skillCoef: 1.4,
    baseCooldown: 3,
    resourceCost: 20,
    maxSupportLinks: 3,
    weaponFamilyRestriction: ["Katana", "Tanto"],
    tags: ["Strike", "Melee", "SingleTarget"],
    description: "A swift slashing strike. Katana and Tanto only.",
    iconId: "icon_shadowslash",
    dropSourceIds: ["boss_oni_general"],
  },
  {
    id: "skill_rune_stormstep",
    name: "Storm Step",
    category: "Skill",
    damageType: "Lightning",
    deliveryMode: "Strike",
    skillCoef: 1.2,
    baseCooldown: 4,
    resourceCost: 25,
    maxSupportLinks: 2,
    tags: ["Strike", "Melee", "AoE"],
    description: "Dash forward with lightning speed, striking all nearby enemies.",
    iconId: "icon_stormstep",
    dropSourceIds: ["region_edo_streets"],
  },
];

export const useRuneStore = create<RuneStore>()(
  persist(
    (set, get) => ({
      ownedRunes: DEFAULT_OWNED_RUNES,
      skillSlots: DEFAULT_SLOTS,

      addRune: (rune) =>
        set((state) => {
          if (state.ownedRunes.find((r) => r.id === rune.id)) return state;
          return { ownedRunes: [...state.ownedRunes, rune] };
        }),

      removeRune: (runeId) =>
        set((state) => ({
          ownedRunes: state.ownedRunes.filter((r) => r.id !== runeId),
        })),

      equipSkillRune: (slotIndex, runeId) => {
        const { ownedRunes, skillSlots } = get();
        const rune = ownedRunes.find((r) => r.id === runeId);
        if (!rune || rune.category !== "Skill") return false;

        const newSlots = skillSlots.map((slot) =>
          slot.slotIndex === slotIndex
            ? { ...slot, skillRuneId: runeId, linkRuneIds: [] }
            : slot
        );
        set({ skillSlots: newSlots });
        return true;
      },

      unequipSkillRune: (slotIndex) =>
        set((state) => ({
          skillSlots: state.skillSlots.map((slot) =>
            slot.slotIndex === slotIndex
              ? { ...slot, skillRuneId: null, linkRuneIds: [] }
              : slot
          ),
        })),

      equipLinkRune: (slotIndex, runeId) => {
        const { ownedRunes, skillSlots } = get();
        const slot = skillSlots.find((s) => s.slotIndex === slotIndex);
        if (!slot || !slot.skillRuneId) return false;

        const skillRune = ownedRunes.find(
          (r) => r.id === slot.skillRuneId && r.category === "Skill"
        ) as SkillRune | undefined;
        if (!skillRune) return false;
        if (slot.linkRuneIds.length >= skillRune.maxSupportLinks) return false;
        if (slot.linkRuneIds.includes(runeId)) return false;

        const newSlots = skillSlots.map((s) =>
          s.slotIndex === slotIndex
            ? { ...s, linkRuneIds: [...s.linkRuneIds, runeId] }
            : s
        );
        set({ skillSlots: newSlots });
        return true;
      },

      unequipLinkRune: (slotIndex, linkRuneId) =>
        set((state) => ({
          skillSlots: state.skillSlots.map((slot) =>
            slot.slotIndex === slotIndex
              ? {
                  ...slot,
                  linkRuneIds: slot.linkRuneIds.filter((id) => id !== linkRuneId),
                }
              : slot
          ),
        })),

      getSkillRune: (slotIndex) => {
        const { ownedRunes, skillSlots } = get();
        const slot = skillSlots.find((s) => s.slotIndex === slotIndex);
        if (!slot?.skillRuneId) return null;
        const rune = ownedRunes.find((r) => r.id === slot.skillRuneId);
        if (!rune || rune.category !== "Skill") return null;
        return rune as SkillRune;
      },
    }),
    { name: "cursed-japan-runes" }
  )
);

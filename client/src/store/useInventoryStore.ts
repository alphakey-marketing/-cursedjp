import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnyItem, ItemSlot } from "../types/item";

interface InventoryStore {
  equippedSlots: Partial<Record<ItemSlot, AnyItem>>;
  bag: AnyItem[];
  gold: number;
  runeDust: number;
  addToBag: (item: AnyItem) => void;
  removeFromBag: (instanceId: string) => void;
  equipFromBag: (instanceId: string, slot: ItemSlot) => AnyItem | null;
  unequipToBAg: (slot: ItemSlot) => void;
  sellItem: (instanceId: string, price: number) => boolean;
  addGold: (amount: number) => void;
}

const BAG_SIZE = 36; // 6×6

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      equippedSlots: {},
      bag: [],
      gold: 0,
      runeDust: 0,

      addToBag: (item) => {
        const { bag } = get();
        if (bag.length >= BAG_SIZE) return; // bag full
        set({ bag: [...bag, item] });
      },

      removeFromBag: (instanceId) =>
        set((state) => ({
          bag: state.bag.filter((i) => i.instanceId !== instanceId),
        })),

      equipFromBag: (instanceId, slot) => {
        const { bag, equippedSlots } = get();
        const item = bag.find((i) => i.instanceId === instanceId);
        if (!item) return null;

        const previouslyEquipped = equippedSlots[slot] ?? null;
        const newBag = bag.filter((i) => i.instanceId !== instanceId);
        const newEquipped = { ...equippedSlots, [slot]: item };

        // Move previously equipped item back to bag if present
        if (previouslyEquipped && newBag.length < BAG_SIZE) {
          newBag.push(previouslyEquipped);
        }

        set({ bag: newBag, equippedSlots: newEquipped });
        return previouslyEquipped;
      },

      unequipToBAg: (slot) => {
        const { equippedSlots, bag } = get();
        const item = equippedSlots[slot];
        if (!item) return;
        if (bag.length >= BAG_SIZE) return;

        const newEquipped = { ...equippedSlots };
        delete newEquipped[slot];
        set({ equippedSlots: newEquipped, bag: [...bag, item] });
      },

      sellItem: (instanceId, price) => {
        const { bag } = get();
        const item = bag.find((i) => i.instanceId === instanceId);
        if (!item) return false;

        set((state) => ({
          bag: state.bag.filter((i) => i.instanceId !== instanceId),
          gold: state.gold + price,
        }));
        return true;
      },

      addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
    }),
    { name: "cursed-japan-inventory" }
  )
);

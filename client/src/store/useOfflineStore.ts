import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OfflineStore {
  lastOnlineTimestamp: number;
  pendingExp: number;
  pendingMaterials: Record<string, number>;
  hasPendingGains: boolean;

  setLastOnlineTimestamp: (ts: number) => void;
  setPendingGains: (exp: number, materials: Record<string, number>) => void;
  clearPendingGains: () => void;
  addPendingMaterial: (materialId: string, quantity: number) => void;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set) => ({
      lastOnlineTimestamp: Date.now(),
      pendingExp: 0,
      pendingMaterials: {},
      hasPendingGains: false,

      setLastOnlineTimestamp: (ts) => set({ lastOnlineTimestamp: ts }),

      setPendingGains: (exp, materials) =>
        set({
          pendingExp: exp,
          pendingMaterials: materials,
          hasPendingGains: exp > 0 || Object.keys(materials).length > 0,
        }),

      clearPendingGains: () =>
        set({
          pendingExp: 0,
          pendingMaterials: {},
          hasPendingGains: false,
          lastOnlineTimestamp: Date.now(),
        }),

      addPendingMaterial: (materialId, quantity) =>
        set((state) => ({
          pendingMaterials: {
            ...state.pendingMaterials,
            [materialId]:
              (state.pendingMaterials[materialId] ?? 0) + quantity,
          },
        })),
    }),
    { name: "cursed-japan-offline" }
  )
);

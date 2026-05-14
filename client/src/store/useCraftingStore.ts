import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CraftingStore {
  craftingMaterials: Record<string, number>   // material name → qty
  craftingHistory: string[]                   // log of last 20 crafting actions

  addMaterial: (name: string, qty: number) => void
  consumeMaterial: (name: string, qty: number) => boolean
  getMaterialQty: (name: string) => number
  addCraftingLog: (message: string) => void
  clearCraftingLog: () => void
}

export const useCraftingStore = create<CraftingStore>()(
  persist(
    (set, get) => ({
      craftingMaterials: {},
      craftingHistory: [],

      addMaterial: (name, qty) =>
        set((state) => ({
          craftingMaterials: {
            ...state.craftingMaterials,
            [name]: (state.craftingMaterials[name] ?? 0) + qty,
          },
        })),

      consumeMaterial: (name, qty) => {
        const current = get().craftingMaterials[name] ?? 0
        if (current < qty) return false
        set((state) => ({
          craftingMaterials: {
            ...state.craftingMaterials,
            [name]: current - qty,
          },
        }))
        return true
      },

      getMaterialQty: (name) => get().craftingMaterials[name] ?? 0,

      addCraftingLog: (message) =>
        set((state) => ({
          craftingHistory: [message, ...state.craftingHistory].slice(0, 20),
        })),

      clearCraftingLog: () => set({ craftingHistory: [] }),
    }),
    { name: 'cursed-japan-crafting' }
  )
)

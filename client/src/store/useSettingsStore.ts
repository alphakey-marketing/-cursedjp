import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  bgmVolume: number
  sfxVolume: number
  autoFarm: boolean
  battleSpeed: 1 | 2 | 4
  showDebugPanel: boolean

  setBgmVolume: (v: number) => void
  setSfxVolume: (v: number) => void
  setAutoFarm: (v: boolean) => void
  setBattleSpeed: (s: 1 | 2 | 4) => void
  toggleDebugPanel: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      bgmVolume: 0.5,
      sfxVolume: 0.7,
      autoFarm: true,
      battleSpeed: 1,
      showDebugPanel: false,

      setBgmVolume: (v) => set({ bgmVolume: Math.max(0, Math.min(1, v)) }),
      setSfxVolume: (v) => set({ sfxVolume: Math.max(0, Math.min(1, v)) }),
      setAutoFarm: (v) => set({ autoFarm: v }),
      setBattleSpeed: (s) => set({ battleSpeed: s }),
      toggleDebugPanel: () => set((state) => ({ showDebugPanel: !state.showDebugPanel })),
    }),
    { name: 'cursed-japan-settings' }
  )
)

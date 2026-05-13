import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { usePlayerStore } from './store/usePlayerStore.ts'
import { useMapStore } from './store/useMapStore.ts'
import { useRuneStore } from './store/useRuneStore.ts'

// Milestone 2 exit criteria debug log
const player = usePlayerStore.getState()
const map = useMapStore.getState()
const runes = useRuneStore.getState()
const weapon = player.character.equippedItems.Weapon
const skillRune0 = runes.skillSlots[0]?.skillRuneId ?? 'none'
const skillRune1 = runes.skillSlots[1]?.skillRuneId ?? 'none'
// eslint-disable-next-line no-console
console.log(
  `Current region: ${map.currentRegionId}, Node: ${map.currentNodeId}, ` +
    `Player Lv.${player.character.stats.level} with ${weapon?.name ?? 'no weapon'} + skill runes [${skillRune0}, ${skillRune1}]`
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


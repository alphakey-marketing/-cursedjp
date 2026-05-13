import { useState } from 'react'
import { usePlayerStore } from './store/usePlayerStore'
import { useMapStore } from './store/useMapStore'
import { useRuneStore } from './store/useRuneStore'
import './App.css'

type Screen = 'map' | 'battle' | 'inventory' | 'runes' | 'passive'

function App() {
  const [screen, setScreen] = useState<Screen>('map')
  const character = usePlayerStore((s) => s.character)
  const { currentRegionId, currentNodeId } = useMapStore()
  const { skillSlots } = useRuneStore()

  return (
    <div style={{ fontFamily: 'monospace', padding: '16px', color: '#e0d5c0', background: '#1a1612', minHeight: '100vh' }}>
      {/* Top Nav */}
      <nav style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #444', paddingBottom: '8px' }}>
        <span>⚔️ CURSED JAPAN</span>
        <span style={{ marginLeft: 'auto' }}>Lv.{character.stats.level}</span>
        <span>EXP {character.stats.experience}/{character.stats.experienceToNextLevel}</span>
        <span>Gold: {character.currency.gold}</span>
        <button onClick={() => setScreen('map')}>🗺 Map</button>
        <button onClick={() => setScreen('inventory')}>🎒 Inventory</button>
        <button onClick={() => setScreen('runes')}>📖 Runes</button>
        <button onClick={() => setScreen('passive')}>🌿 Passive</button>
      </nav>

      {/* Screen Placeholder */}
      {screen === 'map' && (
        <div>
          <h2>World Map</h2>
          <p>Region: {currentRegionId}</p>
          <p>Current Node: {currentNodeId}</p>
          <button onClick={() => setScreen('battle')}>⚔️ Fight (Auto)</button>
        </div>
      )}

      {screen === 'battle' && (
        <div>
          <h2>Battle Screen</h2>
          <p>HP: {character.stats.currentHP} / {character.stats.maxHP}</p>
          <p>Resource: {character.stats.currentResource} / {character.stats.maxResource}</p>
          <div>
            <strong>Skill Slots:</strong>
            {skillSlots.map((slot) => (
              <span key={slot.slotIndex} style={{ marginLeft: '8px', border: '1px solid #888', padding: '4px' }}>
                [{slot.slotIndex + 1}] {slot.skillRuneId ?? '(empty)'}
              </span>
            ))}
          </div>
          <button onClick={() => setScreen('map')} style={{ marginTop: '12px' }}>🏃 Retreat</button>
        </div>
      )}

      {screen === 'inventory' && (
        <div>
          <h2>Inventory</h2>
          <p>Weapon: {character.equippedItems.Weapon?.name ?? '(none)'}</p>
          <p>Bag items: {character.inventory.length}</p>
        </div>
      )}

      {screen === 'runes' && (
        <div>
          <h2>Rune Screen</h2>
          <p>Owned runes: {character.runeInventory.length}</p>
          {skillSlots.map((slot) => (
            <div key={slot.slotIndex}>
              Slot {slot.slotIndex + 1}: {slot.skillRuneId ?? '(empty)'}
              {slot.linkRuneIds.length > 0 && (
                <span> + {slot.linkRuneIds.join(', ')}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {screen === 'passive' && (
        <div>
          <h2>Passive Web</h2>
          <p>Points available: {character.passiveWeb.totalPointsAvailable}</p>
          <p>Points spent: {character.passiveWeb.totalPointsSpent}</p>
          <p>Allocated nodes: {character.passiveWeb.allocatedNodeIds.join(', ')}</p>
        </div>
      )}
    </div>
  )
}

export default App


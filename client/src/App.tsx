import { useState } from 'react'
import { usePlayerStore } from './store/usePlayerStore'
import { useMapStore } from './store/useMapStore'
import { WorldMapScreen } from './screens/WorldMapScreen'
import { BattleScreen } from './screens/BattleScreen'
import { ResultScreen } from './screens/ResultScreen'
import { InventoryScreen } from './screens/InventoryScreen'
import { resolveDrops } from './engine/items/dropResolver'
import type { BattleEndResult } from './hooks/useCombatLoop'
import type { DropResult } from './engine/items/dropResolver'
import './App.css'

type Screen = 'map' | 'battle' | 'result' | 'inventory' | 'runes' | 'passive'

function App() {
  const [screen, setScreen] = useState<Screen>('map')
  const [battleNodeId, setBattleNodeId] = useState<string>('')
  const [lastBattleResult, setLastBattleResult] = useState<BattleEndResult | null>(null)
  const [lastDrops, setLastDrops] = useState<DropResult | null>(null)

  const character = usePlayerStore((s) => s.character)
  const { currentNodeId } = useMapStore()

  const handleFight = (nodeId: string) => {
    setBattleNodeId(nodeId)
    setLastBattleResult(null)
    setLastDrops(null)
    setScreen('battle')
  }

  const handleBattleEnd = (result: BattleEndResult) => {
    if (result.victory) {
      const drops = resolveDrops(
        result.enemies.map((e) => ({
          id: e.templateId,
          tier: 'Common',
          expReward: e.expReward,
          dropTableId: e.dropTableId,
        }))
      )
      setLastBattleResult(result)
      setLastDrops(drops)
      setScreen('result')
    }
  }

  const handleBossInfo = (_bossId: string) => {
    // Placeholder — Milestone 10
  }

  return (
    <div
      style={{
        fontFamily: 'monospace',
        padding: '16px',
        color: '#e0d5c0',
        background: '#1a1612',
        minHeight: '100vh',
      }}
    >
      {/* Top Nav — hidden during battle/result */}
      {screen !== 'battle' && screen !== 'result' && (
        <nav
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            borderBottom: '1px solid #444',
            paddingBottom: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#f0c060', fontWeight: 'bold' }}>⚔️ CURSED JAPAN</span>
          <span style={{ color: '#a0a0a0' }}>Lv.{character.stats.level}</span>
          <span style={{ color: '#8060e0' }}>
            EXP {character.stats.experience}/{character.stats.experienceToNextLevel}
          </span>
          <span style={{ color: '#f0d060' }}>Gold: {character.currency.gold}</span>
          <button style={navBtnStyle(screen === 'map')} onClick={() => setScreen('map')}>
            🗺 Map
          </button>
          <button
            style={navBtnStyle(screen === 'inventory')}
            onClick={() => setScreen('inventory')}
          >
            🎒 Inventory
          </button>
          <button style={navBtnStyle(screen === 'runes')} onClick={() => setScreen('runes')}>
            📖 Runes
          </button>
          <button style={navBtnStyle(screen === 'passive')} onClick={() => setScreen('passive')}>
            🌿 Passive
          </button>
        </nav>
      )}

      {/* ── Screen Router ── */}

      {screen === 'map' && (
        <WorldMapScreen onFight={handleFight} onBossInfo={handleBossInfo} />
      )}

      {screen === 'battle' && battleNodeId && (
        <BattleScreen
          nodeId={battleNodeId}
          onRetreat={() => setScreen('map')}
          onBattleEnd={handleBattleEnd}
        />
      )}

      {screen === 'result' && lastBattleResult && lastDrops && (
        <ResultScreen
          battleResult={lastBattleResult}
          drops={lastDrops}
          onFightAgain={() => handleFight(battleNodeId)}
          onBackToMap={() => setScreen('map')}
          onOpenInventory={() => setScreen('inventory')}
        />
      )}

      {screen === 'inventory' && (
        <InventoryScreen onClose={() => setScreen('map')} />
      )}

      {screen === 'runes' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
              borderBottom: '1px solid #444',
              paddingBottom: 8,
            }}
          >
            <button style={backBtnStyle()} onClick={() => setScreen('map')}>
              ◀ Back
            </button>
            <span style={{ fontWeight: 'bold', color: '#f0c060' }}>RUNE CONFIGURATION</span>
          </div>
          <p style={{ color: '#888' }}>
            Rune Screen — Milestone 6 (coming soon)
          </p>
          <p style={{ color: '#666', fontSize: 12 }}>
            Owned runes: {character.runeInventory.length}
          </p>
        </div>
      )}

      {screen === 'passive' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
              borderBottom: '1px solid #444',
              paddingBottom: 8,
            }}
          >
            <button style={backBtnStyle()} onClick={() => setScreen('map')}>
              ◀ Back
            </button>
            <span style={{ fontWeight: 'bold', color: '#f0c060' }}>PASSIVE WEB</span>
          </div>
          <p style={{ color: '#888' }}>
            Passive Web — Milestone 7 (coming soon)
          </p>
          <p style={{ color: '#aaa', fontSize: 12 }}>
            Points available: {character.passiveWeb.totalPointsAvailable}
          </p>
          <p style={{ color: '#aaa', fontSize: 12 }}>
            Points spent: {character.passiveWeb.totalPointsSpent}
          </p>
          <p style={{ color: '#aaa', fontSize: 12 }}>
            Node: {currentNodeId}
          </p>
        </div>
      )}
    </div>
  )
}

function navBtnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? '#403020' : 'transparent',
    border: active ? '1px solid #806040' : '1px solid #444',
    color: active ? '#f0c060' : '#c0b090',
    padding: '4px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
  }
}

function backBtnStyle(): React.CSSProperties {
  return {
    background: '#2a2010',
    border: '1px solid #555',
    color: '#e0d5c0',
    padding: '4px 12px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
  }
}

export default App


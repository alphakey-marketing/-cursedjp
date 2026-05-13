import { useState } from 'react'
import { usePlayerStore } from './store/usePlayerStore'
import { useOfflineStore } from './store/useOfflineStore'
import { WorldMapScreen } from './screens/WorldMapScreen'
import { BattleScreen } from './screens/BattleScreen'
import { ResultScreen } from './screens/ResultScreen'
import { InventoryScreen } from './screens/InventoryScreen'
import { RuneScreen } from './screens/RuneScreen'
import { PassiveWebScreen } from './screens/PassiveWebScreen'
import { ShrineScreen } from './screens/ShrineScreen'
import { OfflineSummaryScreen } from './screens/OfflineSummaryScreen'
import { useOfflineAccrual } from './hooks/useOfflineAccrual'
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
  const [showShrine, setShowShrine] = useState(false)

  const character = usePlayerStore((s) => s.character)
  const { hasPendingGains } = useOfflineStore()

  // Run offline accrual check on mount
  useOfflineAccrual()

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
        <WorldMapScreen
          onFight={handleFight}
          onBossInfo={handleBossInfo}
          onShrineVisit={() => setShowShrine(true)}
        />
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
        <RuneScreen onClose={() => setScreen('map')} />
      )}

      {screen === 'passive' && (
        <PassiveWebScreen onClose={() => setScreen('map')} />
      )}

      {/* Shrine modal overlay */}
      {showShrine && (
        <ShrineScreen
          onReturnToMap={() => setShowShrine(false)}
          onClose={() => setShowShrine(false)}
        />
      )}

      {/* Offline Summary modal — shown on app load if gains exist */}
      {hasPendingGains && !showShrine && (
        <OfflineSummaryScreen onCollect={() => setScreen('map')} />
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

export default App


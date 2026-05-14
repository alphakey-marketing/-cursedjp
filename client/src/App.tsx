import { useState, useEffect, useCallback } from 'react'
import { usePlayerStore } from './store/usePlayerStore'
import { useOfflineStore } from './store/useOfflineStore'
import { useChapterStore } from './store/useChapterStore'
import { useSettingsStore } from './store/useSettingsStore'
import { useQuestStore } from './store/useQuestStore'
import { WorldMapScreen } from './screens/WorldMapScreen'
import { BattleScreen } from './screens/BattleScreen'
import { ResultScreen } from './screens/ResultScreen'
import { InventoryScreen } from './screens/InventoryScreen'
import { RuneScreen } from './screens/RuneScreen'
import { PassiveWebScreen } from './screens/PassiveWebScreen'
import { CraftingScreen } from './screens/CraftingScreen'
import { ShrineScreen } from './screens/ShrineScreen'
import { OfflineSummaryScreen } from './screens/OfflineSummaryScreen'
import { BossDetailScreen } from './screens/BossDetailScreen'
import { StoryScreen } from './screens/StoryScreen'
import { QuestScreen } from './screens/QuestScreen'
import { DataPreviewScreen } from './screens/DataPreviewScreen'
import { SettingsPanel } from './components/SettingsPanel'
import { DebugPanel } from './components/DebugPanel'
import { useOfflineAccrual } from './hooks/useOfflineAccrual'
import { useAutosave } from './hooks/useAutosave'
import { resolveDrops } from './engine/items/dropResolver'
import { localStats } from './engine/analytics/localStats'
import { useCraftingStore } from './store/useCraftingStore'
import type { BattleEndResult } from './hooks/useCombatLoop'
import type { DropResult } from './engine/items/dropResolver'
import type { BossTemplate } from './types/enemy'
import type { ChapterDialogue } from './types/chapter'
import type { Quest } from './types/quest'
import './App.css'

type Screen = 'map' | 'battle' | 'result' | 'inventory' | 'runes' | 'passive' | 'crafting' | 'quest'

function App() {
  const [screen, setScreen] = useState<Screen>('map')
  const [battleNodeId, setBattleNodeId] = useState<string>('')
  const [lastBattleResult, setLastBattleResult] = useState<BattleEndResult | null>(null)
  const [lastDrops, setLastDrops] = useState<DropResult | null>(null)
  const [showShrine, setShowShrine] = useState(false)
  const [showBossDetail, setShowBossDetail] = useState(false)
  const [activeBossId, setActiveBossId] = useState<string>('')
  const [bossBattleTemplate, setBossBattleTemplate] = useState<BossTemplate | null>(null)
  const [pendingDialogue, setPendingDialogue] = useState<ChapterDialogue | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showDataPreview, setShowDataPreview] = useState(false)

  const character = usePlayerStore((s) => s.character)
  const { hasPendingGains } = useOfflineStore()
  const { isBossKilled, isChapterCompleted, recordBossKill, completeChapter } = useChapterStore()
  const { showDebugPanel, toggleDebugPanel } = useSettingsStore()
  const { loadQuests, updateKillCount, updateBossKill, updateItemAcquired, updateNodeCleared, updateLevelReached, unlockQuestsForCondition } = useQuestStore()

  // Load quests from JSON on mount
  useEffect(() => {
    fetch('/data/quests.json')
      .then((r) => r.json())
      .then((quests: Quest[]) => loadQuests(quests))
      .catch(() => {})
  }, [loadQuests])

  // Run offline accrual check on mount
  useOfflineAccrual()

  // Periodic autosave checkpoint
  useAutosave()

  // Show chapter intro on first load if chapter 1 not seen
  useEffect(() => {
    if (isChapterCompleted('chapter_1')) return
    fetch('/data/chapters.json')
      .then((r) => r.json())
      .then((chapters: Array<{ id: string; dialogues: ChapterDialogue[] }>) => {
        const ch1 = chapters.find((c) => c.id === 'chapter_1')
        const intro = ch1?.dialogues.find((d) => d.triggerCondition === 'ChapterStart')
        if (intro) setPendingDialogue(intro)
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcut: backtick toggles debug panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`') toggleDebugPanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleDebugPanel])

  const handleFight = useCallback((nodeId: string) => {
    setBattleNodeId(nodeId)
    setBossBattleTemplate(null)
    setLastBattleResult(null)
    setLastDrops(null)
    setScreen('battle')
  }, [])

  const handleFightBoss = useCallback((boss: BossTemplate) => {
    setBossBattleTemplate(boss)
    setBattleNodeId(boss.id)
    setLastBattleResult(null)
    setLastDrops(null)
    setShowBossDetail(false)
    setScreen('battle')
  }, [])

  const handleBattleEnd = useCallback((result: BattleEndResult) => {
    if (result.victory) {
      const drops = resolveDrops(
        result.enemies.map((e) => ({
          id: e.templateId,
          tier: e.isBoss ? 'Boss' : 'Common',
          expReward: e.expReward,
          dropTableId: e.dropTableId,
          signatureDrops: e.signatureDrops,
        }))
      )
      setLastBattleResult(result)
      setLastDrops(drops)

      // Feed drop materials into crafting store
      const addMat = useCraftingStore.getState().addMaterial
      drops.materials.forEach(({ name, qty }) => addMat(name, qty))

      // Update quest item acquisition
      drops.materials.forEach(({ name, qty }) => updateItemAcquired(name, qty))

      // Analytics
      if (result.isBoss && result.bossId) {
        localStats.recordBossKill(result.bossId)
        recordBossKill(result.bossId)
        updateBossKill(result.bossId)

        // Trigger boss-kill dialogue
        fetch('/data/chapters.json')
          .then((r) => r.json())
          .then((chapters: Array<{ id: string; chapterBossId: string; dialogues: ChapterDialogue[] }>) => {
            const ch = chapters.find((c) => c.chapterBossId === result.bossId)
            if (ch) {
              const killDialogue = ch.dialogues.find((d) => d.triggerCondition === 'BossKill')
              if (killDialogue) setPendingDialogue(killDialogue)
              if (!isChapterCompleted(ch.id)) {
                completeChapter(ch.id)
                unlockQuestsForCondition(`${ch.id}_complete`)
              }
            }
          })
          .catch(() => {})
      } else {
        localStats.recordCampKill(battleNodeId)
        // Update kill counts for each enemy in the battle
        result.enemies.forEach((e) => updateKillCount(e.templateId))
        // Track node clear for quest objectives
        updateNodeCleared(battleNodeId)
      }

      // Track level-up for reach_level quest objectives
      updateLevelReached(usePlayerStore.getState().character.stats.level)

      setScreen('result')
    }
  }, [battleNodeId, isChapterCompleted, recordBossKill, completeChapter, updateKillCount, updateBossKill, updateItemAcquired, updateNodeCleared, updateLevelReached, unlockQuestsForCondition]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBossInfo = useCallback((bossId: string) => {
    setActiveBossId(bossId)
    setShowBossDetail(true)
  }, [])

  // Suppress unused isBossKilled (used to potentially unlock content)
  void isBossKilled

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
            alignItems: 'center',
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
          <button style={navBtnStyle(screen === 'crafting')} onClick={() => setScreen('crafting')}>
            ⚒️ Craft
          </button>
          <button style={navBtnStyle(screen === 'quest')} onClick={() => setScreen('quest')}>
            📜 Quests
          </button>
          <button
            style={{ ...navBtnStyle(false), marginLeft: 'auto' }}
            onClick={() => setShowSettings(true)}
          >
            ⚙️
          </button>
          {import.meta.env.DEV && (
            <button
              style={navBtnStyle(false)}
              onClick={() => setShowDataPreview(true)}
            >
              🔬 Data
            </button>
          )}
        </nav>
      )}

      {/* ── Screen Router ── */}

      {screen === 'map' && (
        <div key="map" className="cj-screen-enter">
          <WorldMapScreen
            onFight={handleFight}
            onBossInfo={handleBossInfo}
            onShrineVisit={() => setShowShrine(true)}
          />
        </div>
      )}

      {screen === 'battle' && (battleNodeId || bossBattleTemplate) && (
        <BattleScreen
          nodeId={battleNodeId}
          bossTemplate={bossBattleTemplate ?? undefined}
          onRetreat={() => {
            setBossBattleTemplate(null)
            setScreen('map')
          }}
          onBattleEnd={handleBattleEnd}
        />
      )}

      {screen === 'result' && lastBattleResult && lastDrops && (
        <ResultScreen
          battleResult={lastBattleResult}
          drops={lastDrops}
          onFightAgain={() => {
            if (bossBattleTemplate) {
              setLastBattleResult(null)
              setLastDrops(null)
              setScreen('battle')
            } else {
              handleFight(battleNodeId)
            }
          }}
          onBackToMap={() => {
            setBossBattleTemplate(null)
            setScreen('map')
          }}
          onOpenInventory={() => setScreen('inventory')}
        />
      )}

      {screen === 'inventory' && (
        <div key="inventory" className="cj-screen-enter">
          <InventoryScreen onClose={() => setScreen('map')} />
        </div>
      )}

      {screen === 'runes' && (
        <div key="runes" className="cj-screen-enter">
          <RuneScreen onClose={() => setScreen('map')} />
        </div>
      )}

      {screen === 'passive' && (
        <div key="passive" className="cj-screen-enter">
          <PassiveWebScreen onClose={() => setScreen('map')} />
        </div>
      )}

      {screen === 'crafting' && (
        <div key="crafting" className="cj-screen-enter">
          <CraftingScreen onClose={() => setScreen('map')} />
        </div>
      )}

      {screen === 'quest' && (
        <div key="quest" className="cj-screen-enter">
          <QuestScreen onClose={() => setScreen('map')} />
        </div>
      )}

      {/* Shrine modal overlay */}
      {showShrine && (
        <ShrineScreen
          onReturnToMap={() => setShowShrine(false)}
          onClose={() => setShowShrine(false)}
        />
      )}

      {/* Boss Detail modal */}
      {showBossDetail && activeBossId && (
        <BossDetailScreen
          bossId={activeBossId}
          onFightBoss={handleFightBoss}
          onClose={() => setShowBossDetail(false)}
        />
      )}

      {/* Story / Dialogue modal */}
      {pendingDialogue && (
        <StoryScreen
          dialogue={pendingDialogue}
          onFinish={() => setPendingDialogue(null)}
        />
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {/* Offline Summary modal — shown on app load if gains exist */}
      {hasPendingGains && !showShrine && !pendingDialogue && (
        <OfflineSummaryScreen onCollect={() => setScreen('map')} />
      )}

      {/* Debug panel — toggle with backtick key */}
      {showDebugPanel && <DebugPanel />}

      {/* Dev-only data preview */}
      {import.meta.env.DEV && showDataPreview && (
        <DataPreviewScreen onClose={() => setShowDataPreview(false)} />
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


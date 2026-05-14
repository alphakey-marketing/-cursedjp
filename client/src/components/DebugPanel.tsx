import React, { useEffect, useState } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { useMapStore } from '../store/useMapStore'
import { useChapterStore } from '../store/useChapterStore'
import { usePassiveStore } from '../store/usePassiveStore'
import { localStats } from '../engine/analytics/localStats'

export const DebugPanel: React.FC = () => {
  const character = usePlayerStore((s) => s.character)
  const { currentNodeId, idleFarmNodeId, isIdleFarming, clearedNodeIds } = useMapStore()
  const { killedBossIds, completedChapterIds } = useChapterStore()
  const { allocatedNodeIds, totalPointsAvailable } = usePassiveStore()

  const [tick, setTick] = useState(0)
  const snapshot = localStats.getSnapshot()
  const topSkills = localStats.getMostUsedSkills(3)

  // Refresh debug panel every 2s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(id)
  }, [])

  // Suppress unused warning for tick
  void tick

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        width: 280,
        background: 'rgba(0,0,0,0.9)',
        border: '1px solid #225522',
        borderRadius: 4,
        padding: '10px 12px',
        fontSize: 10,
        color: '#88ff88',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxHeight: 480,
        overflowY: 'auto',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#44ff44', fontSize: 11 }}>
        🐛 DEBUG PANEL
      </div>

      <Section label="PLAYER">
        <Row label="Level" value={character.stats.level} />
        <Row label="HP" value={`${character.stats.currentHP} / ${character.stats.maxHP}`} />
        <Row label="EXP" value={`${character.stats.experience} / ${character.stats.experienceToNextLevel}`} />
        <Row label="Gold" value={character.currency.gold} />
        <Row label="Atk" value={`${character.stats.baseAttackMin}–${character.stats.baseAttackMax}`} />
        <Row label="Speed" value={character.stats.attackSpeed.toFixed(2)} />
      </Section>

      <Section label="MAP">
        <Row label="Node" value={currentNodeId} />
        <Row label="Cleared" value={clearedNodeIds.length} />
        <Row label="Idle Farm" value={isIdleFarming ? idleFarmNodeId ?? '—' : '—'} />
      </Section>

      <Section label="PROGRESS">
        <Row label="Bosses killed" value={killedBossIds.join(', ') || '—'} />
        <Row label="Chapters done" value={completedChapterIds.join(', ') || '—'} />
        <Row label="Passive pts" value={totalPointsAvailable} />
        <Row label="Passive nodes" value={allocatedNodeIds.length} />
      </Section>

      <Section label="ANALYTICS">
        <Row
          label="Session time"
          value={`${Math.round((Date.now() - snapshot.sessionStart) / 1000)}s`}
        />
        <Row label="Kills" value={snapshot.totalKills} />
        <Row label="Boss kills" value={snapshot.totalBossKills} />
        {topSkills.map((s) => (
          <Row key={s.runeId} label={s.runeId} value={`${s.count}x`} />
        ))}
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: '#66cc66', fontWeight: 'bold', marginBottom: 3, borderBottom: '1px solid #225522', paddingBottom: 2 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ color: '#88ff88' }}>{String(value ?? '—')}</span>
    </div>
  )
}

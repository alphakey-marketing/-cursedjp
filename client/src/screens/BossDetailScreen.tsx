import React, { useEffect, useState } from 'react'
import { useChapterStore } from '../store/useChapterStore'
import { usePlayerStore } from '../store/usePlayerStore'
import type { BossTemplate } from '../types/enemy'

interface BossDetailScreenProps {
  bossId: string
  onFightBoss: (boss: BossTemplate) => void
  onClose: () => void
}

export const BossDetailScreen: React.FC<BossDetailScreenProps> = ({
  bossId,
  onFightBoss,
  onClose,
}) => {
  const [boss, setBoss] = useState<BossTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const { killedBossIds } = useChapterStore()
  const character = usePlayerStore((s) => s.character)

  useEffect(() => {
    fetch('/data/bosses.json')
      .then((r) => r.json())
      .then((data: BossTemplate[]) => {
        const found = data.find((b) => b.id === bossId)
        setBoss(found ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [bossId])

  if (loading) {
    return (
      <div style={overlayStyle}>
        <div style={panelStyle}>
          <div style={{ color: '#888', padding: 24 }}>Loading boss data…</div>
        </div>
      </div>
    )
  }

  if (!boss) {
    return (
      <div style={overlayStyle}>
        <div style={panelStyle}>
          <div style={{ color: '#c04040', padding: 24 }}>Boss not found: {bossId}</div>
          <button onClick={onClose} style={btnStyle('#2a2010')}>◀ Back</button>
        </div>
      </div>
    )
  }

  const killCount = killedBossIds.includes(bossId) ? 1 : 0
  const isKilled = killCount > 0
  const playerPower = Math.round(
    character.stats.baseAttackMax * character.stats.attackSpeed * 10
  )
  const recommendedPower = 400
  const powerRatio = playerPower / recommendedPower
  const powerWarning =
    powerRatio < 0.8 ? 'red' : powerRatio < 0.9 ? 'yellow' : 'green'

  return (
    <div style={overlayStyle}>
      <div style={{ ...panelStyle, maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div
          style={{
            background: '#1a0808',
            border: '1px solid #662222',
            borderRadius: 4,
            padding: '14px 18px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>💀</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#e06060' }}>
                {boss.name.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                Level {boss.level} &nbsp;|&nbsp; Recommended Power: {recommendedPower}+
                &nbsp;|&nbsp; Phases: {boss.phases.length + 1}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                HP: {boss.baseHP.toLocaleString()}
                {isKilled && (
                  <span style={{ color: '#44dd88', marginLeft: 12 }}>✓ Killed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Power comparison */}
        <div
          style={{
            fontSize: 12,
            color: powerWarning === 'red' ? '#e06060' : powerWarning === 'yellow' ? '#e0c040' : '#44dd88',
            marginBottom: 14,
          }}
        >
          MY POWER: {playerPower} / Recommended {recommendedPower}
          {powerWarning === 'red' && ' ⚠️ Below recommended power'}
          {powerWarning === 'yellow' && ' ⚠️ Slightly below recommended'}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          {/* Abilities */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 'bold', color: '#c0b090', marginBottom: 8, fontSize: 12 }}>
              BOSS ABILITIES
            </div>
            {boss.telegraphAttacks.map((t) => (
              <div
                key={t.id}
                style={{
                  background: '#1a1410',
                  border: '1px solid #443322',
                  borderRadius: 4,
                  padding: '8px 10px',
                  marginBottom: 8,
                }}
              >
                <div style={{ color: '#e09060', fontWeight: 'bold', fontSize: 12 }}>
                  ⚔️ {t.name}
                </div>
                <div style={{ color: '#888', fontSize: 11, marginTop: 3 }}>
                  {t.description}
                </div>
                <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>
                  Telegraph: {t.warningDurationTicks} ticks warning
                </div>
              </div>
            ))}
          </div>

          {/* Phases */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 'bold', color: '#c0b090', marginBottom: 8, fontSize: 12 }}>
              PHASES
            </div>
            <div
              style={{
                background: '#1a1410',
                border: '1px solid #443322',
                borderRadius: 4,
                padding: '8px 10px',
                marginBottom: 8,
              }}
            >
              <div style={{ color: '#a0c0e0', fontSize: 12, fontWeight: 'bold' }}>
                Phase 1 (100% → {Math.round((boss.phases[0]?.hpThreshold ?? 0) * 100)}% HP)
              </div>
              <div style={{ color: '#888', fontSize: 11, marginTop: 3 }}>Standard attacks</div>
            </div>
            {boss.phases.map((phase) => (
              <div
                key={phase.phaseIndex}
                style={{
                  background: '#1a0c08',
                  border: '1px solid #663322',
                  borderRadius: 4,
                  padding: '8px 10px',
                  marginBottom: 8,
                }}
              >
                <div style={{ color: '#e07040', fontSize: 12, fontWeight: 'bold' }}>
                  Phase {phase.phaseIndex + 1} ({'<'}
                  {Math.round(phase.hpThreshold * 100)}% HP)
                </div>
                <div style={{ color: '#888', fontSize: 11, marginTop: 3 }}>
                  {phase.behaviorModifier}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loot table */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 'bold', color: '#c0b090', marginBottom: 8, fontSize: 12 }}>
            FULL LOOT TABLE
          </div>

          {boss.signatureDrops.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: '#e0a060', marginBottom: 6 }}>
                SIGNATURE DROPS (Boss exclusive)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 11 }}>
                <thead>
                  <tr style={{ color: '#888' }}>
                    <th style={thStyle}>Item</th>
                    <th style={thStyle}>Rate</th>
                    <th style={thStyle}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {boss.signatureDrops.map((drop, i) => (
                    <tr key={i} style={{ color: '#c0a080' }}>
                      <td style={tdStyle}>
                        {drop.runeId
                          ? `🌀 [Skill Rune] ${drop.runeId}`
                          : `💀 [Unique] ${drop.itemTemplateId}`}
                      </td>
                      <td style={tdStyle}>{Math.round(drop.dropChance * 100)}%</td>
                      <td style={tdStyle}>
                        {drop.isGuaranteedFirstKill ? '✓ First kill' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div style={{ fontSize: 11, color: '#a0a080', marginBottom: 6 }}>
            SHARED DROPS (Regional pool)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 11 }}>
            <thead>
              <tr style={{ color: '#888' }}>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Rate</th>
                <th style={thStyle}>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ color: '#c0a080' }}>
                <td style={tdStyle}>🔵 [Link Rune] Added Bleed</td>
                <td style={tdStyle}>12%</td>
                <td style={tdStyle}></td>
              </tr>
              <tr style={{ color: '#c0a080' }}>
                <td style={tdStyle}>🔧 Dark Iron Shard (crafting)</td>
                <td style={tdStyle}>45%</td>
                <td style={tdStyle}>avg x3</td>
              </tr>
              <tr style={{ color: '#c0a080' }}>
                <td style={tdStyle}>💰 Gold</td>
                <td style={tdStyle}>100%</td>
                <td style={tdStyle}>800–1,400</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Personal stats */}
        <div style={{ fontSize: 12, color: '#7a7a8a', marginBottom: 16 }}>
          Kill count: {killCount}
          {boss.signatureDrops.map((drop, i) =>
            drop.runeId ? (
              <span key={i} style={{ marginLeft: 16 }}>
                Total {drop.runeId} drops: 0
              </span>
            ) : null
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => onFightBoss(boss)}
            style={btnStyle('#602020')}
          >
            ⚔️ Fight Now — Manual
          </button>
          <button onClick={onClose} style={btnStyle('#2a2010')}>
            ◀ Back
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.9)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  zIndex: 100,
  padding: 16,
  overflowY: 'auto',
}

const panelStyle: React.CSSProperties = {
  background: '#111118',
  border: '1px solid #662222',
  borderRadius: 6,
  padding: 24,
  width: '100%',
  color: '#e8e8e8',
  marginTop: 8,
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '4px 8px',
  borderBottom: '1px solid #333',
  fontWeight: 'bold',
  color: '#888',
}

const tdStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderBottom: '1px solid #222',
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    border: '1px solid #888',
    color: '#e0d5c0',
    padding: '8px 20px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
  }
}

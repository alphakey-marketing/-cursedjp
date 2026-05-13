import React, { useEffect, useState } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { useRuneStore } from '../store/useRuneStore'
import { useCombatLoop } from '../hooks/useCombatLoop'
import { PhaserGame } from '../phaser/PhaserGame'
import { ShrineScreen } from './ShrineScreen'
import type { EnemyTemplate } from '../types/enemy'
import type { BattleEndResult } from '../hooks/useCombatLoop'

interface BattleScreenProps {
  nodeId: string
  onRetreat: () => void
  onBattleEnd: (result: BattleEndResult) => void
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  nodeId,
  onRetreat,
  onBattleEnd,
}) => {
  const character = usePlayerStore((s) => s.character)
  const resetToShrine = usePlayerStore((s) => s.resetToShrine)
  const { skillSlots, ownedRunes } = useRuneStore()
  const [enemies, setEnemies] = useState<EnemyTemplate[]>([])
  const [battleSpeed, setBattleSpeed] = useState(1)
  const [showDeathModal, setShowDeathModal] = useState(false)

  const { combatLog, enemyHPMap, battleResult, playerDied, initEnemies } = useCombatLoop()

  // Load enemy data
  useEffect(() => {
    Promise.all([
      fetch('/data/regions.json').then((r) => r.json()),
      fetch('/data/enemies.json').then((r) => r.json()),
    ]).then(([regions, enemyTemplates]) => {
      const region = regions.find((rg: { nodes: Array<{ id: string; enemyIds?: string[] }> }) =>
        rg.nodes.some((n: { id: string }) => n.id === nodeId)
      )
      const node = region?.nodes.find((n: { id: string }) => n.id === nodeId)
      const nodeEnemyIds: string[] = node?.enemyIds ?? []
      const loaded: EnemyTemplate[] = nodeEnemyIds
        .map((id: string) => enemyTemplates.find((e: EnemyTemplate) => e.id === id))
        .filter(Boolean)
      setEnemies(loaded)

      // Initialize HP tracking
      initEnemies(
        loaded.map((e: EnemyTemplate, i: number) => ({
          instanceId: `${e.id}_${i}`,
          templateId: e.id,
          name: e.name,
          currentHP: e.baseHP,
          maxHP: e.baseHP,
          currentBarrier: e.defenseProfile.barrierMax,
          maxBarrier: e.defenseProfile.barrierMax,
        }))
      )
    })
  }, [nodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle player death
  useEffect(() => {
    if (playerDied) {
      setShowDeathModal(true)
      resetToShrine()
    }
  }, [playerDied, resetToShrine])

  // Handle battle end (victory)
  useEffect(() => {
    if (battleResult?.victory) {
      onBattleEnd(battleResult)
    }
  }, [battleResult]) // eslint-disable-line react-hooks/exhaustive-deps

  // Build skill slot data for Phaser
  const phaserSkillSlots = skillSlots
    .filter((slot) => slot.skillRuneId !== null)
    .map((slot) => {
      const rune = ownedRunes.find((r) => r.id === slot.skillRuneId)
      if (!rune || rune.category !== 'Skill') {
        return {
          slotIndex: slot.slotIndex,
          skillRuneId: slot.skillRuneId,
          skillCoef: 1.0,
          damageType: 'Physical',
          resourceCost: 0,
          baseCooldown: 3,
        }
      }
      return {
        slotIndex: slot.slotIndex,
        skillRuneId: slot.skillRuneId,
        skillCoef: rune.skillCoef,
        damageType: rune.damageType,
        resourceCost: rune.resourceCost,
        baseCooldown: rune.baseCooldown,
      }
    })

  const hpPercent = Math.round(
    (character.stats.currentHP / character.stats.maxHP) * 100
  )
  const resourcePercent = Math.round(
    (character.stats.currentResource / character.stats.maxResource) * 100
  )
  const barrierPercent =
    character.stats.maxBarrier > 0
      ? Math.round((character.stats.currentBarrier / character.stats.maxBarrier) * 100)
      : 0

  return (
    <div style={{ color: '#e0d5c0', position: 'relative' }}>
      {/* Battle header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
          padding: '6px 0',
          borderBottom: '1px solid #444',
        }}
      >
        <button onClick={onRetreat} style={btnStyle()}>
          ◀ Map
        </button>
        <span style={{ color: '#c0b090', fontWeight: 'bold' }}>
          {nodeId.replace(/_/g, ' ').toUpperCase()}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>Speed:</span>
        {([1, 2, 4] as const).map((s) => (
          <button
            key={s}
            onClick={() => setBattleSpeed(s)}
            style={{
              ...btnStyle(),
              background: battleSpeed === s ? '#604020' : '#2a2010',
              minWidth: 32,
            }}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Player HUD */}
      <div
        style={{
          background: '#1a1410',
          border: '1px solid #444',
          borderRadius: 4,
          padding: '8px 12px',
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 11, marginBottom: 3 }}>
          <span style={{ color: '#aaa' }}>HP</span>
          <BarFill
            value={character.stats.currentHP}
            max={character.stats.maxHP}
            percent={hpPercent}
            color="#c04040"
          />
        </div>
        <div style={{ fontSize: 11, marginBottom: 3 }}>
          <span style={{ color: '#aaa' }}>RS</span>
          <BarFill
            value={character.stats.currentResource}
            max={character.stats.maxResource}
            percent={resourcePercent}
            color="#4080c0"
          />
        </div>
        {character.stats.maxBarrier > 0 && (
          <div style={{ fontSize: 11 }}>
            <span style={{ color: '#aaa' }}>BA</span>
            <BarFill
              value={character.stats.currentBarrier}
              max={character.stats.maxBarrier}
              percent={barrierPercent}
              color="#8040c0"
            />
          </div>
        )}
      </div>

      {/* Phaser canvas */}
      {enemies.length > 0 && (
        <PhaserGame
          enemies={enemies}
          playerStats={{
            baseAttackMin: character.stats.baseAttackMin,
            baseAttackMax: character.stats.baseAttackMax,
            attackSpeed: character.stats.attackSpeed,
            critChance: character.stats.critChance,
            critBonus: character.stats.critBonus,
            additiveIncreases: character.stats.additiveIncreases,
            multiplicativeAmplifiers: character.stats.multiplicativeAmplifiers,
            currentBarrier: character.stats.currentBarrier,
          }}
          skillSlots={phaserSkillSlots}
          battleSpeed={battleSpeed}
          width={540}
          height={240}
        />
      )}

      {/* Enemy HUD */}
      {Object.values(enemyHPMap).length > 0 && (
        <div
          style={{
            background: '#1a1410',
            border: '1px solid #444',
            borderRadius: 4,
            padding: '8px 12px',
            marginTop: 8,
          }}
        >
          {Object.values(enemyHPMap).map((e) => {
            const ep = Math.round((e.currentHP / e.maxHP) * 100)
            return (
              <div key={e.instanceId} style={{ marginBottom: 4, fontSize: 11 }}>
                <span style={{ color: e.currentHP <= 0 ? '#555' : '#c0b090', minWidth: 90, display: 'inline-block' }}>
                  {e.name}
                </span>
                <BarFill value={e.currentHP} max={e.maxHP} percent={ep} color="#c04040" />
              </div>
            )
          })}
        </div>
      )}

      {/* Skill bar */}
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {skillSlots.map((slot) => {
          const rune = ownedRunes.find((r) => r.id === slot.skillRuneId)
          return (
            <div
              key={slot.slotIndex}
              style={{
                border: '1px solid #555',
                borderRadius: 4,
                padding: '6px 10px',
                minWidth: 90,
                background: '#1e1812',
                fontSize: 11,
                textAlign: 'center',
              }}
            >
              <div style={{ color: rune ? '#f0c060' : '#555', marginBottom: 2 }}>
                [{slot.slotIndex + 1}] {rune?.name ?? '(empty)'}
              </div>
              <div style={{ color: '#888', fontSize: 10 }}>
                {rune && 'baseCooldown' in rune ? `${rune.baseCooldown}s CD` : '—'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Control buttons */}
      <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
        <button onClick={onRetreat} style={btnStyle()}>
          🏃 Retreat
        </button>
      </div>

      {/* Combat log */}
      <div
        style={{
          marginTop: 10,
          border: '1px solid #333',
          borderRadius: 4,
          padding: '6px 10px',
          background: '#111',
          fontSize: 11,
          maxHeight: 100,
          overflowY: 'auto',
          color: '#b0a080',
          fontFamily: 'monospace',
        }}
      >
        {combatLog.length === 0 ? (
          <div style={{ color: '#555' }}>Entering battle…</div>
        ) : (
          [...combatLog].reverse().map((line, i) => (
            <div key={i} style={{ marginBottom: 2 }}>
              {line}
            </div>
          ))
        )}
      </div>

      {/* Death modal — Shrine Screen */}
      {showDeathModal && (
        <ShrineScreen
          fromDeath
          onReturnToMap={() => {
            setShowDeathModal(false)
            onRetreat()
          }}
          onClose={() => {
            setShowDeathModal(false)
            onRetreat()
          }}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BarFillProps {
  value: number
  max: number
  percent: number
  color: string
}

function BarFill({ value, max, percent, color }: BarFillProps) {
  return (
    <span>
      {' '}
      <span
        style={{
          display: 'inline-block',
          width: 120,
          height: 8,
          background: '#333',
          borderRadius: 2,
          overflow: 'hidden',
          verticalAlign: 'middle',
        }}
      >
        <span
          style={{
            display: 'block',
            width: `${percent}%`,
            height: '100%',
            background: color,
            transition: 'width 0.2s',
          }}
        />
      </span>
      <span style={{ color: '#888', marginLeft: 6 }}>
        {value} / {max}
      </span>
    </span>
  )
}

function btnStyle(): React.CSSProperties {
  return {
    background: '#2a2010',
    border: '1px solid #666',
    color: '#e0d5c0',
    padding: '4px 12px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
  }
}

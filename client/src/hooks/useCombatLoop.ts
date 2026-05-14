import { useEffect, useRef, useState } from 'react'
import { PhaserEventBus, PHASER_EVENTS } from '../phaser/events/PhaserEventBus'
import { usePlayerStore } from '../store/usePlayerStore'
import { useMapStore } from '../store/useMapStore'
import type { CombatResult } from '../types/combat'

export interface EnemyHPState {
  instanceId: string
  templateId: string
  name: string
  currentHP: number
  maxHP: number
  currentBarrier: number
  maxBarrier: number
}

export interface DropInfo {
  templateId: string
  dropTableId: string
  expReward: number
  isBoss?: boolean
  signatureDrops?: Array<{ runeId?: string; itemTemplateId?: string; dropChance: number; isGuaranteedFirstKill: boolean }>
}

export interface BattleEndResult {
  victory: boolean
  isBoss?: boolean
  bossId?: string
  enemies: DropInfo[]
}

const MAX_LOG_LINES = 20

export function useCombatLoop() {
  const takeDamage = usePlayerStore((s) => s.takeDamage)
  const gainExp = usePlayerStore((s) => s.gainExp)
  const clearNode = useMapStore((s) => s.clearNode)
  const currentNodeId = useMapStore((s) => s.currentNodeId)

  const [combatLog, setCombatLog] = useState<string[]>([])
  const [enemyHPMap, setEnemyHPMap] = useState<Record<string, EnemyHPState>>({})
  const [battleResult, setBattleResult] = useState<BattleEndResult | null>(null)
  const [playerDied, setPlayerDied] = useState(false)

  // Track enemy HP refs for fast updates from Phaser
  const enemyHPRef = useRef<Record<string, EnemyHPState>>({})

  const appendLog = (line: string) => {
    setCombatLog((prev) => {
      const next = [...prev, line]
      return next.slice(-MAX_LOG_LINES)
    })
  }

  useEffect(() => {
    // Reset state on mount
    setBattleResult(null)
    setPlayerDied(false)
    setCombatLog([])
    setEnemyHPMap({})
    enemyHPRef.current = {}

    const onEnemyDied = (data: unknown) => {
      const d = data as { enemyId: string; templateId: string; expReward: number }
      gainExp(d.expReward)
      setEnemyHPMap((prev) => {
        const next = { ...prev }
        if (next[d.enemyId]) {
          next[d.enemyId] = { ...next[d.enemyId], currentHP: 0 }
        }
        return next
      })
    }

    const onPlayerDied = () => {
      setPlayerDied(true)
    }

    const onBattleEnd = (data: unknown) => {
      const d = data as BattleEndResult
      setBattleResult(d)
      if (d.victory && currentNodeId) {
        clearNode(currentNodeId)
      }
    }

    const onDamageDealt = (data: unknown) => {
      const d = data as {
        targetId: string
        result: CombatResult
        skillId: string
      }
      setEnemyHPMap((prev) => {
        const existing = prev[d.targetId]
        if (!existing) return prev
        const newHP = Math.max(0, existing.currentHP - d.result.hpDamage)
        const newBarrier = Math.max(0, existing.currentBarrier - d.result.barrierDamage)
        return {
          ...prev,
          [d.targetId]: { ...existing, currentHP: newHP, currentBarrier: newBarrier },
        }
      })
    }

    const onEnemyAttack = (data: unknown) => {
      const d = data as { enemyId: string; result: CombatResult }
      if (!d.result.missed && !d.result.dodged) {
        takeDamage(d.result.hpDamage, d.result.barrierDamage)
      }
    }

    const onCombatLog = (data: unknown) => {
      appendLog(data as string)
    }

    const onSceneReady = () => {
      appendLog('> Battle started!')
    }

    PhaserEventBus.on(PHASER_EVENTS.ENEMY_DIED, onEnemyDied)
    PhaserEventBus.on(PHASER_EVENTS.PLAYER_DIED, onPlayerDied)
    PhaserEventBus.on(PHASER_EVENTS.BATTLE_END, onBattleEnd)
    PhaserEventBus.on(PHASER_EVENTS.DAMAGE_DEALT, onDamageDealt)
    PhaserEventBus.on(PHASER_EVENTS.ENEMY_ATTACK, onEnemyAttack)
    PhaserEventBus.on(PHASER_EVENTS.COMBAT_LOG, onCombatLog)
    PhaserEventBus.on(PHASER_EVENTS.SCENE_READY, onSceneReady)

    return () => {
      PhaserEventBus.off(PHASER_EVENTS.ENEMY_DIED, onEnemyDied)
      PhaserEventBus.off(PHASER_EVENTS.PLAYER_DIED, onPlayerDied)
      PhaserEventBus.off(PHASER_EVENTS.BATTLE_END, onBattleEnd)
      PhaserEventBus.off(PHASER_EVENTS.DAMAGE_DEALT, onDamageDealt)
      PhaserEventBus.off(PHASER_EVENTS.ENEMY_ATTACK, onEnemyAttack)
      PhaserEventBus.off(PHASER_EVENTS.COMBAT_LOG, onCombatLog)
      PhaserEventBus.off(PHASER_EVENTS.SCENE_READY, onSceneReady)
    }
  }, [takeDamage, gainExp, clearNode, currentNodeId])

  const initEnemies = (enemies: EnemyHPState[]) => {
    const map: Record<string, EnemyHPState> = {}
    enemies.forEach((e) => {
      map[e.instanceId] = e
    })
    enemyHPRef.current = map
    setEnemyHPMap(map)
  }

  return {
    combatLog,
    enemyHPMap,
    battleResult,
    playerDied,
    initEnemies,
  }
}

import React, { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { PreloadScene } from './scenes/PreloadScene'
import { BattleScene } from './scenes/BattleScene'
import type { EnemyTemplate } from '../types/enemy'

interface PhaserGameProps {
  enemies: EnemyTemplate[]
  playerStats: {
    baseAttackMin: number
    baseAttackMax: number
    attackSpeed: number
    critChance: number
    critBonus: number
    additiveIncreases: number
    multiplicativeAmplifiers: number[]
    currentBarrier: number
  }
  skillSlots: Array<{
    slotIndex: number
    skillRuneId: string | null
    skillCoef: number
    damageType: string
    resourceCost: number
    baseCooldown: number
  }>
  battleSpeed?: number
  width?: number
  height?: number
}

export const PhaserGame: React.FC<PhaserGameProps> = ({
  enemies,
  playerStats,
  skillSlots,
  battleSpeed = 1,
  width = 540,
  height = 280,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      backgroundColor: '#0d0b08',
      parent: containerRef.current,
      scene: [PreloadScene, BattleScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
      },
      audio: { noAudio: true },
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    // Pass data once BattleScene is started from PreloadScene
    game.events.on('ready', () => {
      const battleScene = game.scene.getScene('BattleScene') as BattleScene | null
      if (battleScene) {
        battleScene.scene.restart({
          enemies,
          playerStats,
          skillSlots,
          battleSpeed,
        })
      }
    })

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update battle speed when prop changes
  useEffect(() => {
    if (!gameRef.current) return
    const scene = gameRef.current.scene.getScene('BattleScene') as BattleScene | null
    if (scene) {
      ;(scene as unknown as { battleSpeed: number }).battleSpeed = battleSpeed
    }
  }, [battleSpeed])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: width,
        height,
        background: '#0d0b08',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    />
  )
}

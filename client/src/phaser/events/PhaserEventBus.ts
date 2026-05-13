/**
 * PhaserEventBus — lightweight EventEmitter bridge between Phaser scenes and React.
 * Phaser emits events here; React hooks listen to them.
 */

type Listener = (...args: unknown[]) => void

class EventBus {
  private listeners: Map<string, Listener[]> = new Map()

  on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  off(event: string, listener: Listener): void {
    const existing = this.listeners.get(event)
    if (!existing) return
    this.listeners.set(
      event,
      existing.filter((l) => l !== listener)
    )
  }

  emit(event: string, ...args: unknown[]): void {
    const existing = this.listeners.get(event)
    if (!existing) return
    existing.forEach((l) => l(...args))
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

export const PhaserEventBus = new EventBus()

// Typed event names
export const PHASER_EVENTS = {
  ENEMY_DIED: 'ENEMY_DIED',
  PLAYER_DIED: 'PLAYER_DIED',
  BATTLE_END: 'BATTLE_END',
  DAMAGE_DEALT: 'DAMAGE_DEALT',
  ENEMY_ATTACK: 'ENEMY_ATTACK',
  COMBAT_LOG: 'COMBAT_LOG',
  SCENE_READY: 'SCENE_READY',
} as const

export type PhaserEventName = (typeof PHASER_EVENTS)[keyof typeof PHASER_EVENTS]

/**
 * saveMigration.ts
 *
 * Versioned save migration utilities for Cursed Japan ARPG.
 *
 * How to add a new version:
 * 1. Increment CURRENT_SAVE_VERSION.
 * 2. Add a migration function `migrate_vN_to_vM`.
 * 3. Add an entry in MIGRATIONS mapping the old version → migration function.
 *
 * Each migration receives the raw persisted state and returns a new state
 * object (or the same one if no structural change needed). Migrations are
 * applied sequentially so only write a function for each adjacent step.
 */

export const CURRENT_SAVE_VERSION = 1

type AnyState = Record<string, unknown>
type MigrationFn = (old: AnyState) => AnyState

/**
 * Map of old version → migration function that upgrades to old+1.
 * Add entries here when bumping CURRENT_SAVE_VERSION.
 */
const MIGRATIONS: Record<number, MigrationFn> = {
  // v0 → v1: add killsSinceLastRareDrop field if missing
  0: (state) => ({
    ...state,
    killsSinceLastRareDrop: (state.killsSinceLastRareDrop as number | undefined) ?? 0,
  }),
}

/**
 * Run all necessary migrations to bring `persistedState` up to
 * CURRENT_SAVE_VERSION. Returns the migrated state and the new version.
 */
export function migrateState(
  persistedState: AnyState,
  persistedVersion: number
): { state: AnyState; version: number } {
  let state = { ...persistedState }
  let version = persistedVersion

  while (version < CURRENT_SAVE_VERSION) {
    const migrateFn = MIGRATIONS[version]
    if (migrateFn) {
      try {
        state = migrateFn(state)
      } catch (err) {
        console.warn(`[saveMigration] Migration v${version}→v${version + 1} failed:`, err)
        // Continue with un-migrated state rather than crashing
      }
    }
    version++
  }

  return { state, version }
}

/**
 * Safely parse save state from localStorage.
 * Returns null if the stored data is malformed or missing.
 */
export function safeLoadSave(storeName: string): { state: AnyState; version: number } | null {
  try {
    const raw = localStorage.getItem(storeName)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).state !== 'object'
    ) {
      console.warn(`[saveMigration] Malformed save detected for "${storeName}", resetting.`)
      localStorage.removeItem(storeName)
      return null
    }
    const wrapped = parsed as { state: AnyState; version?: number }
    const version = typeof wrapped.version === 'number' ? wrapped.version : 0
    return { state: wrapped.state, version }
  } catch (err) {
    console.warn(`[saveMigration] Failed to parse save "${storeName}":`, err)
    localStorage.removeItem(storeName)
    return null
  }
}

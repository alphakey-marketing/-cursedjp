/**
 * useAutosave.ts
 *
 * Throttled autosave hook for Cursed Japan ARPG.
 *
 * Zustand `persist` middleware already writes to localStorage on every state
 * change. This hook provides:
 *  - A periodic "checkpoint" save every N seconds (default 60s) that logs a
 *    confirmation to the console.
 *  - A manual `triggerSave` function that forces an immediate checkpoint.
 *  - A `lastSaved` timestamp (Date | null) for optional UI display.
 *
 * Usage in App.tsx:
 *   const { lastSaved } = useAutosave()
 */

import { useEffect, useState, useCallback, useRef } from 'react'

const AUTOSAVE_INTERVAL_MS = 60_000 // 60 seconds

export function useAutosave(intervalMs: number = AUTOSAVE_INTERVAL_MS) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const doCheckpoint = useCallback(() => {
    // Zustand persist already wrote to localStorage on the last state change.
    // We simply record a timestamp so the UI can indicate "last saved N ago".
    const now = new Date()
    setLastSaved(now)
    if (import.meta.env.DEV) {
      console.info(`[autosave] Checkpoint at ${now.toLocaleTimeString()}`)
    }
  }, [])

  const triggerSave = useCallback(() => {
    doCheckpoint()
    // Reset interval so the next automatic checkpoint is a full intervalMs away
    if (timerRef.current !== null) clearInterval(timerRef.current)
    timerRef.current = setInterval(doCheckpoint, intervalMs)
  }, [doCheckpoint, intervalMs])

  useEffect(() => {
    timerRef.current = setInterval(doCheckpoint, intervalMs)
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current)
    }
  }, [doCheckpoint, intervalMs])

  return { lastSaved, triggerSave }
}

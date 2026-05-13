import { useEffect } from 'react'
import { useOfflineStore } from '../store/useOfflineStore'
import { useMapStore } from '../store/useMapStore'
import { usePlayerStore } from '../store/usePlayerStore'
import { calculateOfflineGains } from '../engine/progression/offlineAccrual'
import type { Region } from '../types/region'

/**
 * On app load, computes any offline gains the player accrued while away.
 * Stores pending gains in useOfflineStore for display in OfflineSummaryScreen.
 * Call this hook once at the top of App.tsx.
 */
export function useOfflineAccrual() {
  const { lastOnlineTimestamp, setPendingGains, setLastOnlineTimestamp } = useOfflineStore()
  const { currentRegionId, idleFarmNodeId } = useMapStore()
  const character = usePlayerStore((s) => s.character)

  useEffect(() => {
    // Fetch region data to compute offline gains
    fetch('/data/regions.json')
      .then((r) => r.json())
      .then((regions: Region[]) => {
        const result = calculateOfflineGains(
          lastOnlineTimestamp,
          idleFarmNodeId,
          currentRegionId,
          regions,
          character.stats.level
        )

        if (result.exp > 0 || Object.keys(result.materials).length > 0) {
          setPendingGains(result.exp, result.materials)
        } else {
          // No meaningful gains — just update the timestamp
          setLastOnlineTimestamp(Date.now())
        }
      })
      .catch(() => {
        // On fetch failure, just reset the timestamp
        setLastOnlineTimestamp(Date.now())
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount only
}

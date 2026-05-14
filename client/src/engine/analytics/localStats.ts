/**
 * localStats — lightweight analytics tracking for in-game metrics.
 * All data lives in localStorage only; nothing is sent externally.
 */

const STORAGE_KEY = 'cursed-japan-stats'

interface LocalStats {
  sessionStart: number
  firstKillTimestamp: number | null
  firstBossKillTimestamp: number | null
  marketCampKillTimes: number[]
  bossKillTimes: number[]
  skillRuneUsageCount: Record<string, number>
  totalKills: number
  totalBossKills: number
}

function _load(): LocalStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as LocalStats
  } catch {
    // ignore
  }
  return _defaults()
}

function _defaults(): LocalStats {
  return {
    sessionStart: Date.now(),
    firstKillTimestamp: null,
    firstBossKillTimestamp: null,
    marketCampKillTimes: [],
    bossKillTimes: [],
    skillRuneUsageCount: {},
    totalKills: 0,
    totalBossKills: 0,
  }
}

function _save(stats: LocalStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // ignore storage errors
  }
}

export const localStats = {
  /** Call when a normal-enemy camp is cleared */
  recordCampKill(nodeId: string): void {
    const stats = _load()
    const now = Date.now()

    if (stats.firstKillTimestamp === null) {
      stats.firstKillTimestamp = now
      console.log(`[Stats] First kill — time since session start: ${((now - stats.sessionStart) / 1000).toFixed(1)}s`)
    }

    stats.totalKills++

    if (nodeId === 'node_edo_01' || nodeId.includes('market')) {
      stats.marketCampKillTimes.push(now)
      if (stats.marketCampKillTimes.length > 100) {
        stats.marketCampKillTimes = stats.marketCampKillTimes.slice(-100)
      }
      const avgTTK = _averageTimeBetween(stats.marketCampKillTimes)
      if (avgTTK !== null) {
        console.log(`[Stats] Market Camp avg TTK: ${(avgTTK / 1000).toFixed(1)}s`)
      }
    }

    _save(stats)
  },

  /** Call when a boss is killed */
  recordBossKill(bossId: string): void {
    const stats = _load()
    const now = Date.now()

    if (stats.firstBossKillTimestamp === null) {
      stats.firstBossKillTimestamp = now
      console.log(`[Stats] First boss kill (${bossId}) — time since session start: ${((now - stats.sessionStart) / 1000).toFixed(1)}s`)
    }

    stats.totalBossKills++
    stats.bossKillTimes.push(now)

    if (stats.bossKillTimes.length > 50) {
      stats.bossKillTimes = stats.bossKillTimes.slice(-50)
    }

    const avgBossTTK = _averageTimeBetween(stats.bossKillTimes)
    if (avgBossTTK !== null) {
      console.log(`[Stats] Boss (${bossId}) avg TTK: ${(avgBossTTK / 1000).toFixed(1)}s`)
    }

    _save(stats)
  },

  /** Call when a skill rune fires */
  recordSkillUse(runeId: string): void {
    const stats = _load()
    stats.skillRuneUsageCount[runeId] = (stats.skillRuneUsageCount[runeId] ?? 0) + 1
    _save(stats)
  },

  /** Returns a snapshot of current stats for the debug panel */
  getSnapshot(): LocalStats {
    return _load()
  },

  /** Returns the most-used skill rune IDs sorted by usage */
  getMostUsedSkills(topN = 3): Array<{ runeId: string; count: number }> {
    const stats = _load()
    return Object.entries(stats.skillRuneUsageCount)
      .map(([runeId, count]) => ({ runeId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN)
  },

  /** Reset all stats (useful for testing) */
  reset(): void {
    _save({ ..._defaults(), sessionStart: Date.now() })
  },
}

function _averageTimeBetween(timestamps: number[]): number | null {
  if (timestamps.length < 2) return null
  const sorted = [...timestamps].sort((a, b) => a - b)
  const gaps: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(sorted[i] - sorted[i - 1])
  }
  return gaps.reduce((a, b) => a + b, 0) / gaps.length
}

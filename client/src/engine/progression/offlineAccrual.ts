import type { Region } from '../../types/region'
import { BALANCE } from '../../constants/gameBalance'

const BASE_MATERIAL_RATE = 0.1 // average materials per second at zone level

/**
 * Calculate EXP and materials gained during offline time.
 * Only applies if the player had idle farming set to a valid cleared node.
 */
export function calculateOfflineGains(
  lastTimestamp: number,
  idleFarmNodeId: string | null,
  currentRegionId: string,
  regions: Region[],
  playerLevel: number
): { exp: number; materials: Record<string, number>; elapsedSeconds: number } {
  if (!idleFarmNodeId) {
    return { exp: 0, materials: {}, elapsedSeconds: 0 }
  }

  const elapsedSeconds = Math.min(
    (Date.now() - lastTimestamp) / 1000,
    BALANCE.MAX_OFFLINE_SECONDS
  )

  // Minimum 60 seconds before showing any gains
  if (elapsedSeconds < 60) {
    return { exp: 0, materials: {}, elapsedSeconds }
  }

  const region = regions.find((r) => r.id === currentRegionId)
  if (!region) {
    return { exp: 0, materials: {}, elapsedSeconds }
  }

  // E9 fix: validate that the idle farm node actually belongs to this region.
  // Stale save data could reference a node from a different (or removed) region.
  const farmNode = region.nodes.find((n) => n.id === idleFarmNodeId)
  if (!farmNode) {
    return { exp: 0, materials: {}, elapsedSeconds }
  }

  const rateMultiplier = region.offlineRateMultiplier ?? 1.0

  // EXP calculation: playerLevel × BASE_EXP_RATE × regionMultiplier per second
  const baseExpPerSecond = playerLevel * BALANCE.BASE_EXP_RATE * rateMultiplier
  const exp = Math.floor(baseExpPerSecond * elapsedSeconds)

  // Materials: drawn from region's ambient enemy pool
  // Each enemy in the pool contributes common materials
  const materialPool = region.ambientEnemyPool ?? []
  const materials: Record<string, number> = {}

  if (materialPool.length > 0) {
    // Iron Shard — common drop from physical enemies
    const ironShards = Math.floor(
      elapsedSeconds * BASE_MATERIAL_RATE * rateMultiplier * 0.5
    )
    if (ironShards > 0) materials['iron_shard'] = ironShards

    // Coarse Cloth — common drop
    const cloth = Math.floor(
      elapsedSeconds * BASE_MATERIAL_RATE * rateMultiplier * 0.25
    )
    if (cloth > 0) materials['coarse_cloth'] = cloth

    // Gold
    const gold = Math.floor(
      elapsedSeconds * playerLevel * rateMultiplier * 0.3
    )
    if (gold > 0) materials['gold'] = gold

    // Rune Dust (rare — about 1 per 60 seconds)
    const runeDust = Math.floor(elapsedSeconds / 60 * rateMultiplier)
    if (runeDust > 0) materials['rune_dust'] = runeDust
  }

  // Rule: no rare runes or unique items in offline accrual
  // (Only common materials and gold are granted)

  return { exp, materials, elapsedSeconds }
}

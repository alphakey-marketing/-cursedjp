import type { PassiveNodeDefinition } from '../../types/passive'
import type { CharacterStats } from '../../types/character'

/**
 * Check if a node can be allocated given currently allocated nodes.
 * A node is allocatable if at least one of its connectedNodeIds is already allocated,
 * OR if the node has no required connections (node_start).
 */
export function canAllocateNode(
  nodeId: string,
  allocatedNodeIds: string[],
  allNodes: PassiveNodeDefinition[]
): boolean {
  if (allocatedNodeIds.includes(nodeId)) return false // already allocated

  const node = allNodes.find((n) => n.id === nodeId)
  if (!node) return false

  // Start node is always allocatable (cost 0)
  if (node.cost === 0) return true

  // Check requiredNodeIds first
  if (node.requiredNodeIds && node.requiredNodeIds.length > 0) {
    const hasRequired = node.requiredNodeIds.every((req) => allocatedNodeIds.includes(req))
    if (!hasRequired) return false
  }

  // Must be adjacent to at least one allocated node
  return node.connectedNodeIds.some((connId) => allocatedNodeIds.includes(connId))
}

/**
 * Check if a node can be deallocated without disconnecting other allocated nodes.
 * Simple rule: a node can be deallocated if removing it doesn't orphan other nodes.
 * We do a BFS from node_start excluding the target node to check connectivity.
 */
export function canDeallocateNode(
  nodeId: string,
  allocatedNodeIds: string[],
  allNodes: PassiveNodeDefinition[]
): boolean {
  if (!allocatedNodeIds.includes(nodeId)) return false
  if (nodeId === 'node_start') return false // cannot remove origin

  // Simulate removal
  const remaining = allocatedNodeIds.filter((id) => id !== nodeId)

  // BFS from node_start through remaining allocated nodes
  const reachable = new Set<string>()
  const queue = ['node_start']
  while (queue.length > 0) {
    const current = queue.shift()!
    if (reachable.has(current)) continue
    reachable.add(current)

    const nodeDef = allNodes.find((n) => n.id === current)
    if (!nodeDef) continue
    for (const conn of nodeDef.connectedNodeIds) {
      if (remaining.includes(conn) && !reachable.has(conn)) {
        queue.push(conn)
      }
    }
  }

  // All remaining allocated nodes must still be reachable
  return remaining.every((id) => reachable.has(id))
}

/**
 * Sum all stat bonuses from the currently allocated passive nodes.
 */
export function sumPassiveStats(
  allocatedNodeIds: string[],
  allNodes: PassiveNodeDefinition[]
): Partial<CharacterStats> {
  const totals: Partial<CharacterStats> = {}

  for (const nodeId of allocatedNodeIds) {
    const node = allNodes.find((n) => n.id === nodeId)
    if (!node?.stats) continue

    for (const [key, value] of Object.entries(node.stats) as [keyof CharacterStats, number][]) {
      const current = (totals[key] as number | undefined) ?? 0
      ;(totals as Record<string, number>)[key] = current + value
    }
  }

  return totals
}

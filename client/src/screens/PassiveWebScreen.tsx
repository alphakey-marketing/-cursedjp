import React, { useEffect, useState } from 'react'
import { usePassiveStore } from '../store/usePassiveStore'
import { usePlayerStore } from '../store/usePlayerStore'
import { PassiveNode } from '../components/PassiveNode'
import {
  canAllocateNode,
  canDeallocateNode,
  sumPassiveStats,
} from '../engine/runes/passiveWebEngine'
import type { PassiveNodeDefinition } from '../types/passive'

interface PassiveWebScreenProps {
  onClose: () => void
}

const SVG_WIDTH = 620
const SVG_HEIGHT = 480

export const PassiveWebScreen: React.FC<PassiveWebScreenProps> = ({ onClose }) => {
  const [allNodes, setAllNodes] = useState<PassiveNodeDefinition[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const { allocatedNodeIds, totalPointsAvailable, totalPointsSpent, allocateNode, deallocateNode, resetAllNodes } =
    usePassiveStore()
  const character = usePlayerStore((s) => s.character)

  useEffect(() => {
    fetch('/data/passiveNodes.json')
      .then((r) => r.json())
      .then((data: PassiveNodeDefinition[]) => setAllNodes(data))
      .catch(() => {})
  }, [])

  const selectedNode = allNodes.find((n) => n.id === selectedNodeId) ?? null

  // Compute passive stat totals for display (not yet applied to player store)
  const passiveTotals = allNodes.length > 0 ? sumPassiveStats(allocatedNodeIds, allNodes) : {}

  const showStatus = (msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(null), 2500)
  }

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId)
  }

  const handleAllocate = () => {
    if (!selectedNodeId) return
    if (!canAllocateNode(selectedNodeId, allocatedNodeIds, allNodes)) {
      showStatus('Cannot allocate: not connected or no points available')
      return
    }
    if (totalPointsAvailable <= 0) {
      showStatus('No passive points available')
      return
    }
    allocateNode(selectedNodeId)
    showStatus(`Allocated: ${allNodes.find((n) => n.id === selectedNodeId)?.label ?? selectedNodeId}`)
  }

  const handleDeallocate = () => {
    if (!selectedNodeId) return
    if (!canDeallocateNode(selectedNodeId, allocatedNodeIds, allNodes)) {
      showStatus('Cannot deallocate: other nodes depend on this path')
      return
    }
    deallocateNode(selectedNodeId)
    showStatus(`Deallocated: ${allNodes.find((n) => n.id === selectedNodeId)?.label ?? selectedNodeId}`)
  }

  const handleReset = () => {
    if (!window.confirm('Reset all passive allocations?')) return
    resetAllNodes()
    setSelectedNodeId(null)
    showStatus('All passive nodes reset')
  }

  // Determine visual state for each node
  const getNodeState = (node: PassiveNodeDefinition) => {
    const isAlloc = allocatedNodeIds.includes(node.id)
    const isKeystone = node.type === 'Keystone'
    if (isAlloc) return isKeystone ? 'keystone-allocated' : 'allocated'
    if (canAllocateNode(node.id, allocatedNodeIds, allNodes)) return isKeystone ? 'keystone-locked' : 'reachable'
    return 'locked'
  }

  return (
    <div style={{ color: '#e0d5c0' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
          borderBottom: '1px solid #444',
          paddingBottom: 8,
        }}
      >
        <button onClick={onClose} style={btnStyle('#2a2010')}>◀ Back</button>
        <span style={{ fontWeight: 'bold', color: '#f0c060', flex: 1 }}>PASSIVE WEB</span>
        <span style={{ fontSize: 12, color: '#c97c2a' }}>
          {totalPointsAvailable} available / {totalPointsSpent} used
        </span>
        <button onClick={handleReset} style={btnStyle('#1a0808')}>
          Reset All
        </button>
      </div>

      {/* Status message */}
      {statusMsg && (
        <div
          style={{
            background: '#1a2010',
            border: '1px solid #608040',
            borderRadius: 4,
            padding: '5px 10px',
            marginBottom: 10,
            fontSize: 12,
            color: '#a0e070',
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* SVG web */}
      <div
        style={{
          border: '1px solid #3a3a4a',
          borderRadius: 4,
          overflow: 'auto',
          background: '#07070d',
          marginBottom: 12,
        }}
      >
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ display: 'block' }}
        >
          {/* Draw edges */}
          {allNodes.map((node) =>
            node.connectedNodeIds.map((connId) => {
              const conn = allNodes.find((n) => n.id === connId)
              if (!conn) return null
              // Only draw each edge once (id < connId lexicographically)
              if (node.id >= connId) return null
              const isActive =
                allocatedNodeIds.includes(node.id) && allocatedNodeIds.includes(connId)
              return (
                <line
                  key={`${node.id}-${connId}`}
                  x1={node.position.x}
                  y1={node.position.y}
                  x2={conn.position.x}
                  y2={conn.position.y}
                  stroke={isActive ? '#806040' : '#2a2a2a'}
                  strokeWidth={isActive ? 2 : 1}
                />
              )
            })
          )}

          {/* Draw nodes */}
          {allNodes.map((node) => (
            <PassiveNode
              key={node.id}
              node={node}
              state={getNodeState(node)}
              isSelected={selectedNodeId === node.id}
              onClick={handleNodeClick}
            />
          ))}
        </svg>
      </div>

      {/* Selected node info panel */}
      {selectedNode ? (
        <div
          style={{
            border: '1px solid #3a3a4a',
            borderRadius: 4,
            padding: '10px 14px',
            background: '#0d0d12',
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#f0c060', marginBottom: 4 }}>
            {selectedNode.label}
            <span style={{ marginLeft: 8, fontWeight: 'normal', color: '#7a7a8a', fontSize: 12 }}>
              ({selectedNode.type})
            </span>
          </div>

          {selectedNode.keystoneEffect && (
            <div style={{ color: '#c080ff', fontSize: 12, marginBottom: 6 }}>
              {selectedNode.keystoneEffect}
            </div>
          )}

          {selectedNode.stats && Object.keys(selectedNode.stats).length > 0 && (
            <div style={{ fontSize: 12, color: '#b0a080', marginBottom: 6 }}>
              {Object.entries(selectedNode.stats).map(([k, v]) => (
                <span key={k} style={{ marginRight: 12 }}>
                  +{formatStatValue(v)} {k}
                </span>
              ))}
            </div>
          )}

          <div style={{ fontSize: 11, color: '#7a7a8a', marginBottom: 8 }}>
            Cost: {selectedNode.cost} point
            {selectedNode.requiredNodeIds && selectedNode.requiredNodeIds.length > 0 && (
              <span style={{ marginLeft: 8 }}>
                | Requires: {selectedNode.requiredNodeIds.join(', ')}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {canAllocateNode(selectedNode.id, allocatedNodeIds, allNodes) &&
              totalPointsAvailable > 0 && (
                <button onClick={handleAllocate} style={btnStyle('#1a2a10')}>
                  ✓ Allocate — {selectedNode.cost}pt
                </button>
              )}
            {allocatedNodeIds.includes(selectedNode.id) && selectedNode.id !== 'node_start' && (
              <button onClick={handleDeallocate} style={btnStyle('#1a0808')}>
                × Deallocate
              </button>
            )}
            {!canAllocateNode(selectedNode.id, allocatedNodeIds, allNodes) &&
              !allocatedNodeIds.includes(selectedNode.id) && (
                <span style={{ color: '#555', fontSize: 12 }}>● Not yet reachable</span>
              )}
          </div>
        </div>
      ) : (
        <div style={{ color: '#555', fontSize: 12, padding: '8px 0' }}>
          Click a node to see its details
        </div>
      )}

      {/* Passive stat totals summary */}
      {Object.keys(passiveTotals).length > 0 && (
        <div
          style={{
            marginTop: 12,
            border: '1px solid #2a2a3a',
            borderRadius: 4,
            padding: '8px 14px',
            background: '#07070d',
            fontSize: 11,
            color: '#8080a0',
          }}
        >
          <span style={{ color: '#7a7a8a', marginRight: 8 }}>Passive bonuses:</span>
          {Object.entries(passiveTotals).map(([k, v]) => (
            <span key={k} style={{ marginRight: 10, color: '#a0c080' }}>
              +{formatStatValue(v)} {k}
            </span>
          ))}
          <span style={{ marginLeft: 8, color: '#555' }}>
            (Lv.{character.stats.level})
          </span>
        </div>
      )}
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    border: '1px solid #555',
    color: '#e0d5c0',
    padding: '5px 12px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
  }
}

function formatStatValue(value: unknown): string {
  if (typeof value !== 'number') return JSON.stringify(value)
  return value < 1 && value > 0 ? `${(value * 100).toFixed(0)}%` : String(value)
}

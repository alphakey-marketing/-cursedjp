import React, { useEffect, useState } from 'react'
import { useMapStore } from '../store/useMapStore'
import { usePlayerStore } from '../store/usePlayerStore'
import { RegionNode } from '../components/RegionNode'
import type { Region, MapNode } from '../types/region'

interface WorldMapScreenProps {
  onFight: (nodeId: string) => void
  onBossInfo: (bossId: string) => void
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({ onFight, onBossInfo }) => {
  const [regions, setRegions] = useState<Region[]>([])
  const {
    currentRegionId,
    currentNodeId,
    discoveredNodeIds,
    clearedNodeIds,
    idleFarmNodeId,
    isIdleFarming,
    setCurrentNode,
    startIdleFarm,
    stopIdleFarm,
    discoverNode,
  } = useMapStore()
  const character = usePlayerStore((s) => s.character)

  const [selectedNodeId, setSelectedNodeId] = useState<string>(currentNodeId)

  useEffect(() => {
    fetch('/data/regions.json')
      .then((r) => r.json())
      .then((data: Region[]) => setRegions(data))
      .catch(() => {})
  }, [])

  const currentRegion = regions.find((r) => r.id === currentRegionId) ?? null
  const selectedNode: MapNode | null =
    currentRegion?.nodes.find((n) => n.id === selectedNodeId) ?? null

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    setCurrentNode(currentRegionId, nodeId)
    // Auto-discover adjacent nodes
    if (currentRegion) {
      const node = currentRegion.nodes.find((n) => n.id === nodeId)
      if (node) {
        node.connectedNodeIds.forEach((adjId) => discoverNode(adjId))
      }
    }
  }

  const handleFight = () => {
    if (selectedNode) onFight(selectedNode.id)
  }

  const handleIdleToggle = () => {
    if (isIdleFarming && idleFarmNodeId === selectedNodeId) {
      stopIdleFarm()
    } else if (selectedNodeId) {
      startIdleFarm(selectedNodeId)
    }
  }

  const handleBossInfo = () => {
    if (selectedNode?.bossId) onBossInfo(selectedNode.bossId)
  }

  const expPercent =
    character.stats.experienceToNextLevel > 0
      ? Math.floor((character.stats.experience / character.stats.experienceToNextLevel) * 100)
      : 0

  return (
    <div style={{ padding: '0', color: '#e0d5c0' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 12, color: '#888', fontSize: 12 }}>
        REGION:{' '}
        <span style={{ color: '#c0b090', fontWeight: 'bold' }}>
          {currentRegion?.name ?? currentRegionId}
        </span>
        {'  '}
        <span style={{ color: '#666' }}>Chapter 1</span>
      </div>

      {/* EXP bar */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#aaa' }}>
          EXP {character.stats.experience.toLocaleString()} /{' '}
          {character.stats.experienceToNextLevel.toLocaleString()}
        </span>
        <div
          style={{
            height: 4,
            background: '#333',
            borderRadius: 2,
            marginTop: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${expPercent}%`,
              height: '100%',
              background: '#8060e0',
              transition: 'width 0.4s',
            }}
          />
        </div>
      </div>

      {/* Map canvas */}
      {currentRegion ? (
        <div
          style={{
            border: '1px solid #444',
            borderRadius: 4,
            background: '#130f0a',
            marginBottom: 12,
            overflow: 'auto',
          }}
        >
          <svg
            width="600"
            height="420"
            viewBox="0 0 600 480"
            style={{ display: 'block', maxWidth: '100%' }}
          >
            {/* Connection lines */}
            {currentRegion.nodes.map((node) =>
              node.connectedNodeIds.map((targetId) => {
                const target = currentRegion.nodes.find((n) => n.id === targetId)
                if (!target) return null
                const srcVisible = discoveredNodeIds.includes(node.id)
                const tgtVisible = discoveredNodeIds.includes(targetId)
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={target.position.x}
                    y2={target.position.y}
                    stroke={srcVisible && tgtVisible ? '#555' : '#2a2a2a'}
                    strokeWidth={1.5}
                    strokeDasharray={srcVisible && tgtVisible ? undefined : '4 3'}
                  />
                )
              })
            )}
            {/* Nodes */}
            {currentRegion.nodes.map((node) => (
              <RegionNode
                key={node.id}
                node={node}
                isDiscovered={discoveredNodeIds.includes(node.id)}
                isCleared={clearedNodeIds.includes(node.id)}
                isIdleFarming={isIdleFarming && idleFarmNodeId === node.id}
                isSelected={selectedNodeId === node.id}
                onClick={handleNodeClick}
              />
            ))}
          </svg>
        </div>
      ) : (
        <div style={{ padding: 24, color: '#666' }}>Loading map…</div>
      )}

      {/* Node info panel */}
      {selectedNode ? (
        <div
          style={{
            border: '1px solid #555',
            borderRadius: 4,
            padding: '12px 16px',
            background: '#1e1812',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 6, color: '#f0c060' }}>
            {selectedNode.label}
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
            Type: {selectedNode.type} &nbsp;|&nbsp; Power: ~{selectedNode.recommendedPower}
            {selectedNode.enemyIds && selectedNode.enemyIds.length > 0 && (
              <span> &nbsp;|&nbsp; Enemies: {selectedNode.enemyIds.join(', ')}</span>
            )}
            {selectedNode.bossId && (
              <span> &nbsp;|&nbsp; Boss: {selectedNode.bossId}</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(selectedNode.type === 'EnemyCamp' || selectedNode.type === 'Miniboss') && (
              <button
                onClick={handleFight}
                style={btnStyle('#804020')}
                disabled={!discoveredNodeIds.includes(selectedNodeId)}
              >
                ⚔️ Fight (Auto)
              </button>
            )}
            {selectedNode.type === 'BossArena' && (
              <>
                <button onClick={handleFight} style={btnStyle('#803020')}>
                  ⚔️ Fight Boss
                </button>
                <button onClick={handleBossInfo} style={btnStyle('#402060')}>
                  📋 Boss Info
                </button>
              </>
            )}
            {clearedNodeIds.includes(selectedNodeId) && selectedNode.type !== 'Shrine' && (
              <button
                onClick={handleIdleToggle}
                style={
                  isIdleFarming && idleFarmNodeId === selectedNodeId
                    ? btnStyle('#203050')
                    : btnStyle('#204030')
                }
              >
                {isIdleFarming && idleFarmNodeId === selectedNodeId
                  ? '⏸ Stop Idle Farm'
                  : '🏃 Idle Farm Here'}
              </button>
            )}
            {selectedNode.type === 'Shrine' && (
              <button onClick={handleFight} style={btnStyle('#205040')}>
                ⛩ Visit Shrine
              </button>
            )}
          </div>

          {isIdleFarming && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#60c0f0' }}>
              ⚡ Idle farming:{' '}
              {idleFarmNodeId === selectedNodeId
                ? selectedNode.label
                : currentRegion?.nodes.find((n) => n.id === idleFarmNodeId)?.label ??
                  idleFarmNodeId}
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: '#666', fontSize: 12 }}>Select a node on the map.</div>
      )}
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    border: '1px solid #888',
    color: '#e0d5c0',
    padding: '6px 14px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 13,
  }
}

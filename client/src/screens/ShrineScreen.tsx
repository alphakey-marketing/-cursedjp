import React, { useEffect, useState } from 'react'
import { useMapStore } from '../store/useMapStore'
import type { Region, MapNode } from '../types/region'

interface ShrineScreenProps {
  fromDeath?: boolean
  onReturnToBattle?: () => void
  onReturnToMap: () => void
  onClose: () => void
}

export const ShrineScreen: React.FC<ShrineScreenProps> = ({
  fromDeath = false,
  onReturnToBattle,
  onReturnToMap,
  onClose,
}) => {
  const { currentRegionId, currentNodeId, discoveredShrineNodeIds, travelToShrine } = useMapStore()
  const [regions, setRegions] = useState<Region[]>([])

  useEffect(() => {
    fetch('/data/regions.json')
      .then((r) => r.json())
      .then((data: Region[]) => setRegions(data))
      .catch(() => {})
  }, [])

  const currentRegion = regions.find((r) => r.id === currentRegionId) ?? null
  const currentNode: MapNode | null =
    currentRegion?.nodes.find((n) => n.id === currentNodeId) ?? null

  // Gather all discovered shrine nodes across all regions
  const shrineNodes: Array<{ node: MapNode; regionName: string }> = []
  for (const region of regions) {
    for (const node of region.nodes) {
      if (node.type === 'Shrine' && discoveredShrineNodeIds.includes(node.id)) {
        shrineNodes.push({ node, regionName: region.name })
      }
    }
  }

  const handleFastTravel = (nodeId: string) => {
    travelToShrine(nodeId)
    onReturnToMap()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#111118',
          border: '1px solid #3a3a4a',
          borderRadius: 6,
          padding: 24,
          width: '100%',
          maxWidth: 420,
          color: '#e8e8e8',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🌸</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#f0c060' }}>
            {currentNode?.type === 'Shrine' ? currentNode.label : 'SHRINE'}
          </div>
          <div style={{ fontSize: 12, color: '#7a7a8a' }}>
            {currentRegion?.name ?? ''} — Chapter 1
          </div>
        </div>

        {/* Death message */}
        {fromDeath && (
          <div
            style={{
              background: '#1a0808',
              border: '1px solid #502020',
              borderRadius: 4,
              padding: '10px 14px',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#c04040', marginBottom: 4 }}>☠ You were defeated.</div>
            <div style={{ color: '#888', fontSize: 12 }}>
              Respawned at nearest shrine. No items lost.
            </div>
          </div>
        )}

        {/* Restore status */}
        <div
          style={{
            border: '1px solid #2a2a3a',
            borderRadius: 4,
            padding: '8px 14px',
            marginBottom: 16,
            fontSize: 12,
            color: '#44dd88',
          }}
        >
          <div>✓ HP fully restored</div>
          <div>✓ Barrier fully restored</div>
          <div>✓ Resource fully restored</div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {onReturnToBattle && !fromDeath && (
            <button onClick={onReturnToBattle} style={btnStyle('#2a2010')}>
              ⚔ Return to Battle
            </button>
          )}
          <button onClick={onReturnToMap} style={btnStyle('#1a2010')}>
            🗺 Return to Map
          </button>
        </div>

        {/* Fast travel */}
        {shrineNodes.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                color: '#7a7a8a',
                marginBottom: 8,
                borderTop: '1px solid #2a2a3a',
                paddingTop: 8,
              }}
            >
              DISCOVERED SHRINES — Fast Travel
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {shrineNodes.map(({ node, regionName }) => {
                const isCurrent = node.id === currentNodeId
                return (
                  <button
                    key={node.id}
                    onClick={() => handleFastTravel(node.id)}
                    disabled={isCurrent}
                    style={{
                      ...btnStyle('#18181f'),
                      color: isCurrent ? '#555' : '#b0a080',
                      textAlign: 'left',
                      fontSize: 11,
                    }}
                  >
                    ● {node.label} — {regionName}
                    {isCurrent && ' (Here)'}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Close */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button onClick={onClose} style={btnStyle('#1a1a1a')}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    width: '100%',
    background: bg,
    border: '1px solid #444',
    color: '#e0d5c0',
    padding: '8px 14px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
  }
}

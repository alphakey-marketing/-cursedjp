import React from 'react'
import type { PassiveNodeDefinition } from '../types/passive'

type PassiveNodeVisualState = 'allocated' | 'reachable' | 'locked' | 'keystone-allocated' | 'keystone-locked'

interface PassiveNodeProps {
  node: PassiveNodeDefinition
  state: PassiveNodeVisualState
  isSelected: boolean
  onClick: (nodeId: string) => void
  scale?: number
}

const STATE_COLORS: Record<PassiveNodeVisualState, { fill: string; stroke: string }> = {
  allocated: { fill: '#c97c2a', stroke: '#f0a040' },
  reachable: { fill: '#2a2820', stroke: '#806040' },
  locked: { fill: '#1a1a1a', stroke: '#3a3a3a' },
  'keystone-allocated': { fill: '#8030c0', stroke: '#c060ff' },
  'keystone-locked': { fill: '#1a1018', stroke: '#402050' },
}

export const PassiveNode: React.FC<PassiveNodeProps> = ({
  node,
  state,
  isSelected,
  onClick,
  scale = 1,
}) => {
  const isKeystone = node.type === 'Keystone'
  const isNotable = node.type === 'NotableNode'
  const colors = STATE_COLORS[state]

  const cx = node.position.x * scale
  const cy = node.position.y * scale

  const radius = isKeystone ? 14 * scale : isNotable ? 10 * scale : 7 * scale
  const strokeWidth = isSelected ? 2.5 : 1.5

  return (
    <g
      onClick={() => onClick(node.id)}
      style={{ cursor: state === 'locked' ? 'not-allowed' : 'pointer' }}
    >
      {isKeystone ? (
        // Diamond shape for keystones
        <polygon
          points={`${cx},${cy - radius} ${cx + radius},${cy} ${cx},${cy + radius} ${cx - radius},${cy}`}
          fill={colors.fill}
          stroke={isSelected ? '#ffff80' : colors.stroke}
          strokeWidth={strokeWidth}
        />
      ) : (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={colors.fill}
          stroke={isSelected ? '#ffff80' : colors.stroke}
          strokeWidth={strokeWidth}
        />
      )}

      {/* Label for keystones and notables */}
      {(isKeystone || isNotable) && (
        <text
          x={cx}
          y={cy + radius + 12 * scale}
          textAnchor="middle"
          fill={state.includes('allocated') ? '#f0c060' : '#888'}
          fontSize={9 * scale}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {node.label}
        </text>
      )}
    </g>
  )
}

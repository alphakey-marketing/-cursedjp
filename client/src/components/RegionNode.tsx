import React from 'react'
import type { MapNode } from '../types/region'

export type NodeVisualState =
  | 'undiscovered'
  | 'discovered'
  | 'cleared'
  | 'idle'
  | 'shrine'
  | 'boss'
  | 'selected'

interface RegionNodeProps {
  node: MapNode
  isDiscovered: boolean
  isCleared: boolean
  isIdleFarming: boolean
  isSelected: boolean
  onClick: (nodeId: string) => void
}

function getNodeIcon(type: MapNode['type'], isCleared: boolean, isIdleFarming: boolean): string {
  if (isIdleFarming) return '⚡'
  if (type === 'BossArena') return '⚑'
  if (type === 'Shrine') return '⛩'
  if (type === 'Miniboss') return '◆'
  if (isCleared) return '✓'
  return '●'
}

function getNodeColor(
  type: MapNode['type'],
  isDiscovered: boolean,
  isCleared: boolean,
  isIdleFarming: boolean,
  isSelected: boolean
): string {
  if (!isDiscovered) return '#444'
  if (isSelected) return '#f0c060'
  if (isIdleFarming) return '#60c0f0'
  if (type === 'BossArena') return '#e05050'
  if (type === 'Shrine') return '#80e0c0'
  if (type === 'Miniboss') return '#c080e0'
  if (isCleared) return '#60a060'
  return '#a0a0a0'
}

export const RegionNode: React.FC<RegionNodeProps> = ({
  node,
  isDiscovered,
  isCleared,
  isIdleFarming,
  isSelected,
  onClick,
}) => {
  const icon = isDiscovered
    ? getNodeIcon(node.type, isCleared, isIdleFarming)
    : '?'
  const color = getNodeColor(node.type, isDiscovered, isCleared, isIdleFarming, isSelected)

  const handleClick = () => {
    if (isDiscovered) onClick(node.id)
  }

  return (
    <g
      onClick={handleClick}
      style={{ cursor: isDiscovered ? 'pointer' : 'default' }}
    >
      <circle
        cx={node.position.x}
        cy={node.position.y}
        r={node.type === 'BossArena' ? 20 : node.type === 'Miniboss' ? 16 : 14}
        fill={isSelected ? '#2a2010' : '#1a1612'}
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        opacity={isDiscovered ? 1 : 0.4}
      />
      {isIdleFarming && (
        <circle
          cx={node.position.x}
          cy={node.position.y}
          r={node.type === 'BossArena' ? 26 : 20}
          fill="none"
          stroke="#60c0f0"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          opacity={0.7}
        />
      )}
      <text
        x={node.position.x}
        y={node.position.y + 5}
        textAnchor="middle"
        fill={color}
        fontSize={12}
        opacity={isDiscovered ? 1 : 0.4}
      >
        {icon}
      </text>
      <text
        x={node.position.x}
        y={node.position.y + 28}
        textAnchor="middle"
        fill={isDiscovered ? '#c0b090' : '#555'}
        fontSize={9}
      >
        {isDiscovered ? node.label : '???'}
      </text>
    </g>
  )
}

import React from 'react'
import type { AnyRune, SkillRune, LinkRune } from '../types/rune'

const ELEMENT_COLORS: Record<string, string> = {
  Physical: '#c0c0c0',
  Fire: '#e06030',
  Cold: '#40a0e0',
  Lightning: '#e0e030',
  Poison: '#60c040',
  Bleed: '#c03030',
  Holy: '#40d0c0',
  Chaos: '#8030c0',
}

interface RuneCardProps {
  rune: AnyRune
  isEquipped?: boolean
  isLinked?: boolean
  onEquipToSlot?: (rune: AnyRune) => void
  onRemove?: (rune: AnyRune) => void
  compact?: boolean
}

export const RuneCard: React.FC<RuneCardProps> = ({
  rune,
  isEquipped = false,
  isLinked = false,
  onEquipToSlot,
  onRemove,
  compact = false,
}) => {
  const isSkill = rune.category === 'Skill'
  const skillRune = isSkill ? (rune as SkillRune) : null
  const linkRune = !isSkill ? (rune as LinkRune) : null

  const color = isSkill && skillRune
    ? ELEMENT_COLORS[skillRune.damageType] ?? '#c0c0c0'
    : '#8080c0'

  const borderColor = isEquipped || isLinked ? color : '#555'

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        padding: compact ? '6px 8px' : '10px 12px',
        background: '#1a1612',
        minWidth: compact ? 90 : 130,
        maxWidth: compact ? 120 : 200,
        fontSize: compact ? 10 : 12,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Equipped / Linked badge */}
      {(isEquipped || isLinked) && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            right: 6,
            fontSize: 9,
            color: color,
            fontWeight: 'bold',
          }}
        >
          {isEquipped ? '✓' : '↗'}
        </div>
      )}

      {/* Name + category */}
      <div style={{ color: color, fontWeight: 'bold', marginBottom: 2, paddingRight: 14 }}>
        {rune.name}
      </div>
      <div style={{ color: '#888', marginBottom: compact ? 0 : 4 }}>
        {rune.category}
        {isSkill && skillRune && (
          <span style={{ color: ELEMENT_COLORS[skillRune.damageType] ?? '#aaa', marginLeft: 6 }}>
            {skillRune.damageType}
          </span>
        )}
      </div>

      {/* Skill rune stats */}
      {!compact && isSkill && skillRune && (
        <div style={{ color: '#b0a080', fontSize: 11, marginBottom: 4 }}>
          <div>Coef: {skillRune.skillCoef}× | CD: {skillRune.baseCooldown}s</div>
          <div>Cost: {skillRune.resourceCost} RS | Links: 0/{skillRune.maxSupportLinks}</div>
          {skillRune.weaponFamilyRestriction && skillRune.weaponFamilyRestriction.length > 0 && (
            <div style={{ color: '#e0a030' }}>
              ⚔ {skillRune.weaponFamilyRestriction.join('/')} only
            </div>
          )}
        </div>
      )}

      {/* Link rune effect */}
      {!compact && !isSkill && linkRune && (
        <div style={{ color: '#b0a080', fontSize: 11, marginBottom: 4 }}>
          <div>{linkRune.effectType}</div>
          {linkRune.modifiesTag && (
            <div style={{ color: '#8080a0' }}>Tag: {linkRune.modifiesTag}</div>
          )}
        </div>
      )}

      {/* Description */}
      {!compact && (
        <div style={{ color: '#888', fontSize: 10, marginBottom: 6 }}>
          {rune.description}
        </div>
      )}

      {/* Action buttons */}
      {!compact && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {onEquipToSlot && !isEquipped && !isLinked && (
            <button
              onClick={(e) => { e.stopPropagation(); onEquipToSlot(rune) }}
              style={btnStyle('#2a2010')}
            >
              Equip
            </button>
          )}
          {onRemove && (isEquipped || isLinked) && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(rune) }}
              style={btnStyle('#301010')}
            >
              Remove
            </button>
          )}
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
    padding: '2px 8px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 10,
  }
}

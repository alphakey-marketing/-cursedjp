import React from 'react'
import type { AnyItem, WeaponItem, ArmorItem, ItemGrade } from '../types/item'
import { getItemSellValue } from '../engine/items/dropResolver'

const GRADE_COLORS: Record<ItemGrade, string> = {
  Normal: '#c0c0c0',
  Magic: '#6060ff',
  Rare: '#f0d030',
  Legendary: '#ff8020',
  Unique: '#c0402a',
  Holy: '#40d0c0',
}

interface ItemCardProps {
  item: AnyItem
  showEquipButton?: boolean
  showStashButton?: boolean
  showSellButton?: boolean
  isEquipped?: boolean
  onEquip?: (item: AnyItem) => void
  onStash?: (item: AnyItem) => void
  onSell?: (item: AnyItem) => void
  compact?: boolean
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  showEquipButton = true,
  showStashButton = true,
  showSellButton = true,
  isEquipped = false,
  onEquip,
  onStash,
  onSell,
  compact = false,
}) => {
  const borderColor = GRADE_COLORS[item.grade] ?? '#888'
  const sellValue = getItemSellValue(item)

  const allAffixes = [...item.prefixes, ...item.suffixes]

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        padding: compact ? '6px 10px' : '10px 14px',
        background: '#1a1612',
        minWidth: compact ? 140 : 180,
        maxWidth: 260,
        fontSize: compact ? 11 : 12,
      }}
    >
      {/* Header */}
      <div style={{ color: borderColor, fontWeight: 'bold', marginBottom: 4 }}>
        [{item.grade}] {item.name}
        {isEquipped && (
          <span style={{ color: '#60a060', marginLeft: 6, fontSize: 10 }}>[Equipped]</span>
        )}
      </div>

      {/* Slot + level */}
      <div style={{ color: '#888', fontSize: 10, marginBottom: 6 }}>
        {item.slot} — Lv.{item.itemLevel}
      </div>

      {/* Weapon stats */}
      {isWeapon(item) && (
        <div style={{ color: '#c0b090', marginBottom: 4 }}>
          <div>
            Dmg: {item.baseDamageMin}–{item.baseDamageMax}
          </div>
          <div>Atk Speed: {item.attackSpeed.toFixed(2)}</div>
          <div>Crit: {Math.round(item.critBaseChance * 100)}%</div>
        </div>
      )}

      {/* Armor stats */}
      {isArmor(item) && (
        <div style={{ color: '#c0b090', marginBottom: 4 }}>
          <div>
            {item.primaryDefenseStat}: {item.baseDefenseValue}
          </div>
        </div>
      )}

      {/* Affixes */}
      {allAffixes.length > 0 && (
        <div style={{ borderTop: '1px solid #333', paddingTop: 4, marginBottom: 6 }}>
          {allAffixes.map((affix, i) => (
            <div key={i} style={{ color: '#80c0e0', fontSize: 10 }}>
              {affix.affixId.replace(/_/g, ' ')} +{Math.round(affix.value * 100)}%
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      {!compact && (
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          {showEquipButton && onEquip && (
            <button onClick={() => onEquip(item)} style={btnStyle('#403020')}>
              Equip
            </button>
          )}
          {showStashButton && onStash && (
            <button onClick={() => onStash(item)} style={btnStyle('#202040')}>
              Stash
            </button>
          )}
          {showSellButton && onSell && (
            <button onClick={() => onSell(item)} style={btnStyle('#402020')}>
              Sell {sellValue}g
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function isWeapon(item: AnyItem): item is WeaponItem {
  return item.slot === 'Weapon' && 'baseDamageMin' in item
}

function isArmor(item: AnyItem): item is ArmorItem {
  return 'primaryDefenseStat' in item
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    border: '1px solid #666',
    color: '#e0d5c0',
    padding: '3px 8px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 10,
  }
}

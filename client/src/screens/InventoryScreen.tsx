import React, { useState } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { useInventoryStore } from '../store/useInventoryStore'
import { useItemEquip } from '../hooks/useItemEquip'
import { getItemSellValue } from '../engine/items/dropResolver'
import type { AnyItem, ItemSlot, WeaponItem, ArmorItem } from '../types/item'

interface InventoryScreenProps {
  onClose: () => void
}

const SLOT_LAYOUT: ItemSlot[] = [
  'Helmet',
  'Chest',
  'Weapon',
  'OffHand',
  'Gloves',
  'Boots',
  'Ring1',
  'Ring2',
  'Amulet',
  'Charm',
]

const SLOT_ICONS: Record<string, string> = {
  Helmet: '🪖',
  Chest: '🥋',
  Weapon: '⚔️',
  OffHand: '🛡',
  Gloves: '🧤',
  Boots: '👟',
  Ring1: '💍',
  Ring2: '💍',
  Amulet: '📿',
  Charm: '✨',
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onClose }) => {
  const character = usePlayerStore((s) => s.character)
  const unequipItem = usePlayerStore((s) => s.unequipItem)
  const { bag, gold, addToBag } = useInventoryStore()
  const { equipDirectly, sellFromBag } = useItemEquip()

  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null)
  const [equipError, setEquipError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 2000)
  }

  const handleEquipFromDetail = () => {
    if (!selectedItem) return
    const result = equipDirectly(selectedItem)
    if (result.success) {
      setEquipError(null)
      showMessage(`Equipped ${selectedItem.name}`)
      setSelectedItem(null)
    } else {
      setEquipError(result.error ?? 'Cannot equip')
    }
  }

  const handleUnequip = (slot: ItemSlot) => {
    const item = character.equippedItems[slot]
    if (!item) return
    addToBag(item)
    unequipItem(slot)
    showMessage(`Unequipped ${item.name}`)
    setSelectedItem(null)
  }

  const handleSellFromBag = (item: AnyItem) => {
    const price = getItemSellValue(item)
    const sold = sellFromBag(item.instanceId, price)
    if (sold) {
      showMessage(`Sold ${item.name} for ${price}g`)
      if (selectedItem?.instanceId === item.instanceId) setSelectedItem(null)
    }
  }

  const handleSellAllJunk = () => {
    let total = 0
    const toSell = bag.filter((i) => i.grade === 'Normal' && !i.isLocked)
    toSell.forEach((item) => {
      const price = getItemSellValue(item)
      sellFromBag(item.instanceId, price)
      total += price
    })
    if (total > 0) showMessage(`Sold ${toSell.length} items for ${total}g`)
  }

  return (
    <div style={{ color: '#e0d5c0', position: 'relative' }}>
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
        <button onClick={onClose} style={btnStyle('#2a2010')}>
          ◀ Back
        </button>
        <span style={{ fontWeight: 'bold', color: '#f0c060' }}>INVENTORY</span>
        <span style={{ marginLeft: 'auto', color: '#f0d060', fontSize: 13 }}>
          Gold: {gold + character.currency.gold}
        </span>
        <span style={{ color: '#a08050', fontSize: 12 }}>
          Rune Dust: {character.currency.runeDust}
        </span>
      </div>

      {message && (
        <div
          style={{
            background: '#203020',
            border: '1px solid #404040',
            borderRadius: 3,
            padding: '4px 12px',
            marginBottom: 8,
            fontSize: 12,
            color: '#80c080',
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Equipped gear grid */}
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ fontWeight: 'bold', color: '#a0a0a0', marginBottom: 8, fontSize: 12 }}>
            EQUIPPED GEAR
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
            }}
          >
            {SLOT_LAYOUT.map((slot) => {
              const item = character.equippedItems[slot]
              return (
                <div
                  key={slot}
                  onClick={() => item && setSelectedItem(item)}
                  style={{
                    border: `1px solid ${item ? '#605040' : '#333'}`,
                    borderRadius: 4,
                    padding: '6px 8px',
                    background: item ? '#1e1812' : '#141210',
                    cursor: item ? 'pointer' : 'default',
                    minWidth: 100,
                    fontSize: 11,
                    position: 'relative',
                  }}
                >
                  <div style={{ color: '#888', fontSize: 9, marginBottom: 2 }}>
                    {SLOT_ICONS[slot]} {slot}
                  </div>
                  {item ? (
                    <div style={{ color: getGradeColor(item.grade) }}>{item.name}</div>
                  ) : (
                    <div style={{ color: '#444' }}>Empty</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bag grid */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 8,
              gap: 10,
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#a0a0a0', fontSize: 12 }}>
              BAG ({bag.length}/36)
            </span>
            <button onClick={handleSellAllJunk} style={btnStyle('#402020')}>
              Sell All Junk
            </button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 4,
            }}
          >
            {Array.from({ length: 36 }).map((_, idx) => {
              const item = bag[idx]
              return (
                <div
                  key={idx}
                  onClick={() => item && setSelectedItem(item)}
                  style={{
                    border: `1px solid ${item ? getGradeColor(item.grade) : '#333'}`,
                    borderRadius: 3,
                    width: 36,
                    height: 36,
                    background: item ? '#1e1812' : '#111',
                    cursor: item ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    outline:
                      selectedItem?.instanceId === item?.instanceId ? '2px solid #f0c060' : 'none',
                  }}
                >
                  {item ? getItemIcon(item) : ''}
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div
            style={{
              flex: '0 0 220px',
              minWidth: 180,
              border: '1px solid #555',
              borderRadius: 4,
              padding: '10px 12px',
              background: '#1a1612',
              fontSize: 12,
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                color: getGradeColor(selectedItem.grade),
                marginBottom: 6,
              }}
            >
              {selectedItem.name}
            </div>
            <div style={{ color: '#888', fontSize: 10, marginBottom: 8 }}>
              {selectedItem.slot} — [{selectedItem.grade}] Lv.{selectedItem.itemLevel}
            </div>

            {isWeapon(selectedItem) && (
              <div style={{ color: '#c0b090', marginBottom: 8 }}>
                <div>Dmg: {selectedItem.baseDamageMin}–{selectedItem.baseDamageMax}</div>
                <div>Atk Speed: {selectedItem.attackSpeed.toFixed(2)}</div>
                <div>Crit: {Math.round(selectedItem.critBaseChance * 100)}%</div>
              </div>
            )}
            {isArmor(selectedItem) && (
              <div style={{ color: '#c0b090', marginBottom: 8 }}>
                <div>{selectedItem.primaryDefenseStat}: {selectedItem.baseDefenseValue}</div>
              </div>
            )}

            {[...selectedItem.prefixes, ...selectedItem.suffixes].map((a, i) => (
              <div key={i} style={{ color: '#80c0e0', fontSize: 10, marginBottom: 2 }}>
                {a.affixId.replace(/_/g, ' ')} +{Math.round(a.value * 100)}%
              </div>
            ))}

            {equipError && (
              <div style={{ color: '#e06060', fontSize: 10, marginTop: 6 }}>⚠ {equipError}</div>
            )}

            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {/* Equip button (from bag items only) */}
              {bag.some((i) => i.instanceId === selectedItem.instanceId) && (
                <button onClick={handleEquipFromDetail} style={btnStyle('#403020')}>
                  Equip
                </button>
              )}
              {/* Unequip button (for equipped items) */}
              {Object.entries(character.equippedItems).some(
                ([, item]) => item?.instanceId === selectedItem.instanceId
              ) && (
                <button
                  onClick={() => handleUnequip(selectedItem.slot as ItemSlot)}
                  style={btnStyle('#402040')}
                >
                  Unequip
                </button>
              )}
              {/* Sell from bag */}
              {bag.some((i) => i.instanceId === selectedItem.instanceId) && (
                <button
                  onClick={() => handleSellFromBag(selectedItem)}
                  style={btnStyle('#402020')}
                >
                  Sell {getItemSellValue(selectedItem)}g
                </button>
              )}
              <button
                onClick={() => { setSelectedItem(null); setEquipError(null) }}
                style={btnStyle('#333')}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getGradeColor(grade: string): string {
  const map: Record<string, string> = {
    Normal: '#c0c0c0',
    Magic: '#6060ff',
    Rare: '#f0d030',
    Legendary: '#ff8020',
    Unique: '#c0402a',
    Holy: '#40d0c0',
  }
  return map[grade] ?? '#888'
}

function getItemIcon(item: AnyItem): string {
  if (item.slot === 'Weapon') return '⚔️'
  if (item.slot === 'Helmet') return '🪖'
  if (item.slot === 'Chest') return '🥋'
  if (item.slot === 'Boots') return '👟'
  if (item.slot === 'Gloves') return '🧤'
  if (item.slot === 'Ring1' || item.slot === 'Ring2') return '💍'
  if (item.slot === 'Amulet') return '📿'
  return '📦'
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
    padding: '4px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 11,
  }
}

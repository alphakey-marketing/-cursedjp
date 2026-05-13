import React from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { useInventoryStore } from '../store/useInventoryStore'
import { useItemEquip } from '../hooks/useItemEquip'
import { ItemCard } from '../components/ItemCard'
import { getItemSellValue } from '../engine/items/dropResolver'
import type { AnyItem, ItemSlot } from '../types/item'
import type { BattleEndResult } from '../hooks/useCombatLoop'
import type { DropResult } from '../engine/items/dropResolver'

interface ResultScreenProps {
  battleResult: BattleEndResult
  drops: DropResult
  onFightAgain: () => void
  onBackToMap: () => void
  onOpenInventory: () => void
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  drops,
  onFightAgain,
  onBackToMap,
  onOpenInventory,
}) => {
  const character = usePlayerStore((s) => s.character)
  const addGold = usePlayerStore((s) => s.addGold)
  const addToBag = useInventoryStore((s) => s.addToBag)
  const { equipDirectly, sellFromBag } = useItemEquip()

  const [collectedGold, setCollectedGold] = React.useState(false)
  const [stashedItems, setStashedItems] = React.useState<Set<string>>(new Set())
  const [soldItems, setSoldItems] = React.useState<Set<string>>(new Set())
  const [equippedItems, setEquippedItems] = React.useState<Set<string>>(new Set())
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Auto-apply gold on mount
  React.useEffect(() => {
    if (drops.gold > 0 && !collectedGold) {
      addGold(drops.gold)
      setCollectedGold(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const expPercent = Math.round(
    (character.stats.experience / character.stats.experienceToNextLevel) * 100
  )

  const handleEquip = (item: AnyItem) => {
    const result = equipDirectly(item)
    if (result.success) {
      setEquippedItems((prev) => new Set([...prev, item.instanceId]))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[item.instanceId]
        return next
      })
    } else {
      setErrors((prev) => ({ ...prev, [item.instanceId]: result.error ?? 'Cannot equip' }))
    }
  }

  const handleStash = (item: AnyItem) => {
    addToBag(item)
    setStashedItems((prev) => new Set([...prev, item.instanceId]))
  }

  const handleSell = (item: AnyItem) => {
    // Add to bag first, then sell
    addToBag(item)
    const sold = sellFromBag(item.instanceId, getItemSellValue(item))
    if (sold) {
      setSoldItems((prev) => new Set([...prev, item.instanceId]))
    }
  }

  const pendingItems = drops.items.filter(
    (item) =>
      !stashedItems.has(item.instanceId) &&
      !soldItems.has(item.instanceId) &&
      !equippedItems.has(item.instanceId)
  )

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#1a1612',
          border: '1px solid #666',
          borderRadius: 6,
          padding: 24,
          maxWidth: 700,
          width: '100%',
          color: '#e0d5c0',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 22, color: '#f0c060', fontWeight: 'bold' }}>
            ⚔️ BATTLE COMPLETE
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* Left: EXP + materials + gold */}
          <div style={{ flex: '0 0 220px', minWidth: 180 }}>
            <div style={{ fontWeight: 'bold', color: '#8060e0', marginBottom: 8 }}>
              EXP GAINED
            </div>
            <div style={{ fontSize: 14, color: '#c0a0ff', marginBottom: 4 }}>
              Lv.{character.stats.level}
            </div>
            <div
              style={{
                height: 8,
                background: '#333',
                borderRadius: 3,
                overflow: 'hidden',
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: `${expPercent}%`,
                  height: '100%',
                  background: '#8060e0',
                  transition: 'width 1.5s ease',
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>
              {character.stats.experience} / {character.stats.experienceToNextLevel} EXP
            </div>

            {drops.materials.length > 0 && (
              <>
                <div style={{ fontWeight: 'bold', color: '#a08050', marginBottom: 6 }}>
                  MATERIALS
                </div>
                {drops.materials.map((mat) => (
                  <div key={mat.name} style={{ fontSize: 12, color: '#c0b090', marginBottom: 3 }}>
                    {mat.name} x{mat.qty}
                  </div>
                ))}
              </>
            )}

            {drops.gold > 0 && (
              <div style={{ marginTop: 12, fontSize: 13, color: '#f0d060' }}>
                + {drops.gold} Gold
              </div>
            )}

            {drops.runeIds.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 'bold', color: '#e0a060', marginBottom: 4, fontSize: 12 }}>
                  RUNE DROPS
                </div>
                {drops.runeIds.map((id) => (
                  <div key={id} style={{ fontSize: 11, color: '#e0b060' }}>
                    🌀 {id}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Item cards */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 'bold', color: '#a0a0a0', marginBottom: 8 }}>
              LOOT DROPPED
            </div>
            {drops.items.length === 0 && (
              <div style={{ color: '#555', fontSize: 12 }}>No items dropped.</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {drops.items.map((item) => {
                const isActedOn =
                  stashedItems.has(item.instanceId) ||
                  soldItems.has(item.instanceId) ||
                  equippedItems.has(item.instanceId)
                return (
                  <div key={item.instanceId}>
                    <div
                      style={{
                        opacity: isActedOn ? 0.4 : 1,
                        position: 'relative',
                      }}
                    >
                      <ItemCard
                        item={item}
                        showEquipButton={!isActedOn}
                        showStashButton={!isActedOn}
                        showSellButton={!isActedOn}
                        isEquipped={equippedItems.has(item.instanceId)}
                        onEquip={handleEquip}
                        onStash={handleStash}
                        onSell={handleSell}
                      />
                    </div>
                    {errors[item.instanceId] && (
                      <div style={{ color: '#e06060', fontSize: 10, marginTop: 2 }}>
                        ⚠ {errors[item.instanceId]}
                      </div>
                    )}
                    {equippedItems.has(item.instanceId) && (
                      <div style={{ color: '#60a060', fontSize: 10, marginTop: 2 }}>✓ Equipped</div>
                    )}
                    {stashedItems.has(item.instanceId) && (
                      <div style={{ color: '#6060a0', fontSize: 10, marginTop: 2 }}>
                        ✓ Added to bag
                      </div>
                    )}
                    {soldItems.has(item.instanceId) && (
                      <div style={{ color: '#a06060', fontSize: 10, marginTop: 2 }}>
                        ✓ Sold for {getItemSellValue(item)}g
                      </div>
                    )}
                  </div>
                )
              })}

              {pendingItems.length > 0 && pendingItems.length < drops.items.length && (
                <div style={{ color: '#888', fontSize: 11 }}>
                  + {pendingItems.length} item(s) pending action
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 20,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button onClick={onFightAgain} style={btnStyle('#403020')}>
            ⚔️ Fight Again
          </button>
          <button onClick={onBackToMap} style={btnStyle('#203040')}>
            🗺 Back to Map
          </button>
          <button onClick={onOpenInventory} style={btnStyle('#204020')}>
            🎒 Open Inventory
          </button>
        </div>
      </div>
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    border: '1px solid #888',
    color: '#e0d5c0',
    padding: '8px 20px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
  }
}

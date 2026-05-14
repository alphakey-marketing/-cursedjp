import React, { useState } from 'react'
import { useInventoryStore } from '../store/useInventoryStore'
import { useCraftingStore } from '../store/useCraftingStore'
import { salvageItem, rerollAffixes, upgradeItemGrade, getCraftingCost } from '../engine/items/craftingEngine'
import { getItemSellValue } from '../engine/items/dropResolver'
import type { BaseItem } from '../types/item'

type CraftTab = 'salvage' | 'reroll' | 'upgrade'

interface CraftingScreenProps {
  onClose: () => void
}

const GRADE_COLORS: Record<string, string> = {
  Normal: '#c0c0c0',
  Magic: '#6080e0',
  Rare: '#d4b800',
  Legendary: '#e07820',
  Unique: '#cc3030',
  Holy: '#60d4c0',
}

export const CraftingScreen: React.FC<CraftingScreenProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<CraftTab>('salvage')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string>('')
  const [messageIsError, setMessageIsError] = useState(false)

  const { bag, removeFromBag, addToBag, gold, addGold } = useInventoryStore()
  const { craftingMaterials, craftingHistory, addMaterial, addCraftingLog } = useCraftingStore()

  const runeDust = useInventoryStore((s) => s.runeDust)

  const selectedItem = bag.find((i) => i.instanceId === selectedItemId) ?? null

  const showMessage = (msg: string, isError = false) => {
    setLastMessage(msg)
    setMessageIsError(isError)
  }

  const handleSalvage = () => {
    if (!selectedItem) return
    const result = salvageItem(selectedItem)
    if (!result.success) {
      showMessage(result.message, true)
      return
    }
    removeFromBag(selectedItem.instanceId)
    useInventoryStore.setState((s) => ({ runeDust: s.runeDust + result.runeDust }))
    addGold(result.gold)
    result.materials.forEach(({ name, qty }) => addMaterial(name, qty))
    addCraftingLog(result.message)
    showMessage(result.message)
    setSelectedItemId(null)
  }

  const handleReroll = () => {
    if (!selectedItem) return
    const cost = getCraftingCost(selectedItem, 'reroll')
    if (runeDust < cost.dust) {
      showMessage(`Not enough Rune Dust. Need ${cost.dust}, have ${runeDust}.`, true)
      return
    }
    const result = rerollAffixes(selectedItem, runeDust)
    if (!result.success) {
      showMessage(result.message, true)
      return
    }
    useInventoryStore.setState((s) => ({ runeDust: s.runeDust - cost.dust }))
    removeFromBag(selectedItem.instanceId)
    addToBag(result.item)
    setSelectedItemId(result.item.instanceId)
    addCraftingLog(result.message)
    showMessage(result.message)
  }

  const handleUpgrade = () => {
    if (!selectedItem) return
    const cost = getCraftingCost(selectedItem, 'upgrade')
    if (runeDust < cost.dust) {
      showMessage(`Not enough Rune Dust. Need ${cost.dust}, have ${runeDust}.`, true)
      return
    }
    if (gold < cost.gold) {
      showMessage(`Not enough Gold. Need ${cost.gold}, have ${gold}.`, true)
      return
    }
    const result = upgradeItemGrade(selectedItem, runeDust, gold)
    if (!result.success) {
      showMessage(result.message, true)
      return
    }
    useInventoryStore.setState((s) => ({
      runeDust: s.runeDust - cost.dust,
      gold: s.gold - cost.gold,
    }))
    removeFromBag(selectedItem.instanceId)
    addToBag(result.item)
    setSelectedItemId(result.item.instanceId)
    addCraftingLog(result.message)
    showMessage(result.message)
  }

  const craftCost = selectedItem ? getCraftingCost(selectedItem, activeTab) : { dust: 0, gold: 0 }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ fontWeight: 'bold', fontSize: 16, color: '#f0c060' }}>⚒️ CRAFTING</span>
        <div style={{ fontSize: 12, color: '#aaa' }}>
          Rune Dust: <span style={{ color: '#c080ff' }}>{runeDust}</span>
          &nbsp;|&nbsp; Gold: <span style={{ color: '#f0d060' }}>{gold}</span>
        </div>
        <button onClick={onClose} style={closeBtnStyle}>✕ Close</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
        {(['salvage', 'reroll', 'upgrade'] as CraftTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setLastMessage('') }}
            style={tabBtnStyle(activeTab === tab)}
          >
            {tab === 'salvage' ? '🔨 Salvage' : tab === 'reroll' ? '🎲 Reroll' : '⬆️ Upgrade'}
          </button>
        ))}
      </div>

      {/* Tab help text */}
      <div style={helpBoxStyle}>
        {activeTab === 'salvage' && (
          <span>Break down an item into Rune Dust and crafting materials. Unique and Holy items cannot be salvaged. <em>Locked items cannot be salvaged.</em></span>
        )}
        {activeTab === 'reroll' && (
          <span>Reroll all affix values on an item within the same tier range. Preserves affix count and base stats. <em>Cannot add new affixes or change grade.</em></span>
        )}
        {activeTab === 'upgrade' && (
          <span>Upgrade an item's grade by one tier (Normal→Magic→Rare→Legendary). Costs Rune Dust + Gold. Adds one new affix. <em>Boss-exclusive Unique items cannot be upgraded.</em></span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Item list */}
        <div style={itemListStyle}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            SELECT ITEM FROM BAG ({bag.length} items)
          </div>
          {bag.length === 0 && (
            <div style={{ color: '#555', fontSize: 12 }}>No items in bag.</div>
          )}
          {bag.map((item) => {
            const canAct =
              activeTab === 'salvage'
                ? item.grade !== 'Unique' && item.grade !== 'Holy' && !item.isLocked
                : activeTab === 'reroll'
                ? item.grade !== 'Normal' || (item as BaseItem).prefixes.length > 0 || (item as BaseItem).suffixes.length > 0
                : item.grade !== 'Legendary' && item.grade !== 'Unique' && item.grade !== 'Holy'
            return (
              <div
                key={item.instanceId}
                onClick={() => canAct && setSelectedItemId(item.instanceId)}
                style={itemRowStyle(selectedItemId === item.instanceId, canAct)}
              >
                <span style={{ color: GRADE_COLORS[item.grade] ?? '#ccc', fontWeight: 'bold', fontSize: 12 }}>
                  [{item.grade}]
                </span>{' '}
                <span style={{ fontSize: 12 }}>{item.name}</span>
                <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>Lv.{item.itemLevel}</span>
                {item.isLocked && <span style={{ fontSize: 10, color: '#f06060', marginLeft: 4 }}>🔒</span>}
              </div>
            )
          })}
        </div>

        {/* Action panel */}
        <div style={actionPanelStyle}>
          {selectedItem ? (
            <>
              <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: GRADE_COLORS[selectedItem.grade] ?? '#ccc' }}>
                  [{selectedItem.grade}]
                </span>{' '}
                {selectedItem.name}
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
                Slot: {selectedItem.slot} &nbsp;|&nbsp; Level: {selectedItem.itemLevel}
              </div>

              {/* Affixes */}
              {(selectedItem as BaseItem).prefixes.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: '#888' }}>Prefixes:</div>
                  {(selectedItem as BaseItem).prefixes.map((a, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#80c080' }}>
                      +{(a.value * 100).toFixed(1)}% ({a.affixId})
                    </div>
                  ))}
                </div>
              )}
              {(selectedItem as BaseItem).suffixes.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: '#888' }}>Suffixes:</div>
                  {(selectedItem as BaseItem).suffixes.map((a, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#80a0e0' }}>
                      +{(a.value * 100).toFixed(1)}% ({a.affixId})
                    </div>
                  ))}
                </div>
              )}

              {/* Cost preview */}
              {activeTab !== 'salvage' && (
                <div style={{ fontSize: 12, color: '#c0b080', marginTop: 8, marginBottom: 8 }}>
                  Cost:{' '}
                  {craftCost.dust > 0 && <span style={{ color: '#c080ff' }}>{craftCost.dust} Rune Dust </span>}
                  {craftCost.gold > 0 && <span style={{ color: '#f0d060' }}>{craftCost.gold} Gold</span>}
                  {craftCost.dust === 0 && craftCost.gold === 0 && '—'}
                </div>
              )}
              {activeTab === 'salvage' && (
                <div style={{ fontSize: 12, color: '#c0b080', marginTop: 8, marginBottom: 8 }}>
                  Sell value: ~{getItemSellValue(selectedItem)} Gold
                </div>
              )}

              {/* Action button */}
              {activeTab === 'salvage' && (
                <button
                  onClick={handleSalvage}
                  style={actionBtnStyle('#602010')}
                  disabled={selectedItem.grade === 'Unique' || selectedItem.grade === 'Holy' || selectedItem.isLocked}
                >
                  🔨 Salvage Item
                </button>
              )}
              {activeTab === 'reroll' && (
                <button
                  onClick={handleReroll}
                  style={actionBtnStyle('#204060')}
                  disabled={runeDust < craftCost.dust}
                >
                  🎲 Reroll Affixes ({craftCost.dust} Dust)
                </button>
              )}
              {activeTab === 'upgrade' && (
                <button
                  onClick={handleUpgrade}
                  style={actionBtnStyle('#304020')}
                  disabled={runeDust < craftCost.dust || gold < craftCost.gold || craftCost.dust === 0}
                >
                  ⬆️ Upgrade Grade ({craftCost.dust} Dust + {craftCost.gold} Gold)
                </button>
              )}
            </>
          ) : (
            <div style={{ color: '#555', fontSize: 12 }}>Select an item from the list.</div>
          )}

          {/* Result message */}
          {lastMessage && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 10px',
                background: messageIsError ? '#3a1010' : '#103020',
                border: `1px solid ${messageIsError ? '#a03030' : '#305030'}`,
                borderRadius: 3,
                fontSize: 12,
                color: messageIsError ? '#ff8080' : '#80e080',
              }}
            >
              {lastMessage}
            </div>
          )}
        </div>
      </div>

      {/* Crafting history */}
      {craftingHistory.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>CRAFTING LOG</div>
          <div
            style={{
              background: '#0e0e0e',
              border: '1px solid #333',
              borderRadius: 3,
              padding: '8px 10px',
              maxHeight: 120,
              overflowY: 'auto',
            }}
          >
            {craftingHistory.map((line, i) => (
              <div key={i} style={{ fontSize: 11, color: '#808080', marginBottom: 2 }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materials inventory */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>CRAFTING MATERIALS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(craftingMaterials).length === 0 && (
            <span style={{ fontSize: 12, color: '#555' }}>No materials yet. Salvage items or defeat enemies.</span>
          )}
          {Object.entries(craftingMaterials).map(([name, qty]) => (
            <div key={name} style={materialChipStyle}>
              {name}: <strong>{qty}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  color: '#e0d5c0',
  padding: 0,
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  marginBottom: 16,
  borderBottom: '1px solid #444',
  paddingBottom: 10,
  flexWrap: 'wrap',
}

const closeBtnStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: 'transparent',
  border: '1px solid #555',
  color: '#888',
  padding: '4px 10px',
  borderRadius: 3,
  cursor: 'pointer',
  fontSize: 12,
}

function tabBtnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? '#302820' : '#1a1612',
    border: active ? '1px solid #806040' : '1px solid #333',
    color: active ? '#f0c060' : '#888',
    padding: '6px 14px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
  }
}

const helpBoxStyle: React.CSSProperties = {
  background: '#181410',
  border: '1px solid #333',
  borderRadius: 3,
  padding: '8px 12px',
  fontSize: 12,
  color: '#a09080',
  marginBottom: 14,
}

const itemListStyle: React.CSSProperties = {
  flex: '0 0 260px',
  maxHeight: 340,
  overflowY: 'auto',
  border: '1px solid #333',
  borderRadius: 3,
  padding: '8px',
  background: '#111',
}

const actionPanelStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 220,
  border: '1px solid #333',
  borderRadius: 3,
  padding: '12px',
  background: '#131310',
}

function itemRowStyle(selected: boolean, canAct: boolean): React.CSSProperties {
  return {
    padding: '6px 8px',
    marginBottom: 3,
    borderRadius: 2,
    cursor: canAct ? 'pointer' : 'not-allowed',
    background: selected ? '#2a2010' : 'transparent',
    border: selected ? '1px solid #806040' : '1px solid transparent',
    opacity: canAct ? 1 : 0.4,
  }
}

function actionBtnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    border: '1px solid #888',
    color: '#e0d5c0',
    padding: '8px 16px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 13,
    marginTop: 8,
    width: '100%',
  }
}

const materialChipStyle: React.CSSProperties = {
  background: '#1a1a14',
  border: '1px solid #404030',
  borderRadius: 3,
  padding: '3px 8px',
  fontSize: 11,
  color: '#c0b080',
}

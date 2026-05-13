import React, { useState } from 'react'
import { useRuneEquip } from '../hooks/useRuneEquip'
import { RuneCard } from '../components/RuneCard'
import type { AnyRune, SkillRune, LinkRune, EquippedSkillSlot } from '../types/rune'

interface RuneScreenProps {
  onClose: () => void
}

type FilterMode = 'All' | 'Skill' | 'Link'

export const RuneScreen: React.FC<RuneScreenProps> = ({ onClose }) => {
  const { equipSkill, unequipSkill, equipLink, removeLink, checkSkillCompat, skillSlots, ownedRunes } = useRuneEquip()

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<FilterMode>('All')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  // IDs of all equipped / linked runes
  const equippedSkillIds = skillSlots.map((s) => s.skillRuneId).filter(Boolean) as string[]
  const linkedRuneIds = skillSlots.flatMap((s) => s.linkRuneIds)

  const filteredRunes = ownedRunes.filter((r) => {
    if (filter === 'Skill') return r.category === 'Skill'
    if (filter === 'Link') return r.category !== 'Skill'
    return true
  })

  const showStatus = (msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(null), 2500)
  }

  const handleEquipToSlot = (slotIndex: number, rune: AnyRune) => {
    if (rune.category === 'Skill') {
      const result = equipSkill(slotIndex, rune.id)
      if (!result.success) showStatus(`⚠ ${result.error}`)
      else showStatus(`✓ ${rune.name} equipped to Slot ${slotIndex + 1}`)
    } else {
      const result = equipLink(slotIndex, rune.id)
      if (!result.success) showStatus(`⚠ ${result.error}`)
      else showStatus(`✓ ${rune.name} linked to Slot ${slotIndex + 1}`)
    }
  }

  const handleRuneCardEquip = (rune: AnyRune) => {
    if (selectedSlotIndex === null) {
      showStatus('Select a slot first')
      return
    }
    handleEquipToSlot(selectedSlotIndex, rune)
  }

  return (
    <div style={{ color: '#e0d5c0' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          borderBottom: '1px solid #444',
          paddingBottom: 8,
        }}
      >
        <button onClick={onClose} style={navBtn()}>◀ Back</button>
        <span style={{ fontWeight: 'bold', color: '#f0c060', flex: 1 }}>RUNE CONFIGURATION</span>
        <button
          onClick={() => showStatus('Build saved ✓')}
          style={navBtn()}
        >
          Save Build
        </button>
      </div>

      {/* Status message */}
      {statusMsg && (
        <div
          style={{
            background: '#1a2010',
            border: '1px solid #608040',
            borderRadius: 4,
            padding: '6px 12px',
            marginBottom: 12,
            fontSize: 12,
            color: '#a0e070',
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* Skill slots grid */}
      <div style={{ fontSize: 12, color: '#7a7a8a', marginBottom: 8 }}>ACTIVE SKILL SLOTS</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {skillSlots.map((slot) => (
          <SkillSlotPanel
            key={slot.slotIndex}
            slot={slot}
            ownedRunes={ownedRunes}
            isSelected={selectedSlotIndex === slot.slotIndex}
            onSelectSlot={setSelectedSlotIndex}
            onUnequipSkill={() => {
              unequipSkill(slot.slotIndex)
              showStatus(`Slot ${slot.slotIndex + 1} cleared`)
            }}
            onRemoveLink={(linkId) => {
              removeLink(slot.slotIndex, linkId)
              showStatus('Link rune removed')
            }}
            checkSkillCompat={checkSkillCompat}
          />
        ))}
      </div>

      {/* Rune inventory */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, color: '#7a7a8a' }}>RUNE INVENTORY</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['All', 'Skill', 'Link'] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...navBtn(),
                background: filter === f ? '#403020' : '#1a1612',
                color: filter === f ? '#f0c060' : '#888',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {selectedSlotIndex !== null && (
        <div style={{ fontSize: 11, color: '#c97c2a', marginBottom: 8 }}>
          ↑ Click a rune below to assign it to Slot {selectedSlotIndex + 1}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {filteredRunes.map((rune) => (
          <RuneCard
            key={rune.id}
            rune={rune}
            isEquipped={equippedSkillIds.includes(rune.id)}
            isLinked={linkedRuneIds.includes(rune.id)}
            onEquipToSlot={selectedSlotIndex !== null ? () => handleRuneCardEquip(rune) : undefined}
            onRemove={
              equippedSkillIds.includes(rune.id)
                ? () => {
                    const slotIdx = skillSlots.find((s) => s.skillRuneId === rune.id)?.slotIndex
                    if (slotIdx !== undefined) unequipSkill(slotIdx)
                  }
                : linkedRuneIds.includes(rune.id)
                ? () => {
                    const slot = skillSlots.find((s) => s.linkRuneIds.includes(rune.id))
                    if (slot) removeLink(slot.slotIndex, rune.id)
                  }
                : undefined
            }
          />
        ))}
        {filteredRunes.length === 0 && (
          <div style={{ color: '#555', fontSize: 12 }}>No runes in this category.</div>
        )}
      </div>
    </div>
  )
}

// ─── SkillSlotPanel sub-component ─────────────────────────────────────────────

interface SkillSlotPanelProps {
  slot: EquippedSkillSlot
  ownedRunes: AnyRune[]
  isSelected: boolean
  onSelectSlot: (idx: number) => void
  onUnequipSkill: () => void
  onRemoveLink: (linkId: string) => void
  checkSkillCompat: (rune: SkillRune) => string | null
}

function SkillSlotPanel({
  slot,
  ownedRunes,
  isSelected,
  onSelectSlot,
  onUnequipSkill,
  onRemoveLink,
  checkSkillCompat,
}: SkillSlotPanelProps) {
  const skillRune = ownedRunes.find(
    (r) => r.id === slot.skillRuneId && r.category === 'Skill'
  ) as SkillRune | undefined

  const compatError = skillRune ? checkSkillCompat(skillRune) : null

  const linkRunes = slot.linkRuneIds
    .map((id) => ownedRunes.find((r) => r.id === id))
    .filter((r): r is LinkRune => r !== undefined && r.category !== 'Skill')

  const maxLinks = skillRune?.maxSupportLinks ?? 3
  const emptyLinkSlots = Math.max(0, maxLinks - linkRunes.length)

  return (
    <div
      onClick={() => onSelectSlot(slot.slotIndex)}
      style={{
        border: `1px solid ${isSelected ? '#c97c2a' : '#3a3a4a'}`,
        borderRadius: 6,
        padding: '10px 14px',
        background: isSelected ? '#1a1408' : '#0d0d12',
        cursor: 'pointer',
        minHeight: 120,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
          fontSize: 11,
          color: '#7a7a8a',
        }}
      >
        <span>SLOT {slot.slotIndex + 1}</span>
        {isSelected && <span style={{ color: '#c97c2a' }}>● Selected</span>}
      </div>

      {/* Skill rune */}
      {skillRune ? (
        <div style={{ marginBottom: 6 }}>
          <div style={{ color: '#f0c060', fontSize: 13, fontWeight: 'bold' }}>
            {skillRune.name}
          </div>
          <div style={{ color: '#888', fontSize: 11 }}>
            {skillRune.damageType} / {skillRune.deliveryMode}
          </div>
          {skillRune.weaponFamilyRestriction && skillRune.weaponFamilyRestriction.length > 0 && (
            <div style={{ color: compatError ? '#c04040' : '#e0a030', fontSize: 10 }}>
              {compatError ? `⚠ ${compatError}` : `⚔ ${skillRune.weaponFamilyRestriction.join('/')}`}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onUnequipSkill() }}
            style={{ ...smallBtn('#1a0808'), marginTop: 2 }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div style={{ color: '#555', fontSize: 12, marginBottom: 6 }}>
          [Empty — select a skill rune]
        </div>
      )}

      {/* Link sub-slots */}
      <div style={{ fontSize: 10, color: '#7a7a8a', marginBottom: 4 }}>
        Links ({linkRunes.length}/{maxLinks}):
      </div>
      {linkRunes.map((lr) => (
        <div key={lr.id} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
          <span style={{ color: '#8080c0', fontSize: 11 }}>{lr.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemoveLink(lr.id) }}
            style={smallBtn('#180818')}
          >
            ×
          </button>
        </div>
      ))}
      {Array.from({ length: emptyLinkSlots }).map((_, i) => (
        <div key={i} style={{ color: '#444', fontSize: 11, marginBottom: 2 }}>
          [+ Add Link]
        </div>
      ))}
    </div>
  )
}

function navBtn(): React.CSSProperties {
  return {
    background: '#2a2010',
    border: '1px solid #555',
    color: '#e0d5c0',
    padding: '4px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
  }
}

function smallBtn(bg: string): React.CSSProperties {
  return {
    background: bg,
    border: '1px solid #444',
    color: '#c0a0a0',
    padding: '1px 5px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 9,
  }
}

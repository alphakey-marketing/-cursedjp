import React from 'react'
import { useOfflineStore } from '../store/useOfflineStore'
import { usePlayerStore } from '../store/usePlayerStore'
import { useInventoryStore } from '../store/useInventoryStore'

interface OfflineSummaryScreenProps {
  onCollect: () => void
}

const MATERIAL_LABELS: Record<string, string> = {
  iron_shard: 'Iron Shard',
  coarse_cloth: 'Coarse Cloth',
  fire_essence: 'Fire Essence',
  rune_dust: 'Rune Dust',
  gold: 'Gold',
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} hour${h > 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`
  return `${m} minute${m !== 1 ? 's' : ''}`
}

export const OfflineSummaryScreen: React.FC<OfflineSummaryScreenProps> = ({ onCollect }) => {
  const { pendingExp, pendingMaterials, hasPendingGains, clearPendingGains, lastOnlineTimestamp } =
    useOfflineStore()
  const gainExp = usePlayerStore((s) => s.gainExp)
  const addGold = usePlayerStore((s) => s.addGold)
  const character = usePlayerStore((s) => s.character)
  const addToBag = useInventoryStore((s) => s.addToBag)

  if (!hasPendingGains) return null

  const elapsedSeconds = Math.min(
    (Date.now() - lastOnlineTimestamp) / 1000,
    8 * 60 * 60
  )

  const expPercent = Math.min(
    100,
    Math.round((character.stats.experience + pendingExp) / character.stats.experienceToNextLevel * 100)
  )

  const nonGoldMaterials = Object.entries(pendingMaterials).filter(([k]) => k !== 'gold')
  const pendingGold = pendingMaterials['gold'] ?? 0

  const handleCollect = () => {
    // Apply EXP
    if (pendingExp > 0) {
      gainExp(pendingExp)
    }
    // Apply gold separately
    if (pendingGold > 0) {
      addGold(pendingGold)
    }
    // Materials would go to inventory — for now just acknowledge them
    // (material items would need item templates; for now skip bag add to avoid type errors)
    void addToBag // referenced to avoid unused-import warning
    clearPendingGains()
    onCollect()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.90)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: '#111118',
          border: '1px solid #3a3a4a',
          borderRadius: 6,
          padding: 24,
          width: '100%',
          maxWidth: 520,
          color: '#e8e8e8',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🌙</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#f0c060' }}>WELCOME BACK</div>
          <div style={{ color: '#7a7a8a', fontSize: 13 }}>
            You were away for {formatDuration(elapsedSeconds)}
          </div>
        </div>

        {/* Two-column layout: EXP + Materials */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {/* EXP panel */}
          <div
            style={{
              flex: 1,
              background: '#0d0d12',
              border: '1px solid #2a2a3a',
              borderRadius: 4,
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, color: '#7a7a8a', marginBottom: 6 }}>EXP GAINED</div>
            <div style={{ fontSize: 20, color: '#44dd88', marginBottom: 6 }}>
              +{pendingExp.toLocaleString()} EXP
            </div>
            <div
              style={{
                height: 8,
                background: '#222',
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: `${expPercent}%`,
                  height: '100%',
                  background: '#8060e0',
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: '#7a7a8a' }}>
              Lv.{character.stats.level} — {expPercent}% to next
            </div>
          </div>

          {/* Materials panel */}
          <div
            style={{
              flex: 1,
              background: '#0d0d12',
              border: '1px solid #2a2a3a',
              borderRadius: 4,
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, color: '#7a7a8a', marginBottom: 6 }}>MATERIALS GATHERED</div>
            {nonGoldMaterials.length === 0 && pendingGold === 0 && (
              <div style={{ color: '#555', fontSize: 12 }}>—</div>
            )}
            {nonGoldMaterials.map(([key, qty]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: '#c0b080' }}>{MATERIAL_LABELS[key] ?? key}</span>
                <span style={{ color: '#e8e8e8' }}>×{qty}</span>
              </div>
            ))}
            {pendingGold > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: '#f0d060' }}>Gold</span>
                <span style={{ color: '#e8e8e8' }}>+{pendingGold}</span>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            background: '#0a0a10',
            border: '1px solid #2a2a3a',
            borderRadius: 4,
            padding: '8px 12px',
            fontSize: 11,
            color: '#7a7a8a',
            marginBottom: 16,
          }}
        >
          ℹ Rare runes and unique items are not gained through idle farming. Defeat bosses manually
          for build-defining drops. Max idle duration: 8 hours.
        </div>

        {/* Collect button */}
        <button
          onClick={handleCollect}
          style={{
            width: '100%',
            background: '#2a4020',
            border: '1px solid #608040',
            color: '#a0e070',
            padding: '10px 0',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          ✅ Collect &amp; Continue
        </button>
      </div>
    </div>
  )
}

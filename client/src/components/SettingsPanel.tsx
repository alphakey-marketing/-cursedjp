import React from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

interface SettingsPanelProps {
  onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const {
    bgmVolume,
    sfxVolume,
    autoFarm,
    battleSpeed,
    setBgmVolume,
    setSfxVolume,
    setAutoFarm,
    setBattleSpeed,
  } = useSettingsStore()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
      }}
    >
      <div
        style={{
          background: '#111118',
          border: '1px solid #3a3a4a',
          borderRadius: 6,
          padding: 24,
          width: '100%',
          maxWidth: 380,
          color: '#e8e8e8',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#c97c2a', marginBottom: 20 }}>
          ⚙️ SETTINGS
        </div>

        {/* BGM Volume */}
        <div style={rowStyle}>
          <label style={labelStyle}>BGM Volume</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              style={{ width: 120 }}
            />
            <span style={{ fontSize: 12, color: '#888', minWidth: 30 }}>
              {Math.round(bgmVolume * 100)}%
            </span>
          </div>
        </div>

        {/* SFX Volume */}
        <div style={rowStyle}>
          <label style={labelStyle}>SFX Volume</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              style={{ width: 120 }}
            />
            <span style={{ fontSize: 12, color: '#888', minWidth: 30 }}>
              {Math.round(sfxVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Auto-Farm */}
        <div style={rowStyle}>
          <label style={labelStyle}>Auto-Farm</label>
          <button
            onClick={() => setAutoFarm(!autoFarm)}
            style={{
              background: autoFarm ? '#204030' : '#2a2010',
              border: `1px solid ${autoFarm ? '#44aa66' : '#666'}`,
              color: autoFarm ? '#44dd88' : '#888',
              padding: '4px 14px',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {autoFarm ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Battle Speed */}
        <div style={rowStyle}>
          <label style={labelStyle}>Battle Speed</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {([1, 2, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => setBattleSpeed(s)}
                style={{
                  background: battleSpeed === s ? '#604020' : '#2a2010',
                  border: `1px solid ${battleSpeed === s ? '#c97c2a' : '#666'}`,
                  color: battleSpeed === s ? '#f0c060' : '#888',
                  padding: '4px 12px',
                  borderRadius: 3,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: '#2a2010',
              border: '1px solid #888',
              color: '#e0d5c0',
              padding: '8px 28px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#c0b090',
}

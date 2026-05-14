import React, { useState } from 'react'
import type { ChapterDialogue } from '../types/chapter'

interface StoryScreenProps {
  dialogue: ChapterDialogue
  onFinish: () => void
}

export const StoryScreen: React.FC<StoryScreenProps> = ({ dialogue, onFinish }) => {
  const [lineIndex, setLineIndex] = useState(0)

  const currentLine = dialogue.lines[lineIndex] ?? ''
  const isLast = lineIndex >= dialogue.lines.length - 1

  const handleAdvance = () => {
    if (isLast) {
      onFinish()
    } else {
      setLineIndex((i) => i + 1)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 200,
        padding: 16,
      }}
      onClick={handleAdvance}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          background: '#0a0a0f',
          border: '1px solid #3a3a4a',
          borderRadius: 6,
          padding: '20px 24px',
          marginBottom: 32,
          cursor: 'pointer',
        }}
      >
        {/* Speaker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: '#1a1820',
              border: '1px solid #3a3a4a',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {_portraitEmoji(dialogue.speakerPortraitId)}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#c97c2a' }}>
              {dialogue.speakerName}
            </div>
            <div style={{ fontSize: 10, color: '#7a7a8a' }}>
              {lineIndex + 1} / {dialogue.lines.length}
            </div>
          </div>
        </div>

        {/* Dialogue text */}
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: '#e8e8e8',
            minHeight: 60,
          }}
        >
          {currentLine}
        </div>

        {/* Advance hint */}
        <div
          style={{
            marginTop: 16,
            textAlign: 'right',
            fontSize: 11,
            color: '#555',
          }}
        >
          {isLast ? 'Click to close' : 'Click to continue ▶'}
        </div>
      </div>
    </div>
  )
}

function _portraitEmoji(portraitId: string): string {
  if (portraitId.includes('narrator')) return '📜'
  if (portraitId.includes('oni') || portraitId.includes('boss')) return '👹'
  if (portraitId.includes('player') || portraitId.includes('wanderer')) return '🗡️'
  return '❓'
}

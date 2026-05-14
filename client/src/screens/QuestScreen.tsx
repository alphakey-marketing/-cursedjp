import { useState } from 'react'
import { useQuestStore } from '../store/useQuestStore'
import { usePlayerStore } from '../store/usePlayerStore'
import { useCraftingStore } from '../store/useCraftingStore'
import type { Quest, QuestType } from '../types/quest'

interface QuestScreenProps {
  onClose: () => void
}

type QuestTab = 'chapter' | 'side' | 'daily'

const TAB_LABELS: Record<QuestTab, string> = {
  chapter: '📖 Chapter',
  side: '🗡 Side',
  daily: '☀️ Daily',
}

const STATUS_COLORS: Record<string, string> = {
  active: '#c0c0c0',
  completed: '#60d060',
  locked: '#606060',
}

export function QuestScreen({ onClose }: QuestScreenProps) {
  const [activeTab, setActiveTab] = useState<QuestTab>('chapter')
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null)
  const [claimMessage, setClaimMessage] = useState<string | null>(null)

  const quests = useQuestStore((s) => s.quests)
  const claimedQuestIds = useQuestStore((s) => s.claimedQuestIds)
  const claimReward = useQuestStore((s) => s.claimReward)
  const addGold = usePlayerStore((s) => s.addGold)
  const addMaterial = useCraftingStore((s) => s.addMaterial)

  const filteredQuests = quests.filter((q) => (q.type as QuestType) === activeTab)
  const selectedQuest: Quest | undefined = quests.find((q) => q.id === selectedQuestId) ?? filteredQuests[0]

  function handleClaimReward(questId: string) {
    const quest = claimReward(questId)
    if (!quest) return

    const parts: string[] = []
    if (quest.reward.gold) {
      addGold(quest.reward.gold)
      parts.push(`${quest.reward.gold} gold`)
    }
    if (quest.reward.craftingMaterials) {
      quest.reward.craftingMaterials.forEach(({ name, qty }) => {
        addMaterial(name, qty)
        parts.push(`${qty}x ${name}`)
      })
    }
    setClaimMessage(`Claimed: ${parts.join(', ')}`)
    setTimeout(() => setClaimMessage(null), 3000)
  }

  const isClaimed = selectedQuest ? claimedQuestIds.includes(selectedQuest.id) : false

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#1e1a14',
          border: '1px solid #5a4a30',
          borderRadius: 6,
          width: 720,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: '1px solid #3a3020',
          }}
        >
          <span style={{ color: '#f0c060', fontWeight: 'bold', fontSize: 16 }}>📜 Quests</span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#a09080', cursor: 'pointer', fontSize: 18 }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 16px', borderBottom: '1px solid #3a3020' }}>
          {(['chapter', 'side', 'daily'] as QuestTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? '#3a2a10' : 'transparent',
                border: activeTab === tab ? '1px solid #806040' : '1px solid #444',
                color: activeTab === tab ? '#f0c060' : '#a09080',
                padding: '4px 14px',
                borderRadius: 3,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Quest list */}
          <div
            style={{
              width: 220,
              borderRight: '1px solid #3a3020',
              overflowY: 'auto',
              padding: '8px 0',
            }}
          >
            {filteredQuests.length === 0 && (
              <div style={{ color: '#707060', padding: '12px 16px', fontSize: 12 }}>No quests</div>
            )}
            {filteredQuests.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuestId(q.id)}
                style={{
                  padding: '8px 14px',
                  cursor: 'pointer',
                  background: selectedQuest?.id === q.id ? '#2a2018' : 'transparent',
                  borderLeft: selectedQuest?.id === q.id ? '2px solid #c09040' : '2px solid transparent',
                }}
              >
                <div style={{ color: STATUS_COLORS[q.status] ?? '#c0c0c0', fontSize: 12 }}>{q.title}</div>
                <div style={{ color: '#706050', fontSize: 10, marginTop: 2 }}>
                  {q.status === 'locked' ? '🔒 Locked' : q.status === 'completed' ? '✓ Complete' : 'In Progress'}
                </div>
              </div>
            ))}
          </div>

          {/* Quest detail */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {!selectedQuest ? (
              <div style={{ color: '#706050' }}>Select a quest</div>
            ) : (
              <>
                <div style={{ color: '#f0c060', fontSize: 15, fontWeight: 'bold', marginBottom: 6 }}>
                  {selectedQuest.title}
                </div>
                <div style={{ color: '#a09070', fontSize: 12, marginBottom: 12 }}>
                  {selectedQuest.description}
                </div>

                {/* Objectives */}
                <div style={{ color: '#e0c080', fontSize: 12, marginBottom: 6 }}>Objectives</div>
                {selectedQuest.objectives.map((obj) => {
                  const done = obj.currentCount >= obj.targetCount
                  return (
                    <div
                      key={obj.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '5px 10px',
                        marginBottom: 4,
                        background: '#2a2018',
                        borderRadius: 3,
                        color: done ? '#60c060' : '#c0b080',
                        fontSize: 12,
                      }}
                    >
                      <span>
                        {done ? '✓ ' : '○ '}
                        {obj.description}
                      </span>
                      <span style={{ color: '#8080a0' }}>
                        {obj.currentCount}/{obj.targetCount}
                      </span>
                    </div>
                  )
                })}

                {/* Reward */}
                <div style={{ color: '#e0c080', fontSize: 12, marginTop: 14, marginBottom: 6 }}>Reward</div>
                <div
                  style={{
                    background: '#2a2018',
                    borderRadius: 4,
                    padding: '10px 12px',
                    fontSize: 12,
                    color: '#c0b080',
                  }}
                >
                  {selectedQuest.reward.gold && (
                    <div>💰 {selectedQuest.reward.gold} Gold</div>
                  )}
                  {selectedQuest.reward.runeId && (
                    <div>📜 Rune: {selectedQuest.reward.runeId}</div>
                  )}
                  {selectedQuest.reward.passiveRespecPoints && (
                    <div>🌿 {selectedQuest.reward.passiveRespecPoints} Respec Point(s)</div>
                  )}
                  {selectedQuest.reward.craftingMaterials?.map((m) => (
                    <div key={m.name}>
                      🔧 {m.qty}x {m.name}
                    </div>
                  ))}
                </div>

                {/* Claim button */}
                {selectedQuest.status === 'completed' && !isClaimed && (
                  <button
                    onClick={() => handleClaimReward(selectedQuest.id)}
                    style={{
                      marginTop: 14,
                      padding: '8px 20px',
                      background: '#5a3010',
                      border: '1px solid #c07030',
                      color: '#f0c060',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Claim Reward
                  </button>
                )}
                {isClaimed && (
                  <div style={{ marginTop: 10, color: '#60c060', fontSize: 12 }}>✓ Reward claimed</div>
                )}
                {claimMessage && (
                  <div style={{ marginTop: 8, color: '#80e080', fontSize: 12 }}>{claimMessage}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

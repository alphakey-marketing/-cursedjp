import { useEffect, useState } from 'react'

interface DataEntry {
  id?: string
  name?: string
  [key: string]: unknown
}

interface DataFile {
  filename: string
  entries: DataEntry[]
}

interface DataPreviewScreenProps {
  onClose: () => void
}

const FILES = [
  'regions.json',
  'enemies.json',
  'bosses.json',
  'runes.json',
  'affixes.json',
  'passiveNodes.json',
  'quests.json',
  'lootTables.json',
  'weapons.json',
  'armors.json',
  'accessories.json',
  'chapters.json',
]

export function DataPreviewScreen({ onClose }: DataPreviewScreenProps) {
  const [dataFiles, setDataFiles] = useState<DataFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<DataEntry | null>(null)

  useEffect(() => {
    Promise.allSettled(
      FILES.map((file) =>
        fetch(`/data/${file}`)
          .then((r) => r.json())
          .then((data): DataFile => ({
            filename: file,
            entries: Array.isArray(data) ? data : Object.values(data),
          }))
      )
    ).then((results) => {
      const loaded: DataFile[] = []
      for (const result of results) {
        if (result.status === 'fulfilled') loaded.push(result.value)
      }
      setDataFiles(loaded)
      if (loaded.length > 0) setSelectedFile(loaded[0].filename)
      setLoading(false)
    })
  }, [])

  const activeFile = dataFiles.find((f) => f.filename === selectedFile)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          background: '#151210',
          border: '1px solid #4a3820',
          borderRadius: 6,
          width: '95vw',
          height: '90vh',
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
            padding: '8px 14px',
            borderBottom: '1px solid #3a2a10',
            background: '#1e1810',
          }}
        >
          <span style={{ color: '#f0a020', fontWeight: 'bold' }}>
            🔬 Data Preview (DEV)
          </span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#a09080', cursor: 'pointer', fontSize: 18 }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ color: '#908070', padding: 20 }}>Loading data…</div>
        ) : (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* File list */}
            <div
              style={{
                width: 180,
                borderRight: '1px solid #3a2a10',
                overflowY: 'auto',
                padding: '8px 0',
              }}
            >
              {dataFiles.map((f) => (
                <div
                  key={f.filename}
                  onClick={() => { setSelectedFile(f.filename); setSelectedEntry(null) }}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    background: selectedFile === f.filename ? '#2a1e0e' : 'transparent',
                    borderLeft: selectedFile === f.filename ? '2px solid #c08030' : '2px solid transparent',
                    color: selectedFile === f.filename ? '#f0c060' : '#a09070',
                    fontSize: 12,
                  }}
                >
                  {f.filename}
                  <span style={{ color: '#606050', marginLeft: 6 }}>({f.entries.length})</span>
                </div>
              ))}
            </div>

            {/* Entry list */}
            <div
              style={{
                width: 240,
                borderRight: '1px solid #3a2a10',
                overflowY: 'auto',
                padding: '8px 0',
              }}
            >
              {activeFile?.entries.map((entry, i) => (
                <div
                  key={entry.id ?? i}
                  onClick={() => setSelectedEntry(entry)}
                  style={{
                    padding: '5px 12px',
                    cursor: 'pointer',
                    background: selectedEntry === entry ? '#2a1e0e' : 'transparent',
                    color: selectedEntry === entry ? '#f0c060' : '#c0b090',
                    fontSize: 11,
                    borderLeft: selectedEntry === entry ? '2px solid #c08030' : '2px solid transparent',
                  }}
                >
                  <div>{entry.name ?? entry.id ?? `[${i}]`}</div>
                  {entry.id && entry.name && (
                    <div style={{ color: '#706050', fontSize: 10 }}>{entry.id}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Entry detail */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
              {selectedEntry ? (
                <pre
                  style={{
                    color: '#c0d0a0',
                    fontSize: 11,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(selectedEntry, null, 2)}
                </pre>
              ) : (
                <div style={{ color: '#606050', fontSize: 12 }}>Select an entry to inspect</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

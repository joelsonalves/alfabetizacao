import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'
import './EmojiPicker.css'

const TABS = [
  { key: 'letters', label: 'Letras' },
  { key: 'syllables', label: 'Sílabas' },
  { key: 'words', label: 'Palavras' },
  { key: 'phrases', label: 'Frases' },
]

export default function EmojiPicker({ onSelect, onClose }) {
  const [mappings, setMappings] = useState(null)
  const [activeTab, setActiveTab] = useState('letters')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.listEmojiMappings()
      .then(setMappings)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const currentItems = mappings ? (mappings[activeTab] || []) : []
  const filtered = search
    ? currentItems.filter(item =>
        item.key.toLowerCase().includes(search.toLowerCase()) ||
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : currentItems

  return (
    <div className="emoji-picker-overlay" onClick={handleOverlayClick}>
      <div className="emoji-picker-modal">
        <div className="emoji-picker-header">
          <div className="emoji-picker-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar emoji..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <button className="emoji-picker-close" onClick={onClose}>✕</button>
        </div>

        <div className="emoji-picker-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`emoji-picker-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setSearch('') }}
            >
              {tab.label}
              {mappings && (
                <span className="tab-count">{mappings[tab.key]?.length || 0}</span>
              )}
            </button>
          ))}
        </div>

        <div className="emoji-picker-body">
          {loading ? (
            <div className="emoji-picker-loading">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="emoji-picker-empty">Nenhum emoji encontrado</div>
          ) : (
            <div className="emoji-picker-grid">
              {filtered.map(item => (
                <button
                  key={item.key}
                  className="emoji-picker-item"
                  onClick={() => onSelect(item.emoji, item.label)}
                  title={item.label}
                >
                  <span className="emoji-picker-item-emoji">{item.emoji}</span>
                  <span className="emoji-picker-item-label">{item.key}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

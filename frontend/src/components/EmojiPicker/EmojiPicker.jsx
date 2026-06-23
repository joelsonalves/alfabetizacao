import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'
import './EmojiPicker.css'

const TABS = [
  { key: 'letters', label: 'Letras' },
  { key: 'syllables', label: 'Sílabas' },
  { key: 'words', label: 'Palavras' },
  { key: 'phrases', label: 'Frases' },
  { key: 'catalog', label: 'Catálogo' },
]

export default function EmojiPicker({ onSelect, onClose }) {
  const [mappings, setMappings] = useState(null)
  const [activeTab, setActiveTab] = useState('letters')
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.listEmojiMappings()
      .then(setMappings)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setSearch('')
    if (activeTab === 'catalog' && mappings?.catalog?.length) {
      setActiveCategory(mappings.catalog[0].key)
    }
  }, [activeTab, mappings])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const currentItems = (() => {
    if (!mappings) return []
    if (activeTab === 'catalog' && activeCategory) {
      const cat = mappings.catalog.find(c => c.key === activeCategory)
      return cat ? cat.items : []
    }
    return mappings[activeTab] || []
  })()

  const filtered = search
    ? currentItems.filter(item =>
        (item.label || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.key || '').toLowerCase().includes(search.toLowerCase()) ||
        item.emoji === search
      )
    : currentItems

  const handleSelect = (item) => {
    onSelect(item.emoji, item.label)
  }

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
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {mappings && activeTab !== 'catalog' && (
                <span className="tab-count">{mappings[tab.key]?.length || 0}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'catalog' && mappings?.catalog && (
          <div className="catalog-sub-tabs">
            {mappings.catalog.map(cat => (
              <button
                key={cat.key}
                className={`catalog-sub-tab ${activeCategory === cat.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                <span className="catalog-sub-icon">{cat.icon}</span>
                <span className="catalog-sub-name">{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="emoji-picker-body">
          {loading ? (
            <div className="emoji-picker-loading">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="emoji-picker-empty">Nenhum emoji encontrado</div>
          ) : (
            <div className="emoji-picker-grid">
              {filtered.map((item, i) => (
                <button
                  key={item.key || `${item.emoji}-${i}`}
                  className={`emoji-picker-item ${item.mapped ? 'emoji-mapped' : ''}`}
                  onClick={() => handleSelect(item)}
                  title={item.label || item.key}
                >
                  {item.mapped && <span className="mapped-badge">⭐</span>}
                  <span className="emoji-picker-item-emoji">{item.emoji}</span>
                  <span className="emoji-picker-item-label">{item.label || item.key}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

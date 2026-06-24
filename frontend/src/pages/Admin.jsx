import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import EmojiPicker from '../components/EmojiPicker/EmojiPicker'
import './Admin.css'

function FlagsTab() {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api.admin.listFlags()
      .then(setFlags)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const toggleFlag = async (key, currentActive) => {
    await api.admin.updateFlag(key, { active: !currentActive })
    load()
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="admin-flags">
      <h2>Feature Flags</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Flag</th>
            <th>Descrição</th>
            <th>Ativo</th>
          </tr>
        </thead>
        <tbody>
          {flags.map(f => (
            <tr key={f.key}>
              <td><code>{f.key}</code></td>
              <td>{f.description}</td>
              <td>
                <div className="status-cell">
                  <label className="toggle-switch">
                    <input type="checkbox" checked={f.active} onChange={() => toggleFlag(f.key, f.active)} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`status-badge ${f.active ? 'active' : 'inactive'}`}>
                    {f.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ModulesTab() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', sort_order: 0 })
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', module_type: '', description: '', sort_order: 0 })

  const load = useCallback(() => {
    setLoading(true)
    api.admin.listModules()
      .then(setModules)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = (mod) => {
    setEditingId(mod.id)
    setEditForm({ name: mod.name, description: mod.description || '', sort_order: mod.sort_order })
  }

  const saveEdit = async (id) => {
    await api.admin.updateModule(id, editForm)
    setEditingId(null)
    load()
  }

  const deleteModule = async (id) => {
    if (!window.confirm('Excluir este módulo e todas as suas lições?')) return
    await api.admin.deleteModule(id)
    load()
  }

  const createModule = async () => {
    await api.admin.createModule(createForm)
    setShowCreate(false)
    setCreateForm({ name: '', module_type: '', description: '', sort_order: 0 })
    load()
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="admin-modules">
      <div className="admin-header-row">
        <h2>Módulos</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Novo Módulo</button>
      </div>

      {showCreate && (
        <div className="admin-form card">
          <h3>Novo Módulo</h3>
          <div className="form-group">
            <label>Nome</label>
            <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <input value={createForm.module_type} onChange={e => setCreateForm(f => ({ ...f, module_type: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <input value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Ordem</label>
            <input type="number" value={createForm.sort_order} onChange={e => setCreateForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={createModule}>Criar</button>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Ordem</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {modules.map(mod => (
            <tr key={mod.id}>
              <td>{mod.id}</td>
              <td>
                {editingId === mod.id ? (
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                ) : mod.name}
              </td>
              <td>{mod.module_type}</td>
              <td>
                {editingId === mod.id ? (
                  <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                ) : mod.description}
              </td>
              <td>
                {editingId === mod.id ? (
                  <input type="number" value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                ) : mod.sort_order}
              </td>
              <td className="admin-actions">
                {editingId === mod.id ? (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => saveEdit(mod.id)}>Salvar</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-ghost" onClick={() => startEdit(mod)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteModule(mod.id)}>Excluir</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ContentTab() {
  const [modules, setModules] = useState([])
  const [moduleId, setModuleId] = useState('')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', target: '', lesson_type: '', active: true, sort_order: 0, image_url: '', image_active: true, image_policy: 'auto', alt_text: '', placeholder_text: '', association_word: '' })
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', target: '', lesson_type: '', active: true, sort_order: 0, image_url: '', image_active: true, image_policy: 'auto', alt_text: '', placeholder_text: '', association_word: '' })
  const [showPicker, setShowPicker] = useState(false)
  const [pickerTarget, setPickerTarget] = useState(null)

  useEffect(() => {
    api.admin.listModules().then(setModules).catch(() => {})
  }, [])

  const loadLessons = useCallback((mid) => {
    setLoading(true)
    const params = mid ? `?module_id=${mid}` : ''
    api.admin.listLessons(params)
      .then(setLessons)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (moduleId) loadLessons(moduleId)
    else { setLessons([]); setLoading(false) }
  }, [moduleId, loadLessons])

  const startEdit = (l) => {
    setEditingId(l.id)
    setEditForm({ name: l.name, target: l.target, lesson_type: l.lesson_type, active: l.active, sort_order: l.sort_order, image_url: l.image_url || '', image_active: l.image_active !== false, image_policy: l.image_policy || 'auto', alt_text: l.alt_text || '', placeholder_text: l.placeholder_text || '', association_word: l.association_word || '' })
  }

  const saveEdit = async (id) => {
    await api.admin.updateLesson(id, editForm)
    setEditingId(null)
    loadLessons(moduleId)
  }

  const toggleActive = async (id, currentActive) => {
    await api.admin.updateLesson(id, { active: !currentActive })
    loadLessons(moduleId)
  }

  const deleteLesson = async (id) => {
    if (!window.confirm('Excluir esta lição?')) return
    await api.admin.deleteLesson(id)
    loadLessons(moduleId)
  }

  const createLesson = async () => {
    await api.admin.createLesson({ ...createForm, module_id: Number(moduleId) })
    setShowCreate(false)
    setCreateForm({ name: '', target: '', lesson_type: '', active: true, sort_order: 0, image_url: '', image_active: true, image_policy: 'auto', alt_text: '', placeholder_text: '', association_word: '' })
    loadLessons(moduleId)
  }

  const handleEmojiSelect = (emoji, label) => {
    const target = pickerTarget
    setShowPicker(false)
    setPickerTarget(null)
    if (target === 'create') {
      setCreateForm(f => ({ ...f, image_url: emoji, alt_text: label || emoji }))
    } else if (target) {
      setEditForm(f => ({ ...f, image_url: emoji, alt_text: label || emoji }))
    }
  }

  const backfillImages = async () => {
    if (!window.confirm('Re-resolver imagens de todas as lições? Lições com image_url personalizado não serão alteradas.')) return
    try {
      const result = await api.admin.backfillImages()
      alert(`${result.updated} lições atualizadas.`)
      loadLessons(moduleId)
    } catch {
      alert('Erro ao re-resolver imagens.')
    }
  }

  return (
    <div className="admin-content">
      <div className="admin-header-row">
        <h2>Conteúdo</h2>
        <div className="admin-header-actions">
          {moduleId && (
            <>
              <button className="btn btn-secondary" onClick={backfillImages}>🔄 Re-resolver imagens</button>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Novo Item</button>
            </>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Módulo</label>
        <select value={moduleId} onChange={e => setModuleId(e.target.value)}>
          <option value="">Selecione um módulo</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.module_type})</option>
          ))}
        </select>
      </div>

      {showCreate && (
        <div className="admin-form card">
          <h3>Nova Lição</h3>
          <div className="form-group">
            <label>Nome</label>
            <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Target</label>
            <input value={createForm.target} onChange={e => setCreateForm(f => ({ ...f, target: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <input value={createForm.lesson_type} onChange={e => setCreateForm(f => ({ ...f, lesson_type: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Ordem</label>
            <input type="number" value={createForm.sort_order} onChange={e => setCreateForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>URL da Imagem</label>
            <div className="input-with-button">
              <input value={createForm.image_url} onChange={e => setCreateForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Ex: 🐝 ou https://..." />
              <button type="button" className="btn btn-small" onClick={() => { setPickerTarget('create'); setShowPicker(true) }}>📂 Escolher</button>
            </div>
          </div>
          <div className="form-group">
            <label>Política da Imagem</label>
            <select value={createForm.image_policy} onChange={e => setCreateForm(f => ({ ...f, image_policy: e.target.value }))}>
              <option value="auto">🔄 Auto — Resolver automaticamente</option>
              <option value="none">🚫 Nenhuma — Não mostrar imagem</option>
              <option value="custom">✏️ Personalizada — Usar imagem selecionada</option>
            </select>
          </div>
          <div className="form-group">
            <label>Texto Alternativo</label>
            <input value={createForm.alt_text} onChange={e => setCreateForm(f => ({ ...f, alt_text: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Placeholder</label>
            <input value={createForm.placeholder_text} onChange={e => setCreateForm(f => ({ ...f, placeholder_text: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Palavra Associada</label>
            <input value={createForm.association_word} onChange={e => setCreateForm(f => ({ ...f, association_word: e.target.value }))} placeholder="Ex: web" />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={createLesson}>Criar</button>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <div className="loading">Carregando...</div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Target</th>
              <th>Tipo</th>
              <th>Ordem</th>
              <th>Imagem</th>
              <th>Política</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map(l => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>
                  {editingId === l.id ? (
                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  ) : l.name}
                </td>
                <td>
                  {editingId === l.id ? (
                    <input value={editForm.target} onChange={e => setEditForm(f => ({ ...f, target: e.target.value }))} />
                  ) : l.target}
                </td>
                <td>{l.lesson_type}</td>
                <td>
                  {editingId === l.id ? (
                    <input type="number" value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                  ) : l.sort_order}
                </td>
                <td className="admin-image-cell">
                  {editingId === l.id ? (
                    <div className="input-with-button">
                      <input value={editForm.image_url} onChange={e => setEditForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Emoji ou URL" />
                      <button type="button" className="btn btn-small" onClick={() => { setPickerTarget(l.id); setShowPicker(true) }}>📂</button>
                    </div>
                  ) : (
                    <span title={l.image_url || ''}>{l.image_url ? (l.image_url.length > 8 ? l.image_url.slice(0, 8) + '…' : l.image_url) : '—'}</span>
                  )}
                </td>
                <td>
                  {editingId === l.id ? (
                    <select value={editForm.image_policy} onChange={e => setEditForm(f => ({ ...f, image_policy: e.target.value }))}>
                      <option value="auto">Auto</option>
                      <option value="none">Nenhuma</option>
                      <option value="custom">Personalizada</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${l.image_policy === 'none' ? 'inactive' : l.image_policy === 'custom' ? 'warning' : 'active'}`}>
                      {l.image_policy === 'none' ? 'Nenhuma' : l.image_policy === 'custom' ? 'Personalizada' : 'Auto'}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === l.id ? (
                    <label className="toggle-switch">
                      <input type="checkbox" checked={editForm.active} onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))} />
                      <span className="toggle-slider"></span>
                    </label>
                  ) : (
                    <div className="status-cell">
                      <label className="toggle-switch">
                        <input type="checkbox" checked={l.active} onChange={() => toggleActive(l.id, l.active)} />
                        <span className="toggle-slider"></span>
                      </label>
                      <span className={`status-badge ${l.active ? 'active' : 'inactive'}`}>
                        {l.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  )}
                </td>
                <td className="admin-actions">
                  {editingId === l.id ? (
                    <div className="edit-fields-compact">
                      <div className="form-group">
                        <label>Alt text</label>
                        <input value={editForm.alt_text} onChange={e => setEditForm(f => ({ ...f, alt_text: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Placeholder</label>
                        <input value={editForm.placeholder_text} onChange={e => setEditForm(f => ({ ...f, placeholder_text: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Palavra Associada</label>
                        <input value={editForm.association_word} onChange={e => setEditForm(f => ({ ...f, association_word: e.target.value }))} placeholder="Ex: web" />
                      </div>
                      <div className="edit-actions">
                        <button className="btn btn-sm btn-primary" onClick={() => saveEdit(l.id)}>Salvar</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-ghost" onClick={() => startEdit(l)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteLesson(l.id)}>Excluir</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => { setShowPicker(false); setPickerTarget(null) }}
        />
      )}
    </div>
  )
}

function AchievementsTab() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingType, setEditingType] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', icon: '', active: true })
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ achievement_type: '', name: '', description: '', icon: '', active: true })

  const load = useCallback(() => {
    setLoading(true)
    api.admin.listAchievements()
      .then(setAchievements)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = (ach) => {
    setEditingType(ach.achievement_type)
    setEditForm({ name: ach.name, description: ach.description || '', icon: ach.icon || '', active: ach.active })
  }

  const saveEdit = async (type) => {
    await api.admin.updateAchievement(type, editForm)
    setEditingType(null)
    load()
  }

  const deleteAchievement = async (type) => {
    if (!window.confirm('Tem certeza? Conquistas já desbloqueadas por usuários continuarão existindo.')) return
    await api.admin.deleteAchievement(type)
    load()
  }

  const createAchievement = async () => {
    await api.admin.createAchievement(createForm)
    setShowCreate(false)
    setCreateForm({ achievement_type: '', name: '', description: '', icon: '', active: true })
    load()
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="admin-achievements">
      <div className="admin-header-row">
        <h2>Conquistas</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Nova Conquista</button>
      </div>

      {showCreate && (
        <div className="admin-form card">
          <h3>Nova Conquista</h3>
          <div className="form-group">
            <label>Tipo</label>
            <input value={createForm.achievement_type} onChange={e => setCreateForm(f => ({ ...f, achievement_type: e.target.value }))} placeholder="Ex: super_streak" />
          </div>
          <div className="form-group">
            <label>Nome</label>
            <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Super Sequência" />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <input value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Estude por 60 dias seguidos" />
          </div>
          <div className="form-group">
            <label>Ícone (emoji)</label>
            <input value={createForm.icon} onChange={e => setCreateForm(f => ({ ...f, icon: e.target.value }))} placeholder="Ex: 🌟" />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={createForm.active} onChange={e => setCreateForm(f => ({ ...f, active: e.target.checked }))} />
              {' '}Ativo
            </label>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={createAchievement}>Criar</button>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Ícone</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {achievements.map(ach => (
            <tr key={ach.achievement_type}>
              <td><code>{ach.achievement_type}</code></td>
              <td>
                {editingType === ach.achievement_type ? (
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                ) : ach.name}
              </td>
              <td>
                {editingType === ach.achievement_type ? (
                  <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                ) : ach.description}
              </td>
              <td>
                {editingType === ach.achievement_type ? (
                  <input value={editForm.icon} onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))} placeholder="Emoji" />
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>{ach.icon || '🏅'}</span>
                )}
              </td>
              <td>
                {editingType === ach.achievement_type ? (
                  <label className="toggle-switch">
                    <input type="checkbox" checked={editForm.active} onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))} />
                    <span className="toggle-slider"></span>
                  </label>
                ) : (
                  <div className="status-cell">
                    <label className="toggle-switch">
                      <input type="checkbox" checked={ach.active} readOnly />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`status-badge ${ach.active ? 'active' : 'inactive'}`}>
                      {ach.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                )}
              </td>
              <td className="admin-actions">
                {editingType === ach.achievement_type ? (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => saveEdit(ach.achievement_type)}>Salvar</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingType(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-ghost" onClick={() => startEdit(ach)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteAchievement(ach.achievement_type)}>Excluir</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'flags'

  const setTab = (t) => setSearchParams({ tab: t })

  return (
    <div className="admin-page fade-in">
      <h1>Administração</h1>
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'flags' ? 'active' : ''}`} onClick={() => setTab('flags')}>
          Flags
        </button>
        <button className={`admin-tab ${tab === 'modules' ? 'active' : ''}`} onClick={() => setTab('modules')}>
          Módulos
        </button>
        <button className={`admin-tab ${tab === 'content' ? 'active' : ''}`} onClick={() => setTab('content')}>
          Conteúdo
        </button>
        <button className={`admin-tab ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>
          Conquistas
        </button>
      </div>
      <div className="admin-tab-content">
        {tab === 'flags' && <FlagsTab />}
        {tab === 'modules' && <ModulesTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'achievements' && <AchievementsTab />}
      </div>
    </div>
  )
}

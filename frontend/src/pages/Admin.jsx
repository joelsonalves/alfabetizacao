import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
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
  const [editForm, setEditForm] = useState({ name: '', target: '', lesson_type: '', active: true, sort_order: 0 })
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', target: '', lesson_type: '', active: true, sort_order: 0 })

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
    setEditForm({ name: l.name, target: l.target, lesson_type: l.lesson_type, active: l.active, sort_order: l.sort_order })
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
    setCreateForm({ name: '', target: '', lesson_type: '', active: true, sort_order: 0 })
    loadLessons(moduleId)
  }

  return (
    <div className="admin-content">
      <div className="admin-header-row">
        <h2>Conteúdo</h2>
        {moduleId && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Novo Item</button>
        )}
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
                <td>
                  <div className="status-cell">
                    <label className="toggle-switch">
                      <input type="checkbox" checked={l.active} onChange={() => toggleActive(l.id, l.active)} />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`status-badge ${l.active ? 'active' : 'inactive'}`}>
                      {l.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </td>
                <td className="admin-actions">
                  {editingId === l.id ? (
                    <>
                      <button className="btn btn-sm btn-primary" onClick={() => saveEdit(l.id)}>Salvar</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                    </>
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
      </div>
      <div className="admin-tab-content">
        {tab === 'flags' && <FlagsTab />}
        {tab === 'modules' && <ModulesTab />}
        {tab === 'content' && <ContentTab />}
      </div>
    </div>
  )
}

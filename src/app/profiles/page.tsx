'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Job } from '@/types'

const MODALIDAD_COLORS: Record<string, string> = {
  Remoto: '#4ade80',
  Presencial: '#60a5fa',
  Híbrido: '#c084fc',
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ nombre: '', telefono: '', tipo: '' })

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(prof)
    setForm({
      nombre: prof?.nombre || '',
      telefono: prof?.telefono || '',
      tipo: prof?.tipo || '',
    })

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .eq('cliente_id', user.id)
      .order('created_at', { ascending: false })

    setJobs(jobsData || [])
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      nombre: form.nombre,
      telefono: form.telefono,
      tipo: form.tipo,
    })
    if (!error) {
      setProfile({ ...profile, ...form })
      setEditing(false)
      setMessage('Perfil actualizado ✓')
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
  }

  return (
    <div className="page">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">TASKLY</span>
          </Link>
          <div className="nav-links">
            <Link href="/jobs" className="nav-link">Ver trabajos</Link>
            {user && (
              <Link href="/profile" className="user-pill">
                <span className="user-avatar">{user.email?.[0].toUpperCase()}</span>
                <span className="user-email">{user.email}</span>
              </Link>
            )}
            <Link href="/dashboard" className="btn-nav">Publicar trabajo</Link>
          </div>
        </div>
      </nav>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : (
        <div className="content">
          <div className="content-inner">

            {/* PROFILE CARD */}
            <div className="profile-card">
              <div className="profile-top">
                <div className="avatar-big">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="avatar-img" />
                  ) : (
                    <span>{user?.email?.[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="profile-info">
                  <h1 className="profile-name">
                    {profile?.nombre || 'Sin nombre'}
                  </h1>
                  <p className="profile-email">{user?.email}</p>
                  {profile?.tipo && (
                    <span className="profile-type">{profile.tipo}</span>
                  )}
                </div>
                <div className="profile-actions">
                  <button className="btn-edit" onClick={() => setEditing(!editing)}>
                    {editing ? 'Cancelar' : '✏️ Editar perfil'}
                  </button>
                  <button className="btn-signout" onClick={handleSignOut}>
                    Cerrar sesión
                  </button>
                </div>
              </div>

              {/* EDIT FORM */}
              {editing && (
                <div className="edit-form">
                  <div className="edit-divider" />
                  <div className="fields">
                    <div className="field">
                      <label>Nombre completo</label>
                      <input
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="field">
                      <label>Teléfono</label>
                      <input
                        value={form.telefono}
                        onChange={e => setForm({ ...form, telefono: e.target.value })}
                        placeholder="+502 0000 0000"
                      />
                    </div>
                    <div className="field">
                      <label>Tipo de cuenta</label>
                      <select
                        value={form.tipo}
                        onChange={e => setForm({ ...form, tipo: e.target.value })}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="cliente">Cliente</option>
                        <option value="freelancer">Freelancer</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  {message && <p className="save-message">{message}</p>}
                </div>
              )}

              {/* STATS */}
              <div className="stats">
                <div className="stat">
                  <span className="stat-value">{jobs.length}</span>
                  <span className="stat-label">Trabajos publicados</span>
                </div>
                {profile?.telefono && (
                  <div className="stat">
                    <span className="stat-value">📞</span>
                    <span className="stat-label">{profile.telefono}</span>
                  </div>
                )}
                <div className="stat">
                  <span className="stat-value">
                    {new Date(user?.created_at).toLocaleDateString('es', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="stat-label">Miembro desde</span>
                </div>
              </div>
            </div>

            {/* JOBS SECTION */}
            <div className="jobs-section">
              <div className="section-header">
                <h2 className="section-title">Trabajos publicados</h2>
                <Link href="/dashboard" className="btn-post">+ Publicar trabajo</Link>
              </div>

              {jobs.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <h3>Aún no has publicado trabajos</h3>
                  <p>Publica tu primer trabajo y encuentra talento</p>
                  <Link href="/dashboard" className="btn-primary">Publicar trabajo →</Link>
                </div>
              ) : (
                <div className="jobs-grid">
                  {jobs.map((job) => (
                    <Link href={`/jobs/${job.id}`} key={job.id} className="job-card">
                      <div className="job-top">
                        <span className="job-cat">{job.categoria}</span>
                        <span className="job-time">{timeAgo(job.created_at)}</span>
                      </div>
                      <h3 className="job-title">{job.titulo}</h3>
                      <p className="job-desc">{job.descripcion}</p>
                      <div className="job-bottom">
                        <div className="job-tags">
                          <span
                            className="tag-modalidad"
                            style={{ color: MODALIDAD_COLORS[job.modalidad] || '#fff' }}
                          >
                            ● {job.modalidad}
                          </span>
                          {job.ubicacion && (
                            <span className="tag-loc">📍 {job.ubicacion}</span>
                          )}
                        </div>
                        <div className="job-budget">
                          <span className="budget-amount">
                            {job.moneda} {Number(job.presupuesto).toLocaleString()}
                          </span>
                          <span className="budget-method">{job.metodo_pago}</span>
                        </div>
                      </div>
                      {job.tags && job.tags.length > 0 && (
                        <div className="job-skills">
                          {job.tags.slice(0, 4).map((t) => (
                            <span key={t} className="skill-tag">{t}</span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        * { box-sizing: border-box; }
        .page {
          min-height: 100vh;
          background: #0a0a0f;
          color: #fff;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        /* NAV */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(10,10,15,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo { display: flex; align-items: center; gap: 0.4rem; text-decoration: none; }
        .logo-icon { font-size: 1.4rem; }
        .logo-text { font-size: 1.2rem; font-weight: 900; letter-spacing: 0.15em; color: #ffc800; }
        .nav-links { display: flex; align-items: center; gap: 1.5rem; }
        .nav-link { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }
        .btn-nav {
          background: #ffc800; color: #0a0a0f; text-decoration: none;
          border-radius: 8px; padding: 0.5rem 1rem;
          font-size: 0.85rem; font-weight: 700; transition: background 0.2s;
        }
        .btn-nav:hover { background: #ffd700; }
        .user-pill {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.2);
          border-radius: 999px; padding: 0.35rem 0.75rem 0.35rem 0.35rem;
          text-decoration: none; transition: background 0.2s;
        }
        .user-pill:hover { background: rgba(255,200,0,0.15); }
        .user-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: #ffc800; color: #0a0a0f;
          font-size: 0.75rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .user-email {
          font-size: 0.8rem; color: rgba(255,255,255,0.6);
          max-width: 140px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }

        /* LOADING */
        .loading-screen {
          display: flex; align-items: center; justify-content: center;
          min-height: 60vh;
        }
        .spinner {
          width: 36px; height: 36px;
          border: 3px solid rgba(255,200,0,0.15);
          border-top-color: #ffc800;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* CONTENT */
        .content { padding: 2.5rem 1.5rem 5rem; }
        .content-inner { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }

        /* PROFILE CARD */
        .profile-card {
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 2rem;
        }
        .profile-top {
          display: flex; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap;
        }
        .avatar-big {
          width: 72px; height: 72px; border-radius: 50%;
          background: #ffc800; color: #0a0a0f;
          font-size: 1.8rem; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .profile-info { flex: 1; }
        .profile-name { font-size: 1.4rem; font-weight: 800; margin: 0 0 0.25rem; }
        .profile-email { font-size: 0.85rem; color: rgba(255,255,255,0.4); margin: 0 0 0.5rem; }
        .profile-type {
          display: inline-block;
          background: rgba(255,200,0,0.1); border: 1px solid rgba(255,200,0,0.25);
          color: #ffc800; border-radius: 999px;
          padding: 0.2rem 0.7rem; font-size: 0.75rem; font-weight: 600;
          text-transform: capitalize;
        }
        .profile-actions { display: flex; flex-direction: column; gap: 0.5rem; }
        .btn-edit {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8); border-radius: 8px;
          padding: 0.5rem 1rem; font-size: 0.82rem; font-family: inherit;
          cursor: pointer; transition: background 0.2s; white-space: nowrap;
        }
        .btn-edit:hover { background: rgba(255,255,255,0.08); }
        .btn-signout {
          background: transparent; border: 1px solid rgba(255,60,60,0.2);
          color: rgba(255,100,100,0.7); border-radius: 8px;
          padding: 0.5rem 1rem; font-size: 0.82rem; font-family: inherit;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .btn-signout:hover { background: rgba(255,60,60,0.08); color: #ff6b6b; }

        /* EDIT FORM */
        .edit-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 1.5rem 0; }
        .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .field { display: flex; flex-direction: column; gap: 0.4rem; }
        .field label {
          font-size: 0.75rem; font-weight: 600;
          color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em;
        }
        .field input, .field select {
          background: #1a1a24; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 0.65rem 0.85rem;
          color: #fff; font-size: 0.88rem; font-family: inherit;
          outline: none; transition: border-color 0.2s;
        }
        .field input:focus, .field select:focus { border-color: rgba(255,200,0,0.4); }
        .field select option { background: #1a1a24; }
        .btn-save {
          background: #ffc800; color: #0a0a0f; border: none;
          border-radius: 8px; padding: 0.65rem 1.5rem;
          font-size: 0.88rem; font-weight: 700; font-family: inherit;
          cursor: pointer; transition: background 0.2s;
        }
        .btn-save:hover:not(:disabled) { background: #ffd700; }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .save-message { font-size: 0.82rem; color: #4ade80; margin-top: 0.5rem; }

        /* STATS */
        .stats {
          display: flex; gap: 2rem; margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
        }
        .stat { display: flex; flex-direction: column; gap: 0.2rem; }
        .stat-value { font-size: 1.1rem; font-weight: 800; color: #fff; }
        .stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.35); }

        /* JOBS SECTION */
        .jobs-section {}
        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .section-title { font-size: 1.1rem; font-weight: 800; margin: 0; }
        .btn-post {
          background: transparent; border: 1px solid rgba(255,200,0,0.3);
          color: #ffc800; text-decoration: none; border-radius: 8px;
          padding: 0.45rem 0.9rem; font-size: 0.82rem; font-weight: 600;
          transition: background 0.2s;
        }
        .btn-post:hover { background: rgba(255,200,0,0.08); }

        /* JOB CARDS */
        .jobs-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .job-card {
          background: #13131a; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.5rem;
          text-decoration: none; display: block;
          transition: border-color 0.2s, transform 0.15s, background 0.2s;
        }
        .job-card:hover {
          border-color: rgba(255,200,0,0.25);
          background: #16161f; transform: translateY(-1px);
        }
        .job-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .job-cat {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,200,0,0.7);
        }
        .job-time { font-size: 0.75rem; color: rgba(255,255,255,0.25); }
        .job-title { font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0 0 0.6rem; line-height: 1.35; }
        .job-desc {
          font-size: 0.85rem; color: rgba(255,255,255,0.4); line-height: 1.6; margin: 0 0 1rem;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .job-bottom {
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
        }
        .job-tags { display: flex; align-items: center; gap: 1rem; }
        .tag-modalidad { font-size: 0.78rem; font-weight: 600; }
        .tag-loc { font-size: 0.78rem; color: rgba(255,255,255,0.35); }
        .job-budget { text-align: right; }
        .budget-amount { font-size: 1rem; font-weight: 800; color: #ffc800; display: block; }
        .budget-method { font-size: 0.72rem; color: rgba(255,255,255,0.3); }
        .job-skills { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.85rem; }
        .skill-tag {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px; padding: 0.2rem 0.6rem;
          font-size: 0.72rem; color: rgba(255,255,255,0.45);
        }

        /* EMPTY */
        .empty { text-align: center; padding: 4rem 1rem; }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.5rem; }
        .empty p { color: rgba(255,255,255,0.4); font-size: 0.88rem; margin: 0 0 1.5rem; }
        .btn-primary {
          background: #ffc800; color: #0a0a0f; text-decoration: none;
          border-radius: 10px; padding: 0.75rem 1.5rem;
          font-size: 0.9rem; font-weight: 700; display: inline-block;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #ffd700; }

        @media (max-width: 640px) {
          .profile-top { flex-direction: column; }
          .profile-actions { flex-direction: row; }
          .fields { grid-template-columns: 1fr; }
          .user-email { display: none; }
          .nav-link { display: none; }
        }
      `}</style>
    </div>
  )
}

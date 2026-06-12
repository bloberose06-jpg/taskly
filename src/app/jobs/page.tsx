'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { Job } from '@/types'
import NotificationBell from '@/components/NotificationBell'


const CATEGORIAS = [
  'Todas',
  'Diseño gráfico',
  'Desarrollo web',
  'Desarrollo móvil',
  'Marketing digital',
  'Redacción y traducción',
  'Video y animación',
  'Fotografía',
  'Contabilidad y finanzas',
  'Soporte técnico',
  'Consultoría',
  'Arquitectura e ingeniería',
  'Educación y tutorías',
  'Ventas',
  'Otro',
]

const MODALIDAD_COLORS: Record<string, string> = {
  Remoto: '#4ade80',
  Presencial: '#60a5fa',
  Híbrido: '#c084fc',
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState('Todas')
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchJobs()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  const filtered = jobs.filter((j) => {
    const matchCat = categoria === 'Todas' || j.categoria === categoria
    const matchSearch =
      !search ||
      j.titulo.toLowerCase().includes(search.toLowerCase()) ||
      j.descripcion.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

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
            <Link href="/jobs" className="nav-link active">Ver trabajos</Link>
            {user ? (
              <Link href="/profile" className="user-pill">
                <span className="user-avatar">{user.email?.[0].toUpperCase()}</span>
                <span className="user-email">{user.email}</span>
              </Link>
            ) : (
              <Link href="/login" className="nav-link">Iniciar sesión</Link>
            )}
            <Link href="/dashboard" className="btn-nav">Publicar trabajo</Link>
            
            <NotificationBell />
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <div className="header">
        <div className="header-inner">
          <h1 className="header-title">Trabajos disponibles</h1>
          <p className="header-sub">Encuentra tu próximo proyecto en Guatemala</p>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar trabajos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="content">
        <div className="content-inner">
          {/* FILTROS */}
          <div className="filters">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${categoria === cat ? 'active' : ''}`}
                onClick={() => setCategoria(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* RESULTADOS */}
          <div className="results-header">
            <span className="results-count">
              {loading ? 'Cargando...' : `${filtered.length} trabajo${filtered.length !== 1 ? 's' : ''}`}
            </span>
            <Link href="/dashboard" className="btn-post">+ Publicar trabajo</Link>
          </div>

          {loading ? (
            <div className="loading">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <h3>No hay trabajos{search ? ' para esta búsqueda' : ' aún'}</h3>
              <p>{search ? 'Intenta con otros términos' : 'Sé el primero en publicar uno'}</p>
              <Link href="/dashboard" className="btn-primary">Publicar trabajo →</Link>
            </div>
          ) : (
            <div className="jobs-grid">
              {filtered.map((job) => (
                <Link href={`/jobs/${job.id}`} key={job.id} className="job-card">
                  <div className="job-top">
                    <span className="job-cat">{job.categoria}</span>
                    <span className="job-time">{timeAgo(job.created_at)}</span>
                  </div>
                  <h2 className="job-title">{job.titulo}</h2>
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
        .nav-link:hover, .nav-link.active { color: #fff; }
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

        /* HEADER */
        .header {
          padding: 3.5rem 1.5rem 2.5rem;
          background-image: radial-gradient(ellipse at 50% 0%, rgba(255,200,0,0.06) 0%, transparent 60%);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .header-inner { max-width: 1100px; margin: 0 auto; }
        .header-title { font-size: 2rem; font-weight: 900; margin: 0 0 0.4rem; letter-spacing: -0.02em; }
        .header-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; margin: 0 0 1.5rem; }
        .search-bar {
          display: flex; align-items: center; gap: 0.75rem;
          background: #13131a; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 0.7rem 1rem;
          max-width: 500px; transition: border-color 0.2s;
        }
        .search-bar:focus-within { border-color: rgba(255,200,0,0.4); }
        .search-icon { font-size: 0.9rem; opacity: 0.4; }
        .search-input {
          flex: 1; background: none; border: none; outline: none;
          color: #fff; font-size: 0.9rem; font-family: inherit;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }
        .search-clear {
          background: none; border: none; color: rgba(255,255,255,0.3);
          cursor: pointer; font-size: 0.8rem; padding: 0;
        }
        .search-clear:hover { color: rgba(255,255,255,0.6); }

        /* CONTENT */
        .content { padding: 2rem 1.5rem 4rem; }
        .content-inner { max-width: 1100px; margin: 0 auto; }

        /* FILTERS */
        .filters {
          display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.75rem;
        }
        .filter-btn {
          background: transparent; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px; padding: 0.4rem 0.9rem;
          color: rgba(255,255,255,0.45); font-size: 0.8rem;
          font-family: inherit; cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .filter-btn:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.75); }
        .filter-btn.active {
          background: rgba(255,200,0,0.12); border-color: rgba(255,200,0,0.4);
          color: #ffc800; font-weight: 600;
        }

        /* RESULTS HEADER */
        .results-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .results-count { font-size: 0.85rem; color: rgba(255,255,255,0.35); }
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
          background: #16161f;
          transform: translateY(-1px);
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
        .job-title {
          font-size: 1.05rem; font-weight: 700; color: #fff;
          margin: 0 0 0.6rem; line-height: 1.35;
        }
        .job-desc {
          font-size: 0.85rem; color: rgba(255,255,255,0.4); line-height: 1.6;
          margin: 0 0 1rem;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .job-bottom {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 0.75rem;
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
        .empty { text-align: center; padding: 5rem 1rem; }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty h3 { font-size: 1.2rem; font-weight: 700; margin: 0 0 0.5rem; }
        .empty p { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin: 0 0 1.5rem; }
        .btn-primary {
          background: #ffc800; color: #0a0a0f; text-decoration: none;
          border-radius: 10px; padding: 0.75rem 1.5rem;
          font-size: 0.9rem; font-weight: 700; display: inline-block;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #ffd700; }

        /* SKELETON */
        .loading { display: flex; flex-direction: column; gap: 0.75rem; }
        .skeleton {
          height: 160px; background: #13131a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 640px) {
          .nav-link { display: none; }
          .header-title { font-size: 1.5rem; }
          .job-bottom { flex-direction: column; align-items: flex-start; }
          .job-budget { text-align: left; }
          .user-email { display: none; }
        }
      `}</style>
    </div>
  )
}

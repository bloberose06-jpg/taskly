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
              <>
                <Link href="/workspaces"    className="nav-link">Mis trabajos</Link>
                <Link href="/notifications" className="nav-link">Notificaciones</Link>
                <Link href="/profile" className="user-pill">
                  <span className="user-avatar">{user.email?.[0].toUpperCase()}</span>
                  <span className="user-email">{user.email}</span>
                </Link>
                <NotificationBell />
              </>
            ) : (
              <Link href="/login" className="nav-link">
                Iniciar sesión
              </Link>
            )}
      
            <Link href="/dashboard" className="btn-nav">
              Publicar trabajo
            </Link>
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
            <div className="loading-grid">
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
                <div key={job.id} className="job-card-wrapper">
                  <Link href={`/jobs/${job.id}`} className="job-card">
                    
                    {/* Contenedor de la Imagen Fijo */}
                    <div className="job-image-wrap">
                      {job.images && job.images.length > 0 ? (
                        <>
                          <img src={job.images[0]} alt={job.titulo} className="job-image" />
                          {job.images.length > 1 && (
                            <span className="job-image-count">+{job.images.length - 1}</span>
                          )}
                        </>
                      ) : (
                        /* Placeholder para los trabajos sin imagen mantengan la simetría */
                        <div className="job-image-placeholder">
                          <span>{job.categoria || 'Taskly'}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Contenedor Wrapper de Contenido */}
                    <div className="job-content-wrap">
                      <div className="job-top">
                        <span className="job-cat">{job.categoria}</span>
                        <span className="job-time">{timeAgo(job.created_at)}</span>
                      </div>
                      <h2 className="job-title">{job.titulo}</h2>
                      <p className="job-desc">{job.descripcion}</p>
                      
                      {/* Skills Intermedias si existen */}
                      {job.tags && job.tags.length > 0 && (
                        <div className="job-skills">
                          {job.tags.slice(0, 3).map((t) => (
                            <span key={t} className="skill-tag">{t}</span>
                          ))}
                        </div>
                      )}

                      <div className="job-bottom">
                        <div className="job-tags">
                          <span
                            className="tag-modalidad"
                            style={{ color: MODALIDAD_COLORS[job.modalidad] || '#fff' }}
                          >
                            ● {job.modalidad}
                          </span>
                          {job.ubicacion && (
                            <span className="tag-loc">📍 {job.ubicacion.split(',')[0]}</span>
                          )}
                        </div>
                        <div className="job-budget">
                          <span className="budget-amount">
                            {job.moneda || 'GTQ'} {Number(job.presupuesto).toLocaleString()}
                          </span>
                          <span className="budget-method">{job.metodo_pago || 'Por entrega'}</span>
                        </div>
                      </div>
                    </div>

                  </Link>

                  {/* Acceso directo al perfil integrado limpiamente abajo */}
                  <div className="job-card-footer-action">
                    <Link href={`/profile/${job.cliente_id}`} className="view-profile-link">
                      Ver perfil del cliente →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page {
          min-height: 100vh;
          background: #09090e;
          color: #fff;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        /* NAV */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(9,9,14,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
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
          padding: 4rem 1.5rem 3rem;
          background-image: radial-gradient(ellipse at 50% 0%, rgba(255,200,0,0.05) 0%, transparent 65%);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .header-inner { max-width: 1200px; margin: 0 auto; }
        .header-title { font-size: 2.2rem; font-weight: 800; margin: 0 0 0.4rem; letter-spacing: -0.02em; }
        .header-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; margin: 0 0 2rem; }
        .search-bar {
          display: flex; align-items: center; gap: 0.75rem;
          background: #111116; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 0.75rem 1.2rem;
          max-width: 480px; transition: border-color 0.2s;
        }
        .search-bar:focus-within { border-color: rgba(255,200,0,0.4); }
        .search-icon { font-size: 0.9rem; opacity: 0.4; }
        .search-input {
          flex: 1; background: none; border: none; outline: none;
          color: #fff; font-size: 0.95rem; font-family: inherit;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }
        .search-clear {
          background: none; border: none; color: rgba(255,255,255,0.3);
          cursor: pointer; font-size: 0.8rem; padding: 0;
        }

        /* CONTENT */
        .content { padding: 2.5rem 1.5rem 5rem; }
        .content-inner { max-width: 1200px; margin: 0 auto; }

        /* FILTROS */
        .filters {
          display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem;
        }
        .filter-btn {
          background: transparent; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 999px; padding: 0.45rem 1rem;
          color: rgba(255,255,255,0.45); font-size: 0.82rem;
          font-family: inherit; cursor: pointer; transition: all 0.2s;
        }
        .filter-btn:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); }
        .filter-btn.active {
          background: rgba(255,200,0,0.1); border-color: rgba(255,200,0,0.4);
          color: #ffc800; font-weight: 600;
        }

        /* RESULTS HEADER */
        .results-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .results-count { font-size: 0.85rem; color: rgba(255,255,255,0.4); }
        .btn-post {
          background: transparent; border: 1px solid rgba(255,200,0,0.3);
          color: #ffc800; text-decoration: none; border-radius: 8px;
          padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600;
          transition: all 0.2s;
        }
        .btn-post:hover { background: rgba(255,200,0,0.08); border-color: #ffc800; }

        /* JOBS GRID - BOXES DISPLAY */
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.75rem;
        }

        .job-card-wrapper {
          background: #111118;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .job-card-wrapper:hover {
          border-color: rgba(255, 200, 0, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.4);
        }

        .job-card {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 1.25rem;
          color: inherit;
        }

        .job-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 8px;
          overflow: hidden;
          background: #181824;
          margin-bottom: 1rem;
        }
        .job-image {
          width: 100%; height: 100%; object-fit: cover;
        }
        .job-image-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #161622 0%, #0d0d14 100%);
        }
        .job-image-placeholder span {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.03); padding: 0.3rem 0.6rem; border-radius: 4px;
        }
        .job-image-count {
          position: absolute; bottom: 0.5rem; right: 0.5rem;
          background: rgba(0,0,0,0.75); color: #fff;
          font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 4px;
        }

        .job-content-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .job-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .job-cat {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; color: #ffc800;
        }
        .job-time { font-size: 0.72rem; color: rgba(255,255,255,0.3); }
        
        .job-title {
          font-size: 1.1rem; font-weight: 700; color: #fff;
          margin: 0 0 0.5rem; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 1;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .job-desc {
          font-size: 0.85rem; color: rgba(255,255,255,0.45); line-height: 1.5;
          margin: 0 0 1rem;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .job-skills {
          display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 1.25rem;
        }
        .skill-tag {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 4px; padding: 0.15rem 0.45rem;
          font-size: 0.7rem; color: rgba(255,255,255,0.4);
        }

        .job-bottom {
          margin-top: auto;
          display: flex; align-items: flex-end; justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 0.85rem;
        }
        .job-tags {
          display: flex; flex-direction: column; gap: 0.25rem;
        }
        .tag-modalidad { font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; }
        .tag-loc { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
        
        .job-budget { text-align: right; }
        .budget-amount { font-size: 1.1rem; font-weight: 800; color: #ffc800; display: block; font-family: monospace; }
        .budget-method { font-size: 0.68rem; color: rgba(255,255,255,0.3); text-transform: uppercase; }

        /* ACCION VER PERFIL */
        .job-card-footer-action {
          background: rgba(255,255,255,0.01);
          border-top: 1px solid rgba(255,255,255,0.03);
          padding: 0.65rem 1.25rem;
          text-align: center;
        }
        .view-profile-link {
          text-decoration: none; font-size: 0.75rem; color: rgba(255,255,255,0.35);
          font-weight: 500; transition: color 0.15s;
        }
        .job-card-wrapper:hover .view-profile-link {
          color: #ffc800;
        }

        /* EMPTY & LOADING */
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

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.75rem;
        }
        .skeleton {
          height: 320px; background: #111116;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 640px) {
          .nav-link { display: none; }
          .header-title { font-size: 1.6rem; }
          .user-email { display: none; }
          .jobs-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

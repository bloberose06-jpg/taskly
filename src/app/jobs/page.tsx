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
  Remoto: '#0d9488',     // Teal
  Presencial: '#2563eb',  // Blue
  Híbrido: '#4b5563',    // Muted Gray
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
              placeholder="Buscar por título o descripción..."
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
              <h3>No hay trabajos para mostrar</h3>
              <p>{search ? 'Intenta ajustando tus términos de búsqueda' : 'Sé el primero en publicar una oferta corporativa'}</p>
              <Link href="/dashboard" className="btn-primary">Publicar trabajo</Link>
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
                        /* Simple Muted Placeholder */
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
                      
                      {/* Skills tags sutiles */}
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
                            style={{ color: MODALIDAD_COLORS[job.modalidad] || '#1f2937' }}
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
                      Ver perfil de la empresa →
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
  
  /* THEME CHANGES: Light Mode, Hyper-Clean Minimalist */
  .page {
    min-height: 100vh;
    background: #f8f9fa;
    color: #1a1a24; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* NAV */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #eef0f2;
  }
  .nav-inner {
    max-width: 1200px; margin: 0 auto;
    padding: 0.85rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .logo { display: flex; align-items: center; gap: 0.4rem; text-decoration: none; }
  .logo-icon { font-size: 1.2rem; }
  .logo-text { font-size: 1.1rem; font-weight: 800; letter-spacing: 0.05em; color: #1a1a24; }
  .nav-links { display: flex; align-items: center; gap: 1.5rem; }
  .nav-link { color: #64748b; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.15s; }
  .nav-link:hover, .nav-link.active { color: #1a1a24; }
  
  .btn-nav {
    background: #1a1a24; color: #fff; text-decoration: none;
    border-radius: 6px; padding: 0.45rem 0.9rem;
    font-size: 0.85rem; font-weight: 500; transition: background 0.15s;
  }
  .btn-nav:hover { background: #334155; }
  
  .user-pill {
    display: flex; align-items: center; gap: 0.5rem;
    background: #f1f5f9; border: 1px solid #e2e8f0;
    border-radius: 999px; padding: 0.25rem 0.65rem 0.25rem 0.25rem;
    text-decoration: none;
  }
  .user-avatar {
    width: 24px; height: 24px; border-radius: 50%;
    background: #1a1a24; color: #fff;
    font-size: 0.7rem; font-weight: 600;
    display: flex; align-items: center; justify-content: center;
  }
  .user-email { font-size: 0.8rem; color: #475569; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* HEADER */
  .header {
    padding: 4rem 1.5rem 3rem;
    background: #ffffff;
    border-bottom: 1px solid #eef0f2;
  }
  .header-inner { max-width: 1200px; margin: 0 auto; }
  .header-title { font-size: 2.2rem; font-weight: 700; margin: 0 0 0.3rem; color: #1a1a24; letter-spacing: -0.02em; }
  .header-sub { color: #64748b; font-size: 1rem; margin: 0 0 1.75rem; }
  
  .search-bar {
    display: flex; align-items: center; gap: 0.6rem;
    background: #f8fafc; border: 1px solid #cbd5e1;
    border-radius: 8px; padding: 0.65rem 1rem;
    max-width: 460px; transition: all 0.15s;
  }
  .search-bar:focus-within { border-color: #1a1a24; background: #fff; box-shadow: 0 0 0 1px #1a1a24; }
  .search-icon { font-size: 0.85rem; opacity: 0.5; }
  .search-input { flex: 1; background: none; border: none; outline: none; color: #1a1a24; font-size: 0.95rem; }
  .search-input::placeholder { color: #94a3b8; }
  .search-clear { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.8rem; }

  /* CONTENT */
  .content { padding: 3rem 1.5rem 5rem; }
  .content-inner { max-width: 1200px; margin: 0 auto; }

  /* FILTROS */
  .filters { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 2rem; }
  .filter-btn {
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 6px; padding: 0.45rem 0.95rem;
    color: #475569; font-size: 0.85rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .filter-btn:hover { border-color: #94a3b8; color: #1a1a24; }
  .filter-btn.active {
    background: #1a1a24; border-color: #1a1a24; color: #fff;
  }

  /* RESULTS HEADER */
  .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.75rem; }
  .results-count { font-size: 0.9rem; color: #64748b; font-weight: 500; }
  .btn-post {
    background: #fff; border: 1px solid #cbd5e1;
    color: #1a1a24; text-decoration: none; border-radius: 6px;
    padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 500;
    transition: all 0.15s;
  }
  .btn-post:hover { border-color: #1a1a24; background: #f8fafc; }

  /* JOBS GRID */
  .jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.75rem;
  }

  .job-card-wrapper {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  .job-card-wrapper:hover {
    border-color: #b4fee7; /* Subtle clean highlight on hover */
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    transform: translateY(-3px);
  }

  .job-card { 
    text-decoration: none; 
    display: flex; 
    flex-direction: column; 
    height: 100%; 
    padding: 1.5rem; /* Increased inner padding */
    color: inherit; 
  }

  /* FIXED IMAGE & PLACEHOLDER RATIO */
  .job-image-wrap {
    position: relative; 
    width: 100%; 
    aspect-ratio: 16 / 10; 
    border-radius: 8px; 
    overflow: hidden; 
    margin-bottom: 1.25rem;
  }
  .job-image { width: 100%; height: 100%; object-fit: cover; }
  
  /* FIXED PLACEHOLDER: Modern, Minimal gray instead of white background blank block */
  .job-image-placeholder {
    width: 100%; height: 100%; 
    display: flex; align-items: center; justify-content: center; 
    background: #f1f5f9; /* Soft tint */
    border: 1px dashed #e2e8f0;
    border-radius: 8px;
  }
  .job-image-placeholder span {
    font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; 
    color: #64748b; background: #ffffff; padding: 0.35rem 0.75rem; border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }
  .job-image-count {
    position: absolute; bottom: 0.5rem; right: 0.5rem; background: rgba(15, 23, 42, 0.8); color: #fff; font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 4px;
  }

  /* CONTENT WRAPPING STRETCH */
  .job-content-wrap { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    justify-content: space-between; /* Pushes content away from footer cleanly */
  }
  
  .job-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
  .job-cat { font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.02em; }
  .job-time { font-size: 0.72rem; color: #94a3b8; }
  
  .job-title {
    font-size: 1.15rem; font-weight: 600; color: #0f172a; margin: 0 0 0.5rem; line-height: 1.4;
    display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
  }
  .job-desc {
    font-size: 0.88rem; color: #475569; line-height: 1.6; margin: 0 0 1.25rem;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  .job-skills { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .skill-tag {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.2rem 0.5rem; font-size: 0.7rem; color: #475569; font-weight: 500;
  }

  /* LOWER ROW ALIGNMENTS */
  .job-bottom {
    margin-top: auto; 
    display: flex; 
    align-items: flex-end; 
    justify-content: space-between; 
    border-top: 1px solid #f1f5f9; 
    padding-top: 1rem;
  }
  .job-tags { display: flex; flex-direction: column; gap: 0.3rem; }
  .tag-modalidad { font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
  .tag-loc { font-size: 0.78rem; color: #64748b; }
  
  .job-budget { text-align: right; }
  .budget-amount { font-size: 1.15rem; font-weight: 700; color: #0f172a; display: block; letter-spacing: -0.01em; }
  .budget-method { font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }

  /* FOOTER INTERACTION ACTION */
  .job-card-footer-action {
    background: #fafafa; border-top: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; text-align: left;
  }
  .view-profile-link {
    text-decoration: none; font-size: 0.78rem; color: #64748b; font-weight: 500; transition: color 0.1s;
  }
  .job-card-wrapper:hover .view-profile-link { color: #0f172a; font-weight: 600; }

  /* EMPTY & LOADING */
  .empty { text-align: center; padding: 5rem 1rem; }
  .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
  .empty h3 { font-size: 1.15rem; font-weight: 600; margin: 0 0 0.4rem; color: #1a1a24; }
  .empty p { color: #64748b; font-size: 0.9rem; margin: 0 0 1.25rem; }
  
  .btn-primary {
    background: #1a1a24; color: #fff; text-decoration: none; border-radius: 6px; padding: 0.6rem 1.25rem; font-size: 0.88rem; font-weight: 500; display: inline-block; transition: background 0.15s;
  }
  .btn-primary:hover { background: #334155; }

  .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
  .skeleton {
    height: 300px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  @media (max-width: 640px) {
    .nav-link { display: none; }
    .header-title { font-size: 1.5rem; }
    .user-email { display: none; }
    .jobs-grid { grid-template-columns: 1fr; }
  }
`}</style>
    </div>
  )
}

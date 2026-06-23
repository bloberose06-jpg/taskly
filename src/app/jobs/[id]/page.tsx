'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { Job } from '@/types'

//import ReviewForm from '@/components/ReviewForm'

// Inside the page, once the job is loaded and completed:
<ReviewForm
  jobId={job.id}
  reviewedId={job.cliente_id}
  reviewedName={clienteProfile.nombre}
/>

const MODALIDAD_COLORS: Record<string, string> = {
  Remoto: '#4ade80',
  Presencial: '#60a5fa',
  Híbrido: '#c084fc',
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      setNotFound(true)
    } else {
      setJob(data)
    }
    setLoading(false)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `hace ${days}d`
    return new Date(date).toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' })
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
            {user ? (
              <Link href="/profile" className="user-pill">
                <span className="user-avatar">{user.email?.[0].toUpperCase()}</span>
                <span className="user-email">{user.email}</span>
              </Link>
            ) : (
              <Link href="/login" className="nav-link">Iniciar sesión</Link>
            )}
            <Link href="/dashboard" className="btn-nav">Publicar trabajo</Link>
          </div>
        </div>
      </nav>

      <div className="content">
        <div className="content-inner">
          <button className="back-btn" onClick={() => router.back()}>
            ← Volver a trabajos
          </button>

          {loading ? (
            <div className="skeleton-wrap">
              <div className="skeleton sk-title" />
              <div className="skeleton sk-meta" />
              <div className="skeleton sk-body" />
              <div className="skeleton sk-body short" />
            </div>
          ) : notFound ? (
            <div className="not-found">
              <div className="nf-icon">📭</div>
              <h2>Trabajo no encontrado</h2>
              <p>Este trabajo ya no está disponible o fue eliminado.</p>
              <Link href="/jobs" className="btn-primary">Ver todos los trabajos →</Link>
            </div>
          ) : job ? (
            <div className="job-layout">
              {/* MAIN */}
              <div className="job-main">
                <div className="job-card">
                  <div className="job-top">
                    <span className="job-cat">{job.categoria}</span>
                    <span className="job-time">{timeAgo(job.created_at)}</span>
                  </div>

                    {job.images && job.images.length > 0 && (
                      <div className="job-gallery">
                        {job.images.map((url, i) => (
                          <img key={url} src={url} alt={`${job.titulo} - foto ${i + 1}`} className="gallery-img" />
                        ))}
                      </div>
                    )}

                  <h1 className="job-title">{job.titulo}</h1>

                  <div className="job-tags-row">
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

                  <div className="divider" />

                  <div className="section">
                    <h2 className="section-title">Descripción del trabajo</h2>
                    <p className="job-desc">{job.descripcion}</p>
                  </div>

                  {job.tags && job.tags.length > 0 && (
                    <>
                      <div className="divider" />
                      <div className="section">
                        <h2 className="section-title">Habilidades requeridas</h2>
                        <div className="skills-list">
                          {job.tags.map((t) => (
                            <span key={t} className="skill-tag">{t}</span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SIDEBAR */}
              <div className="job-sidebar">
                <div className="side-card budget-card">
                  <div className="budget-amount">
                    {job.moneda} {Number(job.presupuesto).toLocaleString('es-GT')}
                  </div>
                  <div className="budget-method">{job.metodo_pago}</div>
                  {user ? (
                    <button className="btn-apply">
                      Aplicar a este trabajo →
                    </button>
                  ) : (
                    <Link href="/login" className="btn-apply">
                      Inicia sesión para aplicar →
                    </Link>
                  )}
                </div>

                <div className="side-card info-card">
                  <h3 className="info-title">Detalles</h3>
                  <div className="info-list">
                    <div className="info-row">
                      <span className="info-label">Categoría</span>
                      <span className="info-value">{job.categoria}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Modalidad</span>
                      <span
                        className="info-value"
                        style={{ color: MODALIDAD_COLORS[job.modalidad] || '#fff' }}
                      >
                        {job.modalidad}
                      </span>
                    </div>
                    {job.ubicacion && (
                      <div className="info-row">
                        <span className="info-label">Ubicación</span>
                        <span className="info-value">{job.ubicacion}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">Pago</span>
                      <span className="info-value">{job.metodo_pago}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Publicado</span>
                      <span className="info-value">{timeAgo(job.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
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
        .content { padding: 2rem 1.5rem 5rem; }
        .content-inner { max-width: 1100px; margin: 0 auto; }
        .back-btn {
          background: none; border: none; color: rgba(255,255,255,0.4);
          font-size: 0.85rem; cursor: pointer; padding: 0;
          font-family: inherit; transition: color 0.2s;
          margin-bottom: 1.75rem; display: block;
        }
        .back-btn:hover { color: #fff; }
        .job-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          align-items: start;
        }
        .job-card {
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 2rem;
        }
        .job-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.85rem;
        }
        .job-cat {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,200,0,0.7);
        }
        .job-time { font-size: 0.75rem; color: rgba(255,255,255,0.25); }
        .job-title {
          font-size: 1.6rem; font-weight: 800; color: #fff;
          margin: 0 0 1rem; line-height: 1.25; letter-spacing: -0.02em;
        }
        .job-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .gallery-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          display: block;
        }
        .job-tags-row {
          display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;
          margin-bottom: 0.25rem;
        }
        .tag-modalidad { font-size: 0.82rem; font-weight: 600; }
        .tag-loc { font-size: 0.82rem; color: rgba(255,255,255,0.35); }
        .divider {
          height: 1px; background: rgba(255,255,255,0.05);
          margin: 1.5rem 0;
        }
        .section-title {
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.35);
          margin: 0 0 0.85rem;
        }
        .job-desc {
          font-size: 0.95rem; color: rgba(255,255,255,0.65);
          line-height: 1.75; margin: 0; white-space: pre-wrap;
        }
        .skills-list { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .skill-tag {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 0.3rem 0.75rem;
          font-size: 0.8rem; color: rgba(255,255,255,0.5);
        }
        .job-sidebar { display: flex; flex-direction: column; gap: 1rem; }
        .side-card {
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.5rem;
        }
        .budget-card { text-align: center; }
        .budget-amount {
          font-size: 2rem; font-weight: 900; color: #ffc800;
          line-height: 1; margin-bottom: 0.3rem;
        }
        .budget-method {
          font-size: 0.8rem; color: rgba(255,255,255,0.3);
          margin-bottom: 1.5rem;
        }
        .btn-apply {
          display: block; width: 100%;
          background: #ffc800; color: #0a0a0f;
          border: none; border-radius: 10px;
          padding: 0.85rem 1rem; font-size: 0.9rem; font-weight: 700;
          font-family: inherit; cursor: pointer;
          text-decoration: none; text-align: center;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-apply:hover { background: #ffd700; transform: translateY(-1px); }
        .info-title {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.3);
          margin: 0 0 1rem;
        }
        .info-list { display: flex; flex-direction: column; gap: 0; }
        .info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.6rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.85rem;
        }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: rgba(255,255,255,0.35); }
        .info-value { color: rgba(255,255,255,0.75); font-weight: 500; text-align: right; max-width: 60%; }
        .skeleton-wrap { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
        .skeleton {
          background: #13131a; border-radius: 12px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .sk-title { height: 48px; max-width: 500px; }
        .sk-meta { height: 24px; max-width: 300px; }
        .sk-body { height: 120px; }
        .sk-body.short { height: 60px; max-width: 60%; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .not-found { text-align: center; padding: 6rem 1rem; }
        .nf-icon { font-size: 3rem; margin-bottom: 1rem; }
        .not-found h2 { font-size: 1.3rem; font-weight: 700; margin: 0 0 0.5rem; }
        .not-found p { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin: 0 0 1.5rem; }
        .btn-primary {
          background: #ffc800; color: #0a0a0f; text-decoration: none;
          border-radius: 10px; padding: 0.75rem 1.5rem;
          font-size: 0.9rem; font-weight: 700; display: inline-block;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #ffd700; }
        @media (max-width: 800px) {
          .job-layout { grid-template-columns: 1fr; }
          .job-sidebar { order: -1; }
          .budget-card { text-align: left; }
          .budget-amount { font-size: 1.5rem; }
        }
        @media (max-width: 640px) {
          .nav-link { display: none; }
          .user-email { display: none; }
          .job-title { font-size: 1.25rem; }
          .job-card { padding: 1.25rem; }
          .side-card { padding: 1.25rem; }
        }
      `}</style>
    </div>
  )
}

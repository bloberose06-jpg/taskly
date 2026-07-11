'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { Job } from '@/types'

const MODALIDAD_COLORS: Record<string, string> = {
  Remoto: '#4ade80',
  Presencial: '#60a5fa',
  Híbrido: '#c084fc',
}

// Trabajo que publicaste (como cliente)
type OwnedJob = Job

// Trabajo donde te aceptaron (como aplicante) — viene de applications + join a jobs
type AcceptedJob = Job & { application_id: string; application_created_at: string }

export default function WorkspacesPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [ownedJobs, setOwnedJobs] = useState<OwnedJob[]>([])
  const [acceptedJobs, setAcceptedJobs] = useState<AcceptedJob[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setErrorMsg(null)

        const { data, error } = await supabase.auth.getUser()

        if (error) {
          console.error('Auth error:', error)
          setErrorMsg('No se pudo verificar tu sesión.')
          return
        }

        if (!data.user) {
          router.push('/login')
          return
        }

        setUser(data.user)
        await fetchWorkspaces(data.user.id)
      } catch (err) {
        console.error('LOAD ERROR:', err)
        setErrorMsg('Ocurrió un error cargando tus trabajos.')
      } finally {
        // Pase lo que pase, dejamos de mostrar el skeleton
        setLoading(false)
      }
    }

    load()
  }, [router])

  const fetchWorkspaces = async (userId: string) => {
    // 1. Trabajos que publicaste tú (cliente)
    const ownedPromise = supabase
      .from('jobs')
      .select('*')
      .eq('cliente_id', userId)
      .order('created_at', { ascending: false })

    // 2. Trabajos donde te aceptaron como aplicante
    //    (join implícito: applications -> jobs)
    const acceptedPromise = supabase
      .from('applications')
      .select(
        `
        id,
        created_at,
        estado,
        job:jobs (*)
      `
      )
      .eq('applicant_id', userId)
      .eq('estado', 'aceptado')
      .order('created_at', { ascending: false })

    const [ownedRes, acceptedRes] = await Promise.all([ownedPromise, acceptedPromise])

    if (ownedRes.error) {
      console.error('Error fetching owned jobs:', ownedRes.error)
      throw ownedRes.error
    }
    if (acceptedRes.error) {
      console.error('Error fetching accepted applications:', acceptedRes.error)
      throw acceptedRes.error
    }

    setOwnedJobs(ownedRes.data || [])

    // Aplanamos application + job en un solo objeto
    const accepted = (acceptedRes.data || [])
      .filter((row: any) => row.job) // por si el job fue borrado
      .map((row: any) => ({
        ...row.job,
        application_id: row.id,
        application_created_at: row.created_at,
      })) as AcceptedJob[]

    setAcceptedJobs(accepted)
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
            <Link href="/workspaces" className="nav-link active">Mis trabajos</Link>
            <Link href="/notifications" className="nav-link">Notificaciones</Link>
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

      <div className="content">
        <div className="content-inner">
          <Link href="/jobs" className="back-link">← Volver a trabajos</Link>
          <h1 className="page-title">Mis trabajos</h1>

          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          {loading ? (
            <div className="skeleton-wrap">
              <div className="skeleton sk-line" />
              <div className="skeleton sk-line short" />
              <div className="skeleton sk-card" />
              <div className="skeleton sk-card" />
            </div>
          ) : (
            <>
              {/* TRABAJOS ACEPTADOS (como aplicante) */}
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Trabajos donde fuiste aceptado</h2>
                  <span className="section-count">{acceptedJobs.length}</span>
                </div>
                {acceptedJobs.length === 0 ? (
                  <div className="empty">
                    <p>Aún no te han aceptado en ningún trabajo.</p>
                    <Link href="/jobs" className="btn-secondary">Buscar trabajos →</Link>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {acceptedJobs.map((job) => (
                      <Link key={job.application_id} href={`/jobs/${job.id}/workspace`} className="job-card">
                        <div className="job-top">
                          <span className="job-cat">{job.categoria}</span>
                          <span className="job-time">{timeAgo(job.application_created_at)}</span>
                        </div>
                        <h3 className="job-title">{job.titulo}</h3>
                        <div className="job-tags-row">
                          <span
                            className="pill pill-modalidad"
                            style={{
                              color: MODALIDAD_COLORS[job.modalidad] || '#fff',
                              borderColor: `${MODALIDAD_COLORS[job.modalidad] || '#fff'}33`,
                              background: `${MODALIDAD_COLORS[job.modalidad] || '#fff'}14`,
                            }}
                          >
                            ● {job.modalidad}
                          </span>
                          <span className="pill pill-status accepted">✅ Aceptado</span>
                        </div>
                        <div className="job-footer">
                          <div className="job-budget">
                            {job.moneda} {Number(job.presupuesto).toLocaleString('es-GT')}
                          </div>
                          <span className="job-cta">Ir al workspace →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* TRABAJOS PUBLICADOS (como cliente) */}
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Trabajos que publicaste</h2>
                  <span className="section-count">{ownedJobs.length}</span>
                </div>
                {ownedJobs.length === 0 ? (
                  <div className="empty">
                    <p>Todavía no has publicado ningún trabajo.</p>
                    <Link href="/dashboard" className="btn-secondary">Publicar trabajo →</Link>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {ownedJobs.map((job) => (
                      <Link key={job.id} href={`/jobs/${job.id}`} className="job-card">
                        <div className="job-top">
                          <span className="job-cat">{job.categoria}</span>
                          <span className="job-time">{timeAgo(job.created_at)}</span>
                        </div>
                        <h3 className="job-title">{job.titulo}</h3>
                        <div className="job-tags-row">
                          <span
                            className="pill pill-modalidad"
                            style={{
                              color: MODALIDAD_COLORS[job.modalidad] || '#fff',
                              borderColor: `${MODALIDAD_COLORS[job.modalidad] || '#fff'}33`,
                              background: `${MODALIDAD_COLORS[job.modalidad] || '#fff'}14`,
                            }}
                          >
                            ● {job.modalidad}
                          </span>
                          <span className={`pill pill-status estado-${job.estado}`}>{job.estado}</span>
                        </div>
                        <div className="job-footer">
                          <div className="job-budget">
                            {job.moneda} {Number(job.presupuesto).toLocaleString('es-GT')}
                          </div>
                          <span className="job-cta">Ver detalles →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; background: #0a0a0f; color: #fff; font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,15,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-inner { max-width: 1100px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 0.4rem; text-decoration: none; }
        .logo-icon { font-size: 1.4rem; }
        .logo-text { font-size: 1.2rem; font-weight: 900; letter-spacing: 0.15em; color: #ffc800; }
        .nav-links { display: flex; align-items: center; gap: 1.5rem; }
        .nav-link { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .nav-link:hover, .nav-link.active { color: #fff; }
        .btn-nav { background: #ffc800; color: #0a0a0f; text-decoration: none; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 700; }
        .user-pill { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.2); border-radius: 999px; padding: 0.35rem 0.75rem 0.35rem 0.35rem; text-decoration: none; }
        .user-avatar { width: 26px; height: 26px; border-radius: 50%; background: #ffc800; color: #0a0a0f; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .user-email { font-size: 0.8rem; color: rgba(255,255,255,0.6); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .content { padding: 2.5rem 1.5rem 6rem; }
        .content-inner { max-width: 1100px; margin: 0 auto; }
        .back-link { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.85rem; display: inline-block; margin-bottom: 1.25rem; }
        .back-link:hover { color: #fff; }
        .page-title { font-size: 1.85rem; font-weight: 800; margin: 0 0 2.5rem; letter-spacing: -0.01em; }

        .error-banner { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171; border-radius: 10px; padding: 0.85rem 1rem; font-size: 0.85rem; margin-bottom: 1.5rem; }

        /* SECCIONES: separación clara con línea superior + espacio generoso */
        .section { margin-bottom: 0; padding: 2rem 0; }
        .section:first-of-type { padding-top: 0; }
        .section + .section { border-top: 1px solid rgba(255,255,255,0.07); }

        .section-header { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 1.5rem; }
        .section-title { font-size: 1.05rem; font-weight: 700; margin: 0; color: rgba(255,255,255,0.9); }
        .section-count {
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.45);
          font-size: 0.75rem; font-weight: 700; min-width: 22px; height: 22px;
          border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
          padding: 0 0.4rem;
        }

        .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 1.25rem; }
        .job-card {
          background: #13131a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
          padding: 1.5rem; text-decoration: none; color: inherit;
          display: flex; flex-direction: column; gap: 0.9rem;
          transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .job-card:hover { border-color: rgba(255,200,0,0.35); transform: translateY(-3px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }

        .job-top { display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; }
        .job-cat { color: rgba(255,200,0,0.7); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .job-time { color: rgba(255,255,255,0.25); }
        .job-title { font-size: 1.05rem; font-weight: 700; margin: 0; line-height: 1.4; }

        .job-tags-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .pill {
          display: inline-flex; align-items: center; gap: 0.25rem;
          font-size: 0.72rem; font-weight: 600; text-transform: capitalize;
          padding: 0.3rem 0.65rem; border-radius: 999px; border: 1px solid transparent;
        }
        .pill-status { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }
        .pill-status.accepted { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.25); color: #4ade80; }
        .pill-status.estado-abierto { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.25); color: #4ade80; }
        .pill-status.estado-cerrado { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.25); color: #f87171; }
        .pill-status.estado-completado { background: rgba(255,200,0,0.1); border-color: rgba(255,200,0,0.25); color: #ffc800; }
        .pill-status.estado-pausado { background: rgba(250,204,21,0.1); border-color: rgba(250,204,21,0.25); color: #facc15; }

        .job-footer {
          margin-top: auto; padding-top: 0.9rem; border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
        }
        .job-budget { font-size: 1.15rem; font-weight: 800; color: #ffc800; }
        .job-cta { font-size: 0.76rem; color: rgba(255,255,255,0.35); transition: color 0.2s; }
        .job-card:hover .job-cta { color: #ffc800; }

        .empty { background: #13131a; border: 1px dashed rgba(255,255,255,0.12); border-radius: 16px; padding: 2.5rem 2rem; text-align: center; }
        .empty p { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin: 0 0 1.1rem; }
        .btn-secondary { display: inline-block; background: rgba(255,200,0,0.1); border: 1px solid rgba(255,200,0,0.25); color: #ffc800; text-decoration: none; border-radius: 8px; padding: 0.55rem 1.1rem; font-size: 0.85rem; font-weight: 600; transition: background 0.2s; }
        .btn-secondary:hover { background: rgba(255,200,0,0.18); }

        .skeleton-wrap { display: flex; flex-direction: column; gap: 1rem; }
        .skeleton { background: #13131a; border-radius: 12px; animation: pulse 1.5s ease-in-out infinite; }
        .sk-line { height: 20px; max-width: 260px; }
        .sk-line.short { height: 16px; max-width: 180px; }
        .sk-card { height: 140px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        @media (max-width: 640px) {
          .nav-link { display: none; }
          .user-email { display: none; }
          .jobs-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

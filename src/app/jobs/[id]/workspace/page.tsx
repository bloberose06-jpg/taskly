'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { Job, Profile, Application } from '@/types'
import ReviewForm from '@/components/ReviewForm'

export default function WorkspacePage() {
  const params  = useParams()
  const router  = useRouter()
  const jobId   = params?.id as string

  const [job,         setJob]         = useState<Job | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [myProfile,   setMyProfile]   = useState<Profile | null>(null)
  const [otherProfile,setOtherProfile]= useState<Profile | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [forbidden,   setForbidden]   = useState(false)
  const [completing,  setCompleting]  = useState(false)
  const [completed,   setCompleted]   = useState(false)

  useEffect(() => {
    if (!jobId) return
    init()
  }, [jobId])

  const init = async () => {
    setLoading(true)

    // 1. Get logged-in user
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { router.push('/login'); return }
    setCurrentUser(authData.user)

    // 2. Load job
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (!jobData) { setForbidden(true); setLoading(false); return }
    setJob(jobData)

    // 3. Load accepted application
    const { data: appData } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .eq('estado', 'aceptado')
      .single()

    if (!appData) { setForbidden(true); setLoading(false); return }
    setApplication(appData)

    const isCliente    = authData.user.id === jobData.cliente_id
    const isFreelancer = authData.user.id === appData.applicant_id

    // 4. Access control — only client and accepted freelancer
    if (!isCliente && !isFreelancer) {
      setForbidden(true)
      setLoading(false)
      return
    }

    // 5. Load both profiles
    const myId    = authData.user.id
    const otherId = isCliente ? appData.applicant_id : jobData.cliente_id

    const [{ data: me }, { data: other }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', myId).single(),
      supabase.from('profiles').select('*').eq('id', otherId).single(),
    ])

    setMyProfile(me)
    setOtherProfile(other)
    if (jobData.estado === 'completado') setCompleted(true)
    setLoading(false)
  }

  const handleMarkComplete = async () => {
    if (!job || !application || !currentUser) return
    setCompleting(true)

    // Update job estado
    await supabase.from('jobs').update({ estado: 'completado' }).eq('id', job.id)

    // Notify freelancer
    await supabase.from('notifications').insert({
      user_id: application.applicant_id,
      title:   '🎉 ¡Trabajo completado!',
      body:    `El cliente marcó "${job.titulo}" como completado. ¡Ahora puedes dejar una reseña!`,
      job_id:  job.id,
    })

    setCompleted(true)
    setJob((prev) => prev ? { ...prev, estado: 'completado' } : prev)
    setCompleting(false)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'hoy'
    if (days === 1) return 'ayer'
    if (days < 7) return `hace ${days} días`
    return new Date(date).toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const isCliente = currentUser && job && currentUser.id === job.cliente_id

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Cargando workspace…</div>
    </div>
  )

  // ── Forbidden ─────────────────────────────────────────────
  if (forbidden) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <h2 style={{ color: '#fff', margin: 0 }}>Acceso restringido</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>Solo el cliente y el freelancer aceptado pueden ver esta página.</p>
      <Link href="/jobs" style={{ color: '#ffc800', textDecoration: 'none', fontWeight: 600 }}>← Ver trabajos</Link>
    </div>
  )

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
            {currentUser && (
              <Link href="/profile" className="user-pill">
                <span className="user-avatar">{currentUser.email?.[0].toUpperCase()}</span>
                <span className="user-email">{currentUser.email}</span>
              </Link>
            )}
            <Link href="/dashboard" className="btn-nav">Publicar trabajo</Link>
          </div>
        </div>
      </nav>

      <div className="content">
        <div className="content-inner">

          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/jobs" className="bc-link">Trabajos</Link>
            <span className="bc-sep">›</span>
            <Link href={`/jobs/${jobId}`} className="bc-link">{job?.titulo}</Link>
            <span className="bc-sep">›</span>
            <span className="bc-current">Workspace</span>
          </div>

          {/* Status banner */}
          <div className={`status-banner ${completed ? 'done' : 'active'}`}>
            <span className="status-dot" />
            <span className="status-text">
              {completed ? '✅ Trabajo completado' : '🟢 Trabajo en progreso'}
            </span>
            {!completed && isCliente && (
              <button
                className="btn-complete"
                onClick={handleMarkComplete}
                disabled={completing}
              >
                {completing ? 'Guardando…' : 'Marcar como completado ✓'}
              </button>
            )}
          </div>

          <div className="workspace-grid">

            {/* LEFT — Job info */}
            <div className="left-col">

              {/* Job card */}
              <div className="card">
                <div className="card-label">📋 Detalles del trabajo</div>
                <h1 className="job-title">{job?.titulo}</h1>
                <div className="job-meta-row">
                  <span className="meta-chip">{job?.categoria}</span>
                  <span className="meta-chip">{job?.modalidad}</span>
                  {job?.ubicacion && <span className="meta-chip">📍 {job.ubicacion}</span>}
                </div>
                <p className="job-desc">{job?.descripcion}</p>
                {job?.tags && job.tags.length > 0 && (
                  <div className="tags-row">
                    {job.tags.map((t) => (
                      <span key={t} className="skill-tag">{t}</span>
                    ))}
                  </div>
                )}
                <div className="job-footer">
                  <div className="budget">
                    <span className="budget-label">Presupuesto</span>
                    <span className="budget-value">{job?.moneda} {Number(job?.presupuesto).toLocaleString('es-GT')}</span>
                  </div>
                  <div className="budget">
                    <span className="budget-label">Método de pago</span>
                    <span className="budget-value">{job?.metodo_pago}</span>
                  </div>
                  <div className="budget">
                    <span className="budget-label">Publicado</span>
                    <span className="budget-value">{job ? timeAgo(job.created_at) : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Review form — only for freelancer when completed */}
              {completed && !isCliente && job && job.cliente_id && (
                <div className="card">
                  <div className="card-label">⭐ Califica al cliente</div>
                  <ReviewForm
                    jobId={job.id}
                    reviewedId={job.cliente_id}
                    reviewedName={otherProfile?.nombre ?? 'el cliente'}
                  />
                </div>
              )}
            </div>

            {/* RIGHT — Contact */}
            <div className="right-col">

              {/* Other user contact card */}
              {otherProfile && (
                <div className="card contact-card">
                  <div className="card-label">
                    {isCliente ? '👤 Freelancer contratado' : '🏢 Cliente'}
                  </div>

                  <Link href={`/profile/${otherProfile.id}`} className="contact-profile-link">
                    <div className="contact-avatar">
                      {otherProfile.nombre[0].toUpperCase()}
                    </div>
                    <div className="contact-info">
                      <span className="contact-name">{otherProfile.nombre}</span>
                      <span className="contact-rating">
                        {'★'.repeat(Math.round(otherProfile.avg_rating))}
                        {'☆'.repeat(5 - Math.round(otherProfile.avg_rating))}
                        {' '}{otherProfile.avg_rating.toFixed(1)} · {otherProfile.total_reviews} reseña{otherProfile.total_reviews !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="contact-arrow">Ver perfil →</span>
                  </Link>

                  <div className="divider" />

                  <div className="contact-label">Información de contacto</div>
                  <div className="contact-methods">
                    {otherProfile.telefono ? (
                      <a href={`https://wa.me/${otherProfile.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="contact-btn whatsapp">
                        <span>💬</span> WhatsApp
                      </a>
                    ) : (
                      <div className="contact-missing">Sin teléfono registrado</div>
                    )}
                    <a
                      href={`mailto:${isCliente ? '' : ''}?subject=Trabajo: ${encodeURIComponent(job?.titulo ?? '')}`}
                      className="contact-btn email"
                    >
                      <span>✉️</span> Enviar correo
                    </a>
                  </div>

                  {otherProfile.bio && (
                    <>
                      <div className="divider" />
                      <p className="contact-bio">{otherProfile.bio}</p>
                    </>
                  )}

                  {otherProfile.habilidades && otherProfile.habilidades.length > 0 && (
                    <div className="skills-wrap">
                      {otherProfile.habilidades.map((h) => (
                        <span key={h} className="skill-tag">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* My info card */}
              {myProfile && (
                <div className="card my-card">
                  <div className="card-label">👤 Tu perfil en este trabajo</div>
                  <div className="my-profile-row">
                    <div className="contact-avatar sm">
                      {myProfile.nombre[0].toUpperCase()}
                    </div>
                    <div className="contact-info">
                      <span className="contact-name">{myProfile.nombre}</span>
                      <span className="my-role">{isCliente ? '🏢 Cliente' : '🎯 Freelancer'}</span>
                    </div>
                  </div>
                  {!myProfile.telefono && (
                    <div className="profile-tip">
                      💡 <Link href="/profile" className="tip-link">Agrega tu teléfono</Link> para que el otro usuario pueda contactarte por WhatsApp.
                    </div>
                  )}
                </div>
              )}

              {/* Application message */}
              {application?.mensaje && (
                <div className="card">
                  <div className="card-label">💬 Mensaje de aplicación</div>
                  <p className="app-mensaje">"{application.mensaje}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; background: #0a0a0f; color: #fff; font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        /* NAV */
        .nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,15,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-inner { max-width: 1100px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 0.4rem; text-decoration: none; }
        .logo-icon { font-size: 1.4rem; }
        .logo-text { font-size: 1.2rem; font-weight: 900; letter-spacing: 0.15em; color: #ffc800; }
        .nav-links { display: flex; align-items: center; gap: 1.5rem; }
        .nav-link { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 0.9rem; }
        .nav-link:hover { color: #fff; }
        .btn-nav { background: #ffc800; color: #0a0a0f; text-decoration: none; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 700; }
        .user-pill { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.2); border-radius: 999px; padding: 0.35rem 0.75rem 0.35rem 0.35rem; text-decoration: none; }
        .user-avatar { width: 26px; height: 26px; border-radius: 50%; background: #ffc800; color: #0a0a0f; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .user-email { font-size: 0.8rem; color: rgba(255,255,255,0.6); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* CONTENT */
        .content { padding: 2rem 1.5rem 5rem; }
        .content-inner { max-width: 1100px; margin: 0 auto; }

        /* BREADCRUMB */
        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .bc-link { color: rgba(255,255,255,0.35); text-decoration: none; transition: color 0.2s; }
        .bc-link:hover { color: rgba(255,255,255,0.7); }
        .bc-sep { color: rgba(255,255,255,0.2); }
        .bc-current { color: rgba(255,255,255,0.6); }

        /* STATUS BANNER */
        .status-banner { display: flex; align-items: center; gap: 0.85rem; border-radius: 14px; padding: 1rem 1.25rem; margin-bottom: 1.75rem; flex-wrap: wrap; }
        .status-banner.active { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); }
        .status-banner.done   { background: rgba(255,200,0,0.07); border: 1px solid rgba(255,200,0,0.2); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
        .status-banner.done .status-dot { background: #ffc800; }
        .status-text { font-size: 0.9rem; font-weight: 600; color: #fff; flex: 1; }
        .btn-complete { background: #ffc800; color: #0a0a0f; border: none; border-radius: 8px; padding: 0.55rem 1.1rem; font-size: 0.82rem; font-weight: 700; font-family: inherit; cursor: pointer; transition: background 0.2s; margin-left: auto; }
        .btn-complete:hover:not(:disabled) { background: #ffd700; }
        .btn-complete:disabled { opacity: 0.5; cursor: not-allowed; }

        /* GRID */
        .workspace-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }
        .left-col  { display: flex; flex-direction: column; gap: 1.25rem; }
        .right-col { display: flex; flex-direction: column; gap: 1.25rem; }

        /* CARDS */
        .card { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 1.5rem; }
        .card-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.3); margin-bottom: 1rem; }

        /* JOB CARD */
        .job-title { font-size: 1.4rem; font-weight: 800; margin: 0 0 0.85rem; line-height: 1.25; letter-spacing: -0.02em; }
        .job-meta-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .meta-chip { background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.18); color: rgba(255,200,0,0.8); border-radius: 6px; padding: 0.2rem 0.65rem; font-size: 0.75rem; font-weight: 600; }
        .job-desc { font-size: 0.92rem; color: rgba(255,255,255,0.55); line-height: 1.75; margin: 0 0 1rem; white-space: pre-wrap; }
        .tags-row { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .skill-tag { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 0.2rem 0.6rem; font-size: 0.75rem; color: rgba(255,255,255,0.45); }
        .job-footer { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .budget { display: flex; flex-direction: column; gap: 0.2rem; }
        .budget-label { font-size: 0.68rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.06em; }
        .budget-value { font-size: 0.88rem; font-weight: 700; color: #ffc800; }

        /* CONTACT CARD */
        .contact-card {}
        .contact-profile-link { display: flex; align-items: center; gap: 0.85rem; text-decoration: none; padding: 0.5rem; margin: -0.5rem; border-radius: 10px; transition: background 0.2s; }
        .contact-profile-link:hover { background: rgba(255,255,255,0.04); }
        .contact-avatar { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; background: rgba(255,200,0,0.15); border: 2px solid rgba(255,200,0,0.3); color: #ffc800; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .contact-avatar.sm { width: 38px; height: 38px; font-size: 0.9rem; }
        .contact-info { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
        .contact-name { font-size: 0.95rem; font-weight: 700; color: #fff; }
        .contact-rating { font-size: 0.72rem; color: rgba(255,200,0,0.75); }
        .contact-arrow { font-size: 0.75rem; color: rgba(255,200,0,0.5); white-space: nowrap; font-weight: 600; }
        .contact-profile-link:hover .contact-arrow { color: #ffc800; }
        .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 1rem 0; }
        .contact-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.25); margin-bottom: 0.75rem; }
        .contact-methods { display: flex; flex-direction: column; gap: 0.5rem; }
        .contact-btn { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 1rem; border-radius: 10px; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: opacity 0.2s, transform 0.15s; }
        .contact-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .contact-btn.whatsapp { background: rgba(37,211,102,0.12); border: 1px solid rgba(37,211,102,0.25); color: #4ade80; }
        .contact-btn.email    { background: rgba(255,200,0,0.08);  border: 1px solid rgba(255,200,0,0.2);   color: #ffc800; }
        .contact-missing { font-size: 0.8rem; color: rgba(255,255,255,0.25); padding: 0.5rem 0; }
        .contact-bio { font-size: 0.83rem; color: rgba(255,255,255,0.45); line-height: 1.65; margin: 0; }
        .skills-wrap { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.75rem; }

        /* MY CARD */
        .my-profile-row { display: flex; align-items: center; gap: 0.75rem; }
        .my-role { font-size: 0.75rem; color: rgba(255,200,0,0.7); font-weight: 600; }
        .profile-tip { font-size: 0.78rem; color: rgba(255,255,255,0.35); margin-top: 0.85rem; line-height: 1.5; }
        .tip-link { color: #ffc800; text-decoration: none; font-weight: 600; }
        .tip-link:hover { text-decoration: underline; }

        /* APP MESSAGE */
        .app-mensaje { font-size: 0.88rem; color: rgba(255,255,255,0.55); line-height: 1.65; margin: 0; font-style: italic; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border-left: 2px solid rgba(255,200,0,0.3); border-radius: 0 8px 8px 0; }

        @media (max-width: 800px) {
          .workspace-grid { grid-template-columns: 1fr; }
          .right-col { order: -1; }
          .job-footer { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .nav-link { display: none; }
          .user-email { display: none; }
          .job-title { font-size: 1.15rem; }
          .card { padding: 1.1rem; }
          .btn-complete { margin-left: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}

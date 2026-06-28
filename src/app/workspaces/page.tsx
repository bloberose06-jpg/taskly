'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type WorkspaceItem = {
  jobId: string
  titulo: string
  categoria: string
  modalidad: string
  presupuesto: number
  moneda: string
  estado: string
  role: 'cliente' | 'freelancer'
  otherName: string
  otherAvatar: string | null
  updatedAt: string
}

export default function WorkspacesPage() {
  const router = useRouter()
  const [user,       setUser]       = useState<any>(null)
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      fetchWorkspaces(data.user.id)
    })
  }, [])

  const fetchWorkspaces = async (userId: string) => {
    setLoading(true)

    // Jobs where user is the client and there's an accepted application
    const { data: clientJobs } = await supabase
      .from('jobs')
      .select('id, titulo, categoria, modalidad, presupuesto, moneda, estado, created_at')
      .eq('cliente_id', userId)
      .in('estado', ['en progreso', 'completado'])

    // Applications where user is the freelancer and was accepted
    const { data: freelancerApps } = await supabase
      .from('applications')
      .select('job_id, created_at')
      .eq('applicant_id', userId)
      .eq('estado', 'aceptado')

    const items: WorkspaceItem[] = []

    // Process client jobs
    if (clientJobs && clientJobs.length > 0) {
      for (const job of clientJobs) {
        // Get accepted freelancer
        const { data: app } = await supabase
          .from('applications')
          .select('applicant_id')
          .eq('job_id', job.id)
          .eq('estado', 'aceptado')
          .single()

        let otherName = 'Freelancer'
        let otherAvatar = null
        if (app) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nombre, avatar_url')
            .eq('id', app.applicant_id)
            .single()
          if (profile) { otherName = profile.nombre; otherAvatar = profile.avatar_url }
        }

        items.push({
          jobId: job.id,
          titulo: job.titulo,
          categoria: job.categoria,
          modalidad: job.modalidad,
          presupuesto: job.presupuesto,
          moneda: job.moneda,
          estado: job.estado,
          role: 'cliente',
          otherName,
          otherAvatar,
          updatedAt: job.created_at,
        })
      }
    }

    // Process freelancer apps
    if (freelancerApps && freelancerApps.length > 0) {
      for (const app of freelancerApps) {
        const { data: job } = await supabase
          .from('jobs')
          .select('id, titulo, categoria, modalidad, presupuesto, moneda, estado, created_at, cliente_id')
          .eq('id', app.job_id)
          .single()

        if (!job) continue

        const { data: profile } = await supabase
          .from('profiles')
          .select('nombre, avatar_url')
          .eq('id', job.cliente_id)
          .single()

        items.push({
          jobId: job.id,
          titulo: job.titulo,
          categoria: job.categoria,
          modalidad: job.modalidad,
          presupuesto: job.presupuesto,
          moneda: job.moneda,
          estado: job.estado,
          role: 'freelancer',
          otherName: profile?.nombre ?? 'Cliente',
          otherAvatar: profile?.avatar_url ?? null,
          updatedAt: app.created_at,
        })
      }
    }

    // Sort by most recent
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    setWorkspaces(items)
    setLoading(false)
  }

  const MODALIDAD_COLORS: Record<string, string> = {
    Remoto: '#4ade80', Presencial: '#60a5fa', Híbrido: '#c084fc',
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
              <>
                <Link href="/workspaces" className="nav-link active">Mis trabajos</Link>
                <Link href="/notifications" className="nav-link">Notificaciones</Link>
                <Link href="/profile" className="user-pill">
                  <span className="user-avatar">{user.email?.[0].toUpperCase()}</span>
                  <span className="user-email">{user.email}</span>
                </Link>
              </>
            )}
            <Link href="/dashboard" className="btn-nav">Publicar trabajo</Link>
          </div>
        </div>
      </nav>

      <div className="content">
        <div className="content-inner">
          <div className="page-header">
            <div>
              <h1 className="page-title">Mis trabajos activos</h1>
              <p className="page-sub">Trabajos donde estás participando como cliente o freelancer</p>
            </div>
          </div>

          {loading ? (
            <div className="skeleton-list">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" />)}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">💼</div>
              <h3>Sin trabajos activos</h3>
              <p>Cuando un cliente acepte tu aplicación o contrates un freelancer, aparecerá aquí.</p>
              <div className="empty-actions">
                <Link href="/jobs" className="btn-secondary">Buscar trabajos →</Link>
                <Link href="/dashboard" className="btn-primary">Publicar un trabajo →</Link>
              </div>
            </div>
          ) : (
            <div className="workspace-list">
              {workspaces.map((ws) => (
                <Link href={`/jobs/${ws.jobId}/workspace`} key={ws.jobId} className="ws-card">
                  <div className="ws-left">
                    <div className="ws-top">
                      <span className="ws-cat">{ws.categoria}</span>
                      <span
                        className="ws-modalidad"
                        style={{ color: MODALIDAD_COLORS[ws.modalidad] || '#fff' }}
                      >
                        ● {ws.modalidad}
                      </span>
                      <span className={`ws-estado ${ws.estado.replace(' ', '-')}`}>
                        {ws.estado}
                      </span>
                    </div>
                    <h2 className="ws-title">{ws.titulo}</h2>
                    <div className="ws-other">
                      <div className="other-avatar">
                        {ws.otherName[0].toUpperCase()}
                      </div>
                      <span className="other-label">
                        {ws.role === 'cliente' ? 'Freelancer:' : 'Cliente:'}
                      </span>
                      <span className="other-name">{ws.otherName}</span>
                    </div>
                  </div>
                  <div className="ws-right">
                    <div className="ws-budget">
                      <span className="budget-amount">{ws.moneda} {Number(ws.presupuesto).toLocaleString('es-GT')}</span>
                      <span className="role-badge">{ws.role === 'cliente' ? '🏢 Cliente' : '🎯 Freelancer'}</span>
                    </div>
                    <span className="ws-cta">Abrir workspace →</span>
                  </div>
                </Link>
              ))}
            </div>
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
        .nav-link:hover { color: #fff; }
        .nav-link.active { color: #ffc800; }
        .btn-nav { background: #ffc800; color: #0a0a0f; text-decoration: none; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 700; }
        .btn-nav:hover { background: #ffd700; }
        .user-pill { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.2); border-radius: 999px; padding: 0.35rem 0.75rem 0.35rem 0.35rem; text-decoration: none; }
        .user-pill:hover { background: rgba(255,200,0,0.15); }
        .user-avatar { width: 26px; height: 26px; border-radius: 50%; background: #ffc800; color: #0a0a0f; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .user-email { font-size: 0.8rem; color: rgba(255,255,255,0.6); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .content { padding: 2.5rem 1.5rem 5rem; }
        .content-inner { max-width: 860px; margin: 0 auto; }
        .page-header { margin-bottom: 2rem; }
        .page-title { font-size: 1.8rem; font-weight: 900; margin: 0 0 0.25rem; letter-spacing: -0.02em; }
        .page-sub { color: rgba(255,255,255,0.35); font-size: 0.9rem; margin: 0; }

        /* WORKSPACE LIST */
        .workspace-list { display: flex; flex-direction: column; gap: 0.85rem; }
        .ws-card {
          display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
          background: #13131a; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.5rem;
          text-decoration: none; transition: border-color 0.2s, transform 0.15s;
        }
        .ws-card:hover { border-color: rgba(255,200,0,0.3); transform: translateY(-2px); }
        .ws-left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.55rem; }
        .ws-top { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
        .ws-cat { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,200,0,0.65); background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.15); border-radius: 5px; padding: 0.15rem 0.5rem; }
        .ws-modalidad { font-size: 0.75rem; font-weight: 600; }
        .ws-estado { font-size: 0.7rem; font-weight: 700; border-radius: 5px; padding: 0.15rem 0.5rem; text-transform: capitalize; margin-left: auto; }
        .ws-estado.en-progreso { background: rgba(34,197,94,0.1);  color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
        .ws-estado.completado  { background: rgba(255,200,0,0.1);  color: #ffc800; border: 1px solid rgba(255,200,0,0.2); }
        .ws-title { font-size: 1rem; font-weight: 700; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ws-other { display: flex; align-items: center; gap: 0.5rem; }
        .other-avatar { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,200,0,0.15); border: 1px solid rgba(255,200,0,0.25); color: #ffc800; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .other-label { font-size: 0.75rem; color: rgba(255,255,255,0.3); }
        .other-name  { font-size: 0.75rem; color: rgba(255,255,255,0.6); font-weight: 600; }

        .ws-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0; }
        .ws-budget { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; }
        .budget-amount { font-size: 1rem; font-weight: 800; color: #ffc800; }
        .role-badge { font-size: 0.7rem; color: rgba(255,255,255,0.35); }
        .ws-cta { font-size: 0.78rem; color: rgba(255,200,0,0.5); font-weight: 600; transition: color 0.2s; }
        .ws-card:hover .ws-cta { color: #ffc800; }

        /* EMPTY */
        .empty { text-align: center; padding: 5rem 1rem; }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty h3 { font-size: 1.2rem; font-weight: 700; margin: 0 0 0.5rem; }
        .empty p { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin: 0 0 1.75rem; max-width: 400px; margin-left: auto; margin-right: auto; }
        .empty-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .btn-primary { background: #ffc800; color: #0a0a0f; text-decoration: none; border-radius: 10px; padding: 0.75rem 1.5rem; font-size: 0.9rem; font-weight: 700; display: inline-block; transition: background 0.2s; }
        .btn-primary:hover { background: #ffd700; }
        .btn-secondary { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.65); text-decoration: none; border-radius: 10px; padding: 0.75rem 1.5rem; font-size: 0.9rem; font-weight: 600; display: inline-block; transition: border-color 0.2s; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.35); color: #fff; }

        .skeleton-list { display: flex; flex-direction: column; gap: 0.85rem; }
        .skeleton { height: 100px; background: #13131a; border-radius: 16px; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        @media (max-width: 640px) {
          .nav-link { display: none; }
          .user-email { display: none; }
          .ws-card { flex-direction: column; align-items: flex-start; }
          .ws-right { align-items: flex-start; flex-direction: row; justify-content: space-between; width: 100%; }
          .ws-estado { margin-left: 0; }
        }
      `}</style>
    </div>
  )
}

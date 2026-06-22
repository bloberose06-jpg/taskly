'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ─── types ────────────────────────────────────────────────────────────────────
type Profile = {
  id: string
  nombre: string
  telefono?: string
  avatar_url?: string
  tipo: 'cliente' | 'freelancer'
  bio?: string
  ubicacion?: string
  habilidades?: string[]
  total_reviews: number
  avg_rating: number
  total_jobs: number
  created_at: string
}

type Review = {
  id: string
  rating: number
  comentario: string
  created_at: string
  reviewer: { nombre: string; avatar_url?: string }
  job: { titulo: string; id: string }
}

type Job = {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  presupuesto: number
  moneda: string
  estado: string
  created_at: string
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="stars" aria-label={`${value} de ${max} estrellas`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? 'star filled' : 'star'}>★</span>
      ))}
      <style jsx>{`
        .stars { display: inline-flex; gap: 2px; }
        .star  { font-size: 1.1rem; color: rgba(255,255,255,0.2); }
        .filled{ color: #ffc800; }
      `}</style>
    </div>
  )
}

function Avatar({ name, url, size = 64 }: { name: string; url?: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {url ? (
        <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      ) : (
        initials
      )}
      <style jsx>{`
        .avatar {
          border-radius: 50%;
          background: rgba(255,200,0,0.15);
          border: 2px solid rgba(255,200,0,0.25);
          color: #ffc800;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [profile, setProfile]   = useState<Profile | null>(null)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [jobs,    setJobs]      = useState<Job[]>([])
  const [tab,     setTab]       = useState<'reviews' | 'trabajos'>('reviews')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [{ data: p }, { data: r }, { data: j }] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('reviews')
          .select(`
            id, rating, comentario, created_at,
            reviewer:reviewer_id ( nombre, avatar_url ),
            job:job_id ( titulo, id )
          `)
          .eq('reviewed_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('jobs')
          .select('id, titulo, descripcion, categoria, presupuesto, moneda, estado, created_at')
          .eq('cliente_id', id)
          .order('created_at', { ascending: false }),
      ])
      setProfile(p as Profile)
      setReviews((r ?? []) as Review[])
      setJobs((j ?? []) as Job[])
      setLoading(false)
    })()
  }, [id])

  if (loading) return (
    <div className="page">
      <div className="loader">Cargando perfil…</div>
      <style jsx>{`.page{min-height:100vh;background:#0a0a0f;display:flex;align-items:center;justify-content:center}.loader{color:rgba(255,255,255,0.35);font-size:0.9rem}`}</style>
    </div>
  )

  if (!profile) return (
    <div className="page">
      <p className="err">Perfil no encontrado.</p>
      <style jsx>{`.page{min-height:100vh;background:#0a0a0f;display:flex;align-items:center;justify-content:center}.err{color:rgba(255,255,255,0.35)}`}</style>
    </div>
  )

  const memberSince = new Date(profile.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long' })

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
            <Link href="/jobs"     className="nav-link">Ver trabajos</Link>
            <Link href="/login"    className="nav-link">Iniciar sesión</Link>
            <Link href="/register" className="btn-nav">Registrarse gratis</Link>
          </div>
        </div>
      </nav>

      <div className="layout">

        {/* ── LEFT: profile card ─────────────────────────────── */}
        <aside className="sidebar">
          <div className="profile-card">
            <Avatar name={profile.nombre} url={profile.avatar_url} size={80} />
            <h1 className="profile-name">{profile.nombre}</h1>
            <span className="badge-tipo">
              {profile.tipo === 'freelancer' ? '🎯 Freelancer' : '🏢 Cliente'}
            </span>
            {profile.ubicacion && (
              <p className="meta-row">📍 {profile.ubicacion}</p>
            )}
            <p className="meta-row">📅 Miembro desde {memberSince}</p>

            {/* rating summary */}
            <div className="rating-block">
              <span className="rating-num">{profile.avg_rating.toFixed(1)}</span>
              <div>
                <StarRating value={profile.avg_rating} />
                <p className="rating-sub">{profile.total_reviews} reseña{profile.total_reviews !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* stats row */}
            <div className="stats-row">
              <div className="stat">
                <span className="stat-value">{profile.total_jobs}</span>
                <span className="stat-label">Trabajos publicados</span>
              </div>
              <div className="stat-div" />
              <div className="stat">
                <span className="stat-value">{profile.total_reviews}</span>
                <span className="stat-label">Reseñas</span>
              </div>
              <div className="stat-div" />
              <div className="stat">
                <span className="stat-value">{profile.avg_rating.toFixed(1)}</span>
                <span className="stat-label">Calificación</span>
              </div>
            </div>

            {/* bio */}
            {profile.bio && (
              <p className="bio">{profile.bio}</p>
            )}

            {/* skills */}
            {profile.habilidades && profile.habilidades.length > 0 && (
              <div className="skills">
                {profile.habilidades.map((h) => (
                  <span key={h} className="skill-tag">{h}</span>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT: tabs ────────────────────────────────────── */}
        <main className="content">
          <div className="tabs">
            <button
              className={tab === 'reviews' ? 'tab active' : 'tab'}
              onClick={() => setTab('reviews')}
            >
              Reseñas ({reviews.length})
            </button>
            <button
              className={tab === 'trabajos' ? 'tab active' : 'tab'}
              onClick={() => setTab('trabajos')}
            >
              Trabajos ({jobs.length})
            </button>
          </div>

          {/* reviews tab */}
          {tab === 'reviews' && (
            <div className="list">
              {reviews.length === 0 ? (
                <p className="empty">Todavía no hay reseñas para este perfil.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="review-card">
                    <div className="review-header">
                      <Avatar
                        name={rev.reviewer?.nombre ?? '?'}
                        url={rev.reviewer?.avatar_url}
                        size={40}
                      />
                      <div className="review-meta">
                        <span className="reviewer-name">{rev.reviewer?.nombre ?? 'Usuario'}</span>
                        <span className="review-date">
                          {new Date(rev.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <StarRating value={rev.rating} />
                    </div>
                    {rev.comentario && (
                      <p className="review-body">{rev.comentario}</p>
                    )}
                    {rev.job && (
                      <Link href={`/jobs/${rev.job.id}`} className="review-job-link">
                        📋 {rev.job.titulo}
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* jobs tab */}
          {tab === 'trabajos' && (
            <div className="list">
              {jobs.length === 0 ? (
                <p className="empty">Este usuario no ha publicado trabajos aún.</p>
              ) : (
                jobs.map((job) => (
                  <Link href={`/jobs/${job.id}`} key={job.id} className="job-card">
                    <div className="job-top">
                      <span className="job-cat">{job.categoria}</span>
                      <span className={`job-estado ${job.estado}`}>{job.estado}</span>
                    </div>
                    <h3 className="job-title">{job.titulo}</h3>
                    <p className="job-desc">{job.descripcion.slice(0, 120)}{job.descripcion.length > 120 ? '…' : ''}</p>
                    <div className="job-footer">
                      <span className="job-budget">
                        {job.moneda === 'GTQ' ? 'Q' : '$'}{Number(job.presupuesto).toLocaleString('es-GT')}
                      </span>
                      <span className="job-date">
                        {new Date(job.created_at).toLocaleDateString('es-GT', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </main>
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
          background: rgba(10,10,15,0.85);
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
        .nav-link { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }
        .btn-nav {
          background: #ffc800; color: #0a0a0f; text-decoration: none;
          border-radius: 8px; padding: 0.5rem 1rem;
          font-size: 0.85rem; font-weight: 700; transition: background 0.2s;
        }
        .btn-nav:hover { background: #ffd700; }

        /* LAYOUT */
        .layout {
          max-width: 1100px; margin: 0 auto;
          padding: 3rem 1.5rem;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          align-items: start;
        }

        /* SIDEBAR */
        .sidebar { position: sticky; top: 90px; }
        .profile-card {
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
        }
        .profile-name {
          font-size: 1.25rem; font-weight: 800;
          color: #fff; margin: 0;
        }
        .badge-tipo {
          background: rgba(255,200,0,0.1);
          border: 1px solid rgba(255,200,0,0.25);
          color: #ffc800;
          border-radius: 999px;
          padding: 0.25rem 0.85rem;
          font-size: 0.75rem; font-weight: 600;
        }
        .meta-row {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }
        .rating-block {
          display: flex; align-items: center; gap: 0.85rem;
          background: rgba(255,200,0,0.05);
          border: 1px solid rgba(255,200,0,0.12);
          border-radius: 12px;
          padding: 0.85rem 1.25rem;
          width: 100%;
        }
        .rating-num {
          font-size: 2rem; font-weight: 900; color: #ffc800; line-height: 1;
        }
        .rating-sub {
          font-size: 0.75rem; color: rgba(255,255,255,0.35); margin: 0.2rem 0 0;
        }
        .stats-row {
          display: flex; width: 100%;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; overflow: hidden;
        }
        .stat {
          flex: 1; padding: 0.85rem 0.5rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
        }
        .stat-value { font-size: 1.15rem; font-weight: 800; color: #ffc800; }
        .stat-label { font-size: 0.68rem; color: rgba(255,255,255,0.3); text-align: center; line-height: 1.3; }
        .stat-div { width: 1px; background: rgba(255,255,255,0.07); }
        .bio {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.65;
          margin: 0;
          text-align: left;
          width: 100%;
        }
        .skills { display: flex; flex-wrap: wrap; gap: 0.4rem; width: 100%; }
        .skill-tag {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 0.2rem 0.6rem;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.55);
        }

        /* CONTENT */
        .content {}
        .tabs {
          display: flex; gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 1.75rem;
        }
        .tab {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4);
          font-size: 0.9rem; font-weight: 600;
          padding: 0.75rem 1.5rem 0.85rem;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .tab:hover { color: rgba(255,255,255,0.7); }
        .tab.active { color: #ffc800; border-bottom-color: #ffc800; }

        /* REVIEWS */
        .list { display: flex; flex-direction: column; gap: 1rem; }
        .empty { color: rgba(255,255,255,0.3); font-size: 0.9rem; padding: 2rem 0; }

        .review-card {
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          display: flex; flex-direction: column; gap: 0.75rem;
          transition: border-color 0.2s;
        }
        .review-card:hover { border-color: rgba(255,200,0,0.2); }
        .review-header {
          display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;
        }
        .review-meta {
          flex: 1;
          display: flex; flex-direction: column; gap: 0.1rem;
        }
        .reviewer-name { font-size: 0.9rem; font-weight: 700; color: #fff; }
        .review-date   { font-size: 0.75rem; color: rgba(255,255,255,0.3); }
        .review-body   { font-size: 0.88rem; color: rgba(255,255,255,0.6); line-height: 1.65; margin: 0; }
        .review-job-link {
          font-size: 0.8rem;
          color: rgba(255,200,0,0.65);
          text-decoration: none;
          align-self: flex-start;
          transition: color 0.2s;
        }
        .review-job-link:hover { color: #ffc800; }

        /* JOB CARDS */
        .job-card {
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          text-decoration: none;
          display: flex; flex-direction: column; gap: 0.6rem;
          transition: border-color 0.2s, transform 0.15s;
        }
        .job-card:hover {
          border-color: rgba(255,200,0,0.3);
          transform: translateY(-2px);
        }
        .job-top { display: flex; align-items: center; gap: 0.6rem; }
        .job-cat {
          font-size: 0.72rem; font-weight: 700;
          background: rgba(255,200,0,0.1);
          border: 1px solid rgba(255,200,0,0.2);
          color: #ffc800;
          border-radius: 6px; padding: 0.2rem 0.55rem;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .job-estado {
          font-size: 0.72rem; font-weight: 600; border-radius: 6px;
          padding: 0.2rem 0.55rem; text-transform: capitalize;
          margin-left: auto;
        }
        .job-estado.abierto   { background: rgba(34,197,94,0.12);  color: #4ade80; }
        .job-estado.cerrado   { background: rgba(239,68,68,0.12);  color: #f87171; }
        .job-estado.pausado   { background: rgba(234,179,8,0.12);  color: #facc15; }
        .job-title {
          font-size: 1rem; font-weight: 700; color: #fff; margin: 0;
        }
        .job-desc {
          font-size: 0.85rem; color: rgba(255,255,255,0.4); line-height: 1.6; margin: 0;
        }
        .job-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .job-budget { font-size: 0.9rem; font-weight: 700; color: #ffc800; }
        .job-date   { font-size: 0.75rem; color: rgba(255,255,255,0.3); }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .layout { grid-template-columns: 1fr; }
          .sidebar { position: static; }
          .nav-link { display: none; }
        }
      `}</style>
    </div>
  )
}

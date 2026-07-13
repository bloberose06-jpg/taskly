'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

const CATEGORIAS = [
  { icon: '🔨', name: 'Pequeñas reparaciones' },
  { icon: '🌱', name: 'Jardinería y patios' },
  { icon: '💪', name: 'Fuerza y mudanzas' },
  { icon: '🧹', name: 'Limpieza del hogar' },
  { icon: '💻', name: 'Desarrollo web' }, 
  { icon: '🚗', name: 'Lavado de autos' },
  { icon: '📊', name: 'Contabilidad y finanzas' },
  { icon: '🏗️', name: 'Arquitectura e ingeniería' },
  { icon: '🐶', name: 'Cuidado de mascotas' },
   
]

const STATS = [
  { value: '100+', label: 'Trabajos publicados' },
  { value: '30+', label: 'Trabajadores activos' },
  { value: 'GTQ',    label: 'Pagos en quetzales' },
]

export default function HomePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

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
              <>
                <Link href="/workspaces"    className="nav-link">Mis trabajos</Link>
                <Link href="/notifications" className="nav-link">Notificaciones</Link>
                <Link href="/profile" className="user-pill">
                  <span className="user-avatar">{user.email?.[0].toUpperCase()}</span>
                  <span className="user-email">{user.email}</span>
                </Link>
                <Link href="/dashboard" className="btn-nav">Publicar trabajo</Link>
              </>
            ) : (
              <>
                <Link href="/login"    className="nav-link">Iniciar sesión</Link>
                <Link href="/register" className="btn-nav">Registrarse gratis</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">🇬🇹 Hecho para Guatemala</div>
          <h1 className="hero-title">
            Encuentra la ayuda que necesitas <br />
            <span className="hero-accent">en tu zona</span>
          </h1>
          <p className="hero-sub">
            Publica tareas, contrata ayuda local y paga en quetzales.<br />
            Simple, rápido y sin complicaciones.
          </p>
          <div className="hero-cta">
            <Link href={user ? '/dashboard' : '/register'} className="btn-primary">
              Publicar un trabajo →
            </Link>
            <Link href="/jobs" className="btn-secondary">
              Buscar trabajos
            </Link>
          </div>
          <div className="stats">
            {STATS.map((s) => (
              <div key={s.label} className="stat">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="section">
        <div className="section-inner">
          <p className="section-eyebrow">Categorías populares</p>
          <h2 className="section-title">¿Qué necesitas hoy?</h2>
          <div className="grid-cats">
            {CATEGORIAS.map((cat) => (
              <Link href="/jobs" key={cat.name} className="cat-card">
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="section section-alt">
        <div className="section-inner">
          <p className="section-eyebrow">El proceso</p>
          <h2 className="section-title">Tres pasos y listo</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3 className="step-title">Crea tu cuenta</h3>
              <p className="step-desc">Regístrate gratis en segundos con tu correo o cuenta de Google.</p>
              <Link href="/register" className="step-link">Registrarse →</Link>
            </div>
            <div className="step-divider" />
            <div className="step">
              <div className="step-num">2</div>
              <h3 className="step-title">Publica tu trabajo</h3>
              <p className="step-desc">Describe lo que necesitas, el presupuesto y la modalidad en minutos.</p>
              <Link href="/dashboard" className="step-link">Publicar trabajo →</Link>
            </div>
            <div className="step-divider" />
            <div className="step">
              <div className="step-num">3</div>
              <h3 className="step-title">Conecta y contrata</h3>
              <p className="step-desc">Revisa propuestas, elige al mejor y comienza a trabajar.</p>
              <Link href="/jobs" className="step-link">Ver trabajos →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section section-cta">
        <div className="section-inner cta-center">
          <h2 className="cta-title">¿Listo para empezar?</h2>
          <p className="cta-sub">Únete a la comunidad freelance de Guatemala.</p>
          <div className="hero-cta">
            {user ? (
              <Link href="/dashboard" className="btn-primary">Publicar un trabajo →</Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary">Crear cuenta gratis →</Link>
                <Link href="/login"    className="btn-secondary">Ya tengo cuenta</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">TASKLY</span>
          </div>
          <div className="footer-links">
            <Link href="/jobs"        className="footer-link">Ver trabajos</Link>
            <Link href="/workspaces"  className="footer-link">Mis trabajos</Link>
            <Link href="/dashboard"   className="footer-link">Publicar trabajo</Link>
            {user ? (
              <Link href="/profile"   className="footer-link">Mi perfil</Link>
            ) : (
              <>
                <Link href="/login"   className="footer-link">Iniciar sesión</Link>
                <Link href="/register" className="footer-link">Registrarse</Link>
              </>
            )}
          </div>
          <p className="footer-copy">© 2025 Taskly · Guatemala</p>
        </div>
      </footer>

      <style jsx>{`
        * { box-sizing: border-box; }

        .page {
          min-height: 100vh;
          background: #f8f9fa;
          color: #1a1a24;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* NAV */
        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          backdrop-filter: blur(12px);
        }
        .nav-inner { max-width: 1100px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 0.4rem; text-decoration: none; }
        .logo-icon { font-size: 1.4rem; }
        .logo-text { font-size: 1.2rem; font-weight: 900; letter-spacing: 0.15em; color: #ffc800; }
        .nav-links { display: flex; align-items: center; gap: 1.5rem; }
        .nav-link { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .nav-link:hover { color: #cdcfd4; }
        .btn-nav { background: #ffc800; color: #e3e3e6; text-decoration: none; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 700; transition: background 0.2s; }
        .btn-nav:hover { background: #ffd700; }
        .user-pill { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.2); border-radius: 999px; padding: 0.35rem 0.75rem 0.35rem 0.35rem; text-decoration: none; transition: background 0.2s; }
        .user-pill:hover { background: rgba(255,200,0,0.15); }
        .user-avatar { width: 26px; height: 26px; border-radius: 50%; background: #ffc800; color: #0a0a0f; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .user-email { font-size: 0.8rem; color: #1f2937; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* HERO */
        .hero { padding: 6rem 1.5rem 5rem; background-image: radial-gradient(ellipse at 20% 50%, rgba(255,200,0,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,100,0,0.05) 0%, transparent 50%); }
        .hero-inner { max-width: 800px; margin: 0 auto; text-align: center; }
        .hero-badge { display: inline-block; background: rgba(255,200,0,0.1); border: 1px solid rgba(255,200,0,0.25); color: #ffc800; border-radius: 999px; padding: 0.35rem 1rem; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 1.75rem; }
        .hero-title { font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 900; line-height: 1.12; letter-spacing: -0.02em; margin: 0 0 1.25rem; color: #111827; }
        .hero-accent { color: #ffc800; }
        .hero-sub { font-size: 1.1rem; color: rgba(255,255,255,0.5); line-height: 1.7; margin: 0 0 2.5rem; }
        .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3rem; }
        .btn-primary { background: #ffc800; color: #0a0a0f; text-decoration: none; border-radius: 10px; padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 700; transition: background 0.2s, transform 0.15s; display: inline-block; }
        .btn-primary:hover { background: #ffd700; transform: translateY(-2px); }
        .btn-secondary { background: transparent; color: rgba(255,255,255,0.75); text-decoration: none; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; transition: border-color 0.2s, color 0.2s; display: inline-block; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.35); color: #111827; }
        .stats { display: flex; gap: 2.5rem; justify-content: center; flex-wrap: wrap; }
        .stat { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
        .stat-value { font-size: 1.5rem; font-weight: 800; color: #ffc800; }
        .stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.35); letter-spacing: 0.03em; }

        /* SECTIONS */
        .section { padding: 5rem 1.5rem; }
        .section-alt { background: rgba(255,255,255,0.02); }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-eyebrow { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #ffc800; margin: 0 0 0.75rem; }
        .section-title { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: #111827; margin: 0 0 2.5rem; letter-spacing: -0.01em; }

        /* CATEGORÍAS */
        .grid-cats { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .cat-card { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 0.85rem; text-decoration: none; transition: border-color 0.2s, background 0.2s, transform 0.15s; }
        .cat-card:hover { border-color: rgba(255,200,0,0.35); background: #1a1a24; transform: translateY(-2px); }
        .cat-icon { font-size: 1.3rem; }
        .cat-name { flex: 1; font-size: 0.9rem; font-weight: 500; color: rgba(24, 19, 19, 0.8); }
        .cat-arrow { font-size: 0.85rem; color: rgba(255,200,0,0.5); }
        .cat-card:hover .cat-arrow { color: #ffc800; }

        /* STEPS */
        .steps { display: flex; align-items: flex-start; gap: 0; }
        .step { flex: 1; padding: 0 2rem; }
        .step:first-child { padding-left: 0; }
        .step:last-child { padding-right: 0; }
        .step-divider { width: 1px; height: 120px; background: rgba(255,255,255,0.07); align-self: center; flex-shrink: 0; }
        .step-num { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,200,0,0.12); border: 1px solid rgba(255,200,0,0.3); color: #ffc800; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
        .step-title { font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0 0 0.6rem; }
        .step-desc { font-size: 0.88rem; color: rgba(255,255,255,0.45); line-height: 1.65; margin: 0 0 1rem; }
        .step-link { font-size: 0.85rem; color: #ffc800; text-decoration: none; font-weight: 600; }
        .step-link:hover { text-decoration: underline; }

        /* CTA */
        .section-cta { background-image: radial-gradient(ellipse at 50% 50%, rgba(255,200,0,0.06) 0%, transparent 70%); }
        .cta-center { text-align: center; }
        .cta-title { font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 900; color: #fff; margin: 0 0 0.75rem; letter-spacing: -0.02em; }
        .cta-sub { font-size: 1rem; color: rgba(255,255,255,0.45); margin: 0 0 2.5rem; }

        /* FOOTER */
        .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 2.5rem 1.5rem; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; }
        .footer-links { display: flex; gap: 2rem; flex-wrap: wrap; }
        .footer-link { font-size: 0.85rem; color: rgba(255,255,255,0.35); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: rgba(20, 19, 19, 0.7); }
        .footer-copy { font-size: 0.8rem; color: rgba(255,255,255,0.2); margin: 0; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .nav-links { gap: 1rem; }
          .nav-link { display: none; }
          .user-email { display: none; }
          .steps { flex-direction: column; gap: 2rem; }
          .step { padding: 0; }
          .step-divider { width: 100%; height: 1px; }
          .footer-inner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  )
}

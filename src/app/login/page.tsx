'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (authError) throw authError

      router.push('/jobs')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión.'
      // Traducir mensajes comunes
      if (msg.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Por favor confirma tu correo electrónico antes de iniciar sesión.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand */}
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <h1 className="brand-name">TASKLY</h1>
          <p className="brand-sub">Encuentra talento. Publica trabajo.</p>
        </div>

        <h2 className="form-title">Iniciar sesión</h2>

        {error && (
          <div className="error-banner">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="juan@ejemplo.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="password">
              Contraseña
              <Link href="/forgot-password" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Entrar →'}
          </button>
        </form>

        <div className="divider">
          <span>o</span>
        </div>

        <button
          className="btn-google"
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/jobs` },
            })
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <p className="auth-footer">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="auth-link">
            Regístrate gratis
          </Link>
        </p>
      </div>

      <style jsx>{`
        .auth-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          background-image: radial-gradient(ellipse at 20% 50%, rgba(255, 200, 0, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(255, 100, 0, 0.05) 0%, transparent 50%);
          padding: 2rem 1rem;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        .auth-card {
          background: #13131a;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
        }

        .brand {
          text-align: center;
          margin-bottom: 2rem;
        }

        .brand-icon { font-size: 2rem; }

        .brand-name {
          font-size: 1.8rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: #ffc800;
          margin: 0.25rem 0 0.25rem;
        }

        .brand-sub {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.05em;
        }

        .form-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .error-banner {
          background: rgba(255, 60, 60, 0.1);
          border: 1px solid rgba(255, 60, 60, 0.3);
          color: #ff6b6b;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field label {
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          font-size: 0.75rem;
          color: rgba(255, 200, 0, 0.7);
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          font-weight: 400;
        }

        .forgot-link:hover { color: #ffc800; }

        .field input {
          background: #1a1a24;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.75rem 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }

        .field input::placeholder { color: rgba(255, 255, 255, 0.2); }

        .field input:focus {
          border-color: rgba(255, 200, 0, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 200, 0, 0.08);
        }

        .btn-primary {
          background: #ffc800;
          color: #0a0a0f;
          border: none;
          border-radius: 10px;
          padding: 0.85rem;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #ffd700;
          transform: translateY(-1px);
        }

        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #0a0a0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.25rem 0;
          color: rgba(255, 255, 255, 0.2);
          font-size: 0.8rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.07);
        }

        .btn-google {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 0.75rem;
          color: rgba(255, 255, 255, 0.75);
          font-size: 0.9rem;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          transition: border-color 0.2s, background 0.2s;
        }

        .btn-google:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.35);
        }

        .auth-link {
          color: #ffc800;
          text-decoration: none;
          font-weight: 600;
        }

        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabase/client";
import type { JobFormData } from '@/types'
import NotificationBell from '@/components/NotificationBell'
import JobImageUpload from '@/components/JobImageUpload'

const CATEGORIAS = [
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

const MODALIDADES = ['Remoto', 'Presencial', 'Híbrido']
const METODOS_PAGO = ['Por hora', 'Por proyecto', 'Por entrega', 'Mensual']
const MONEDAS = ['GTQ', 'USD', 'MXN']

const EMPTY_FORM: JobFormData = {
  titulo: '',
  descripcion: '',
  categoria: '',
  ubicacion: '',
  presupuesto: '',
  moneda: 'GTQ',
  metodo_pago: '',
  modalidad: '',
  tags: '',
}

export default function PostJobPage() {
  const router = useRouter()
  const [form, setForm] = useState<JobFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(1) // multi-step form
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
        setUserId(data.user.id)
      }
    })
  }, [router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleNext = () => {
    if (step === 1) {
      if (!form.titulo.trim() || !form.descripcion.trim() || !form.categoria) {
        setError('Por favor completa todos los campos requeridos.')
        return
      }
    }
    setError('')
    setStep(step + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    if (!form.presupuesto || !form.metodo_pago || !form.modalidad) {
      setError('Por favor completa todos los campos requeridos.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const tagsArray = form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      const { error: insertError } = await supabase.from('jobs').insert({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria,
        ubicacion: form.ubicacion.trim() || null,
        presupuesto: parseFloat(form.presupuesto),
        moneda: form.moneda,
        metodo_pago: form.metodo_pago,
        modalidad: form.modalidad,
        tags: tagsArray.length > 0 ? tagsArray : null,
        cliente_id: userId,
        estado: 'abierto',
          images: images,
          destacado: false,
      })

      if (insertError) throw insertError

      setSuccess(true)
    } catch (err: any) {
  // Cambia temporalmente esto para ver el mensaje real en la pantalla de tu app
      setError(err.message || 'Error al publicar el trabajo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="page-wrapper">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>¡Trabajo publicado!</h2>
          <p>Tu publicación ya está visible para los freelancers.</p>
          <div className="success-actions">
            <button
              className="btn-secondary"
              onClick={() => { setForm(EMPTY_FORM); setImages([]); setSuccess(false); setStep(1) }}
            >
              Publicar otro
            </button>
            <button className="btn-primary" onClick={() => router.push('/jobs')}>
              Ver dashboard →
            </button>
          </div>
        </div>
        <Styles />
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <button className="back-btn" onClick={() => router.back()}>← Volver</button>
          <div>
            <h1 className="page-title">Publicar trabajo</h1>
            <p className="page-sub">Encuentra al freelancer perfecto para tu proyecto</p>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label">Detalles</span>
          </div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">Presupuesto</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="form-card">
          {error && (
            <div className="error-banner">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* STEP 1 */}
            {step === 1 && (
              <div className="form-step">
                <div className="field">
                  <label htmlFor="titulo">Título del trabajo *</label>
                  <input
                    id="titulo"
                    name="titulo"
                    type="text"
                    required
                    placeholder="Ej: Diseñador web para landing page de e-commerce"
                    value={form.titulo}
                    onChange={handleChange}
                    maxLength={120}
                  />
                  <span className="field-hint">{form.titulo.length}/120 caracteres</span>
                </div>

                <div className="field">
                  <label htmlFor="descripcion">Descripción *</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    required
                    rows={5}
                    placeholder="Describe el trabajo, requisitos, entregables esperados, plazos..."
                    value={form.descripcion}
                    onChange={handleChange}
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="categoria">Categoría *</label>
                    <select id="categoria" name="categoria" required value={form.categoria} onChange={handleChange}>
                      <option value="">Selecciona una categoría</option>
                      {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="modalidad">Modalidad *</label>
                    <select id="modalidad" name="modalidad" required value={form.modalidad} onChange={handleChange}>
                      <option value="">Selecciona modalidad</option>
                      {MODALIDADES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="ubicacion">Ubicación <span className="optional">(opcional)</span></label>
                  <input
                    id="ubicacion"
                    name="ubicacion"
                    type="text"
                    placeholder="Ej: Ciudad de Guatemala, Guatemala"
                    value={form.ubicacion}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label htmlFor="tags">
                    Tags / Habilidades <span className="optional">(opcional)</span>
                  </label>
                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    placeholder="Ej: React, Figma, SEO (separados por comas)"
                    value={form.tags}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label>Fotos del trabajo <span className="optional">(opcional, hasta 4)</span></label>
                  <JobImageUpload value={images} onChange={setImages} maxImages={4} />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-primary" onClick={handleNext}>
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="form-step">
                <div className="budget-section">
                  <h3 className="section-title">💰 Presupuesto</h3>
                  <div className="field-row">
                    <div className="field" style={{ flex: 2 }}>
                      <label htmlFor="presupuesto">Monto *</label>
                      <input
                        id="presupuesto"
                        name="presupuesto"
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        placeholder="500"
                        value={form.presupuesto}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label htmlFor="moneda">Moneda</label>
                      <select id="moneda" name="moneda" value={form.moneda} onChange={handleChange}>
                        {MONEDAS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="metodo_pago">Método de pago *</label>
                    <div className="radio-group">
                      {METODOS_PAGO.map((m) => (
                        <label key={m} className={`radio-card ${form.metodo_pago === m ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="metodo_pago"
                            value={m}
                            checked={form.metodo_pago === m}
                            onChange={handleChange}
                          />
                          {m}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="summary-card">
                  <h3 className="section-title">📋 Resumen</h3>
                  <div className="summary-item">
                    <span>Título</span>
                    <strong>{form.titulo || '—'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Categoría</span>
                    <strong>{form.categoria || '—'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Modalidad</span>
                    <strong>{form.modalidad || '—'}</strong>
                  </div>
                  {form.presupuesto && (
                    <div className="summary-item highlight">
                      <span>Presupuesto</span>
                      <strong>{form.moneda} {parseFloat(form.presupuesto).toLocaleString()}</strong>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                    ← Atrás
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <span className="spinner" /> : '⚡ Publicar trabajo'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <Styles />
    </div>
  )
}

function Styles() {
  return (
    <style jsx global>{`
      * { box-sizing: border-box; }

      .page-wrapper {
        min-height: 100vh;
        background: #0a0a0f;
        background-image: radial-gradient(ellipse at 10% 30%, rgba(255, 200, 0, 0.05) 0%, transparent 50%);
        padding: 2rem 1rem 4rem;
        font-family: 'DM Sans', 'Segoe UI', sans-serif;
        color: rgba(255,255,255,0.9);
      }

      .page-container {
        max-width: 680px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .back-btn {
        background: none;
        border: 1px solid rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.5);
        padding: 0.5rem 0.85rem;
        border-radius: 8px;
        font-size: 0.85rem;
        cursor: pointer;
        font-family: inherit;
        white-space: nowrap;
        transition: border-color 0.2s, color 0.2s;
        margin-top: 4px;
      }

      .back-btn:hover { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.8); }

      .page-title {
        font-size: 1.7rem;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .page-sub {
        font-size: 0.85rem;
        color: rgba(255,255,255,0.35);
        margin: 0.2rem 0 0;
      }

      /* Progress */
      .progress-bar {
        display: flex;
        align-items: center;
        margin-bottom: 2rem;
      }

      .progress-step {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        opacity: 0.35;
        transition: opacity 0.3s;
      }

      .progress-step.active { opacity: 1; }

      .step-num {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #1a1a24;
        border: 2px solid rgba(255,255,255,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .progress-step.active .step-num {
        background: #ffc800;
        border-color: #ffc800;
        color: #0a0a0f;
      }

      .step-label {
        font-size: 0.85rem;
        font-weight: 500;
        color: rgba(255,255,255,0.7);
      }

      .progress-line {
        flex: 1;
        height: 2px;
        background: rgba(255,255,255,0.08);
        margin: 0 1rem;
        transition: background 0.3s;
      }

      .progress-line.active { background: #ffc800; }

      /* Form card */
      .form-card {
        background: #13131a;
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 20px 50px rgba(0,0,0,0.4);
      }

      .error-banner {
        background: rgba(255,60,60,0.1);
        border: 1px solid rgba(255,60,60,0.3);
        color: #ff6b6b;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .form-step {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .field > label {
        font-size: 0.78rem;
        font-weight: 600;
        color: rgba(255,255,255,0.45);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .optional {
        font-weight: 400;
        opacity: 0.6;
        text-transform: none;
        letter-spacing: 0;
      }

      .field-hint {
        font-size: 0.72rem;
        color: rgba(255,255,255,0.25);
        text-align: right;
      }

      .field input,
      .field textarea,
      .field select {
        background: #1a1a24;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        padding: 0.75rem 0.9rem;
        color: rgba(255,255,255,0.9);
        font-size: 0.9rem;
        font-family: inherit;
        transition: border-color 0.2s, box-shadow 0.2s;
        outline: none;
        width: 100%;
        resize: vertical;
      }

      .field input::placeholder,
      .field textarea::placeholder { color: rgba(255,255,255,0.2); }

      .field input:focus,
      .field textarea:focus,
      .field select:focus {
        border-color: rgba(255,200,0,0.5);
        box-shadow: 0 0 0 3px rgba(255,200,0,0.07);
      }

      .field select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.9rem center;
        padding-right: 2.5rem;
      }

      .field select option { background: #1a1a24; }

      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      /* Radio group */
      .radio-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.6rem;
        margin-top: 0.2rem;
      }

      .radio-card {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.65rem 0.75rem;
        background: #1a1a24;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        gap: 0.5rem;
      }

      .radio-card input { display: none; }

      .radio-card.selected {
        border-color: #ffc800;
        background: rgba(255,200,0,0.08);
        color: #ffc800;
        font-weight: 600;
      }

      /* Summary */
      .summary-card {
        background: #1a1a24;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px;
        padding: 1.25rem;
      }

      .section-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: rgba(255,255,255,0.6);
        margin: 0 0 1rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .budget-section .section-title { margin-bottom: 1.25rem; }

      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        font-size: 0.88rem;
      }

      .summary-item:last-child { border-bottom: none; }

      .summary-item span { color: rgba(255,255,255,0.4); }
      .summary-item strong { color: rgba(255,255,255,0.85); font-size: 0.9rem; }

      .summary-item.highlight strong {
        color: #ffc800;
        font-size: 1rem;
      }

      /* Actions */
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }

      .btn-primary {
        background: #ffc800;
        color: #0a0a0f;
        border: none;
        border-radius: 10px;
        padding: 0.8rem 1.5rem;
        font-size: 0.9rem;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 44px;
      }

      .btn-primary:hover:not(:disabled) {
        background: #ffd700;
        transform: translateY(-1px);
      }

      .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

      .btn-secondary {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.6);
        border-radius: 10px;
        padding: 0.8rem 1.25rem;
        font-size: 0.9rem;
        font-family: inherit;
        cursor: pointer;
        transition: border-color 0.2s;
      }

      .btn-secondary:hover { border-color: rgba(255,255,255,0.3); }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(0,0,0,0.2);
        border-top-color: #0a0a0f;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        display: inline-block;
      }

      @keyframes spin { to { transform: rotate(360deg); } }

      /* Success */
      .success-card {
        max-width: 440px;
        margin: 10vh auto 0;
        background: #13131a;
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 20px;
        padding: 3rem 2.5rem;
        text-align: center;
        box-shadow: 0 25px 60px rgba(0,0,0,0.5);
      }

      .success-icon {
        width: 72px;
        height: 72px;
        background: rgba(74, 222, 128, 0.12);
        border: 2px solid rgba(74, 222, 128, 0.4);
        color: #4ade80;
        border-radius: 50%;
        font-size: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
      }

      .success-card h2 {
        font-size: 1.5rem;
        font-weight: 800;
        margin: 0 0 0.5rem;
      }

      .success-card p {
        color: rgba(255,255,255,0.4);
        font-size: 0.9rem;
        margin: 0 0 2rem;
      }

      .success-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
      }

      @media (max-width: 520px) {
        .field-row { grid-template-columns: 1fr; }
        .radio-group { grid-template-columns: 1fr 1fr; }
        .form-card { padding: 1.5rem 1.25rem; }
        .success-actions { flex-direction: column; }
      }
    `}</style>
  )
}

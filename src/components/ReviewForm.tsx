'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Props = {
  jobId: string
  reviewedId: string
  reviewedName: string
  onSuccess?: () => void
}

export default function ReviewForm({ jobId, reviewedId, reviewedName, onSuccess }: Props) {
  const [rating,     setRating]     = useState(0)
  const [hovered,    setHovered]    = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [done,       setDone]       = useState(false)

  async function handleSubmit() {
    if (rating === 0) { setError('Selecciona una calificación.'); return }
    setLoading(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { setError('Debes iniciar sesión para dejar una reseña.'); setLoading(false); return }

    const { error: err } = await supabase.from('reviews').insert({
      job_id:      jobId,
      reviewer_id: user.id,
      reviewed_id: reviewedId,
      rating,
      comentario:  comentario.trim() || null,
    })

    setLoading(false)
    if (err) {
      if (err.code === '23505') setError('Ya dejaste una reseña para este trabajo.')
      else setError(err.message)
    } else {
      setDone(true)
      onSuccess?.()
    }
  }

  if (done) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
      borderRadius: '14px', padding: '1.25rem 1.5rem',
    }}>
      <span style={{ fontSize: '1.3rem' }}>✅</span>
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
        ¡Gracias! Tu reseña fue enviada correctamente.
      </p>
    </div>
  )

  const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']

  return (
    <div style={{
      background: '#13131a', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px', padding: '1.75rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
        Califica a <span style={{ color: '#ffc800' }}>{reviewedName}</span>
      </h3>

      {/* star picker */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        role="group"
        aria-label="Calificación de 1 a 5 estrellas"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHovered(n)}
            onClick={() => setRating(n)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '2rem', padding: 0, lineHeight: 1,
              color: n <= (hovered || rating) ? '#ffc800' : 'rgba(255,255,255,0.2)',
              transform: hovered === n ? 'scale(1.15)' : 'scale(1)',
              transition: 'color 0.1s, transform 0.1s',
            }}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span style={{
            marginLeft: '0.75rem', fontSize: '0.82rem',
            color: 'rgba(255,200,0,0.7)', fontWeight: 600,
          }}>
            {LABELS[rating]}
          </span>
        )}
      </div>

      {/* comment */}
      <textarea
        placeholder={`Describe tu experiencia trabajando con ${reviewedName}… (opcional)`}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={4}
        maxLength={600}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
          padding: '0.85rem 1rem', color: '#fff', fontSize: '0.88rem',
          fontFamily: 'inherit', lineHeight: 1.65, resize: 'vertical',
          outline: 'none', boxSizing: 'border-box',
        }}
      />
      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: '-0.5rem' }}>
        {comentario.length}/600
      </span>

      {error && (
        <p style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '8px', color: '#f87171', fontSize: '0.82rem',
          padding: '0.6rem 0.9rem', margin: 0,
        }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        style={{
          background: '#ffc800', color: '#0a0a0f', border: 'none',
          borderRadius: '10px', padding: '0.85rem 1.75rem',
          fontSize: '0.95rem', fontWeight: 700,
          cursor: loading || rating === 0 ? 'not-allowed' : 'pointer',
          opacity: loading || rating === 0 ? 0.4 : 1,
          alignSelf: 'flex-start',
          transition: 'background 0.2s, opacity 0.2s',
        }}
      >
        {loading ? 'Enviando…' : 'Publicar reseña →'}
      </button>
    </div>
  )
}

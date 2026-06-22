'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  jobId: string
  reviewedId: string        // profile id of the person being reviewed
  reviewedName: string
  onSuccess?: () => void
}

export default function ReviewForm({ jobId, reviewedId, reviewedName, onSuccess }: Props) {
  const supabase = createClientComponentClient()

  const [rating,     setRating]     = useState(0)
  const [hovered,   setHovered]     = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading,   setLoading]     = useState(false)
  const [error,     setError]       = useState<string | null>(null)
  const [done,      setDone]        = useState(false)

  async function handleSubmit() {
    if (rating === 0) { setError('Selecciona una calificación.'); return }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
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
    <div className="done">
      <span className="done-icon">✅</span>
      <p>¡Gracias! Tu reseña fue enviada correctamente.</p>
      <style jsx>{`
        .done { display:flex; align-items:center; gap:0.75rem; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:14px; padding:1.25rem 1.5rem; }
        .done-icon { font-size:1.3rem; }
        p { margin:0; font-size:0.9rem; color:rgba(255,255,255,0.7); }
      `}</style>
    </div>
  )

  return (
    <div className="form-wrap">
      <h3 className="form-title">Califica a <span className="accent">{reviewedName}</span></h3>

      {/* star picker */}
      <div
        className="star-picker"
        role="group"
        aria-label="Calificación de 1 a 5 estrellas"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
            className={`star-btn ${n <= (hovered || rating) ? 'active' : ''}`}
            onMouseEnter={() => setHovered(n)}
            onClick={() => setRating(n)}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="rating-label">
            {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][rating]}
          </span>
        )}
      </div>

      {/* comment */}
      <textarea
        className="textarea"
        placeholder={`Describe tu experiencia trabajando con ${reviewedName}… (opcional)`}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={4}
        maxLength={600}
      />
      <span className="char-count">{comentario.length}/600</span>

      {error && <p className="error-msg">{error}</p>}

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={loading || rating === 0}
      >
        {loading ? 'Enviando…' : 'Publicar reseña →'}
      </button>

      <style jsx>{`
        * { box-sizing: border-box; }

        .form-wrap {
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .accent { color: #ffc800; }

        .star-picker {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 2rem;
          color: rgba(255,255,255,0.2);
          padding: 0;
          line-height: 1;
          transition: color 0.1s, transform 0.1s;
        }
        .star-btn.active { color: #ffc800; }
        .star-btn:hover  { transform: scale(1.15); }
        .rating-label {
          margin-left: 0.75rem;
          font-size: 0.82rem;
          color: rgba(255,200,0,0.7);
          font-weight: 600;
        }

        .textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.85rem 1rem;
          color: #fff;
          font-size: 0.88rem;
          font-family: inherit;
          line-height: 1.65;
          resize: vertical;
          transition: border-color 0.2s;
        }
        .textarea:focus {
          outline: none;
          border-color: rgba(255,200,0,0.4);
        }
        .textarea::placeholder { color: rgba(255,255,255,0.25); }
        .char-count {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.2);
          text-align: right;
          margin-top: -0.5rem;
        }

        .error-msg {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 8px;
          color: #f87171;
          font-size: 0.82rem;
          padding: 0.6rem 0.9rem;
          margin: 0;
        }

        .submit-btn {
          background: #ffc800;
          color: #0a0a0f;
          border: none;
          border-radius: 10px;
          padding: 0.85rem 1.75rem;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          align-self: flex-start;
          transition: background 0.2s, transform 0.15s, opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled) { background: #ffd700; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

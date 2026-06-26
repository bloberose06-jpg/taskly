export type JobFormData = {
  titulo: string
  descripcion: string
  categoria: string
  ubicacion: string
  presupuesto: string
  moneda: string
  metodo_pago: string
  modalidad: string
  tags: string
}

export type Job = {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  ubicacion: string | null
  presupuesto: number
  moneda: string
  metodo_pago: string
  modalidad: string
  tags: string[] | null
  images: string[] | null
  cliente_id: string
  estado: string
  destacado: boolean
  created_at: string
}

export type Profile = {
  id: string
  nombre: string
  telefono: string | null
  avatar_url: string | null
  tipo: 'cliente' | 'freelancer'
  bio: string | null
  ubicacion: string | null
  habilidades: string[] | null
  total_reviews: number
  avg_rating: number
  total_jobs: number
  created_at: string
}

export type Application = {
  id: string
  job_id: string
  applicant_id: string
  mensaje: string | null
  estado: 'pendiente' | 'aceptado' | 'rechazado'
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  body: string | null
  job_id: string | null
  application_id: string | null
  leida: boolean
  created_at: string
}

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
  user_id: string
  created_at: string
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { Job } from '@/types'
import NotificationBell from '@/components/NotificationBell'

const CATEGORIAS = [
  'Todas',
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

const MODALIDAD_COLORS: Record<string, string> = {
  Remoto: '#4ade80',
  Presencial: '#60a5fa',
  Híbrido: '#c084fc',
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState('Todas')
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchJobs()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  const filtered = jobs.filter((j) => {
    const matchCat = categoria === 'Todas' || j.categoria === categoria
    const matchSearch =
      !search ||
      j.titulo.toLowerCase().includes(search.toLowerCase()) ||
      j.descripcion.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
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
            <Link href="/jobs" className="nav-link active">Ver trabajos</Link>
            {user ? (
              <Link href="/profile" className="user-pill">
                <span className="user-avatar">{user.email?.[0].toUpperCase()}</span>
                <span className="user-email">{user.email}</span>
              </Link>
            ) : (
              <Link href="/login" className="nav-link">Iniciar sesión</Link>
            )}
            <Link href="/dashboard" className="btn-nav">Publicar trabajo</Link>
            
            <NotificationBell />
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <div className="header">
        <div className="header-inner">
          <h1 className="header-title">Trabajos disponibles</h1>
          <p className="header-sub">Encuentra tu próximo proyecto en Guatemala</p>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar trabajos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="content">
        <div className="content-inner">
          {/* FILTROS */}
          <div className="filters">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${categoria === cat ? 'active' : ''}`}
                onClick={() => setCategoria(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* RESULTADOS */}
          <div className="results-header">
            <span className="results-count">
              {loading ? 'Cargando...' : `${filtered.length} trabajo${filtered.length !== 1 ? 's' : ''}`}
            </span>
            <Link href="/dashboard" className="btn-post">+ Publicar trabajo</Link>
          </div>

          {loading ? (
            <div className="loading">
              {[...Array(4)].map((_, i) => (

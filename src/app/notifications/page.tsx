'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      fetchNotifications(data.user.id)

      // Realtime: escuchar nuevas notificaciones en vivo
      const channel = supabase
        .channel('notifications-live')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${data.user.id}` },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev])
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    })
  }, [router])

  const fetchNotifications = async (userId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ leida: true }).eq('id', id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    )
  }

  const markAllAsRead = async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ leida: true })
      .eq('user_id', user.id)
      .eq('leida', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora mismo'
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `hace ${days}d`
    return new Date(date).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })
  }

  const unreadCount = notifications.filter((n) => !n.leida).length

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
              <Link href="/profile" className="user-pill">
                <span className="user-avatar">{user.email?.[0].toUpperCase()}</span>
                <span className="user-email">{user.email}</span>
              </Link>
            )}
            <Link href="/dashboard" className="btn-nav">Publicar trabajo</Link>
          </div>
        </div>
      </nav>

      <div className="content">
        <div className="content-inner">
          {/* Header */}
          <div className="page-header">
            <div className="header-left">
              <h1 className="page-title">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
              </h1>
              <p className="page-sub">Aplicaciones recibidas en tus trabajos publicados</p>
            </div>
            {unreadCount > 0 && (
              <button className="btn-mark-all" onClick={markAllAsRead}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          {loading ? (
            <div className="skeleton-list">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔔</div>
              <h3>Sin notificaciones aún</h3>
              <p>Cuando alguien aplique a uno de tus trabajos, aparecerá aquí.</p>
              <Link href="/jobs" className="btn-primary">Explorar trabajos →</Link>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-card ${!notif.leida ? 'unread' : ''}`}
                  onClick={() => !notif.leida && markAsRead(notif.id)}
                >
                  <div className="notif-icon-wrap">
                    <span className="notif-icon">👤</span>
                    {!notif.leida && <span className="notif-dot" />}
                  </div>
                  <div className="notif-body">
                    <p className="notif-title">{notif.title}</p>
                    <p className="notif-message">{notif.body}</p>
                    {notif.job_id && (
                      <Link
                        href={`/jobs/${notif.job_id}`}
                        className="notif-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver publicación →
                      </Link>
                    )}
                  </div>
                  <span className="notif-time">{timeAgo(notif.created_at)}</span>
                </div>
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
        .btn-nav { background: #ffc800; color: #0a0a0f; text-decoration: none; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 700; transition: background 0.2s; }
        .btn-nav:hover { background: #ffd700; }
        .user-pill { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.2); border-radius: 999px; padding: 0.35rem 0.75rem 0.35rem 0.35rem; text-decoration: none; transition: background 0.2s; }
        .user-pill:hover { background: rgba(255,200,0,0.15); }
        .user-avatar { width: 26px; height: 26px; border-radius: 50%; background: #ffc800; color: #0a0a0f; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .user-email { font-size: 0.8rem; color: rgba(255,255,255,0.6); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .content { padding: 2.5rem 1.5rem 5rem; }
        .content-inner { max-width: 720px; margin: 0 auto; }

        .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .header-left { }
        .page-title { font-size: 1.8rem; font-weight: 900; margin: 0 0 0.25rem; letter-spacing: -0.02em; display: flex; align-items: center; gap: 0.75rem; }
        .unread-badge { background: #ffc800; color: #0a0a0f; border-radius: 999px; font-size: 0.75rem; font-weight: 800; padding: 0.15rem 0.55rem; min-width: 24px; text-align: center; }
        .page-sub { color: rgba(255,255,255,0.35); font-size: 0.9rem; margin: 0; }
        .btn-mark-all { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.45); border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.82rem; font-family: inherit; cursor: pointer; transition: border-color 0.2s, color 0.2s; white-space: nowrap; }
        .btn-mark-all:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.75); }

        .notif-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .notif-card { display: flex; align-items: flex-start; gap: 1rem; background: #13131a; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1.25rem 1.5rem; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .notif-card.unread { background: #16161f; border-color: rgba(255,200,0,0.2); }
        .notif-card:hover { border-color: rgba(255,200,0,0.3); background: #16161f; }
        .notif-icon-wrap { position: relative; flex-shrink: 0; }
        .notif-icon { width: 40px; height: 40px; background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        .notif-dot { position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background: #ffc800; border-radius: 50%; border: 2px solid #0a0a0f; }
        .notif-body { flex: 1; min-width: 0; }
        .notif-title { font-size: 0.9rem; font-weight: 700; color: #fff; margin: 0 0 0.3rem; }
        .notif-message { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin: 0 0 0.6rem; line-height: 1.5; }
        .notif-link { font-size: 0.8rem; color: #ffc800; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
        .notif-link:hover { opacity: 0.8; }
        .notif-time { font-size: 0.75rem; color: rgba(255,255,255,0.25); white-space: nowrap; flex-shrink: 0; margin-top: 0.15rem; }

        .skeleton-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .skeleton { height: 90px; background: #13131a; border-radius: 14px; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .empty { text-align: center; padding: 5rem 1rem; }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty h3 { font-size: 1.2rem; font-weight: 700; margin: 0 0 0.5rem; }
        .empty p { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin: 0 0 1.5rem; }
        .btn-primary { background: #ffc800; color: #0a0a0f; text-decoration: none; border-radius: 10px; padding: 0.75rem 1.5rem; font-size: 0.9rem; font-weight: 700; display: inline-block; transition: background 0.2s; }
        .btn-primary:hover { background: #ffd700; }

        @media (max-width: 640px) {
          .nav-link { display: none; }
          .user-email { display: none; }
          .notif-card { padding: 1rem; }
          .page-title { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  )
}

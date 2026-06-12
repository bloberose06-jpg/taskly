'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      fetchUnread(data.user.id)

      // Escuchar nuevas notificaciones en tiempo real
      const channel = supabase
        .channel('notif-bell')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${data.user.id}` },
          () => setUnread((prev) => prev + 1)
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    })
  }, [])

  const fetchUnread = async (uid: string) => {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid)
      .eq('leida', false)
    setUnread(count || 0)
  }

  if (!userId) return null

  return (
    <Link href="/notifications" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '1.2rem', transition: 'color 0.2s' }}>
      🔔
      {unread > 0 && (
        <span style={{
          position: 'absolute', top: '-6px', right: '-8px',
          background: '#ffc800', color: '#0a0a0f',
          borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800,
          padding: '0.1rem 0.35rem', minWidth: '16px', textAlign: 'center',
          border: '2px solid #0a0a0f', lineHeight: '1.2',
        }}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}

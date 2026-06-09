'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// /jobs/create redirects to /dashboard where the job creation form lives
export default function CreateJobPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255,255,255,0.4)',
      fontFamily: 'sans-serif',
      fontSize: '0.9rem',
    }}>
      Redirigiendo...
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      setName(data.user.user_metadata?.full_name || '')
      setLoading(false)
    })
  }, [router])

  const save = async () => {
    setSaving(true)
    await supabase.auth.updateUser({ data: { full_name: name } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const s: any = {
    bg: { minHeight: '100vh', background: '#060610', color: '#e8e8f0', fontFamily: "'Inter',system-ui,sans-serif" },
    sidebar: { width: 240, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'fixed' as const, top: 0, left: 0, height: '100vh', display: 'flex', flexDirection: 'column' as const, zIndex: 50 },
    main: { marginLeft: 240, padding: '32px 40px', maxWidth: 640 },
    sideItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', margin: '2px 8px', borderRadius: 10, color: '#6b6b8a', fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' },
  }

  if (loading) return <div style={{ ...s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#6b6b8a' }}>Loading...</div></div>

  return (
    <div style={s.bg}>
      <div style={s.sidebar}>
        <div style={{ padding: '20px 24px 16px', fontWeight: 900, fontSize: '1.4rem', background: 'linear-gradient(135deg,#7c6fff,#1ef5b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Base88</div>
        <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: .5, marginTop: 8 }}>Workspace</div>
        <Link href="/dashboard" style={s.sideItem}>🏠 Dashboard</Link>
        <Link href="/agents" style={s.sideItem}>🤖 Agents</Link>
        <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: .5, marginTop: 8 }}>Manage</div>
        <Link href="/billing" style={s.sideItem}>💳 Billing</Link>
        <Link href="/settings" style={{ ...s.sideItem, background: 'rgba(124,111,255,0.12)', color: '#7c6fff' }}>⚙️ Settings</Link>
        <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#6b6b8a', cursor: 'pointer', fontSize: 13 }}>Log out</button>
        </div>
      </div>

      <div style={s.main}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>⚙️ Settings</h1>
          <p style={{ color: '#6b6b8a', fontSize: 14 }}>Manage your account</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 20 }}>Profile</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6b6b8a', marginBottom: 6 }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e8e8f0', fontSize: 14, outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6b6b8a', marginBottom: 6 }}>Email</label>
            <input value={user?.email || ''} disabled style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#6b6b8a', fontSize: 14, outline: 'none' }} />
          </div>
          <button onClick={save} disabled={saving} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#7c6fff,#5a4fcf)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: 16, padding: 28 }}>
          <div style={{ fontWeight: 700, color: '#ff4d6d', marginBottom: 8 }}>⚠️ Danger Zone</div>
          <div style={{ color: '#6b6b8a', fontSize: 13, marginBottom: 16 }}>Permanently delete your account and all data. This cannot be undone.</div>
          <button onClick={() => { if (confirm('Delete your account permanently? This cannot be undone.')) { supabase.auth.signOut(); router.push('/') } }} style={{ padding: '9px 20px', background: '#ff4d6d', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Delete Account</button>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLANS = [
  { key: 'free', name: 'Free', price: 0, credits: 25, apps: 1, features: ['1 agent', '25 AI credits total', 'Community support'], highlight: false },
  { key: 'starter', name: 'Starter', price: 29, credits: 5000, apps: 10, features: ['10 agents', '5,000 credits/mo', 'HitPay + PayNow', 'WhatsApp + Telegram', 'Email support'], highlight: false },
  { key: 'pro', name: 'Pro', price: 79, credits: 30000, apps: 100, features: ['100 agents', '30,000 credits/mo', 'Custom domain', 'All integrations', 'Priority 24/7 support', 'GitHub export'], highlight: true },
  { key: 'agency', name: 'Agency', price: 199, credits: 100000, apps: 999, features: ['Unlimited agents', '100,000 credits/mo', 'White-label', 'Dedicated support', 'Client management'], highlight: false },
]

export default function BillingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState('free')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      setCurrentPlan(data.user.user_metadata?.plan || 'free')
      setLoading(false)
    })
  }, [router])

  const s: any = {
    bg: { minHeight: '100vh', background: '#060610', color: '#e8e8f0', fontFamily: "'Inter',system-ui,sans-serif" },
    sidebar: { width: 240, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'fixed' as const, top: 0, left: 0, height: '100vh', display: 'flex', flexDirection: 'column' as const, zIndex: 50 },
    main: { marginLeft: 240, padding: '32px 40px', maxWidth: 1000 },
    sideItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', margin: '2px 8px', borderRadius: 10, color: '#6b6b8a', fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' },
  }

  if (loading) return <div style={{ ...s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#6b6b8a' }}>Loading...</div></div>

  return (
    <div style={s.bg}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={{ padding: '20px 24px 16px', fontWeight: 900, fontSize: '1.4rem', background: 'linear-gradient(135deg,#7c6fff,#1ef5b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Base88</div>
        <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: .5, marginTop: 8 }}>Workspace</div>
        <Link href="/dashboard" style={s.sideItem}>🏠 Dashboard</Link>
        <Link href="/agents" style={s.sideItem}>🤖 Agents</Link>
        <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: .5, marginTop: 8 }}>Manage</div>
        <Link href="/billing" style={{ ...s.sideItem, background: 'rgba(124,111,255,0.12)', color: '#7c6fff' }}>💳 Billing</Link>
        <Link href="/settings" style={s.sideItem}>⚙️ Settings</Link>
        <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#6b6b8a', cursor: 'pointer', fontSize: 13 }}>Log out</button>
        </div>
      </div>

      <div style={s.main}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>💳 Billing</h1>
          <p style={{ color: '#6b6b8a', fontSize: 14 }}>Manage your subscription and usage</p>
        </div>

        {/* Current plan */}
        <div style={{ background: 'rgba(124,111,255,0.08)', border: '1px solid rgba(124,111,255,0.2)', borderRadius: 16, padding: 24, marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Current Plan</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{PLANS.find(p => p.key === currentPlan)?.name || 'Free'}</div>
              <div style={{ color: '#6b6b8a', fontSize: 13, marginTop: 4 }}>{PLANS.find(p => p.key === currentPlan)?.credits.toLocaleString()} credits · {PLANS.find(p => p.key === currentPlan)?.apps === 999 ? 'Unlimited' : PLANS.find(p => p.key === currentPlan)?.apps} agents</div>
            </div>
            <div style={{ padding: '6px 16px', background: 'rgba(30,245,176,0.15)', border: '1px solid rgba(30,245,176,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#1ef5b0' }}>Active</div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24 }}>Upgrade your plan</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.key} style={{ background: plan.highlight ? 'linear-gradient(160deg,rgba(124,111,255,0.12),rgba(255,255,255,0.04))' : 'rgba(255,255,255,0.04)', border: plan.highlight ? '1px solid #7c6fff' : '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24, position: 'relative' }}>
              {plan.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c6fff,#5a4fcf)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: .5 }}>Most Popular</div>}
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#6b6b8a', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 4 }}>S${plan.price}<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6b6b8a' }}>{plan.price > 0 ? '/mo' : ''}</span></div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '16px 0' }} />
              {plan.features.map(f => <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '5px 0', color: '#a0a0b8' }}><span style={{ color: '#1ef5b0', fontWeight: 700 }}>✓</span>{f}</div>)}
              {plan.key === currentPlan ? (
                <div style={{ textAlign: 'center', marginTop: 20, color: '#6b6b8a', fontSize: 13 }}>✓ Current plan</div>
              ) : (
                <button onClick={() => alert('Payment integration coming soon! Contact us to upgrade.')} style={{ width: '100%', marginTop: 20, padding: '11px', background: plan.highlight ? 'linear-gradient(135deg,#7c6fff,#5a4fcf)' : 'transparent', color: plan.highlight ? '#fff' : '#e8e8f0', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {plan.price === 0 ? 'Downgrade' : `Upgrade → S$${plan.price}/mo`}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

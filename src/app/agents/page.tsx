'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  description: string
  system_prompt: string
  status: string
  created_at: string
}

export default function AgentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [step, setStep] = useState(1)
  const [agentName, setAgentName] = useState('')
  const [agentDesc, setAgentDesc] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      loadAgents(data.user.id)
    })
  }, [router])

  const loadAgents = async (userId: string) => {
    const { data } = await supabase.from('agents').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setAgents(data || [])
    setLoading(false)
  }

  const createAgent = async () => {
    if (!agentName.trim() || !user) return
    setCreating(true)
    const { data, error } = await supabase.from('agents').insert({
      user_id: user.id,
      name: agentName.trim(),
      description: agentDesc.trim(),
      system_prompt: agentDesc.trim() || `You are a helpful AI assistant named ${agentName.trim()}.`,
      status: 'active',
    }).select().single()
    
    if (!error && data) {
      router.push(`/agents/${data.id}`)
    } else {
      setCreating(false)
      alert(error?.message || 'Error creating agent')
    }
  }

  const s: any = {
    bg: { minHeight: '100vh', background: '#060610', color: '#e8e8f0', fontFamily: "'Inter',system-ui,sans-serif" },
    sidebar: { width: 240, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'fixed' as const, top: 0, left: 0, height: '100vh', display: 'flex', flexDirection: 'column' as const, zIndex: 50 },
    main: { marginLeft: 240, padding: '32px 40px', maxWidth: 1200 },
    sideItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', margin: '2px 8px', borderRadius: 10, color: '#6b6b8a', fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' },
  }

  const Sidebar = () => (
    <div style={s.sidebar}>
      <div style={{ padding: '20px 24px 16px', fontWeight: 900, fontSize: '1.4rem', background: 'linear-gradient(135deg,#7c6fff,#1ef5b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Base88</div>
      <div style={{ padding: '0 12px', marginBottom: 8 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</div>
          <div style={{ color: '#6b6b8a', fontSize: 12 }}>Free plan</div>
        </div>
      </div>
      <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: .5, marginTop: 8 }}>Workspace</div>
      <Link href="/dashboard" style={{ ...s.sideItem }}>🏠 Dashboard</Link>
      <Link href="/apps/new" style={{ ...s.sideItem }}>✨ New App</Link>
      <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: .5, marginTop: 8 }}>Manage</div>
      <Link href="/agents" style={{ ...s.sideItem, background: 'rgba(124,111,255,0.12)', color: '#7c6fff' }}>🤖 Agents</Link>
      <Link href="/billing" style={{ ...s.sideItem }}>💳 Billing</Link>
      <Link href="/settings" style={{ ...s.sideItem }}>⚙️ Settings</Link>
      <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#6b6b8a', cursor: 'pointer', fontSize: 13 }}>Log out</button>
      </div>
    </div>
  )

  if (loading) return <div style={{ ...s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#6b6b8a' }}>Loading...</div></div>

  return (
    <div style={s.bg}>
      <Sidebar />
      <div style={s.main}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>🤖 AI Agents</h1>
            <p style={{ color: '#6b6b8a', fontSize: 14 }}>Your intelligent agents — available 24/7</p>
          </div>
          <button onClick={() => { setShowCreate(true); setStep(1); setAgentName(''); setAgentDesc('') }} style={{ background: 'linear-gradient(135deg,#7c6fff,#5a4fcf)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>+ New Agent</button>
        </div>

        {agents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 20 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤖</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>No agents yet</div>
            <div style={{ color: '#6b6b8a', marginBottom: 24 }}>Create your first AI agent — it'll be live in seconds</div>
            <button onClick={() => { setShowCreate(true); setStep(1) }} style={{ background: 'linear-gradient(135deg,#7c6fff,#5a4fcf)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>+ Create your first agent</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {agents.map(agent => (
              <div key={agent.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all .2s' }} onClick={() => router.push(`/agents/${agent.id}`)} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7c6fff'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤖</div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{agent.name}</div>
                <div style={{ color: '#6b6b8a', fontSize: 13, marginBottom: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{agent.description || agent.system_prompt || 'AI Agent'}</div>
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <Link href={`/agents/${agent.id}`} style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg,#7c6fff,#5a4fcf)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Chat →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '90%', maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Create New Agent</div>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#6b6b8a', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            {step === 1 ? (
              <>
                <p style={{ color: '#6b6b8a', marginBottom: 20, fontSize: 14 }}>What should your agent be called?</p>
                <input autoFocus value={agentName} onChange={e => setAgentName(e.target.value)} onKeyDown={e => e.key === 'Enter' && agentName.trim() && setStep(2)} placeholder="e.g. Sales Bot, Support Agent, Finance Advisor..." style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e8e8f0', fontSize: 15, marginBottom: 20, outline: 'none' }} />
                <button onClick={() => agentName.trim() && setStep(2)} style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg,#7c6fff,#5a4fcf)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Continue →</button>
              </>
            ) : (
              <>
                <p style={{ color: '#6b6b8a', marginBottom: 20, fontSize: 14 }}>What should <strong style={{ color: '#e8e8f0' }}>{agentName}</strong> do?</p>
                <textarea value={agentDesc} onChange={e => setAgentDesc(e.target.value)} placeholder="e.g. Handle customer support, answer questions about our products, qualify leads..." style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e8e8f0', fontSize: 14, marginBottom: 20, outline: 'none', minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#6b6b8a', cursor: 'pointer', fontSize: 14 }}>← Back</button>
                  <button onClick={createAgent} disabled={creating} style={{ flex: 2, padding: 12, background: 'linear-gradient(135deg,#7c6fff,#5a4fcf)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{creating ? 'Creating...' : 'Create Agent →'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Message { role: 'user' | 'assistant'; content: string; ts: string }

export default function AgentChatPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [agent, setAgent] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      const { data: ag } = await supabase.from('agents').select('*').eq('id', agentId).eq('user_id', data.user.id).single()
      if (!ag) { router.push('/agents'); return }
      setAgent(ag)
      // Load message history
      const { data: logs } = await supabase.from('agent_logs').select('*').eq('agent_id', agentId).order('created_at', { ascending: true }).limit(50)
      if (logs) setMessages(logs.map((l: any) => ({ role: l.role, content: l.content, ts: l.created_at })))
      else setMessages([{ role: 'assistant', content: `Hey! I'm ${ag.name}. ${ag.description || 'How can I help you today?'}`, ts: new Date().toISOString() }])
    })
  }, [agentId, router])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || sending || !agent) return
    const userMsg: Message = { role: 'user', content: input.trim(), ts: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, message: userMsg.content, systemPrompt: agent.system_prompt, userId: user.id }),
      })
      const data = await res.json()
      const botMsg: Message = { role: 'assistant', content: data.reply || '❌ No response', ts: new Date().toISOString() }
      setMessages(prev => [...prev, botMsg])
      // Save to DB
      await supabase.from('agent_logs').insert([
        { agent_id: agentId, user_id: user.id, role: 'user', content: userMsg.content },
        { agent_id: agentId, user_id: user.id, role: 'assistant', content: botMsg.content },
      ])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Network error. Please try again.', ts: new Date().toISOString() }])
    }
    setSending(false)
  }

  if (!agent) return <div style={{ minHeight: '100vh', background: '#060610', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b8a' }}>Loading...</div>

  const now = () => new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ minHeight: '100vh', background: '#060610', color: '#e8e8f0', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Topbar */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/agents" style={{ color: '#6b6b8a', fontSize: 20, textDecoration: 'none' }}>←</Link>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#7c6fff,#1ef5b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{agent.name}</div>
            <div style={{ fontSize: 12, color: '#1ef5b0' }}>● Online</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setMessages([])} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#6b6b8a', cursor: 'pointer', fontSize: 13 }}>Clear</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '75%' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, borderBottomLeftRadius: 4, padding: '12px 16px', fontSize: 14, lineHeight: 1.6 }}>
              Hey! I&apos;m <strong>{agent.name}</strong>. {agent.description || 'How can I help you today?'}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
            <div style={{ background: msg.role === 'user' ? '#7c6fff' : 'rgba(255,255,255,0.05)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRadius: 16, borderBottomRightRadius: msg.role === 'user' ? 4 : 16, borderBottomLeftRadius: msg.role === 'user' ? 16 : 4, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
            <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 4, padding: '0 4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              {new Date(msg.ts).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, borderBottomLeftRadius: 4, padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, .2, .4].map(d => <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6b6b8a', animation: `bounce 1.2s ${d}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', background: 'rgba(255,255,255,0.03)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', maxWidth: 900, margin: '0 auto' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder={`Message ${agent.name}...`} style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#e8e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={send} disabled={sending} style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#7c6fff,#5a4fcf)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Send</button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(.8);opacity:.5}40%{transform:scale(1.1);opacity:1}}`}</style>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Inquiry = {
  id:string
  source:string
  from_name:string
  from_email:string
  subject:string
  body:string
  reply_draft:string
  status:'unread'|'resolved'
  created_at:string
}

const card={background:'#171b30',border:'1px solid #363f59',borderRadius:18,padding:22}
const control={background:'#252b43',border:'1px solid #46536d',color:'#f3f3ff',borderRadius:10,padding:'12px 13px',font:'inherit',width:'100%'}
const button={border:0,background:'#7c6fff',color:'white',borderRadius:10,padding:'12px 19px',fontWeight:800,cursor:'pointer'}

export default function BusinessInbox() {
  const params=useParams<{id:string}>()
  const id=params.id
  const [inquiries,setInquiries]=useState<Inquiry[]>([])
  const [drafts,setDrafts]=useState<Record<string,string>>({})
  const [businessName,setBusinessName]=useState('Business')
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [notice,setNotice]=useState('')
  const [form,setForm]=useState({from_name:'Test Customer',from_email:'test@example.com',subject:'Question about your product',body:'I would like to know what is included.'})

  const token = useCallback(async()=>{
    const {data,error}=await supabase.auth.getSession()
    if(error || !data.session?.access_token) {setError('Sign in to use your private business inbox.');return null}
    return data.session.access_token
  },[])

  const load = useCallback(async()=>{
    const jwt=await token()
    if(!jwt){setLoading(false);return}
    try{
      const r=await fetch('/api/business-drafts/'+encodeURIComponent(id)+'/inbox',{headers:{Authorization:'Bearer '+jwt},cache:'no-store'})
      const data=await r.json()
      if(!r.ok){setError(data.error||'Inbox unavailable.');return}
      setBusinessName(data.business.name)
      setInquiries(data.items)
      setDrafts(Object.fromEntries(data.items.map((m:Inquiry)=>[m.id,m.reply_draft])))
      setError('')
    }catch{setError('Could not load the private inbox.')}
    finally{setLoading(false)}
  },[id,token])

  useEffect(()=>{void load()},[load])

  async function createTestInquiry(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault()
    if(saving)return
    const jwt=await token()
    if(!jwt)return
    setSaving(true);setNotice('')
    try{
      const r=await fetch('/api/business-drafts/'+encodeURIComponent(id)+'/inbox',{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+jwt},body:JSON.stringify(form)
      })
      const data=await r.json()
      if(!r.ok){setError(data.error||'Cannot add test inquiry.');return}
      setNotice(data.notice||'Test inquiry created.')
      await load()
    }catch{setError('Could not create the test message.')}
    finally{setSaving(false)}
  }

  async function saveDraft(item:Inquiry,status:'unread'|'resolved'){
    const jwt=await token()
    if(!jwt)return
    setSaving(true);setNotice('')
    try{
      const r=await fetch('/api/business-drafts/'+encodeURIComponent(id)+'/inbox',{
        method:'PATCH',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+jwt},
        body:JSON.stringify({id:item.id,reply_draft:drafts[item.id]||'',status})
      })
      const data=await r.json()
      if(!r.ok){setError(data.error||'Could not save draft.');return}
      setNotice(data.notice||'Private draft saved.')
      await load()
    }catch{setError('Draft save failed.')}
    finally{setSaving(false)}
  }

  return <main style={{background:'linear-gradient(130deg,#080b18,#0f1b2a)',color:'#f4f3ff',minHeight:'100vh',fontFamily:'Inter,system-ui,sans-serif',padding:'30px 22px'}}>
    <div style={{maxWidth:1070,margin:'auto'}}>
      <header style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:50}}>
        <Link href="/surprise-me" style={{color:'#a69aff',textDecoration:'none',fontWeight:900,fontSize:20}}>Base88 / Surprise Me</Link>
        <span style={{fontSize:12,padding:'8px 12px',borderRadius:20,border:'1px solid #50665e',color:'#8fe8cb'}}>Private owner test environment</span>
      </header>
      <h1 style={{fontSize:'clamp(32px,5vw,52px)',marginBottom:12}}>{businessName} · Inbox</h1>
      <p style={{fontSize:16,color:'#b2bed1',lineHeight:1.7,maxWidth:780,marginBottom:34}}>Simulate incoming customer inquiries and prepare replies. These messages never leave Base88. No email, WhatsApp, or telephone provider is connected.</p>
      {error && <div role="alert" style={{...card,borderColor:'#b9767b',color:'#ffc3cb',marginBottom:20}}>{error} <Link style={{color:'#c5b9ff'}} href="/auth/login">Sign in</Link></div>}
      {notice && <div role="status" style={{...card,borderColor:'#519a82',color:'#9eeacd',marginBottom:20}}>{notice}</div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,350px),1fr))',gap:20,alignItems:'start'}}>
        <form onSubmit={createTestInquiry} style={card}>
          <h2 style={{fontSize:23,marginBottom:7}}>Create a test inquiry</h2>
          <p style={{fontSize:13,color:'#aeb9ce',marginBottom:20}}>Owner simulation only. No outside customer is contacted.</p>
          {[
            ['Customer name','from_name'],['Email (example)','from_email'],['Subject','subject']
          ].map(([label,key])=><label key={key} style={{display:'block',fontSize:13,color:'#cad1e2',marginBottom:14}}>
            <span style={{display:'block',marginBottom:6}}>{label}</span>
            <input style={control} required maxLength={key==='from_email'?320:key==='subject'?180:120} type={key==='from_email'?'email':'text'} value={form[key as keyof typeof form]} onChange={e=>setForm({...form,[key]:e.target.value})}/>
          </label>)}
          <label style={{display:'block',fontSize:13,color:'#cad1e2',marginBottom:16}}>
            <span style={{display:'block',marginBottom:6}}>Message</span>
            <textarea style={{...control,minHeight:130}} required maxLength={3500} value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/>
          </label>
          <button disabled={saving} type="submit" style={{...button,opacity:saving?.65:1}}>{saving?'Saving…':'Add test message'}</button>
        </form>
        <section aria-label="Inbox messages" style={{display:'grid',gap:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <h2 style={{fontSize:23,margin:0}}>Messages ({inquiries.length})</h2>
            <button onClick={()=>void load()} style={{...button,background:'#32395a'}} disabled={loading}>Refresh</button>
          </div>
          {loading && <p style={{color:'#b4bed4'}}>Loading private inbox…</p>}
          {!loading && inquiries.length===0 && <div style={card}><p style={{color:'#b4bed4'}}>No test messages yet. Add one using the form.</p></div>}
          {inquiries.map(m=><article key={m.id} style={card}>
            <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',alignItems:'center'}}>
              <strong>{m.subject}</strong>
              <span style={{fontSize:12,color:m.status==='unread'?'#8cecc4':'#a8b4c7'}}>{m.status}</span>
            </div>
            <div style={{fontSize:13,color:'#b5c1d3',marginTop:8}}>{m.from_name} · {m.from_email} · Test message</div>
            <p style={{whiteSpace:'pre-wrap',color:'#dae0ef',lineHeight:1.7,margin:'18px 0'}}>{m.body}</p>
            <label style={{fontSize:13,color:'#c5cfe0',display:'block'}}>
              <span style={{display:'block',marginBottom:8}}>Editable unsent reply</span>
              <textarea style={{...control,minHeight:135}} maxLength={3500} value={drafts[m.id]??m.reply_draft} onChange={e=>setDrafts(prev=>({...prev,[m.id]:e.target.value}))}/>
            </label>
            <div style={{display:'flex',gap:10,marginTop:13,flexWrap:'wrap'}}>
              <button disabled={saving} onClick={()=>void saveDraft(m,m.status)} style={{...button,background:'#2e705e'}}>Save draft</button>
              <button disabled={saving} onClick={()=>void saveDraft(m,m.status==='unread'?'resolved':'unread')} style={{...button,background:'#32395a'}}>{m.status==='unread'?'Mark resolved':'Reopen'}</button>
            </div>
          </article>)}
        </section>
      </div>
      <p style={{marginTop:42,color:'#98a8bd',fontSize:13,lineHeight:1.7}}>Owner test mode only. This page cannot send email, SMS, WhatsApp, or take payments. Live provider onboarding, approvals and delivery verification are separate future releases.</p>
    </div>
  </main>
}

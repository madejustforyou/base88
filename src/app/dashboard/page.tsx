'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Draft={id:string;name:string;category:string;status:string;created_at:string}

export default function Dashboard() {
  const router=useRouter()
  const [user,setUser]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [drafts,setDrafts]=useState<Draft[]>([])
  const [storageReady,setStorageReady]=useState(false)
  const [storageNotice,setStorageNotice]=useState('')

  const loadDrafts=useCallback(async(jwt:string)=>{
    try{
      const res=await fetch('/api/business-drafts',{
        method:'GET',headers:{Authorization:'Bearer '+jwt},cache:'no-store'
      })
      const data=await res.json()
      if(!res.ok){
        setStorageReady(false)
        setStorageNotice(data.error||'Business draft storage is not configured yet.')
        return
      }
      setStorageReady(true)
      setStorageNotice('')
      setDrafts(data.drafts||[])
    }catch{
      setStorageReady(false)
      setStorageNotice('Could not load your private business drafts.')
    }
  },[])

  useEffect(()=>{
    let active=true
    supabase.auth.getUser().then(async({data})=>{
      if(!active)return
      if(!data.user){router.push('/auth/login');return}
      setUser(data.user)
      setLoading(false)
      const session=await supabase.auth.getSession()
      if(active && session.data.session?.access_token)
        await loadDrafts(session.data.session.access_token)
    }).catch(()=>{
      if(active){setLoading(false);router.push('/auth/login')}
    })
    return ()=>{active=false}
  },[router,loadDrafts])

  const handleSignOut=async()=>{
    await supabase.auth.signOut()
    router.push('/')
  }

  if(loading)return <div className="min-h-screen flex items-center justify-center" role="status">
    <p className="text-gray-400">Loading your private Base88 workspace…</p>
  </div>

  return <main className="min-h-screen" style={{background:'linear-gradient(135deg,#090b19,#101b2b)',color:'#f0efff'}}>
    <nav className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/10 flex-wrap gap-3">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center text-white font-extrabold text-sm">88</span>
        <span className="text-white font-extrabold text-xl">Base88</span>
      </Link>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-gray-400 text-sm">{user?.email}</span>
        <button onClick={handleSignOut} className="text-gray-300 hover:text-white text-sm transition-colors">Sign out</button>
      </div>
    </nav>
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-3">Your private operating workspace</div>
        <h1 className="text-4xl font-extrabold text-white">Base88 Dashboard</h1>
        <p className="text-gray-400 mt-3">Welcome back. Start with a business idea, review what was generated, and build toward a verifiable launch.</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-9" aria-label="Workspace status">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Saved business drafts</div>
          <div className="text-3xl text-white font-extrabold">{storageReady?drafts.length:'—'}</div>
          <p className="text-gray-500 text-xs mt-2">{storageReady?'Your account only':'Private storage not activated'}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Autonomous company operation</div>
          <div className="text-lg text-amber-300 font-bold">Not connected</div>
          <p className="text-gray-500 text-xs mt-2">Dedicated agent workers are not live on this frontend</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Current workspace</div>
          <div className="text-lg text-emerald-300 font-bold">Preview</div>
          <p className="text-gray-500 text-xs mt-2">No live customer payments or messaging</p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-violet-600/20 to-emerald-500/10 border border-violet-400/30 rounded-2xl p-7 md:p-10 mb-8">
        <div className="text-4xl mb-4">✦</div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Surprise Me — start a new business</h2>
        <p className="text-gray-300 mb-7 max-w-2xl leading-relaxed">Explore a $0-upfront business concept, generate a starter website and product, and export a launch package. This is a real working preview, not a live registered or operating company.</p>
        <Link href="/surprise-me" className="inline-flex items-center bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold no-underline">Create a business concept</Link>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Saved business drafts</h2>
            <p className="text-gray-400 text-sm mt-1">Private to your account. Each one can have an owner test inbox.</p>
          </div>
          <Link href="/surprise-me" className="text-emerald-300 text-sm font-semibold underline">Explore Surprise Me</Link>
        </div>
        {storageNotice && <p role="status" className="bg-amber-800/20 border border-amber-500/20 p-4 rounded-xl text-amber-200 text-sm mb-5">{storageNotice} Account data has not been loaded or fabricated.</p>}
        {storageReady && drafts.length===0 && <p className="text-gray-400 text-sm">No saved businesses yet. Use Surprise Me to create and save your first concept.</p>}
        <div className="grid gap-3">
          {drafts.map(d=><div key={d.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-white font-bold">{d.name}</div>
              <div className="text-gray-400 text-xs mt-1">{d.category} · Draft only</div>
            </div>
            <Link className="text-emerald-300 text-sm underline" href={'/business-drafts/'+d.id+'/inbox'}>Open test inbox</Link>
          </div>)}
        </div>
      </section>

      <p className="text-gray-500 text-xs leading-relaxed mt-7">Base88 is being developed independently of Base44. Real autonomous execution, publication, financial transactions, calls, emails and public customer-intake integrations remain separately controlled and require tested deployment.</p>
    </div>
  </main>
}

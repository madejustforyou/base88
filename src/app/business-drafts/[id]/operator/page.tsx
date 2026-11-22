'use client'
import {useCallback,useEffect,useState} from 'react'
import {useParams,useRouter} from 'next/navigation'
import Link from 'next/link'
import {supabase} from '@/lib/supabase'

type Goal = {
 id:string; agent_label:string; objective:string; state:string;
 execution_enabled:boolean; readiness:string; warning?:string;
}
type Work = {id:string;kind:string;title:string;status:string;error?:string;finished_at?:string}
const message='No public posts, payments, calls, live trades or terminal access are authorized by this control.'

export default function OperatorPage(){
 const params=useParams<{id:string}>()
 const id=params.id
 const router=useRouter()
 const [goals,setGoals]=useState<Goal[]>([])
 const [selected,setSelected]=useState<string|null>(null)
 const [jobs,setJobs]=useState<Work[]>([])
 const [objective,setObjective]=useState('Run my business. Find ways to improve it and prepare useful work.')
 const [agentLabel,setAgentLabel]=useState('Base88 Director')
 const [notice,setNotice]=useState('')
 const [loading,setLoading]=useState(true)
 const [busy,setBusy]=useState(false)
 const base='/api/business-drafts/'+encodeURIComponent(id)+'/engine/goals'

 const authHeaders=async()=>{
  const {data}=await supabase.auth.getSession()
  const token=data.session?.access_token
  if(!token)throw new Error('Sign in to access your own Operator.')
  return {Authorization:'Bearer '+token}
 }
 const refresh=useCallback(async()=>{
  try{
   const headers=await authHeaders()
   const res=await fetch(base,{headers,cache:'no-store'})
   const data=await res.json()
   if(!res.ok){setNotice(data.error||'Independent engine is not connected.');setGoals([])}
   else {setGoals(data.goals||[]);setNotice(data.error||'')}
  }catch{setNotice('Could not connect to the private Operator workspace.')}
  finally{setLoading(false)}
 },[base])

 useEffect(()=>{
  let alive=true
  supabase.auth.getUser().then(({data})=>{
   if(!alive)return
   if(!data.user){router.push('/auth/login');return}
   void refresh()
  })
  return ()=>{alive=false}
 },[refresh,router])

 const create=async()=>{
  if(busy||objective.trim().length<8)return
  setBusy(true);setNotice('')
  try{
   const headers=await authHeaders()
   const res=await fetch(base,{method:'POST',headers:{
    ...headers,'Content-Type':'application/json'
   },body:JSON.stringify({objective:objective.trim(),agent_label:agentLabel.trim(),
      idempotency_key:crypto.randomUUID()})})
   const data=await res.json()
   if(!res.ok)throw new Error(data.error||'Could not create this goal.')
   setNotice('Goal saved. Activate it to begin limited private work when the worker is connected.')
   await refresh()
  }catch(e){setNotice(e instanceof Error?e.message:'Could not save this goal.')}
  finally{setBusy(false)}
 }

 const action=async(goalId:string,command:'activate'|'pause'|'resume'|'archive')=>{
  if(busy)return
  setBusy(true);setNotice('')
  try{
   const headers=await authHeaders()
   const res=await fetch(base+'/'+encodeURIComponent(goalId),{
    method:'POST',headers:{...headers,'Content-Type':'application/json'},
    body:JSON.stringify({action:command}),
   })
   const data=await res.json()
   if(!res.ok)throw new Error(data.error||'Owner action failed.')
   setNotice(command==='activate'
    ?'Local private-work mandate activated. A job is only complete after a real worker receipt.'
    : 'Goal '+command+' acknowledged by the private engine.')
   await refresh()
  }catch(e){setNotice(e instanceof Error?e.message:'Unable to update this goal.')}
  finally{setBusy(false)}
 }

 const inspect=async(goalId:string)=>{
  setSelected(goalId);setJobs([])
  try{
   const headers=await authHeaders()
   const res=await fetch(base+'/'+encodeURIComponent(goalId)+'/jobs',{
    headers,cache:'no-store'
   })
   const data=await res.json()
   if(!res.ok)throw new Error(data.error||'Cannot inspect job evidence.')
   setJobs(data.jobs||[])
  }catch(e){setNotice(e instanceof Error?e.message:'Cannot load Operator jobs.')}
 }

 return <main className="min-h-screen bg-[#080c1c] text-slate-100">
  <header className="border-b border-white/10 px-6 py-5">
   <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
    <Link href="/" className="text-xl font-black text-white">Base<span className="text-emerald-300">88</span></Link>
    <Link href="/dashboard" className="text-sm text-violet-300 hover:text-white">Back to dashboard</Link>
   </div>
  </header>
  <div className="max-w-5xl mx-auto px-6 py-12">
   <div className="rounded-xl border border-violet-400/25 bg-violet-400/10 px-4 py-3 text-xs text-violet-200 inline-block mb-6">
    Owner-managed business Operator · November 28 beta
   </div>
   <h1 className="text-4xl sm:text-5xl font-extrabold">Tell your Operator what to do.</h1>
   <p className="mt-4 max-w-2xl text-slate-300 leading-relaxed">
    You do not need to specify an end date. Save a long-running business goal.
    Initial execution is limited to genuine private website drafts and evidence-based business reviews;
    other actions need connected services and their own permissions.
   </p>
   <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
    <label htmlFor="agentName" className="block text-sm font-semibold mb-2">Your Operator</label>
    <input id="agentName" value={agentLabel} onChange={e=>setAgentLabel(e.target.value.slice(0,80))}
      maxLength={80} className="w-full sm:max-w-md rounded-xl bg-slate-950 border border-white/15 px-4 py-3 text-white"/>
    <label htmlFor="objective" className="block text-sm font-semibold mt-6 mb-2">What should it work on?</label>
    <textarea id="objective" value={objective} rows={4} maxLength={5000}
      onChange={e=>setObjective(e.target.value)}
      className="w-full rounded-xl bg-slate-950 border border-white/15 px-4 py-3 text-white"
      placeholder="Just run my business and improve it."/>
    <div className="mt-5 flex gap-4 flex-wrap items-center">
     <button onClick={()=>void create()} disabled={busy||objective.trim().length<8||agentLabel.trim().length<2}
       className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl px-6 py-3 font-bold">
      {busy?'Working…':'Save standing goal'}
     </button>
     <span className="text-xs text-slate-400">No end date · Pause any time · No automatic cash spending</span>
    </div>
   </section>
   {notice&&<p role="status" className="mt-6 rounded-xl border border-amber-500/30 bg-amber-400/10 px-4 py-3 text-amber-100 text-sm">{notice}</p>}
   <section className="mt-12">
    <div className="flex justify-between gap-4 flex-wrap items-end">
      <h2 className="text-2xl font-bold">Saved Operator goals</h2>
      <button onClick={()=>void refresh()} className="text-sm underline text-violet-300">Refresh</button>
    </div>
    {loading&&<p className="text-slate-400 mt-6">Loading your private workspace…</p>}
    {!loading&&goals.length===0&&<p className="text-slate-400 mt-5">No connected goals are available yet.</p>}
    <div className="grid gap-4 mt-6">
     {goals.map(g=><article key={g.id} className="p-6 bg-slate-900/75 rounded-2xl border border-white/10">
      <div className="flex justify-between gap-4 flex-wrap">
       <h3 className="font-bold text-lg">{g.agent_label}</h3>
       <span className="text-xs text-emerald-300">{g.state} · {g.readiness.replaceAll('_',' ')}</span>
      </div>
      <p className="text-slate-200 mt-3 whitespace-pre-wrap">{g.objective}</p>
      <div className="mt-5 flex gap-3 flex-wrap">
       {(g.state==='configured'||g.state==='paused')&&
        <button disabled={busy} onClick={()=>void action(g.id,'activate')}
         className="bg-violet-600 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
          Activate private work
        </button>}
       {g.state==='active'&&
        <button disabled={busy} onClick={()=>void action(g.id,'pause')}
          className="bg-amber-500/20 text-amber-200 px-4 py-2 rounded-lg text-sm">
         Pause
        </button>}
       {g.state!=='archived'&&
        <button disabled={busy} onClick={()=>void action(g.id,'archive')}
          className="bg-white/10 px-4 py-2 rounded-lg text-sm">Archive</button>}
       <button onClick={()=>void inspect(g.id)} className="border border-white/20 px-4 py-2 rounded-lg text-sm">
        See actual jobs
       </button>
      </div>
      <p className="text-xs mt-5 text-slate-400">{g.warning||message}</p>
     </article>)}
    </div>
   </section>
   {selected&&<section className="mt-10 rounded-2xl border border-white/10 p-6">
    <h2 className="text-xl font-bold mb-3">Recorded job results</h2>
    {!jobs.length?<p className="text-slate-400 text-sm">No worker jobs have been recorded for this goal.</p>:
     <div className="grid gap-3">{jobs.map(j=><div key={j.id} className="bg-white/5 p-4 rounded-xl">
      <div className="font-medium">{j.title}</div>
      <div className="mt-1 text-xs text-slate-400">{j.kind} · {j.status} · {j.id}</div>
      {j.error&&<p className="text-xs text-amber-200">{j.error}</p>}
     </div>)}</div>}
   </section>}
   <p className="mt-10 text-sm text-slate-400 leading-relaxed">{message} Each goal is scoped to your verified private business and server-validated Operator workspace.</p>
  </div>
 </main>
}

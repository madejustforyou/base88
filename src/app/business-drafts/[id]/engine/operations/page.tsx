'use client'

import Link from 'next/link'
import {useCallback,useEffect,useState} from 'react'
import {useParams,useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase'

type Goal={
  id:string
  workspace_id:string
  agent_label:string
  objective:string
  state:string
  readiness:string
  execution_enabled:boolean
  external_actions:false
  created_at:string
  updated_at:string
}
type GoalJob={
  id:string
  title:string
  kind:string
  status:string
  attempt_count:number
  error:string
  created_at:string
  finished_at:string|null
}
type ResponseError={error?:string}

export default function BusinessOperations(){
  const router=useRouter()
  const params=useParams<{id:string}>()
  const draftId=params.id
  const [ready,setReady]=useState(false)
  const [working,setWorking]=useState(false)
  const [imported,setImported]=useState(false)
  const [goals,setGoals]=useState<Goal[]>([])
  const [selected,setSelected]=useState<string|null>(null)
  const [jobs,setJobs]=useState<GoalJob[]>([])
  const [notice,setNotice]=useState('')
  const [agentName,setAgentName]=useState('Ava')
  const [objective,setObjective]=useState('Run my business. Keep researching improvements, build useful private drafts, and show me verified progress.')
  const [lastChecked,setLastChecked]=useState<string|null>(null)

  const token=async()=>{
    const session=await supabase.auth.getSession()
    return session.data.session?.access_token||null
  }
  const url='/api/business-drafts/'+encodeURIComponent(draftId)+'/engine/standing-goals'
  const withAuth=async(path:string,method:'GET'|'POST'='GET',body?:object)=>{
    const jwt=await token()
    if(!jwt)throw new Error('Please sign in again to access your business.')
    const response=await fetch(path,{
      method,cache:'no-store',
      headers:{Authorization:'Bearer '+jwt,...(body?{'Content-Type':'application/json'}:{})},
      ...(body?{body:JSON.stringify(body)}:{}),
    })
    const content=await response.json() as ResponseError & Record<string,unknown>
    if(!response.ok)throw new Error(content.error||'The independent Operator is unavailable.')
    return content
  }

  const load=useCallback(async()=>{
    try{
      const payload=await withAuth(url)
      setImported(payload.imported===true)
      const list=Array.isArray(payload.goals)?payload.goals as Goal[]:[]
      setGoals(list)
      setSelected(s=>s&&list.some(g=>g.id===s)?s:list[0]?.id||null)
      setLastChecked(new Date().toLocaleTimeString())
      setNotice('')
    }catch(error){
      setNotice(error instanceof Error?error.message:'The independent Operator is not reachable.')
      setGoals([])
      setJobs([])
    }
  },[url])

  useEffect(()=>{
    let active=true
    supabase.auth.getUser().then(({data})=>{
      if(!active)return
      if(!data.user){router.replace('/auth/login');return}
      setReady(true)
      void load()
    }).catch(()=>{
      if(active)router.replace('/auth/login')
    })
    return()=>{active=false}
  },[router,load])

  useEffect(()=>{
    if(!ready||!selected)return
    let alive=true
    const fetchJobs=async()=>{
      try{
        const response=await withAuth(url+'/'+selected+'/jobs')
        if(alive)setJobs(Array.isArray(response.jobs)?response.jobs as GoalJob[]:[])
      }catch{
        if(alive)setJobs([])
      }
    }
    void fetchJobs()
    const interval=setInterval(()=>{void fetchJobs()},12000)
    return()=>{alive=false;clearInterval(interval)}
  },[ready,selected,url])

  const create=async()=>{
    if(working)return
    setWorking(true)
    setNotice('')
    try{
      const payload=await withAuth(url,'POST',{
        agent_label:agentName.trim(),
        objective:objective.trim(),
        idempotency_key:crypto.randomUUID(),
      })
      const result=payload.goal as Goal
      await load()
      setSelected(result.id)
      setNotice('Goal saved. It is not yet running. Review the scope and explicitly activate private work.')
    }catch(error){
      setNotice(error instanceof Error?error.message:'Goal could not be saved.')
    }finally{setWorking(false)}
  }

  const change=async(goal:Goal,action:'activate'|'pause'|'resume'|'archive')=>{
    if(working)return
    setWorking(true)
    setNotice('')
    try{
      const result=await withAuth(url+'/'+goal.id+'/action','POST',{action})
      const updated=result.goal as Goal
      await load()
      setSelected(updated.id)
      setNotice(action==='activate'
        ?'Private local drafting is enabled only if the independent worker is online. No account connections, posts, calls, trades or payments are authorized.'
        :action==='pause'
        ?'Private work paused. Pending goal-bound jobs have been stopped.'
        :action==='resume'
        ?'Goal restored to configured state. Private work remains off until you activate it again.'
        :'Goal archived. No further work can start from this goal.')
    }catch(error){
      setNotice(error instanceof Error?error.message:'Could not update Operator state.')
    }finally{setWorking(false)}
  }

  if(!ready)return <main className="min-h-screen flex items-center justify-center bg-[#070a16] text-slate-200">
    <p role="status">Loading your verified workspace…</p>
  </main>

  const chosen=goals.find(g=>g.id===selected)
  const active=goals.filter(g=>g.state==='active'&&g.execution_enabled).length

  return <main className="min-h-screen bg-[#080a18] text-slate-100">
    <header className="border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard" className="font-black text-xl text-white no-underline">
          <span className="text-violet-400">88</span> Base88
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href={'/business-drafts/'+draftId+'/engine'} className="text-slate-300 hover:text-white">Private tasks</Link>
          <Link href="/dashboard" className="text-emerald-300 hover:text-emerald-200">Dashboard</Link>
        </div>
      </nav>
    </header>

    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <p className="text-xs uppercase tracking-widest text-emerald-300 font-extrabold">Owner-controlled operations</p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
        Tell your Operator what to do.
      </h1>
      <p className="mt-4 text-slate-300 max-w-3xl leading-7">
        Give your business Operator a standing instruction without choosing an end date.
        You can activate, pause or archive it any time. For now, activation permits
        <strong> only private website drafts and evidence-based operating reviews</strong>.
        It does not authorize spending, customer outreach, publishing, live trading or remote SSH.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.04]">
          <div className="text-slate-400 text-sm">Saved standing goals</div>
          <div className="mt-2 text-3xl font-bold">{goals.length}</div>
        </div>
        <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.04]">
          <div className="text-slate-400 text-sm">Private-work authorizations</div>
          <div className="mt-2 text-3xl font-bold">{active}</div>
        </div>
        <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.04]">
          <div className="text-slate-400 text-sm">External business operations</div>
          <div className="mt-2 font-bold text-amber-200">Not enabled</div>
        </div>
      </div>

      {notice&&<div role="status" className="mt-6 p-4 border border-amber-400/20 bg-amber-400/[0.08] rounded-xl text-amber-100 text-sm">{notice}</div>}
      {!imported&&<div className="mt-6 rounded-xl bg-violet-500/10 border border-violet-300/20 text-violet-100 p-5">
        This business must be imported into the independent engine before its Operator can be saved.
        <Link href="/dashboard" className="ml-2 underline text-violet-200">Prepare the business</Link>.
      </div>}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6 mt-9">
        <section className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-slate-900/70 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Create an ongoing instruction</h2>
          <label className="block text-slate-300 text-sm font-semibold mt-6 mb-2" htmlFor="operator-name">Operator name</label>
          <input id="operator-name" maxLength={80} minLength={2} value={agentName}
            onChange={e=>setAgentName(e.target.value)}
            className="w-full rounded-xl bg-black/25 border border-white/15 p-3 text-white focus:outline-none focus:border-violet-400"
            placeholder="Ava"/>
          <label className="block text-slate-300 text-sm font-semibold mt-6 mb-2" htmlFor="operator-goal">What should this Operator work toward?</label>
          <textarea id="operator-goal" value={objective} onChange={e=>setObjective(e.target.value)}
            maxLength={5000} rows={5}
            className="w-full rounded-xl bg-black/25 border border-white/15 p-3 text-white resize-y focus:outline-none focus:border-violet-400"
            placeholder="Run my business, investigate improvements and make useful progress."/>
          <div className="mt-3 text-xs text-slate-400">No expiration date required. Saving an instruction does not start jobs or approve external actions.</div>
          <button onClick={()=>void create()} disabled={!imported||working||objective.trim().length<8||agentName.trim().length<2}
            className="mt-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 text-white font-bold">
            {working?'Updating…':'Save ongoing instruction'}
          </button>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Saved Operators</h2>
            <button onClick={()=>void load()} className="text-violet-300 text-sm underline">Refresh</button>
          </div>
          {lastChecked&&<p className="text-slate-500 text-xs mt-2">Last checked {lastChecked}</p>}
          <div className="space-y-3 mt-6">
            {goals.length===0&&<p className="text-slate-400 text-sm">No private Operator goals available yet.</p>}
            {goals.map(g=><button key={g.id} onClick={()=>setSelected(g.id)}
              className={'text-left w-full rounded-xl p-4 border transition-colors '+
                (selected===g.id?'border-violet-400/60 bg-violet-500/15':'border-white/10 bg-black/10 hover:bg-white/[0.05]')}>
              <span className="flex justify-between items-center gap-3">
                <strong>{g.agent_label}</strong>
                <span className={g.state==='active'?'text-emerald-300 text-xs':'text-slate-400 text-xs'}>
                  {g.state==='active'?'Private tasks authorized':g.state}
                </span>
              </span>
              <span className="block text-slate-400 text-sm mt-2 line-clamp-3">{g.objective}</span>
            </button>)}
          </div>
        </section>
      </div>

      {chosen&&<section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8 mt-7">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{chosen.agent_label}: execution and receipts</h2>
            <p className="text-slate-400 text-sm mt-2">Saved goal {chosen.id.slice(0,8)} · {chosen.state} · {chosen.readiness}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {chosen.state!=='archived'&&chosen.state!=='active'&&
              <button disabled={working} onClick={()=>void change(chosen,'activate')}
                className="rounded-xl bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 px-4 py-2 text-sm font-bold">
                Start private work
              </button>}
            {chosen.state==='active'&&<button disabled={working}
              onClick={()=>void change(chosen,'pause')}
              className="rounded-xl bg-amber-500 text-black disabled:opacity-50 hover:bg-amber-400 px-4 py-2 text-sm font-bold">Pause work</button>}
            {chosen.state!=='archived'&&chosen.state!=='active'&&<button disabled={working}
              onClick={()=>void change(chosen,'archive')}
              className="rounded-xl border border-white/20 hover:bg-white/10 disabled:opacity-50 px-4 py-2 text-sm">Archive</button>}
          </div>
        </div>
        <div className="mt-7 border-t border-white/10 pt-6">
          <h3 className="font-bold">Verified private work history</h3>
          <p className="text-slate-500 text-sm mt-1">Updated every 12 seconds while this page is open. A successful job is not proof of external publication or revenue.</p>
          <div className="mt-5 space-y-3">
            {jobs.length===0&&<p className="text-slate-400 text-sm">No recorded work yet. A deployed independent worker must be online to create actual jobs.</p>}
            {jobs.map(job=><div key={job.id} className="flex flex-wrap items-center justify-between gap-4 border border-white/10 rounded-xl p-4">
              <div>
                <p className="font-semibold">{job.title}</p>
                <p className="text-slate-500 text-xs mt-1">{job.kind} · attempts {job.attempt_count}</p>
                {job.error&&<p className="text-amber-200 text-sm mt-2">{job.error}</p>}
              </div>
              <span className={'text-sm font-semibold '+(job.status==='completed'?'text-emerald-300':'text-slate-300')}>
                {job.status}
              </span>
            </div>)}
          </div>
          <Link href={'/business-drafts/'+draftId+'/engine'}
            className="inline-block mt-6 text-violet-300 underline text-sm">
            View private engine tasks and downloadable evidence
          </Link>
        </div>
      </section>}

      <p className="text-slate-500 text-xs leading-relaxed mt-9 mb-5">
        Base88 Director has no authority to charge money, impersonate a person, perform trades,
        post content or use your SSH credentials unless the relevant verified provider and
        separate owner-approved execution flow are connected.
      </p>
    </div>
  </main>
}

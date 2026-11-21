'use client'
import {useCallback,useEffect,useState} from 'react'
import Link from 'next/link'
import {useParams} from 'next/navigation'
import {supabase} from '@/lib/supabase'

type Task={id:string;kind:string;title:string;status:string;attempt_count:number;error:string}
type Output={id:string;job_id:string;name:string;sha256:string;integrity_verified:boolean;size_bytes:number}
type Runtime={
  worker_heartbeat_fresh:boolean
  observed_worker_count:number
  most_recent_worker_pulse_at:string|null
  federated_tasks:Record<string,number>
  observation_only:true
}
const types=[
  {kind:'landing_page',title:'Draft a landing page',desc:'Private HTML draft; no publication'},
  {kind:'starter_product',title:'Create a product template',desc:'Editable product materials'},
  {kind:'launch_checklist',title:'Prepare launch checklist',desc:'Risk and readiness checks'},
  {kind:'business_review',title:'Review the business',desc:'Evidence-only status summary'},
] as const

export default function EngineWorkspace(){
  const {id}=useParams<{id:string}>()
  const [tasks,setTasks]=useState<Task[]>([])
  const [outputs,setOutputs]=useState<Output[]>([])
  const [imported,setImported]=useState(false)
  const [loading,setLoading]=useState(true)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [notice,setNotice]=useState('')
  const [runtime,setRuntime]=useState<Runtime|null>(null)
  const [runtimeChecked,setRuntimeChecked]=useState(false)

  const token=useCallback(async()=>{
    const {data,error}=await supabase.auth.getSession()
    if(error||!data.session?.access_token){
      setError('Sign in to access your private Base88 business.')
      return null
    }
    return data.session.access_token
  },[])

  const load=useCallback(async()=>{
    const jwt=await token()
    if(!jwt){setLoading(false);return}
    setRuntimeChecked(false)
    setRuntime(null)
    try{
      const res=await fetch('/api/business-drafts/'+encodeURIComponent(id)+'/engine/tasks',{
        headers:{Authorization:'Bearer '+jwt},cache:'no-store'
      })
      const data=await res.json()
      if(!res.ok){setError(data.error||'Private engine is unavailable.');return}
      setImported(data.imported===true)
      setTasks(Array.isArray(data.tasks)?data.tasks:[])
      setOutputs(Array.isArray(data.deliverables)?data.deliverables:[])
      setError('')
      if(data.imported===true){
        try{
          const runtimeRes=await fetch('/api/business-drafts/'+encodeURIComponent(id)+'/engine/runtime',{
            headers:{Authorization:'Bearer '+jwt},cache:'no-store'
          })
          if(runtimeRes.ok){
            const runtimeData=await runtimeRes.json()
            if(typeof runtimeData.worker_heartbeat_fresh==='boolean'&&runtimeData.observation_only===true){
              setRuntime(runtimeData as Runtime)
            }
          }
        }catch{
          // An unavailable telemetry endpoint never becomes a green status.
        }
      }
      setRuntimeChecked(true)
    }catch{setError('The private Base88 engine could not be reached.')}
    finally{setLoading(false);setRuntimeChecked(true)}
  },[id,token])

  useEffect(()=>{void load()},[load])

  async function importBusiness(){
    if(busy)return
    const jwt=await token();if(!jwt)return
    setBusy(true);setError('');setNotice('')
    try{
      const res=await fetch('/api/business-drafts/'+encodeURIComponent(id)+'/engine',{
        method:'POST',headers:{Authorization:'Bearer '+jwt},cache:'no-store'
      })
      const data=await res.json()
      if(!res.ok){setError(data.error||'Business could not be imported.');return}
      setNotice(data.created?'Private planning workspace created.':'Existing private workspace retrieved.')
      await load()
    }catch{setError('Independent engine is unavailable.')}
    finally{setBusy(false)}
  }

  async function action(action:'propose'|'approve'|'cancel',target:string){
    if(busy)return
    const jwt=await token();if(!jwt)return
    setBusy(true);setError('');setNotice('')
    try{
      const payload=action==='propose'?{action,kind:target}:{action,task_id:target}
      const res=await fetch('/api/business-drafts/'+encodeURIComponent(id)+'/engine/tasks',{
        method:'POST',headers:{Authorization:'Bearer '+jwt,'Content-Type':'application/json'},
        body:JSON.stringify(payload),cache:'no-store'
      })
      const data=await res.json()
      if(!res.ok){setError(data.error||'Task action was rejected.');return}
      setNotice(action==='propose'?'Draft task proposed. Approve it separately before execution.':
        action==='approve'?'Task queued for private internal worker execution.':'Task stopped; late writes are fenced.')
      await load()
    }catch{setError('Private task action failed.')}
    finally{setBusy(false)}
  }

  async function download(output:Output){
    if(!output.integrity_verified){setError('This output did not pass integrity verification.');return}
    const jwt=await token();if(!jwt)return
    setError('')
    try{
      const res=await fetch('/api/business-drafts/'+encodeURIComponent(id)+'/engine/deliverables/'+output.id,{
        headers:{Authorization:'Bearer '+jwt},cache:'no-store'
      })
      if(!res.ok){setError('Deliverable download failed or integrity verification was rejected.');return}
      const blob=await res.blob()
      const href=URL.createObjectURL(blob)
      const a=document.createElement('a')
      a.href=href;a.download='base88-'+output.id+'.txt';a.click()
      URL.revokeObjectURL(href)
      setNotice('Verified private deliverable downloaded. It has not been published.')
    }catch{setError('Could not download the private deliverable.')}
  }

  return <main className="min-h-screen text-white px-5 md:px-10 py-9" style={{background:'linear-gradient(135deg,#080b18,#111d2d)',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div className="max-w-6xl mx-auto">
      <header className="flex gap-4 justify-between items-center flex-wrap mb-12">
        <Link href="/dashboard" className="text-violet-300 font-bold text-lg underline">Base88 / Dashboard</Link>
        <span className="text-xs text-emerald-300 border border-emerald-400/30 px-3 py-2 rounded-full">Private planning environment</span>
      </header>
      <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Independent engine workspace</h1>
      <p className="text-slate-300 max-w-3xl leading-relaxed mb-7">
        Propose work, approve each private job, inspect its progress and download independently verified files.
        No public launch, outbound messages, purchases or automatic payments are permitted through these controls.
      </p>
      <div className="flex gap-3 flex-wrap mb-8">
        <button onClick={()=>void load()} disabled={loading||busy} className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-5 py-3 rounded-xl font-semibold">Refresh status</button>
        {!imported && <button onClick={()=>void importBusiness()} disabled={busy} className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-5 py-3 rounded-xl font-semibold">Import my saved business</button>}
      </div>
      {loading && <p role="status" className="text-slate-400 mb-8">Checking secure engine connectivity…</p>}
      {error && <p role="alert" className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-5 mb-7 text-rose-200">{error} <Link href="/auth/login" className="underline">Account login</Link></p>}
      {notice && <p role="status" className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-5 mb-7 text-emerald-200">{notice}</p>}
      {!error&&!loading&&!imported && <p className="p-6 border border-amber-500/20 bg-amber-950/20 rounded-xl mb-7 text-amber-200">This business is not connected to a private engine workspace yet. Importing creates an internal planning workspace, not a launched business.</p>}
      <section className="mb-9 border border-white/10 bg-white/5 rounded-2xl p-6" aria-label="Verified worker runtime">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">Actual worker status</h2>
            <p className="text-slate-400 text-sm mt-2">A recent receipt from the private engine database is required before Base88 reports a running worker.</p>
          </div>
          <span role="status" className={runtime?.worker_heartbeat_fresh
            ?'text-emerald-200 border border-emerald-500/40 bg-emerald-950/30 rounded-full px-3 py-2 text-xs font-semibold'
            :'text-amber-200 border border-amber-500/40 bg-amber-950/30 rounded-full px-3 py-2 text-xs font-semibold'}>
            {runtime?.worker_heartbeat_fresh?'Worker observed':runtimeChecked?'Worker not verified':'Checking evidence…'}
          </span>
        </div>
        {runtime && <div className="mt-5 text-slate-300 text-sm grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>Active heartbeat count: <strong>{runtime.observed_worker_count}</strong></div>
          <div>Queued private tasks: <strong>{runtime.federated_tasks?.queued??0}</strong></div>
          <div>Completed private tasks: <strong>{runtime.federated_tasks?.completed??0}</strong></div>
          <p className="text-slate-400 text-xs md:col-span-3">Last recorded heartbeat: {runtime.most_recent_worker_pulse_at||'Not observed'}. An observed heartbeat does not verify model inference, Docker isolation, payments, customer messages, or site deployment.</p>
        </div>}
        {!runtime && <p className="text-amber-200/80 text-sm mt-4">No verified runtime evidence is available. Private backend hosting, database migrations and a running worker still require live deployment.</p>}
      </section>
      <section className="mb-9">
        <h2 className="text-2xl font-bold mb-4">Create private deliverables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map(t=><article key={t.kind} className="border border-white/10 bg-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-2">{t.title}</h3>
            <p className="text-slate-400 text-sm mb-5">{t.desc}</p>
            <button disabled={busy||!imported||Boolean(error)} onClick={()=>void action('propose',t.kind)}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-lg px-4 py-2 font-semibold text-sm">Propose task</button>
          </article>)}
        </div>
      </section>
      <section className="mb-9">
        <h2 className="text-2xl font-bold mb-4">Task history ({tasks.length})</h2>
        {tasks.length===0 && <p className="text-slate-400 border border-white/10 bg-white/5 rounded-xl p-5">No private engine jobs recorded yet.</p>}
        <div className="space-y-3">
          {tasks.map(t=><article key={t.id} className="p-5 border border-white/10 bg-white/5 rounded-xl flex items-start justify-between flex-wrap gap-4">
            <div><h3 className="font-bold">{t.title}</h3>
              <p className="text-slate-400 text-sm mt-1">{t.kind} · <span className="text-emerald-300">{t.status}</span> · attempts: {t.attempt_count}</p>
              {t.error && <p className="text-rose-200 text-sm mt-2">{t.error}</p>}
            </div>
            <div className="flex gap-2">
              {t.status==='proposed' && <button disabled={busy} onClick={()=>void action('approve',t.id)} className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-semibold">Approve</button>}
              {['proposed','queued','running'].includes(t.status) && <button disabled={busy} onClick={()=>void action('cancel',t.id)} className="bg-rose-800 hover:bg-rose-700 disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-semibold">Stop</button>}
            </div>
          </article>)}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">Verified private files ({outputs.length})</h2>
        {outputs.length===0 && <p className="text-slate-400 border border-white/10 bg-white/5 rounded-xl p-5">Completed jobs produce downloadable files after integrity checks. Nothing has been produced yet.</p>}
        <div className="space-y-3">{outputs.map(o=><div key={o.id} className="border border-white/10 bg-white/5 rounded-xl p-5 flex items-center justify-between gap-3 flex-wrap">
          <div><p className="font-bold">{o.name}</p><p className="text-slate-400 text-xs mt-1">{o.size_bytes} bytes · SHA256: {o.sha256.slice(0,20)}… · {o.integrity_verified?'Verified':'Integrity mismatch'}</p></div>
          <button disabled={!o.integrity_verified||busy} onClick={()=>void download(o)} className="bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 px-4 py-2 rounded-lg font-semibold text-sm">Download</button>
        </div>)}</div>
      </section>
      <p className="mt-12 text-slate-500 text-xs leading-relaxed">All work requires signed-in ownership and explicit approval. Preview status does not prove a live worker is connected; queued jobs remain queued until an authorized private worker processes them. No external sending, publication or spending.</p>
    </div>
  </main>
}

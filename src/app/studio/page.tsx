'use client'

import Link from 'next/link'
import {useState} from 'react'
import {buildStudioDocument,suggestStudioKind,type StudioKind} from '@/lib/base88-studio'
import {createLaunchZip} from '@/lib/zip-store'

const initialName='LaunchBoard'
const initialGoal='Build a task tracker for a small team with owners and progress updates.'
const initialCode=buildStudioDocument({name:initialName,goal:initialGoal,kind:'tasks'})
type Mode='auto'|StudioKind

export default function StudioPage(){
  const [name,setName]=useState(initialName)
  const [goal,setGoal]=useState(initialGoal)
  const [mode,setMode]=useState<Mode>('auto')
  const [code,setCode]=useState(initialCode)
  const [activeType,setActiveType]=useState<StudioKind>('tasks')
  const [view,setView]=useState<'preview'|'code'>('preview')
  const [revision,setRevision]=useState(0)
  const [notice,setNotice]=useState('')

  function generate(){
    try{
      const kind=mode==='auto'?suggestStudioKind(goal):mode
      const next=buildStudioDocument({name,goal,kind})
      setActiveType(kind);setCode(next);setRevision(v=>v+1);setView('preview')
      setNotice('Working browser-local prototype generated. No external services were called.')
    }catch(error){setNotice(error instanceof Error?error.message:'Unable to create the prototype.')}
  }

  function download(){
    if(!code.trim()){setNotice('Generate a prototype before exporting.');return}
    try{
      const readme=[
        '# Base88 App Studio', '',
        'Browser-local working prototype: '+name.trim(),
        'Purpose: '+goal.trim(), '',
        'Open index.html in a modern browser. Add and delete records.',
        'When the browser permits it, records persist in localStorage on that origin.',
        'Export JSON in the prototype to keep a backup.',
        'No server database, authentication, payment processing, public deployment or AI agent is included.',
        'This ZIP is source you can inspect, edit and host independently.',
      ].join('\n')
      const archive=createLaunchZip([{name:'index.html',content:code},
        {name:'README.txt',content:readme}])
      const url=URL.createObjectURL(new Blob([archive],{type:'application/zip'}))
      const link=document.createElement('a')
      link.href=url;link.download='base88-studio-prototype.zip';link.click()
      setTimeout(()=>URL.revokeObjectURL(url),1000)
      setNotice('ZIP prepared with editable HTML source and project instructions.')
    }catch{setNotice('The prototype export could not be prepared.')}
  }

  return <main className="min-h-screen bg-[#080b19] text-white">
    <header className="border-b border-white/10 px-5 sm:px-9 py-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="font-black text-xl tracking-tight">
          <span className="text-violet-400">Base</span><span className="text-emerald-300">88</span>
          <span className="ml-3 text-xs tracking-widest uppercase text-slate-400 font-semibold">Studio</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/surprise-me" className="text-slate-400 hover:text-white">Surprise Me</Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white">Workspace</Link>
          <Link href="/launch" className="text-emerald-300 hover:text-white">Beta status</Link>
        </nav>
      </div>
    </header>
    <div className="max-w-7xl mx-auto px-5 sm:px-9 py-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[.23em] font-black text-emerald-300 mb-2">App Studio · First working prototype</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Describe it. See it work.</h1>
          <p className="text-slate-400 mt-3 max-w-2xl leading-7">
            Build a working local task, customer, or booking tracker from your own idea. Preview it,
            inspect the source, and export the full artifact instead of a screenshot.
          </p>
        </div>
        <div className="rounded-full border border-amber-400/25 bg-amber-400/10 text-amber-200 px-4 py-2 text-xs font-semibold">
          Local prototype · Not an AI-generated full-stack deployment
        </div>
      </div>

      <div className="mt-9 grid grid-cols-1 lg:grid-cols-[minmax(310px,390px)_minmax(0,1fr)] gap-6 items-start">
        <section aria-labelledby="project-input" className="rounded-3xl border border-white/10 bg-[#11172b] p-6 sm:p-7">
          <h2 id="project-input" className="text-xl font-bold">Your app</h2>
          <p className="text-sm text-slate-400 mt-2">Start with a short description. You can change the generated HTML directly.</p>
          <label htmlFor="project-name" className="block mt-7 mb-2 text-sm font-semibold">App name</label>
          <input id="project-name" value={name} maxLength={80} onChange={e=>setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/15 bg-[#080d20] focus:outline-none focus:ring-2 focus:ring-violet-400"/>
          <label htmlFor="project-goal" className="block mt-5 mb-2 text-sm font-semibold">What should the app do?</label>
          <textarea id="project-goal" rows={6} value={goal} maxLength={1200} onChange={e=>setGoal(e.target.value)}
            placeholder="Build a simple CRM to track new customers and follow-ups."
            className="w-full px-4 py-3 rounded-xl border border-white/15 bg-[#080d20] focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y"/>
          <label htmlFor="project-kind" className="block mt-5 mb-2 text-sm font-semibold">Starter app type</label>
          <select id="project-kind" value={mode} onChange={e=>setMode(e.target.value as Mode)}
            className="w-full px-4 py-3 rounded-xl border border-white/15 bg-[#080d20]">
            <option value="auto">Suggest from description</option>
            <option value="tasks">Task management</option>
            <option value="clients">Customer relationship tracker</option>
            <option value="bookings">Bookings and appointments</option>
          </select>
          <button onClick={generate} disabled={name.trim().length<2||goal.trim().length<8}
            className="mt-7 w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 py-3.5 font-bold transition-colors">
            Generate working prototype
          </button>
          <button onClick={download} className="mt-3 w-full rounded-xl border border-emerald-400/25 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-200 py-3 font-bold transition-colors">
            Export editable ZIP
          </button>
          {notice&&<p role="status" aria-live="polite" className="text-sm mt-5 rounded-xl bg-white/5 p-3 text-slate-200">{notice}</p>}
          <p className="text-xs text-slate-500 mt-6 leading-5">
            The built-in starter uses deterministic templates, not a paid model. Data stays inside the
            generated app&apos;s browser; preview storage may be restricted. No accounts, public hosting,
            payment processing or external messages are created.
          </p>
        </section>

        <section aria-label="Generated app preview and source" className="rounded-3xl border border-white/10 overflow-hidden bg-[#11172b]">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 px-5 sm:px-7 py-4">
            <div>
              <span className="text-sm font-bold">Live app prototype</span>
              <span className="ml-3 text-xs text-slate-400">{activeType} · editable HTML</span>
            </div>
            <div className="inline-flex rounded-xl bg-white/5 p-1 gap-1">
              <button onClick={()=>setView('preview')} aria-pressed={view==='preview'}
                className={'px-4 py-2 rounded-lg text-sm font-bold '+(view==='preview'?'bg-violet-600 text-white':'text-slate-300 hover:text-white')}>
                Preview
              </button>
              <button onClick={()=>setView('code')} aria-pressed={view==='code'}
                className={'px-4 py-2 rounded-lg text-sm font-bold '+(view==='code'?'bg-violet-600 text-white':'text-slate-300 hover:text-white')}>
                Source
              </button>
            </div>
          </div>
          {view==='preview'?
            <iframe key={revision} title="Interactive Base88 starter application" srcDoc={code}
              sandbox="allow-scripts allow-downloads" referrerPolicy="no-referrer"
              className="w-full bg-[#080d19] min-h-[640px] border-0"/>:
            <div className="p-5">
              <label htmlFor="source-editor" className="text-sm font-semibold block mb-3">Editable HTML, CSS and JavaScript</label>
              <textarea id="source-editor" spellCheck={false} value={code} maxLength={150000}
                onChange={e=>setCode(e.target.value)}
                className="w-full min-h-[610px] rounded-xl bg-[#060914] border border-white/15 p-4 text-xs font-mono text-emerald-100 focus:outline-none focus:ring-2 focus:ring-violet-500"/>
            </div>}
          <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-400">
            Prototype execution is isolated inside a sandboxed frame. Exported source is yours to run independently.
          </div>
        </section>
      </div>
    </div>
  </main>
}
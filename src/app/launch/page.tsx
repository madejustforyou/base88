import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'November 28 Launch Status | Base88',
  description: 'Track the verified Base88 business-operator beta launch. Explore Surprise Me and see what is working, connected, and still in development.',
}

const tracks = [
  {
    name:'Business concept and starter site',
    label:'Preview available',
    level:'ready',
    description:'Surprise Me can generate a business hypothesis, a usable sample webpage, a first digital-product concept and a downloadable starter package. Test prices and demand claims are hypotheses.',
    href:'/surprise-me',
    action:'Try Surprise Me',
  },
  {
    name:'App Studio — functional client-side prototypes',
    label:'Preview available',
    level:'ready',
    description:'Describe a task, customer, or booking tracker and generate a runnable browser-local app with editable HTML and ZIP export. This is deterministic scaffolding, not autonomous AI development or a hosted backend.',
    href:'/studio',
    action:'Try App Studio',
  },
  {
    name:'Account and private drafts',
    label:'Requires connected storage',
    level:'partial',
    description:'Account signup uses Supabase. Saved business drafts require the correct database tables, row-level permissions, and authenticated customer access. A browser preview never means private storage is provisioned.',
    href:'/auth/signup',
    action:'Open signup',
  },
  {
    name:'Independent business operator',
    label:'Backend deployment pending',
    level:'blocked',
    description:'The private Python API, worker, standing-goal endpoints, and PostgreSQL acceptance suites exist and are passing in CI. They cannot execute unattended on the public website until an actual cloud worker is deployed.',
    href:'/dashboard',
    action:'Workspace',
  },
  {
    name:'Voice, calls, meetings and 88 Desk',
    label:'Provider setup and QA pending',
    level:'blocked',
    description:'Humanlike AI avatars, owner callbacks, Zoom/Meet attendance and agent-owned cloud computers require actual approved provider accounts, authentication and live test receipts. No provider connection is claimed.',
    href:'/agents',
    action:'Agent area',
  },
  {
    name:'Payments and subscriptions',
    label:'No live checkout',
    level:'blocked',
    description:'Paid plans are proposed. No customer should be billed until the billing provider, prepaid credit ledger, verified entitlements, pricing and settlement have been tested end to end.',
    href:'/billing',
    action:'Proposed plans',
  },
] as const

export default function LaunchPage(){
  return <main className="min-h-screen bg-[#070917] text-slate-100">
    <header className="border-b border-white/10 bg-[#070917]/90">
      <div className="mx-auto max-w-6xl px-6 py-5 flex flex-wrap justify-between items-center gap-4">
        <Link href="/" className="text-2xl font-black tracking-tight text-white no-underline">
          <span className="text-violet-400">88</span> Base88
        </Link>
        <div className="flex flex-wrap gap-5 items-center text-sm">
          <Link href="/surprise-me" className="text-emerald-300 hover:text-emerald-200">Surprise Me</Link>
          <Link href="/auth/signup" className="text-slate-300 hover:text-white">Create account</Link>
          <Link href="/dashboard" className="text-slate-300 hover:text-white">Dashboard</Link>
        </div>
      </div>
    </header>

    <section className="mx-auto max-w-6xl px-6 pt-20 pb-14">
      <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs uppercase font-bold tracking-wider text-violet-200">
        Release engineering · November 2026
      </div>
      <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px] gap-10 items-start">
        <div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Built to do the work.<br/>
            <span className="text-emerald-300">Verified before launch.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl">
            Base88 is building AI Operators that research, create, run projects and represent you.
            Our November 28 launch target is a working customer beta, not a simulated 24/7 agent.
            Follow the exact feature status below.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/surprise-me" className="inline-flex items-center rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-3 font-semibold text-white">Try a real starter project</Link>
            <Link href="/auth/signup" className="inline-flex items-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-slate-100 hover:border-white/40">Create an account</Link>
          </div>
        </div>
        <aside className="rounded-3xl border border-violet-400/20 bg-gradient-to-b from-violet-500/15 to-slate-900/60 p-7">
          <p className="text-violet-200 text-xs tracking-widest uppercase font-extrabold">Launch deadline</p>
          <p className="text-5xl font-black mt-3">NOV 28</p>
          <p className="mt-1 text-slate-300 text-sm">Saturday, 2026</p>
          <div className="h-px bg-white/10 my-6"/>
          <p className="text-sm text-slate-300 leading-6">A feature is marked live only after the actual provider, owner permissions, billing limits and end-to-end receipts have passed. Preview code alone does not count.</p>
        </aside>
      </div>
    </section>

    <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs uppercase font-bold tracking-widest text-emerald-300">Product readiness</p>
          <h2 id="features-heading" className="text-3xl font-extrabold mt-2">What you can use—and what still needs a connection</h2>
        </div>
        <p className="text-xs text-slate-400">No fake deployments · No unapproved charges</p>
      </div>
      <div className="grid gap-4">
        {tracks.map(track => <article key={track.name} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-7">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-3 items-center">
                <h3 className="text-lg font-bold">{track.name}</h3>
                <span className={'rounded-full px-3 py-1 text-xs font-semibold '+
                  (track.level==='ready'?'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20':
                   track.level==='partial'?'bg-amber-400/10 text-amber-200 border border-amber-400/20':
                   'bg-slate-400/10 text-slate-300 border border-slate-400/20')}>
                  {track.label}
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-6 mt-3">{track.description}</p>
            </div>
            <Link href={track.href} className="shrink-0 text-sm font-semibold text-violet-300 hover:text-violet-200">
              {track.action} →
            </Link>
          </div>
        </article>)}
      </div>
    </section>

    <section className="border-t border-white/10 bg-[#0d1022]">
      <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-bold">The vision stays ambitious.</h2>
          <p className="mt-4 text-slate-400 leading-7">One persistent Director, specialist agents, a private cloud computer for each operator, reliable voice and messaging, research before action and a prepaid owner-controlled budget. Customers should be able to say “run my business” without setting an expiry.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">The implementation stays honest.</h2>
          <p className="mt-4 text-slate-400 leading-7">Real Zoom/Meet avatars, trading, hosted computers, Shopify/TikTok posting and phone calls depend on their actual providers, platform permissions and verified costs. Features awaiting those integrations are not sold as working services.</p>
        </div>
      </div>
    </section>
    <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
      <span>© 2026 Base88. Independent business-operator platform.</span>
      <Link href="/" className="text-slate-400 hover:text-white">Back to Base88</Link>
    </footer>
  </main>
}

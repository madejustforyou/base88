'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateStarterSite } from '@/lib/surprise-site'
import { generateStarterProduct } from '@/lib/surprise-product'
import { createLaunchZip } from '@/lib/zip-store'

type Idea = {
  name: string
  category: string
  audience: string
  tagline: string
  problem: string
  firstProduct: string
  offer: string
  price: string
  validation: string[]
  acquisition: string[]
  risk: string
  freeTool: string
}

const ideas: Idea[] = [
  {
    name: 'DetailNudge', category: 'Auto services', audience: 'Independent US mobile auto detailers',
    tagline: 'Turn more quotes into booked detailing jobs.',
    problem: 'Owners lose valuable time to unanswered inquiries and inconsistent quote follow-ups.',
    firstProduct: 'Downloadable booking and follow-up templates, lead tracker and quote reply generator',
    offer: 'Digital toolkit sold once, with a useful free browser-based generator',
    price: '$19 test price',
    validation: ['Interview 10 mobile detailing owners about missed quotes and follow-up habits.', 'Get five owners to try the free reply generator.', 'Require three real purchase-intent signals before adding paid checkout.'],
    acquisition: ['Publish a genuinely helpful free quote-follow-up template.', 'Share tutorials in communities that permit them.', 'Post useful short demonstrations; do not send bulk unsolicited messages.'],
    risk: 'Customers may prefer existing detailing CRM tools or free template packs.',
    freeTool: 'Estimate follow-up message generator'
  },
  {
    name: 'PetBrief', category: 'Pet services', audience: 'Solo dog walkers and pet sitters',
    tagline: 'Better client updates, less admin.',
    problem: 'Solo pet-care providers need consistent intake notes, visit recaps and follow-up messages.',
    firstProduct: 'Customizable visit summary, client intake and scheduling template pack',
    offer: 'One-time digital template purchase plus a free client-update generator',
    price: '$15 test price',
    validation: ['Interview 10 solo pet sitters about communication and visit reporting.', 'Test five sample pet visit templates with users.', 'Check interest before setting up payments.'],
    acquisition: ['Publish free pet visit update examples.', 'Demonstrate the template with sample fictional pets.', 'Offer a no-cost checklist through community-approved posts.'],
    risk: 'Insurance, care quality and customer trust matter more than a template alone.',
    freeTool: 'Pet visit recap generator'
  },
  {
    name: 'QuoteCraft', category: 'Freelance services', audience: 'Freelance designers and virtual assistants',
    tagline: 'Send professional proposals in minutes.',
    problem: 'Freelancers struggle to price, scope and follow up on small projects.',
    firstProduct: 'Proposal templates, scope checklist, pricing worksheet and follow-up scripts',
    offer: 'Digital proposal toolkit; no consulting or legal promises',
    price: '$24 test price',
    validation: ['Ask 10 freelancers to critique a sample proposal.', 'Measure how often free-tool users finish a proposal.', 'Ask users to select between free and paid versions with real intent.'],
    acquisition: ['Free proposal scope checker.', 'Tutorials explaining deliverables and change requests.', 'Useful example proposals with no fabricated testimonials.'],
    risk: 'Highly competitive template niche; quality and differentiation must be proven.',
    freeTool: 'Proposal scope checklist'
  },
  {
    name: 'StudioReply', category: 'Creative services', audience: 'Independent US photographers',
    tagline: 'Reply faster and book with confidence.',
    problem: 'Photographers repeat the same pricing, availability and session preparation messages.',
    firstProduct: 'Session inquiry and booking message templates, preparation questionnaire',
    offer: 'One-time client communication kit',
    price: '$17 test price',
    validation: ['Talk with wedding, portrait and family photographers separately.', 'Test the usefulness of a free session FAQ.', 'Identify three photographers willing to pay at a stated price.'],
    acquisition: ['Search-optimized session preparation article.', 'Free photo-session intake checklist.', 'Helpful posts in creator communities where allowed.'],
    risk: 'Different photographer specialties have materially different workflows.',
    freeTool: 'Photo session inquiry reply builder'
  },
  {
    name: 'LocalLaunch Kit', category: 'Local business', audience: 'Solo neighborhood service providers',
    tagline: 'Look organized before your first booking.',
    problem: 'New local service businesses need a professional inquiry and booking process.',
    firstProduct: 'Simple service-page copy, inquiry form examples, customer FAQ and launch checklist',
    offer: 'Downloadable launch starter toolkit',
    price: '$19 test price',
    validation: ['Choose one narrow service niche before promoting the offer.', 'Interview 10 service owners about the most repetitive admin work.', 'Validate one deliverable with five pilot users.'],
    acquisition: ['Free neighborhood-business website checklist.', 'Educational social posts with examples.', 'Search content targeted to the selected service niche.'],
    risk: 'A generic starter kit may be less useful than a niche-specific product.',
    freeTool: 'Local service FAQ builder'
  },
  {
    name: 'ReviewReady', category: 'Reputation', audience: 'Independent home cleaning businesses',
    tagline: 'Make every customer follow-up count.',
    problem: 'Small cleaning businesses need consistent after-service updates and review requests.',
    firstProduct: 'After-clean checklist, satisfaction survey and compliant review-request message kit',
    offer: 'Editable templates without automatic messaging or review manipulation',
    price: '$12 test price',
    validation: ['Confirm actual pain with 10 independent cleaners.', 'Trial the checklist with five volunteers.', 'Require proof of demand before offering a paid download.'],
    acquisition: ['Publish a free post-clean customer checklist.', 'Demonstrate ethical review requests.', 'Share checklists on permitted local-business channels.'],
    risk: 'Must not encourage fabricated reviews or incentives that violate platform rules.',
    freeTool: 'Post-clean follow-up composer'
  }
]

function safeFileSlug(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'').slice(0,46) || 'business'
}

const panel = {background: '#131322', border:'1px solid #2a2b42', borderRadius: 22, padding: 24} as const
const button = {padding:'13px 20px',borderRadius:12,border:'1px solid #6e60df',background:'#7467f4',color:'#fff',fontWeight:750,cursor:'pointer'} as const

function launchMarkdown(idea: Idea) {
  const lines = [
    '# ' + idea.name + ' — Base88 Surprise Me launch brief', '',
    '**Stage:** business concept only; not launched', '**Starting budget:** $0 upfront',
    '**Brand availability:** not checked; confirm name and trademark before use', '',
    '## Audience', idea.audience, '', '## Positioning', idea.tagline, '',
    '## Problem hypothesis', idea.problem, '',
    '## First product', idea.firstProduct, '',
    '## Business model', idea.offer, '',
    '## Pricing experiment', idea.price, '',
    '## Free lead magnet', idea.freeTool, '',
    '## Market-validation checklist', ...idea.validation.map(s => '- [ ] ' + s), '',
    '## Organic acquisition plan', ...idea.acquisition.map(s => '- [ ] ' + s), '',
    '## Biggest risk', idea.risk, '',
    '## Planned business inbox', '- [ ] Set up business-scoped web contact form',
    '- [ ] Draft (never automatically send) customer replies',
    '- [ ] Connect actual provider only when owner authorizes', '',
    '## Planned payment setup', '- [ ] Owner verifies merchant identity and creates approved Stripe account',
    '- [ ] Connect a specific product and Price ID',
    '- [ ] Verify signed webhook before issuing a download', '',
    '## Proposed autonomy', 'May prepare drafts, market research plans and site previews autonomously.',
    'Must request owner approval before publishing, sending messages, making purchases, refunds, or changing prices.',
    'Do not charge, contact customers, register domains or claim launched without real execution evidence.', '',
    '## Acceptance tests', '- [ ] No payment, email, domain or advertising expense without approval',
    '- [ ] Site can be previewed on mobile and desktop',
    '- [ ] Contact data isolated to its business',
    '- [ ] Payment entitlement requires authenticated paid webhook',
    '- [ ] Stop control halts further autonomous external action',
    '- [ ] Every claimed external result has a verifiable receipt'
  ]
  return lines.join('\n')
}

export default function SurpriseMePage() {
  const [selected, setSelected] = useState<Idea | null>(null)
  const [focus, setFocus] = useState('Any viable category')
  const [notice, setNotice] = useState('')
  const [showOperations, setShowOperations] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [savedError, setSavedError] = useState('')
  const [siteVisible, setSiteVisible] = useState(false)
  const [savedDrafts, setSavedDrafts] = useState<Array<{id:string;name:string;category:string;brief:Idea;created_at:string}>>([])

  async function accountToken() {
    const {data, error} = await supabase.auth.getSession()
    if (error || !data.session?.access_token) {
      setNotice('Please sign in to Base88 to save or view business drafts.')
      return null
    }
    return data.session.access_token
  }

  async function saveDraft() {
    if (!selected || saving) return
    const token = await accountToken()
    if (!token) return
    setSaving(true)
    try {
      const response = await fetch('/api/business-drafts', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify(selected),
        cache:'no-store',
      })
      const data = await response.json()
      if (!response.ok) {setNotice(data.error || 'Could not save the business draft.');return}
      setNotice('Business draft saved privately to your Base88 account. It is not launched.')
      if (showSaved) await loadSaved(token)
    } catch {setNotice('Unable to connect to business draft storage.')}
    finally {setSaving(false)}
  }

  async function loadSaved(existingToken?: string) {
    const token = existingToken || await accountToken()
    if (!token) return
    setLoadingSaved(true)
    setShowSaved(true)
    setSavedError('')
    try {
      const response = await fetch('/api/business-drafts', {
        method:'GET',headers:{'Authorization':'Bearer '+token},cache:'no-store'
      })
      const data = await response.json()
      if (!response.ok) {setSavedError(data.error || 'Could not load saved drafts.');return}
      setSavedDrafts(data.drafts || [])
    } catch {setSavedError('Unable to retrieve your private drafts.')}
    finally {setLoadingSaved(false)}
  }


  function generate() {
    const pool = focus === 'Any viable category' ? ideas : ideas.filter(x => x.category === focus)
    const choices = pool.length > 1 ? pool.filter(x => x.name !== selected?.name) : pool
    const source = choices.length ? choices : pool
    const index = window.crypto.getRandomValues(new Uint32Array(1))[0] % source.length
    setSelected(source[index])
    setNotice('New zero-upfront business concept prepared. No business was launched and no money was spent.')
    setShowOperations(false)
    setSiteVisible(false)
  }

  function download() {
    if (!selected) return
    const file = new Blob([launchMarkdown(selected)], {type:'text/markdown;charset=utf-8'})
    const href = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = href
    a.download = safeFileSlug(selected.name) + '-base88-launch-brief.md'
    a.click()
    URL.revokeObjectURL(href)
    setNotice('Launch brief exported locally. This does not create or publish a business.')
  }

  function downloadLaunchPack() {
    if (!selected) return
    const prefix = safeFileSlug(selected.name)
    const archive = createLaunchZip([
      {name:prefix+'-business-brief.md', content:launchMarkdown(selected)},
      {name:prefix+'-starter-product.md',content:generateStarterProduct(selected)},
      {name:prefix+'-starter-website.html',content:generateStarterSite(selected)},
    ])
    const href = URL.createObjectURL(new Blob([archive],{type:'application/zip'}))
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = prefix+'-base88-launch-pack.zip'
    anchor.click()
    URL.revokeObjectURL(href)
    setNotice('Complete launch pack exported. It is a draft: no website published, account connected or payment taken.')
  }

  function downloadProduct() {
    if (!selected) return
    const filename = safeFileSlug(selected.name) + '-starter-product.md'
    const blob = new Blob([generateStarterProduct(selected)], {type:'text/markdown;charset=utf-8'})
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(href)
    setNotice('Editable starter product exported. Review it before selling or publishing.')
  }

  function downloadSite() {
    if (!selected) return
    const filename = safeFileSlug(selected.name) + '-starter-site.html'
    const blob = new Blob([generateStarterSite(selected)], {type:'text/html;charset=utf-8'})
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(href)
    setNotice('HTML starter site downloaded. It is not published; forms and checkout are intentionally inactive.')
  }

  const options = ['Any viable category', ...Array.from(new Set(ideas.map(x=>x.category)))]
  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(150deg,#080917,#13152a 50%,#0b1118)',color:'#f1efff',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif'}}>
      <header style={{padding:'20px clamp(18px,5vw,72px)',borderBottom:'1px solid #26263e',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
        <Link href="/" style={{fontSize:23,fontWeight:900,textDecoration:'none',color:'#b9acf9'}}>Base88<span style={{color:'#53e4bb'}}>.</span></Link>
        <nav style={{display:'flex',gap:18,alignItems:'center',fontSize:14}}>
          <Link href="/" style={{color:'#b5b9cd',textDecoration:'none'}}>Home</Link>
          <Link href="/auth/signup" style={{color:'#b5b9cd',textDecoration:'none'}}>Account</Link>
        </nav>
      </header>
      <section style={{maxWidth:1120,margin:'0 auto',padding:'clamp(44px,8vw,86px) 20px 90px'}}>
        <div style={{fontSize:12,fontWeight:800,letterSpacing:2,color:'#6ce8bc',marginBottom:16}}>BASE88 LAB / EXPERIMENTAL</div>
        <h1 style={{fontSize:'clamp(40px,7vw,74px)',lineHeight:1.04,letterSpacing:'-2px',maxWidth:850,fontWeight:850,marginBottom:20}}>No idea? <span style={{color:'#a69afe'}}>Surprise me.</span></h1>
        <p style={{color:'#abb0c9',fontSize:18,lineHeight:1.7,maxWidth:750,marginBottom:28}}>Generate a complete business concept with a first product, validation strategy, customer-acquisition plan, inbox design and approval rules. No inventory or upfront purchase required.</p>
        <div style={{...panel,display:'flex',gap:16,alignItems:'end',flexWrap:'wrap',marginBottom:24}}>
          <label style={{display:'grid',gap:7,minWidth:235,flex:'1 1 250px',fontSize:13,color:'#b4b7cf'}}>Business category
            <select aria-label="Business category" value={focus} onChange={e=>setFocus(e.target.value)} style={{border:'1px solid #484462',background:'#202139',padding:'13px 12px',borderRadius:10,color:'#f0ecff',fontSize:15}}>
              {options.map(x=><option key={x}>{x}</option>)}
            </select>
          </label>
          <div style={{display:'grid',gap:7,flex:'1 1 170px'}}>
            <span style={{fontSize:13,color:'#b4b7cf'}}>Maximum upfront spending</span>
            <span style={{padding:'13px 12px',border:'1px solid #484462',borderRadius:10,color:'#6ce8bc',background:'#202139',fontWeight:800}}>$0 — locked</span>
          </div>
          <button onClick={generate} style={{...button,flex:'0 0 auto',minHeight:49}}>✦ Surprise me</button>
        </div>
        <p style={{fontSize:13,color:'#8e94ae',marginBottom:30}}>Concepts are curated hypotheses, not verified market opportunities. Your brand name and business model require independent validation before launch.</p>
        {selected ? <div aria-live="polite">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,330px),1fr))',gap:18}}>
            <article style={{...panel,background:'linear-gradient(135deg,#201d3b,#13272c)',borderColor:'#7063c3'}}>
              <div style={{fontSize:12,letterSpacing:1.5,color:'#8fe5d0',marginBottom:13}}>YOUR GENERATED BUSINESS</div>
              <h2 style={{fontSize:36,fontWeight:850,marginBottom:9}}>{selected.name}</h2>
              <p style={{fontSize:17,color:'#ddd6fe',marginBottom:16}}>{selected.tagline}</p>
              <p style={{fontSize:14,color:'#aeb5ca',lineHeight:1.6}}>{selected.audience}</p>
              <div style={{marginTop:26,paddingTop:18,borderTop:'1px solid #4a4669',fontSize:14,color:'#d1d2e8'}}>
                <strong style={{color:'#78eac8'}}>First offer: </strong>{selected.firstProduct}
                <p style={{marginTop:10}}><strong>Pricing to test:</strong> {selected.price}</p>
              </div>
            </article>
            <article style={panel}>
              <h3 style={{fontSize:20,fontWeight:800,marginBottom:16}}>Why this business?</h3>
              <p style={{lineHeight:1.7,color:'#c8c9dc'}}>{selected.problem}</p>
              <p style={{lineHeight:1.7,color:'#c8c9dc',marginTop:16}}><strong style={{color:'#a9f2db'}}>Free acquisition tool:</strong> {selected.freeTool}</p>
              <p style={{lineHeight:1.7,color:'#e2b5ad',marginTop:16}}><strong>Risk:</strong> {selected.risk}</p>
            </article>
          </div>
          <div style={{...panel,marginTop:18}}>
            <h3 style={{fontSize:22,fontWeight:850,marginBottom:20}}>Market validation before spending</h3>
            <ol style={{paddingLeft:22,color:'#d4d5e3',lineHeight:1.8,display:'grid',gap:12}}>
              {selected.validation.map((step,i)=><li key={i}>{step}</li>)}
            </ol>
          </div>
          <div style={{...panel,marginTop:18}}>
            <h3 style={{fontSize:22,fontWeight:850,marginBottom:16}}>Organic customer acquisition</h3>
            <ul style={{paddingLeft:22,color:'#d4d5e3',lineHeight:1.8,display:'grid',gap:10}}>
              {selected.acquisition.map((step,i)=><li key={i}>{step}</li>)}
            </ul>
          </div>
          <div style={{...panel,marginTop:18}}>
            <button onClick={()=>setShowOperations(!showOperations)} aria-expanded={showOperations} style={{padding:0,background:'transparent',border:0,color:'#a9a0ff',fontWeight:800,fontSize:18,cursor:'pointer'}}>Owner inbox, payments and autonomous operations {showOperations?'−':'+'}</button>
            {showOperations && <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:24,marginTop:20,fontSize:14,lineHeight:1.8,color:'#d4d5e3'}}>
              <div><h4 style={{color:'#fff',marginBottom:8}}>Business inbox</h4><p>Planned per-business contact form, web inquiries, owner decision inbox, AI-suggested replies that remain unsent.</p></div>
              <div><h4 style={{color:'#fff',marginBottom:8}}>Payment setup</h4><p>No live payment account is connected. Owner must verify their Stripe account; signed webhooks are required before downloads.</p></div>
              <div><h4 style={{color:'#fff',marginBottom:8}}>Autonomy</h4><p>Internal drafting and validation plans can run automatically. Owner approval is required for publishing, emailing, spending, refunds and live account connections.</p></div>
            </div>}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:23}}>
            <button onClick={downloadLaunchPack} style={{...button,background:'#347e6e',borderColor:'#5be7c3'}}>Download complete launch pack (.zip)</button>
            <button onClick={download} style={button}>Download launch brief</button>
            <button onClick={saveDraft} disabled={saving} style={{...button,background:'#235748',borderColor:'#54be9d',opacity:saving?.65:1}}>{saving?'Saving…':'Save to my account'}</button>
            <button onClick={()=>setSiteVisible(!siteVisible)} style={{...button,background:'#343458'}}>{siteVisible?'Hide starter website':'Preview starter website'}</button>
            <button onClick={downloadSite} style={{...button,background:'#343458'}}>Download website HTML</button>
            <button onClick={downloadProduct} style={{...button,background:'#343458'}}>Download starter product</button>
            <button onClick={generate} style={{...button,background:'transparent',color:'#e4dfff'}}>Try another business</button>
          </div>
          <div role="status" style={{fontSize:13,color:'#8eefd1',marginTop:15}}>{notice}</div>
          {siteVisible && <section style={{...panel,marginTop:22}}>
            <h3 style={{fontSize:20,fontWeight:800,marginBottom:8}}>Generated starter website · safe preview</h3>
            <p style={{fontSize:13,color:'#aeb4cc',marginBottom:15}}>Self-contained HTML, no external resources, checkout, email or scripts.</p>
            <iframe title={selected.name+' starter website preview'} sandbox="" referrerPolicy="no-referrer" srcDoc={generateStarterSite(selected)} style={{width:'100%',height:610,borderRadius:12,border:'1px solid #46516b',background:'#09131c'}} />
          </section>}
        </div> : <div style={{...panel,textAlign:'center',padding:'48px 24px',borderStyle:'dashed'}}>
          <div style={{fontSize:42,marginBottom:14}}>✧</div>
          <p style={{fontSize:20,fontWeight:700,marginBottom:8}}>Your next business starts with one click</p>
          <p style={{color:'#aaaeca',fontSize:14}}>No signup or payment required to explore a concept.</p>
        </div>}
        <section style={{...panel,marginTop:30}} aria-label="My saved business drafts">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:14,flexWrap:'wrap'}}>
            <div>
              <h2 style={{fontSize:21,marginBottom:5}}>My business drafts</h2>
              <p style={{fontSize:13,color:'#aeb4cc'}}>Sign in to retrieve the ideas you saved privately to Base88.</p>
            </div>
            <button onClick={()=>loadSaved()} disabled={loadingSaved} style={{...button,background:'#2e304b',borderColor:'#565677'}}>{loadingSaved?'Loading…':'View my saved ideas'}</button>
          </div>
          {showSaved && <div style={{marginTop:20,display:'grid',gap:10}}>
            {savedError ? <p role="alert" style={{color:'#f2b7ab',fontSize:14}}>{savedError}</p> :
            savedDrafts.length===0 ? <p style={{color:'#aeb4cc',fontSize:14}}>No saved drafts to display.</p> :
            savedDrafts.map(d=>
              <div key={d.id} style={{background:'#1e2035',border:'1px solid #464866',padding:16,borderRadius:12,display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
                <button onClick={()=>{setSelected(d.brief);setSiteVisible(false);setNotice('Saved business draft opened. No live business has been launched.')}} style={{textAlign:'left',background:'transparent',border:0,color:'#f2efff',cursor:'pointer',fontWeight:800,fontSize:16}}>{d.name} <span style={{color:'#9fadc4',fontWeight:400,fontSize:12}}>· {d.category}</span></button>
                <Link href={'/business-drafts/'+d.id+'/inbox'} style={{color:'#8ce5c9',fontSize:13,textDecoration:'underline'}}>Open test inbox</Link>
              </div>
            )}
          </div>}
        </section>
        <p style={{fontSize:13,color:'#9399af',marginTop:36,lineHeight:1.7,borderTop:'1px solid #35374a',paddingTop:20}}>Preview feature only: This page does not incorporate a company, deploy a website, create an inbox, contact customers, charge payments, or run a persistent AI agent. Those capabilities require authenticated services, separate approvals, and verified execution.</p>
      </section>
    </main>
  )
}

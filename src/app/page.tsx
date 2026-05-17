'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen" style={{background:'#060610',color:'#e8e8f0',fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`
        :root{--accent:#7c6fff;--accent2:#1ef5b0;--muted:#6b6b8a;--border:rgba(255,255,255,0.07);--surface:rgba(255,255,255,0.04)}
        *{box-sizing:border-box;margin:0;padding:0}
        .btn-primary{background:linear-gradient(135deg,#7c6fff,#5a4fcf);color:#fff;border:none;border-radius:14px;font-weight:700;cursor:pointer;transition:all .2s;text-decoration:none;display:inline-flex;align-items:center}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(124,111,255,0.4)}
        .btn-ghost{background:transparent;color:#e8e8f0;border:1px solid rgba(255,255,255,0.12);border-radius:14px;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none;display:inline-flex;align-items:center}
        .btn-ghost:hover{border-color:#7c6fff;color:#7c6fff}
        .grad-text{background:linear-gradient(135deg,#a78bfa,#1ef5b0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(124,111,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,111,255,0.05) 1px,transparent 1px);background-size:64px 64px;pointer-events:none}
        .glow{position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:900px;height:700px;background:radial-gradient(ellipse,rgba(124,111,255,0.2) 0%,transparent 65%);pointer-events:none}
        .bento-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:32px;transition:all .3s;position:relative;overflow:hidden}
        .bento-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(124,111,255,0.4),transparent);opacity:0;transition:opacity .3s}
        .bento-card:hover{border-color:rgba(124,111,255,0.35);transform:translateY(-3px);box-shadow:0 20px 60px rgba(0,0,0,0.4)}
        .bento-card:hover::before{opacity:1}
        .feature-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(124,111,255,0.1);border:1px solid rgba(124,111,255,0.2);border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;color:#a78bfa}
        .p-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:32px;transition:all .3s;position:relative}
        .p-card:hover{transform:translateY(-4px);border-color:rgba(124,111,255,0.3)}
        .p-card.pop{border-color:#7c6fff;background:linear-gradient(160deg,rgba(124,111,255,0.1),rgba(255,255,255,0.04))}
        .p-card.pop::before{content:'Most Popular';position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#7c6fff,#5a4fcf);color:#fff;font-size:11px;font-weight:800;padding:5px 16px;border-radius:100px;white-space:nowrap;letter-spacing:.5px;text-transform:uppercase}
        .p-feat{display:flex;align-items:center;gap:10px;font-size:13px;padding:7px 0;border-bottom:1px solid var(--border);color:#a0a0b8}
        .p-feat:last-child{border:none}
        .p-feat span:first-child{color:#1ef5b0;font-weight:700;flex-shrink:0}
        .p-feat.off span:last-child{text-decoration:line-through;opacity:.4}
        .testi{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px}
        .pulse{animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @media(max-width:768px){.hero-h1{font-size:2.4rem!important;letter-spacing:-1px!important}.nav-links{display:none}}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(6,6,16,0.85)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 48px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontWeight:900,fontSize:'1.4rem',letterSpacing:'-0.5px',background:'linear-gradient(135deg,#7c6fff,#1ef5b0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Base88</div>
        <div className="nav-links" style={{display:'flex',alignItems:'center',gap:32}}>
          <a href="#features" style={{color:'#6b6b8a',fontSize:14,fontWeight:500,textDecoration:'none'}}>Features</a>
          <a href="#pricing" style={{color:'#6b6b8a',fontSize:14,fontWeight:500,textDecoration:'none'}}>Pricing</a>
          <a href="#testimonials" style={{color:'#6b6b8a',fontSize:14,fontWeight:500,textDecoration:'none'}}>Reviews</a>
          <Link href="/auth/login" style={{color:'#6b6b8a',fontSize:14,fontWeight:500,textDecoration:'none'}}>Login</Link>
          <Link href="/auth/signup" className="btn-primary" style={{padding:'9px 20px',fontSize:14}}>Get started free →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{position:'relative',textAlign:'center',padding:'140px 24px 100px',overflow:'hidden',minHeight:'90vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div className="grid-bg" />
        <div className="glow" />
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(124,111,255,0.1)',border:'1px solid rgba(124,111,255,0.25)',borderRadius:100,padding:'7px 18px',fontSize:12,fontWeight:700,color:'#7c6fff',letterSpacing:.5,textTransform:'uppercase',marginBottom:32}}>
            <span className="pulse" style={{width:6,height:6,borderRadius:'50%',background:'#1ef5b0',display:'inline-block'}} />
            Live · Trusted by 500+ Singapore businesses
          </div>
          <h1 className="hero-h1" style={{fontSize:'5rem',fontWeight:900,lineHeight:1.02,letterSpacing:'-2px',maxWidth:900,margin:'0 auto 28px'}}>
            Build AI agents that<br/>
            <span className="grad-text">think, work & close deals</span><br/>
            while you sleep
          </h1>
          <p style={{fontSize:'1.2rem',color:'#6b6b8a',maxWidth:560,margin:'0 auto 48px',lineHeight:1.7}}>
            Describe what you need in plain English. Base88 builds a fully working AI agent — with memory, automations, integrations, and payments — in under 60 seconds.
          </p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:56}}>
            <Link href="/auth/signup" className="btn-primary" style={{padding:'16px 36px',fontSize:'1rem',boxShadow:'0 0 48px rgba(124,111,255,0.45)'}}>
              Start building free →
            </Link>
            <a href="#features" className="btn-ghost" style={{padding:'16px 32px',fontSize:'1rem'}}>
              See how it works
            </a>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14,justifyContent:'center',color:'#6b6b8a',fontSize:13}}>
            <div style={{display:'flex'}}>
              {['J','S','M','K','R'].map((l,i)=>(
                <div key={l} style={{width:32,height:32,borderRadius:'50%',border:'2px solid #060610',background:`linear-gradient(135deg,${['#7c6fff,#1ef5b0','#ff6b35,#f7c948','#38bdf8,#818cf8','#f472b6,#a855f7','#34d399,#059669'][i]})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff',marginLeft:i?-8:0}}>{l}</div>
              ))}
            </div>
            <span style={{color:'#f59e0b',fontSize:16}}>★★★★★</span>
            <span>Loved by 500+ businesses</span>
          </div>
        </div>
      </section>

      {/* BENTO FEATURES */}
      <section id="features" style={{padding:'100px 24px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:'uppercase',color:'#7c6fff',marginBottom:12}}>Platform</div>
          <h2 style={{fontSize:'2.8rem',fontWeight:900,letterSpacing:'-1px',marginBottom:16}}>Everything built in. Nothing bolted on.</h2>
          <p style={{color:'#6b6b8a',fontSize:'1.05rem',maxWidth:520,margin:'0 auto',lineHeight:1.7}}>Stop stitching 10 tools together. Base88 is the complete platform — agents, database, automations, payments, and 50+ integrations.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(12,1fr)',gap:16}}>
          {/* Card 1 — Main hero card */}
          <div className="bento-card" style={{gridColumn:'span 7'}}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(124,111,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:20}}>🤖</div>
            <div style={{fontWeight:800,fontSize:'1.1rem',marginBottom:8,letterSpacing:'-.3px'}}>AI Agent Builder</div>
            <div style={{fontSize:14,color:'#6b6b8a',lineHeight:1.6,marginBottom:20}}>Create intelligent agents with memory and personality. Connect to WhatsApp, Telegram, Gmail, and 50+ integrations. Your agent works 24/7 — no babysitting needed.</div>
            <div style={{background:'rgba(0,0,0,0.3)',borderRadius:16,padding:20,border:'1px solid var(--border)'}}>
              <div style={{display:'flex',gap:10,marginBottom:12}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(124,111,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>👤</div>
                <div style={{background:'rgba(124,111,255,0.12)',border:'1px solid rgba(124,111,255,0.2)',borderRadius:12,padding:'10px 14px',fontSize:13,lineHeight:1.5}}>Build me a customer support agent for my online store</div>
              </div>
              <div style={{display:'flex',gap:10}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#7c6fff,#1ef5b0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>⚡</div>
                <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',borderRadius:12,padding:'10px 14px',fontSize:13,lineHeight:1.5}}>✅ Done! <strong>ShopBot</strong> is live with product knowledge, order tracking, refund handling, and WhatsApp integration.</div>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bento-card" style={{gridColumn:'span 5',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            <div>
              <div style={{width:52,height:52,borderRadius:16,background:'rgba(30,245,176,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:20}}>⚡</div>
              <div style={{fontWeight:800,fontSize:'1.1rem',marginBottom:8}}>60-Second Deploy</div>
              <div style={{fontSize:14,color:'#6b6b8a',lineHeight:1.6}}>From idea to live agent in under a minute. No servers, no DevOps, no config hell.</div>
            </div>
            <div style={{marginTop:24}}>
              <div style={{fontSize:'3.5rem',fontWeight:900,letterSpacing:'-2px',background:'linear-gradient(135deg,#7c6fff,#1ef5b0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>60s</div>
              <div style={{fontSize:14,color:'#6b6b8a'}}>average deploy time</div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bento-card" style={{gridColumn:'span 4'}}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(251,146,60,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:20}}>🗄️</div>
            <div style={{fontWeight:800,fontSize:'1.1rem',marginBottom:8}}>Built-in Database</div>
            <div style={{fontSize:14,color:'#6b6b8a',lineHeight:1.6}}>Every agent gets its own database. No SQL. No setup. Just define your data and go.</div>
          </div>
          {/* Card 4 */}
          <div className="bento-card" style={{gridColumn:'span 4'}}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(255,77,109,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:20}}>🔌</div>
            <div style={{fontWeight:800,fontSize:'1.1rem',marginBottom:8}}>50+ Integrations</div>
            <div style={{fontSize:14,color:'#6b6b8a',lineHeight:1.6}}>WhatsApp, Telegram, Gmail, Google Sheets, Slack, HitPay, PayNow, Stripe, and more.</div>
          </div>
          {/* Card 5 */}
          <div className="bento-card" style={{gridColumn:'span 4'}}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(56,189,248,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:20}}>📊</div>
            <div style={{fontWeight:800,fontSize:'1.1rem',marginBottom:8}}>Real-time Analytics</div>
            <div style={{fontSize:14,color:'#6b6b8a',lineHeight:1.6}}>See exactly what your agent does. Every message, every action, every outcome tracked live.</div>
          </div>
          {/* Card 6 — SG */}
          <div className="bento-card" style={{gridColumn:'span 6',background:'linear-gradient(135deg,rgba(124,111,255,0.1),rgba(30,245,176,0.05))'}}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(124,111,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:20}}>🇸🇬</div>
            <div style={{fontWeight:800,fontSize:'1.1rem',marginBottom:8}}>Built for Singapore</div>
            <div style={{fontSize:14,color:'#6b6b8a',lineHeight:1.6,marginBottom:20}}>HitPay, PayNow, SGD pricing, PDPA-compliant, hosted in Singapore. We understand local business.</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {['PayNow','HitPay','PDPA ✓','SG Servers','SGD'].map(l=>(
                <span key={l} className="feature-pill">{l}</span>
              ))}
            </div>
          </div>
          {/* Card 7 — Automations */}
          <div className="bento-card" style={{gridColumn:'span 6'}}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(30,245,176,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:20}}>🔁</div>
            <div style={{fontWeight:800,fontSize:'1.1rem',marginBottom:8}}>Automations That Work</div>
            <div style={{fontSize:14,color:'#6b6b8a',lineHeight:1.6,marginBottom:20}}>Schedule tasks, react to events, send messages — all without writing a single line of code.</div>
            <div style={{background:'rgba(0,0,0,0.3)',borderRadius:12,padding:14,border:'1px solid var(--border)'}}>
              <div style={{fontSize:11,color:'#1ef5b0',fontWeight:700,marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>Running Now</div>
              {['⏰ Daily report → every morning 9am','📧 New signup → welcome email sent','💳 Payment → update records instantly'].map(l=>(
                <div key={l} style={{fontSize:13,color:'#6b6b8a',marginBottom:4}}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{padding:'100px 24px',background:'linear-gradient(180deg,transparent,rgba(124,111,255,0.04),transparent)'}}>
        <div style={{maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:'uppercase',color:'#7c6fff',marginBottom:12}}>Testimonials</div>
          <h2 style={{fontSize:'2.5rem',fontWeight:900,letterSpacing:'-1px',marginBottom:48}}>Businesses that switched to Base88</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20}}>
            {[
              {text:'"We replaced 4 different tools with Base88. Our WhatsApp agent handles 80% of customer enquiries — without us lifting a finger."',name:'Ravi Sharma',role:'Founder, ShopSG',grad:'135deg,#7c6fff,#1ef5b0'},
              {text:'"Built a full booking system in 3 minutes. Customers book, pay via PayNow, and get confirmations automatically. Insane."',name:'Michelle Tan',role:'Owner, Bloom Studios',grad:'135deg,#ff6b35,#f7c948'},
              {text:'"Been using Base44 for a year. Switched to Base88 — it\'s faster, smarter, and the agents are actually intelligent. No going back."',name:'Kevin Lim',role:'CTO, NexusTech',grad:'135deg,#38bdf8,#818cf8'},
            ].map((t,i)=>(
              <div key={i} className="testi">
                <div style={{color:'#f59e0b',marginBottom:14,fontSize:14}}>★★★★★</div>
                <p style={{fontSize:15,lineHeight:1.7,marginBottom:20,color:'#e8e8f0'}}>{t.text}</p>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:42,height:42,borderRadius:'50%',background:`linear-gradient(${t.grad})`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16}}>{t.name[0]}</div>
                  <div><div style={{fontWeight:700,fontSize:14}}>{t.name}</div><div style={{fontSize:12,color:'#6b6b8a'}}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:'100px 24px',background:'linear-gradient(180deg,rgba(0,0,0,0),rgba(124,111,255,0.04),rgba(0,0,0,0))'}}>
        <div style={{maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:'uppercase',color:'#7c6fff',marginBottom:12}}>Pricing</div>
          <h2 style={{fontSize:'2.5rem',fontWeight:900,letterSpacing:'-1px',marginBottom:16}}>Start free. Scale when you're ready.</h2>
          <p style={{color:'#6b6b8a',fontSize:'1.05rem',maxWidth:480,margin:'0 auto 56px',lineHeight:1.7}}>No credit card required. Upgrade when your agent starts making money.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
            {[
              {key:'free',name:'Free',price:'S$0',period:'/mo',desc:'Try it out. No strings attached.',features:['1 agent','25 AI credits total','Community support'],noFeatures:['Payments','Integrations','Priority support'],pop:false},
              {key:'starter',name:'Starter',price:'S$29',period:'/mo',desc:'For solo founders and small teams.',features:['10 agents','5,000 AI credits/mo','HitPay + PayNow','WhatsApp + Telegram','Email support'],noFeatures:[],pop:false},
              {key:'pro',name:'Pro',price:'S$79',period:'/mo',desc:'For growing businesses serious about AI.',features:['100 agents','30,000 AI credits/mo','Custom domain','All integrations','Priority 24/7 support','GitHub export'],noFeatures:[],pop:true},
              {key:'agency',name:'Agency',price:'S$199',period:'/mo',desc:'For agencies building for clients.',features:['Unlimited agents','100,000 AI credits/mo','White-label','Dedicated support','Client management'],noFeatures:[],pop:false},
            ].map(p=>(
              <div key={p.key} className={`p-card${p.pop?' pop':''}`}>
                <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#6b6b8a',marginBottom:8}}>{p.name}</div>
                <div style={{fontSize:'2.8rem',fontWeight:900,letterSpacing:'-2px',lineHeight:1}}>{p.price}<span style={{fontSize:'1rem',fontWeight:400,color:'#6b6b8a'}}>{p.period}</span></div>
                <div style={{fontSize:13,color:'#6b6b8a',margin:'12px 0 24px',lineHeight:1.5}}>{p.desc}</div>
                <div style={{height:1,background:'var(--border)',marginBottom:24}} />
                {p.features.map(f=><div key={f} className="p-feat"><span>✓</span><span>{f}</span></div>)}
                {p.noFeatures.map(f=><div key={f} className="p-feat off"><span>✗</span><span>{f}</span></div>)}
                <Link href={`/auth/signup?plan=${p.key}`} className={p.pop?'btn-primary':'btn-ghost'} style={{width:'100%',justifyContent:'center',marginTop:24,padding:'12px 20px',fontSize:14}}>
                  {p.price==='S$0'?'Start free':p.pop?`Get ${p.name} →`:`Get started →`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'120px 24px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:400,background:'radial-gradient(ellipse,rgba(124,111,255,0.25) 0%,transparent 70%)',pointerEvents:'none'}} />
        <div style={{position:'relative',zIndex:1}}>
          <h2 style={{fontSize:'4rem',fontWeight:900,letterSpacing:'-2px',lineHeight:1.05,marginBottom:24}}>
            Your competitors are already<br/>
            <span className="grad-text">using AI agents</span>
          </h2>
          <p style={{fontSize:'1.1rem',color:'#6b6b8a',maxWidth:480,margin:'0 auto 48px',lineHeight:1.7}}>Don't get left behind. Build your first agent in 60 seconds — no credit card, no code, no excuses.</p>
          <Link href="/auth/signup" className="btn-primary" style={{padding:'18px 48px',fontSize:'1.1rem',boxShadow:'0 0 80px rgba(124,111,255,0.5)'}}>
            Build your agent free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid var(--border)',padding:'60px 48px 40px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:48,marginBottom:48}}>
            <div>
              <div style={{fontWeight:900,fontSize:'1.4rem',background:'linear-gradient(135deg,#7c6fff,#1ef5b0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:12}}>Base88</div>
              <p style={{color:'#6b6b8a',fontSize:13,lineHeight:1.6,maxWidth:240}}>The world's most powerful AI agent builder. Built for businesses that refuse to be average.</p>
            </div>
            {[
              {title:'Product',links:[['Features','#features'],['Pricing','#pricing'],['Get started','/auth/signup'],['Login','/auth/login']]},
              {title:'Compare',links:[['vs Base44','#'],['vs Famous.ai','#'],['vs Bubble','#'],['vs Zapier','#']]},
              {title:'Company',links:[['About','#'],['Blog','#'],['Privacy','#'],['Terms','#']]},
            ].map(col=>(
              <div key={col.title}>
                <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#6b6b8a',marginBottom:16}}>{col.title}</div>
                {col.links.map(([label,href])=>(
                  <a key={label} href={href} style={{display:'block',fontSize:14,color:'#6b6b8a',marginBottom:8,textDecoration:'none',transition:'color .15s'}} onMouseEnter={e=>(e.currentTarget.style.color='#e8e8f0')} onMouseLeave={e=>(e.currentTarget.style.color='#6b6b8a')}>{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid var(--border)',paddingTop:24,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
            <p style={{fontSize:13,color:'#6b6b8a'}}>© 2026 Base88. Built in Singapore 🇸🇬 — Powered by obsession.</p>
            <p style={{fontSize:12,color:'#6b6b8a'}}>Proudly crushing every competitor, one agent at a time 💪</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

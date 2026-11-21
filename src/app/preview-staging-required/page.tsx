import Link from 'next/link'

export default function StagingNotReady() {
  return <main className="min-h-screen flex items-center justify-center px-6 py-16"
    style={{background:'linear-gradient(140deg,#0b1020,#182238)',color:'#f3f5ff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <section style={{maxWidth:640,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.13)',
      borderRadius:24,padding:'clamp(24px,5vw,46px)'}}>
      <p style={{color:'#8ce5c7',fontSize:13,fontWeight:800,letterSpacing:'1.4px',marginBottom:16}}>BASE88 / PRIVATE PREVIEW</p>
      <h1 style={{fontSize:'clamp(30px,5vw,48px)',lineHeight:1.12,marginBottom:20}}>Private features are temporarily locked.</h1>
      <p style={{fontSize:17,color:'#b9c8dc',lineHeight:1.75}}>
        This preview has not been connected to a separate staging database. To protect existing accounts,
        sign-in, business storage, inboxes and private engine controls are intentionally unavailable here.
      </p>
      <p style={{fontSize:15,color:'#aebed3',lineHeight:1.7,marginTop:16}}>
        You can still use Surprise Me to generate business ideas, draft products, websites and downloadable launch packs without an account.
      </p>
      <Link href="/surprise-me" style={{display:'inline-block',marginTop:26,padding:'13px 20px',
        borderRadius:12,background:'#7467f4',fontWeight:800,color:'#fff',textDecoration:'none'}}>Explore Surprise Me</Link>
      <p style={{fontSize:13,color:'#8a9bb5',marginTop:26}}>No production database migration or customer data modification has been performed.</p>
    </section>
  </main>
}

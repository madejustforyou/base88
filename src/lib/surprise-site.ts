/** Self-contained, script-free, offline starter site. Not a published business. */
export type StarterSiteInput = {
  name: string
  tagline: string
  audience: string
  problem: string
  firstProduct: string
  price: string
  freeTool: string
  risk: string
}
const escapeText = (value: string) => String(value)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;')

export function generateStarterSite(idea: StarterSiteInput): string {
  const name = escapeText(idea.name.slice(0,120))
  const tagline = escapeText(idea.tagline.slice(0,220))
  const audience = escapeText(idea.audience.slice(0,300))
  const problem = escapeText(idea.problem.slice(0,1200))
  const product = escapeText(idea.firstProduct.slice(0,1200))
  const price = escapeText(idea.price.slice(0,80))
  const tool = escapeText(idea.freeTool.slice(0,180))
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<meta name="color-scheme" content="dark"/>
<title>${name} — Starter preview</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#09131c;color:#edf5f9}
*{box-sizing:border-box} body{margin:0} a{color:inherit} main{max-width:1080px;margin:auto;padding:0 24px}
header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;border-bottom:1px solid #31404a;gap:12px}
.logo{font-weight:900;font-size:23px;color:#8be7c7}
.pill{display:inline-block;border-radius:100px;background:#1d3a3e;border:1px solid #3c7770;color:#98e6d6;font-size:12px;font-weight:800;padding:9px 13px}
.hero{padding:100px 0 88px}h1{font-size:clamp(40px,6vw,72px);line-height:1.05;letter-spacing:-2px;margin:22px 0}
p{line-height:1.75;color:#bac9d2} .hero p{font-size:20px;max-width:740px}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.action{display:inline-block;background:#91eacc;color:#10262a;padding:15px 22px;font-weight:800;border-radius:12px;text-decoration:none}
.action.secondary{background:#233944;color:#eaf5ff;border:1px solid #55747d}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));gap:18px;margin-bottom:80px}
.card{padding:30px;border-radius:20px;border:1px solid #344755;background:#132635}
.card h2{font-size:23px;margin:0 0 14px}.card p{font-size:16px}
.price{font-size:34px;font-weight:900;color:#9fe9d5}
footer{border-top:1px solid #344755;padding:26px 24px;margin-top:55px;font-size:13px;color:#a6bdcb;text-align:center}
@media(max-width:600px){.hero{padding:65px 0}header{padding:18px 20px}}
</style></head><body>
<header><span class="logo">${name}</span><span class="pill">Starter site preview</span></header>
<main>
<section class="hero"><span class="pill">For ${audience}</span>
<h1>${tagline}</h1><p>${problem}</p>
<div class="actions"><a class="action" href="#product">Explore the product</a><a class="action secondary" href="#about">How it helps</a></div></section>
<section class="cards" id="about">
<article class="card"><h2>The problem we solve</h2><p>${problem}</p></article>
<article class="card"><h2>Start with something free</h2><p>${tool}</p>
<p>This free feature is planned; it is not yet available in this site preview.</p></article>
</section>
<section class="cards" id="product">
<article class="card"><span class="pill">First offer</span><h2 style="margin-top:16px">A practical starter product</h2><p>${product}</p>
<p class="price">${price}</p><p>Checkout is not connected. No payments can be taken from this preview.</p></article>
<article class="card"><h2>Questions or early access?</h2>
<p>Customer inbox and contact form will be added after verified business setup. No message is sent by this page.</p>
<p>Brand, business claims and availability must be independently verified before launch.</p></article>
</section>
</main><footer>Illustrative prelaunch concept. No merchant, inbox, booking or payment integration is active.</footer>
</body></html>`
}

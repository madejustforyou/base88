import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: 'S$0',
    period: '/month',
    description: 'Perfect for exploring',
    features: ['1 app', '100 credits/month', 'Basic components', 'Community support'],
    cta: 'Get Started Free',
    href: '/auth/signup?plan=free',
    highlight: false,
  },
  {
    name: 'Starter',
    price: 'S$29',
    period: '/month',
    description: 'For individuals & freelancers',
    features: ['5 apps', '2,000 credits/month', 'All components', 'Email support', 'Custom domains'],
    cta: 'Start Starter',
    href: '/auth/signup?plan=starter',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'S$79',
    period: '/month',
    description: 'For growing businesses',
    features: ['25 apps', '10,000 credits/month', 'All components', 'Priority support', 'Custom domains', 'Team collaboration'],
    cta: 'Start Pro',
    href: '/auth/signup?plan=pro',
    highlight: true,
  },
  {
    name: 'Agency',
    price: 'S$299',
    period: '/month',
    description: 'For agencies & enterprises',
    features: ['Unlimited apps', '50,000 credits/month', 'White-label', 'Dedicated support', 'Custom domains', 'Team collaboration', 'SLA guarantee'],
    cta: 'Start Agency',
    href: '/auth/signup?plan=agency',
    highlight: false,
  },
]

const features = [
  { icon: '🤖', title: 'AI App Builder', desc: 'Describe your app in plain English. Our AI generates a complete, working full-stack app with database, logic, and UI — in seconds.' },
  { icon: '🗄️', title: 'Built-in Database', desc: 'Every app comes with a fully managed database. Create entities, relationships, and run queries — no SQL needed.' },
  { icon: '⚡', title: 'Automations & CRON', desc: 'Schedule tasks, trigger workflows, and connect to 30+ integrations. Your app runs on autopilot.' },
  { icon: '💳', title: 'HitPay Payments', desc: 'Accept payments from Singapore customers with HitPay built right in. PayNow, cards, and more — zero setup.' },
  { icon: '🌐', title: 'Custom Domains', desc: 'Launch your app on your own domain. Free SSL, Cloudflare-backed, always fast.' },
  { icon: '🔒', title: 'User Auth & Security', desc: 'Login, signup, roles, and row-level security — all handled for you out of the box.' },
]

const faqs = [
  { q: 'Do I need to know how to code?', a: 'No coding required. Just describe what you want to build in plain English and Base88 generates it for you.' },
  { q: 'Is Base88 built for Singapore?', a: 'Yes. Base88 is built in Singapore with HitPay payments, SGD pricing, and local business needs in mind.' },
  { q: 'How fast can I launch an app?', a: 'Most apps are ready in under 5 minutes. The AI generates your database, UI, and logic instantly.' },
  { q: 'Can I connect it to my existing tools?', a: 'Yes. Base88 connects to Google Workspace, Slack, WhatsApp, Stripe, Notion, and 30+ more integrations.' },
  { q: 'What happens when I reach my credit limit?', a: 'Upgrade your plan anytime. Credits reset monthly and unused credits do not roll over.' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 sticky top-0 z-50 bg-gray-950/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">88</div>
          <span className="text-white font-semibold text-lg">Base88</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors hidden md:block">Features</a>
          <a href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors hidden md:block">Pricing</a>
          <a href="#faq" className="text-gray-400 hover:text-white text-sm transition-colors hidden md:block">FAQ</a>
          <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-semibold">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-4 py-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-8">
          🚀 Singapore&apos;s #1 AI App Builder
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Build Web Apps with AI.<br />
          <span className="text-blue-500">No Code. No Limits.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Base88 is Singapore&apos;s AI-powered no-code app builder. Describe your app — we generate a full-stack application with database, automations, and payments in minutes.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
            Start Building Free →
          </Link>
          <a href="#features" className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
            See How It Works
          </a>
        </div>
        <p className="text-gray-500 text-sm mt-6">Free forever plan • No credit card required • Launch in minutes</p>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-white/10 py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 flex-wrap text-center text-sm text-gray-400">
          <span>⭐ 4.9/5 rating</span>
          <span>🏢 500+ Singapore businesses</span>
          <span>🚀 10,000+ apps built</span>
          <span>⚡ Launch in under 5 minutes</span>
          <span>🇸🇬 Made in Singapore</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Everything You Need to Build & Launch</h2>
        <p className="text-gray-400 text-center mb-16 text-lg max-w-2xl mx-auto">Base88 gives you a complete platform — from AI app generation to database, payments, and automations. All in one place.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white/3 border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-center mb-16 text-lg">Start free. Upgrade when you grow. Cancel anytime.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 border ${plan.highlight ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/3'} flex flex-col`}>
                {plan.highlight && <div className="text-blue-400 text-xs font-bold uppercase mb-3 tracking-wider">Most Popular</div>}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-green-400">✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`text-center py-3 rounded-xl font-semibold transition-colors ${plan.highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'border border-white/20 hover:border-white/40 text-white'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center bg-blue-600/10 border-y border-blue-500/20">
        <h2 className="text-4xl font-bold mb-4">Ready to Build Your App?</h2>
        <p className="text-gray-400 mb-8 text-lg">Join 500+ Singapore businesses already using Base88. Start free today.</p>
        <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors inline-block">
          Start Building Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xs">88</div>
              <span className="font-semibold">Base88</span>
            </div>
            <p className="text-gray-500 text-sm">Singapore&apos;s AI-powered no-code app builder.</p>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-gray-500 text-xs">
          © 2026 Base88. All rights reserved. | Singapore&apos;s #1 AI App Builder | No-Code Platform SG
        </div>
      </footer>
    </main>
  )
}

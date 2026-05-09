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

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">88</div>
          <span className="text-white font-semibold text-lg">Base88</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-4 py-24">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-8">
          ✨ AI-powered app builder
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Build apps with AI.<br />
          <span className="text-blue-500">Ship in minutes.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Base88 is the no-code platform that turns your ideas into full-stack apps using AI. No coding required.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
            Start Building Free
          </Link>
          <Link href="#pricing" className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: 'AI-Powered', desc: 'Describe your app and watch AI build it for you in seconds.' },
            { icon: '🗄️', title: 'Built-in Database', desc: 'Full database with CRUD, automations, and real-time updates.' },
            { icon: '🔗', title: '50+ Integrations', desc: 'Connect Google, Slack, Stripe, and 50+ other services instantly.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-400 text-lg">Start free. Scale as you grow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl p-6 border ${plan.highlight ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</div>
              )}
              <div className="mb-6">
                <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'border border-white/20 hover:border-white/40 text-white'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Base88. Built in Singapore 🇸🇬</p>
      </footer>
    </main>
  )
}

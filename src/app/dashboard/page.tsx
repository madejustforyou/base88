'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth/login')
      else { setUser(data.user); setLoading(false) }
    })
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">88</div>
          <span className="text-white font-semibold">Base88</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button onClick={handleSignOut} className="text-gray-400 hover:text-white text-sm transition-colors">Sign out</button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.user_metadata?.full_name || user?.email} 👋</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Apps', value: '0', icon: '📱' },
            { label: 'Credits Used', value: '0 / 100', icon: '⚡' },
            { label: 'Plan', value: user?.user_metadata?.plan || 'Free', icon: '💎' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Create App CTA */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-xl font-bold text-white mb-2">Build your first app</h2>
          <p className="text-gray-400 mb-6">Describe what you want to build and AI will create it for you.</p>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            + New App
          </button>
        </div>
      </div>
    </div>
  )
}

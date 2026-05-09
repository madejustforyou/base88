import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, company, use_case } = body
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
    const supabase = getServerSupabase()
    const { data, error } = await supabase.from('waitlist').insert([{ email, name, company, use_case, created_at: new Date().toISOString() }])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

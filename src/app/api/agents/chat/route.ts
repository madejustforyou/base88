import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { agentId, message, systemPrompt, userId } = await req.json()
    if (!message) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 })

    const sysPrompt = systemPrompt || 'You are a helpful AI assistant.'
    const fullSystem = `${sysPrompt}\n\nDate: ${new Date().toISOString().split('T')[0]}\nPlatform: Base88`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: fullSystem,
        messages: [{ role: 'user', content: message }],
      }),
    })

    const data = await res.json()
    const reply = data.content?.[0]?.text || data.error?.message || 'No response'
    return NextResponse.json({ ok: true, reply })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

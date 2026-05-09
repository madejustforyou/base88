import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'base88', timestamp: new Date().toISOString() })
}

import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: Request) {
  const token = req.headers.get('authorization')
  const user = await getUserFromToken(token)

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { passwordHash: _, ...safeUser } = user
  return NextResponse.json({ data: safeUser })
}

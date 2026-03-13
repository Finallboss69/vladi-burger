import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { passwordHash: _, ...safeUser } = user
  return NextResponse.json({ data: safeUser })
}

export async function PATCH(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const allowedFields = ['name', 'phone', 'avatarUrl']
  const data: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field]
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  })

  const { passwordHash: _, ...safeUser } = updated
  return NextResponse.json({ data: safeUser })
}

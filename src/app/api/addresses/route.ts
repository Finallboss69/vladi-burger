import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
  })
  return NextResponse.json({ data: addresses })
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const address = await prisma.address.create({
    data: { ...body, userId: user.id },
  })

  return NextResponse.json({ data: address }, { status: 201 })
}

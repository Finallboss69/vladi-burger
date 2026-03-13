import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ data: coupons })
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      discount: body.discount,
      isPercent: body.isPercent ?? true,
      minOrder: body.minOrder ?? 0,
      maxUses: body.maxUses ?? 100,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  })

  return NextResponse.json({ data: coupon }, { status: 201 })
}

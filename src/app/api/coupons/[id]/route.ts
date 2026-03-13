import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const coupon = await prisma.coupon.update({ where: { id }, data: body })
  return NextResponse.json({ data: coupon })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ data: { deleted: true } })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, extras: true, comboItems: true },
  })

  if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ data: product })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { extras, comboItems, ...productData } = body

  // Delete old extras/combos and recreate
  await prisma.productExtra.deleteMany({ where: { productId: id } })
  await prisma.comboItem.deleteMany({ where: { productId: id } })

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      extras: extras?.length ? { create: extras } : undefined,
      comboItems: comboItems?.length ? { create: comboItems } : undefined,
    },
    include: { category: true, extras: true, comboItems: true },
  })

  return NextResponse.json({ data: product })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const product = await prisma.product.update({
    where: { id },
    data: body,
    include: { category: true, extras: true, comboItems: true },
  })

  return NextResponse.json({ data: product })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ data: { deleted: true } })
}

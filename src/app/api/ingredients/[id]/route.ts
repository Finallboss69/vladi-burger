import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, price, type, imageUrl, isActive } = body

  const existing = await prisma.ingredient.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 })
  }

  const validTypes = ['BUN', 'MEAT', 'CHEESE', 'VEGETABLE', 'SAUCE', 'TOPPING']
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: 'Tipo invalido' }, { status: 400 })
  }

  const ingredient = await prisma.ingredient.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price: Number(price) }),
      ...(type !== undefined && { type }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json({ data: ingredient })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.ingredient.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 })
  }

  const ingredient = await prisma.ingredient.update({
    where: { id },
    data: {
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
    },
  })

  return NextResponse.json({ data: ingredient })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.ingredient.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 })
  }

  await prisma.ingredient.delete({ where: { id } })
  return NextResponse.json({ data: { success: true } })
}

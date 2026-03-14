import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')

  const ingredients = await prisma.ingredient.findMany({
    where: all === 'true' ? {} : { isActive: true },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ data: ingredients })
}

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { name, price, type, imageUrl, isActive } = body

  if (!name || price === undefined || !type) {
    return NextResponse.json({ error: 'Nombre, precio y tipo son requeridos' }, { status: 400 })
  }

  const validTypes = ['BUN', 'MEAT', 'CHEESE', 'VEGETABLE', 'SAUCE', 'TOPPING']
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'Tipo invalido' }, { status: 400 })
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      name,
      price: Number(price),
      type,
      imageUrl: imageUrl || null,
      isActive: isActive !== false,
    },
  })

  return NextResponse.json({ data: ingredient }, { status: 201 })
}

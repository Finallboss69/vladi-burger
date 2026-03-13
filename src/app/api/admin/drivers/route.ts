import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, hashPassword } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const drivers = await prisma.user.findMany({
    where: { role: 'DELIVERY' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
      deliveryOrders: {
        where: { status: { in: ['DELIVERING', 'READY'] } },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const data = drivers.map(({ deliveryOrders, ...driver }) => ({
    ...driver,
    activeOrderCount: deliveryOrders.length,
  }))

  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { name, email, password, phone } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const driver = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        role: 'DELIVERY',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ data: driver }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Error creando conductor', detail: String(e) }, { status: 500 })
  }
}

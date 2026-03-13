import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { sendOrderStatusUpdate } from '@/lib/email'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      address: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      review: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  if (user.role === 'CUSTOMER' && order.userId !== user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  return NextResponse.json({
    data: {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        extras: item.extras ? JSON.parse(item.extras) : [],
        customIngredients: item.customIngredients ? JSON.parse(item.customIngredients) : undefined,
      })),
    },
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || (user.role !== 'ADMIN' && user.role !== 'KITCHEN')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: { include: { product: true } },
      address: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  })

  // Fire-and-forget status update email
  if (order.user) {
    sendOrderStatusUpdate({
      to: order.user.email,
      customerName: order.user.name,
      orderNumber: order.orderNumber,
      status,
    }).catch(() => {})
  }

  return NextResponse.json({
    data: {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        extras: item.extras ? JSON.parse(item.extras) : [],
      })),
    },
  })
}

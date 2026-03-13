import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { createPreference } from '@/lib/mercadopago'

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const preference = await createPreference({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: order.total,
    })

    return NextResponse.json({
      data: {
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'Error creando preferencia de pago', detail: String(e) },
      { status: 500 },
    )
  }
}

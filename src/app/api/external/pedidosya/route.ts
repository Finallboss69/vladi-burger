import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RESTAURANT } from '@/lib/config'

// ─── Tipos para el payload de PedidosYa ───

interface PedidosYaItem {
  name: string
  quantity: number
  price: number
  notes?: string
}

interface PedidosYaOrderPayload {
  externalId: string
  customer: {
    name: string
    phone?: string
    address?: string
  }
  items: PedidosYaItem[]
  total: number
  deliveryNotes?: string
  paymentMethod?: string
}

// ─── Health check ───

export async function GET() {
  return NextResponse.json({ status: 'ok', platform: 'pedidosya' })
}

// ─── Recibir orden desde PedidosYa ───

export async function POST(req: Request) {
  try {
    // Validar webhook secret
    const secret = req.headers.get('X-Webhook-Secret')
    const expectedSecret = process.env.PEDIDOSYA_WEBHOOK_SECRET

    if (!expectedSecret) {
      console.error('[PedidosYa Webhook] PEDIDOSYA_WEBHOOK_SECRET no configurado')
      return NextResponse.json(
        { error: 'Webhook no configurado' },
        { status: 503 }
      )
    }

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Secret inválido' },
        { status: 401 }
      )
    }

    // Parsear y validar body
    const body: PedidosYaOrderPayload = await req.json()

    if (!body.externalId || !body.items?.length || !body.total) {
      return NextResponse.json(
        { error: 'Payload inválido: se requiere externalId, items y total' },
        { status: 400 }
      )
    }

    // Buscar o crear usuario "guest" para pedidos externos
    const guestUser = await prisma.user.upsert({
      where: { email: `external@${RESTAURANT.email.split('@')[1]}` },
      create: {
        email: `external@${RESTAURANT.email.split('@')[1]}`,
        name: 'Pedidos Externos',
        passwordHash: '', // Sin acceso por login
        role: 'CUSTOMER',
      },
      update: {},
    })

    // Calcular subtotal a partir de los items
    const subtotal = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Generar número de orden (siguiente al último)
    const lastOrder = await prisma.order.findFirst({
      orderBy: { orderNumber: 'desc' },
    })
    const orderNumber = (lastOrder?.orderNumber ?? 1000) + 1

    // Armar notas combinando info del cliente y notas de delivery
    const notesParts: string[] = []
    if (body.externalId) notesParts.push(`PedidosYa ID: ${body.externalId}`)
    if (body.customer?.name) notesParts.push(`Cliente: ${body.customer.name}`)
    if (body.customer?.phone) notesParts.push(`Tel: ${body.customer.phone}`)
    if (body.customer?.address) notesParts.push(`Dir: ${body.customer.address}`)
    if (body.deliveryNotes) notesParts.push(`Notas: ${body.deliveryNotes}`)
    if (body.paymentMethod) notesParts.push(`Pago: ${body.paymentMethod}`)

    // Crear la orden en la base de datos
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: guestUser.id,
        status: 'CONFIRMED',
        subtotal,
        discount: 0,
        total: body.total,
        deliveryType: 'DELIVERY',
        notes: notesParts.join(' | '),
        source: 'PEDIDOSYA',
        items: {
          create: body.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            extras: item.notes ? JSON.stringify([{ note: item.notes }]) : null,
            isCustom: false,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    console.log(`[PedidosYa Webhook] Orden #${orderNumber} creada (ext: ${body.externalId})`)

    return NextResponse.json({
      data: order,
      externalId: body.externalId,
      orderNumber,
    })
  } catch (e) {
    console.error('[PedidosYa Webhook] Error procesando orden:', e)
    return NextResponse.json(
      { error: 'Error procesando orden de PedidosYa', detail: String(e) },
      { status: 500 }
    )
  }
}

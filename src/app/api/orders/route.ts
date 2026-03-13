import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { sendOrderConfirmation } from '@/lib/email'

export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const limit = parseInt(url.searchParams.get('limit') ?? '50')
  const driverId = url.searchParams.get('driverId')

  const where: Record<string, unknown> = {}

  // Admin/Kitchen see all, customers see only their own
  if (user.role === 'CUSTOMER') {
    where.userId = user.id
  } else if (user.role === 'DELIVERY') {
    where.deliveryDriverId = user.id
  }

  if (status) {
    where.status = { in: status.split(',') }
  }

  if (driverId) {
    where.deliveryDriverId = driverId
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      address: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      review: true,
      deliveryDriver: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  // Parse JSON fields
  const data = orders.map((o) => ({
    ...o,
    items: o.items.map((item) => ({
      ...item,
      extras: item.extras ? JSON.parse(item.extras) : [],
      customIngredients: item.customIngredients ? JSON.parse(item.customIngredients) : undefined,
    })),
  }))

  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const { items, couponCode, deliveryType, addressId, scheduledAt, notes } = body

    // Calculate totals
    let subtotal = 0
    for (const item of items) {
      const extraTotal = (item.extras ?? []).reduce((sum: number, e: { price: number }) => sum + e.price, 0)
      subtotal += (item.price + extraTotal) * item.quantity
    }

    // Apply coupon
    let discount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (coupon && coupon.isActive && coupon.usedCount < coupon.maxUses && subtotal >= coupon.minOrder) {
        discount = coupon.isPercent ? Math.round(subtotal * coupon.discount / 100) : coupon.discount
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
      }
    }

    const total = subtotal - discount

    // Generate order number
    const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: 'desc' } })
    const orderNumber = (lastOrder?.orderNumber ?? 1000) + 1

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'PENDING',
        subtotal,
        discount,
        total,
        couponCode: couponCode || null,
        deliveryType: deliveryType || 'DELIVERY',
        addressId: addressId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        notes: notes || null,
        pointsEarned: 0,
        source: 'WEB',
        items: {
          create: items.map((item: { productId?: string; name: string; price: number; quantity: number; extras?: unknown[]; isCustom?: boolean; customIngredients?: unknown[]; notes?: string }) => ({
            productId: item.productId || null,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            extras: item.extras?.length ? JSON.stringify(item.extras) : null,
            isCustom: item.isCustom ?? false,
            customIngredients: item.customIngredients?.length ? JSON.stringify(item.customIngredients) : null,
            notes: item.notes ?? null,
          })),
        },
      },
      include: {
        items: true,
        address: true,
      },
    })

    // Decrease stock
    for (const item of items) {
      if (item.productId) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        if (product && product.stock > 0) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }
    }

    // Award stamp card stamps for qualifying purchases
    try {
      const stampConfig = await prisma.stampConfig.findFirst({ where: { isActive: true } })
      if (stampConfig) {
        // Count qualifying items (matching category or all burgers if no category set)
        let qualifyingCount = 0
        for (const item of items) {
          if (item.productId) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } })
            if (product) {
              const matches = stampConfig.categoryId
                ? product.categoryId === stampConfig.categoryId
                : true
              if (matches) {
                qualifyingCount += item.quantity
              }
            }
          }
        }

        if (qualifyingCount > 0) {
          await prisma.stampCard.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              stamps: qualifyingCount,
              lastStampAt: new Date(),
            },
            update: {
              stamps: { increment: qualifyingCount },
              lastStampAt: new Date(),
            },
          })
        }
      }
    } catch {
      // Stamp card errors should not block order creation
    }

    // Fire-and-forget order confirmation email
    sendOrderConfirmation({
      to: user.email,
      customerName: user.name,
      orderNumber,
      items: items.map((item: { name: string; price: number; quantity: number }) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
    }).catch(() => {})

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Error creando orden', detail: String(e) }, { status: 500 })
  }
}

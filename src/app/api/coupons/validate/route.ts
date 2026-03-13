import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { code, subtotal } = await req.json()

  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: 'Cupón inválido' }, { status: 404 })
  }

  if (coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: 'Cupón agotado' }, { status: 410 })
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Cupón vencido' }, { status: 410 })
  }

  if (subtotal && subtotal < coupon.minOrder) {
    return NextResponse.json({ error: `Pedido mínimo: $${coupon.minOrder}` }, { status: 400 })
  }

  const discount = coupon.isPercent ? Math.round((subtotal ?? 0) * coupon.discount / 100) : coupon.discount

  return NextResponse.json({
    data: {
      code: coupon.code,
      discount,
      isPercent: coupon.isPercent,
      discountValue: coupon.discount,
    },
  })
}

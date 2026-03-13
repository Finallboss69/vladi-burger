import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET /api/stamps - Get current user's stamp card + config
export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const config = await prisma.stampConfig.findFirst({ where: { isActive: true } })
  if (!config) {
    return NextResponse.json({ data: { config: null, card: null } })
  }

  let card = await prisma.stampCard.findUnique({ where: { userId: user.id } })
  if (!card) {
    card = await prisma.stampCard.create({
      data: { userId: user.id, stamps: 0 },
    })
  }

  return NextResponse.json({
    data: {
      config: {
        stampsRequired: config.stampsRequired,
        prizeName: config.prizeName,
        prizeDescription: config.prizeDescription,
        prizeDiscount: config.prizeDiscount,
      },
      card: {
        stamps: card.stamps,
        completed: card.completed,
        lastStampAt: card.lastStampAt,
      },
      canRedeem: card.stamps >= config.stampsRequired,
    },
  })
}

// POST /api/stamps - Redeem stamp card prize
export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const config = await prisma.stampConfig.findFirst({ where: { isActive: true } })
  if (!config) return NextResponse.json({ error: 'Programa no disponible' }, { status: 404 })

  const card = await prisma.stampCard.findUnique({ where: { userId: user.id } })
  if (!card || card.stamps < config.stampsRequired) {
    return NextResponse.json({ error: 'No tenés suficientes sellos' }, { status: 400 })
  }

  // Reset stamps and increment completed count
  const updated = await prisma.stampCard.update({
    where: { userId: user.id },
    data: {
      stamps: card.stamps - config.stampsRequired,
      completed: { increment: 1 },
    },
  })

  // Create a special coupon for the prize
  const code = `STAMP${user.id.slice(-4).toUpperCase()}${Date.now().toString(36).toUpperCase()}`
  await prisma.coupon.create({
    data: {
      code,
      discount: config.prizeDiscount,
      isPercent: true,
      minOrder: 0,
      maxUses: 1,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  })

  return NextResponse.json({
    data: {
      redeemed: true,
      couponCode: code,
      prizeName: config.prizeName,
      stampsRemaining: updated.stamps,
      timesCompleted: updated.completed,
    },
  })
}

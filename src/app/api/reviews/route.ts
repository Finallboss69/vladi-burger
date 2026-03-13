import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET /api/reviews — public: get latest reviews for homepage
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '6', 10), 20)

    const reviews = await prisma.orderReview.findMany({
      where: { rating: { gte: 3 } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    })

    // Calculate average rating
    const stats = await prisma.orderReview.aggregate({
      _avg: { rating: true },
      _count: true,
    })

    return NextResponse.json({
      data: {
        reviews,
        avgRating: Math.round((stats._avg.rating ?? 0) * 10) / 10,
        totalReviews: stats._count,
      },
    })
  } catch (err) {
    console.error('Reviews GET error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/reviews — auth: create a review for a delivered order
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { orderId, rating, comment } = await req.json()

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'orderId y rating (1-5) son obligatorios' },
        { status: 400 },
      )
    }

    // Verify order belongs to user and is delivered
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id, status: 'DELIVERED' },
      include: { review: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado o no entregado' },
        { status: 404 },
      )
    }

    if (order.review) {
      return NextResponse.json(
        { error: 'Ya dejaste una resena para este pedido' },
        { status: 409 },
      )
    }

    const review = await prisma.orderReview.create({
      data: {
        orderId,
        userId: user.id,
        rating: Math.round(rating),
        comment: comment?.trim() || null,
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json({ data: review }, { status: 201 })
  } catch (err) {
    console.error('Reviews POST error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

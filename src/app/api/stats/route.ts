import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalOrders, totalCustomers, avgRating] = await Promise.all([
    prisma.order.count({
      where: { status: { notIn: ['CANCELLED'] } },
    }),
    prisma.user.count({
      where: { role: 'CUSTOMER' },
    }),
    prisma.orderReview.aggregate({
      _avg: { rating: true },
    }),
  ])

  // Calculate total burgers sold (sum of all order item quantities)
  const burgersSold = await prisma.orderItem.aggregate({
    _sum: { quantity: true },
    where: {
      order: { status: { notIn: ['CANCELLED'] } },
    },
  })

  return NextResponse.json({
    data: {
      burgersSold: burgersSold._sum.quantity ?? 0,
      avgRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 0,
      totalCustomers,
      totalOrders,
    },
  })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    todayAgg,
    weekAgg,
    monthAgg,
    activeCustomers,
    reviewsAgg,
    popularProducts,
    sourceCountsRaw,
  ] = await Promise.all([
    // Today's orders — aggregate count + sum in DB
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfDay } },
      _count: true,
      _sum: { total: true },
    }),
    // Week's orders
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfWeek } },
      _count: true,
      _sum: { total: true },
    }),
    // Month's orders
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _count: true,
      _sum: { total: true },
    }),
    // Active customers
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    // Reviews avg
    prisma.orderReview.aggregate({ _avg: { rating: true } }),
    // Popular products — groupBy in DB instead of loading all items
    prisma.orderItem.groupBy({
      by: ['name'],
      where: { order: { createdAt: { gte: startOfMonth } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    // Orders by source — groupBy in DB
    prisma.order.groupBy({
      by: ['source'],
      where: { createdAt: { gte: startOfMonth } },
      _count: true,
    }),
  ])

  // Revenue by day of week — 7 lightweight aggregate queries in parallel
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const revenueByDay = await Promise.all(
    dayNames.map(async (day, i) => {
      const dayStart = new Date(startOfWeek)
      dayStart.setDate(dayStart.getDate() + i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      const agg = await prisma.order.aggregate({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
        _sum: { total: true },
      })
      return { day, value: agg._sum.total ?? 0 }
    }),
  )

  // Format source counts
  const sourceMap: Record<string, number> = {}
  for (const s of sourceCountsRaw) {
    sourceMap[s.source] = s._count
  }
  const ordersBySource = [
    { source: 'WEB', label: 'Web', count: sourceMap['WEB'] ?? 0, color: '#FF6B35' },
    { source: 'RAPPI', label: 'Rappi', count: sourceMap['RAPPI'] ?? 0, color: '#D62828' },
    { source: 'PEDIDOSYA', label: 'PedidosYa', count: sourceMap['PEDIDOSYA'] ?? 0, color: '#F5CB5C' },
  ]

  return NextResponse.json({
    data: {
      ordersToday: todayAgg._count,
      ordersWeek: weekAgg._count,
      ordersMonth: monthAgg._count,
      revenueToday: todayAgg._sum.total ?? 0,
      revenueWeek: weekAgg._sum.total ?? 0,
      revenueMonth: monthAgg._sum.total ?? 0,
      avgRating: reviewsAgg._avg.rating ?? 0,
      activeCustomers,
      popularProducts: popularProducts.map((p) => ({
        name: p.name,
        count: p._sum.quantity ?? 0,
      })),
      ordersBySource,
      revenueByDay,
    },
  })
}

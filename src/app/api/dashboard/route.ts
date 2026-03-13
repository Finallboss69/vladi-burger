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

  const [ordersToday, allOrders, activeCustomers, reviews] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: startOfDay } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: startOfMonth } },
      include: { items: true },
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.orderReview.aggregate({ _avg: { rating: true } }),
  ])

  const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0)
  const weekOrders = allOrders.filter((o) => new Date(o.createdAt) >= startOfWeek)
  const revenueWeek = weekOrders.reduce((sum, o) => sum + o.total, 0)
  const revenueMonth = allOrders.reduce((sum, o) => sum + o.total, 0)

  // Popular products
  const productCounts: Record<string, number> = {}
  for (const order of allOrders) {
    for (const item of order.items) {
      productCounts[item.name] = (productCounts[item.name] ?? 0) + item.quantity
    }
  }
  const popularProducts = Object.entries(productCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Orders by source
  const sourceCounts: Record<string, number> = {}
  for (const order of allOrders) {
    sourceCounts[order.source] = (sourceCounts[order.source] ?? 0) + 1
  }
  const ordersBySource = [
    { source: 'WEB', label: 'Web', count: sourceCounts['WEB'] ?? 0, color: '#FF6B35' },
    { source: 'RAPPI', label: 'Rappi', count: sourceCounts['RAPPI'] ?? 0, color: '#D62828' },
    { source: 'PEDIDOSYA', label: 'PedidosYa', count: sourceCounts['PEDIDOSYA'] ?? 0, color: '#F5CB5C' },
  ]

  // Revenue by day of week (current week)
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const revenueByDay = dayNames.map((day, i) => {
    const dayStart = new Date(startOfWeek)
    dayStart.setDate(dayStart.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    const dayRevenue = weekOrders
      .filter((o) => {
        const d = new Date(o.createdAt)
        return d >= dayStart && d < dayEnd
      })
      .reduce((sum, o) => sum + o.total, 0)
    return { day, value: dayRevenue }
  })

  return NextResponse.json({
    data: {
      ordersToday: ordersToday.length,
      ordersWeek: weekOrders.length,
      ordersMonth: allOrders.length,
      revenueToday,
      revenueWeek,
      revenueMonth,
      avgRating: reviews._avg.rating ?? 0,
      activeCustomers,
      popularProducts,
      ordersBySource,
      revenueByDay,
    },
  })
}

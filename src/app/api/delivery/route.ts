import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const dayOfWeek = url.searchParams.get('dayOfWeek')

  if (dayOfWeek !== null) {
    // Return time slots for a specific day
    const schedule = await prisma.deliverySchedule.findFirst({
      where: { dayOfWeek: parseInt(dayOfWeek), isActive: true },
    })

    if (!schedule) {
      return NextResponse.json({ data: [] })
    }

    // Get today's date string for slot matching
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    // Count all non-cancelled orders today grouped by their scheduled time
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        status: { notIn: ['CANCELLED'] },
      },
      select: { scheduledAt: true },
    })

    // Build a map of scheduled time -> order count
    const slotCounts = new Map<string, number>()
    for (const order of todayOrders) {
      if (order.scheduledAt) {
        const orderTime = order.scheduledAt.toISOString().substring(11, 16) // HH:MM
        slotCounts.set(orderTime, (slotCounts.get(orderTime) ?? 0) + 1)
      }
    }

    // Generate time slots
    const slots = []
    const [startH, startM] = schedule.startTime.split(':').map(Number)
    const [endH, endM] = schedule.endTime.split(':').map(Number)
    const startMin = startH * 60 + startM
    const endMin = endH === 0 ? 24 * 60 : endH * 60 + endM

    for (let min = startMin; min < endMin; min += schedule.slotMinutes) {
      const h = Math.floor(min / 60)
      const m = min % 60
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`

      const ordersInSlot = slotCounts.get(time) ?? 0
      const remainingSlots = Math.max(0, schedule.maxOrders - ordersInSlot)

      slots.push({
        time,
        available: remainingSlots > 0,
        remainingSlots,
      })
    }

    return NextResponse.json({ data: slots })
  }

  // Return all schedules
  const schedules = await prisma.deliverySchedule.findMany({
    where: { isActive: true },
    orderBy: { dayOfWeek: 'asc' },
  })

  return NextResponse.json({ data: schedules })
}

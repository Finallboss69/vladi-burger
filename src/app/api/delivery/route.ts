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

      // Count orders for this slot (simplified)
      const remainingSlots = Math.max(0, schedule.maxOrders - Math.floor(Math.random() * 3))

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

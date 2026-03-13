import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { driverId, orderIds } = await req.json()

    if (!driverId || !orderIds?.length) {
      return NextResponse.json(
        { error: 'Se requiere driverId y al menos un orderId' },
        { status: 400 },
      )
    }

    // Verify driver exists and has DELIVERY role
    const driver = await prisma.user.findUnique({ where: { id: driverId } })
    if (!driver || driver.role !== 'DELIVERY') {
      return NextResponse.json({ error: 'Repartidor no encontrado' }, { status: 404 })
    }

    // Assign all orders to the driver and update status to DELIVERING
    const updated = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        status: 'READY',
        deliveryType: 'DELIVERY',
      },
      data: {
        deliveryDriverId: driverId,
        status: 'DELIVERING',
      },
    })

    return NextResponse.json({
      data: { assignedCount: updated.count, driverId },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'Error asignando pedidos', detail: String(e) },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params

  try {
    const { name, centerLat, centerLng, radiusKm, isActive, deliveryFee } = await req.json()

    const existing = await prisma.deliveryZone.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (centerLat !== undefined) data.centerLat = centerLat
    if (centerLng !== undefined) data.centerLng = centerLng
    if (radiusKm !== undefined) data.radiusKm = radiusKm
    if (isActive !== undefined) data.isActive = isActive
    if (deliveryFee !== undefined) data.deliveryFee = deliveryFee

    const zone = await prisma.deliveryZone.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: zone })
  } catch (e) {
    return NextResponse.json({ error: 'Error actualizando zona', detail: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params

  try {
    const existing = await prisma.deliveryZone.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 })
    }

    await prisma.deliveryZone.delete({ where: { id } })

    return NextResponse.json({ message: 'Zona eliminada' })
  } catch (e) {
    return NextResponse.json({ error: 'Error eliminando zona', detail: String(e) }, { status: 500 })
  }
}

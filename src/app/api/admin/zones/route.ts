import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const zones = await prisma.deliveryZone.findMany({
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ data: zones })
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { name, centerLat, centerLng, radiusKm, deliveryFee } = await req.json()

    if (!name || centerLat === undefined || centerLng === undefined) {
      return NextResponse.json({ error: 'Nombre, latitud y longitud son requeridos' }, { status: 400 })
    }

    const zone = await prisma.deliveryZone.create({
      data: {
        name,
        centerLat,
        centerLng,
        radiusKm: radiusKm ?? 5,
        deliveryFee: deliveryFee ?? 0,
      },
    })

    return NextResponse.json({ data: zone }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Error creando zona', detail: String(e) }, { status: 500 })
  }
}

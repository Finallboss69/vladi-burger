import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

interface Stop {
  orderId: string
  orderNumber: number
  address: string
  lat: number | null
  lng: number | null
  estimatedDistanceKm: number | null
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function nearestNeighborRoute(
  startLat: number,
  startLng: number,
  stops: Stop[]
): Stop[] {
  const remaining = [...stops]
  const ordered: Stop[] = []
  let currentLat = startLat
  let currentLng = startLng

  while (remaining.length > 0) {
    let nearestIdx = 0
    let nearestDist = Infinity

    for (let i = 0; i < remaining.length; i++) {
      const stop = remaining[i]
      if (stop.lat == null || stop.lng == null) continue
      const dist = haversineKm(currentLat, currentLng, stop.lat, stop.lng)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestIdx = i
      }
    }

    const next = remaining.splice(nearestIdx, 1)[0]
    next.estimatedDistanceKm = nearestDist === Infinity ? null : Math.round(nearestDist * 100) / 100
    currentLat = next.lat ?? currentLat
    currentLng = next.lng ?? currentLng
    ordered.push(next)
  }

  return ordered
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || (user.role !== 'ADMIN' && user.role !== 'DELIVERY')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { orderIds, startLat, startLng } = await req.json()

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un orderId' }, { status: 400 })
    }

    if (startLat === undefined || startLng === undefined) {
      return NextResponse.json({ error: 'Se requieren coordenadas de inicio (startLat, startLng)' }, { status: 400 })
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: {
        address: true,
      },
    })

    if (orders.length === 0) {
      return NextResponse.json({ error: 'No se encontraron ordenes' }, { status: 404 })
    }

    const stops: Stop[] = orders.map((order) => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      address: order.address
        ? `${order.address.street} ${order.address.number}, ${order.address.city}`
        : 'Sin dirección',
      lat: order.address?.lat ?? null,
      lng: order.address?.lng ?? null,
      estimatedDistanceKm: null,
    }))

    // Try Google Maps Directions API if key exists
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY
    if (googleApiKey && stops.every((s) => s.lat != null && s.lng != null)) {
      try {
        const origin = `${startLat},${startLng}`
        const waypoints = stops.map((s) => `${s.lat},${s.lng}`).join('|')
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${origin}&waypoints=optimize:true|${waypoints}&key=${googleApiKey}`

        const res = await fetch(url)
        const data = await res.json()

        if (data.status === 'OK' && data.routes?.[0]?.waypoint_order) {
          const waypointOrder: number[] = data.routes[0].waypoint_order
          const legs = data.routes[0].legs

          const optimizedStops: Stop[] = waypointOrder.map((idx: number, i: number) => ({
            ...stops[idx],
            estimatedDistanceKm: legs[i]
              ? Math.round((legs[i].distance.value / 1000) * 100) / 100
              : null,
          }))

          return NextResponse.json({
            data: {
              optimizedBy: 'google_maps',
              stops: optimizedStops,
              totalDistanceKm: legs
                ? Math.round(
                    legs.reduce((sum: number, leg: { distance: { value: number } }) => sum + leg.distance.value, 0) /
                      10
                  ) / 100
                : null,
            },
          })
        }
      } catch {
        // Fall through to nearest-neighbor
      }
    }

    // Fallback: nearest-neighbor algorithm
    const optimizedStops = nearestNeighborRoute(startLat, startLng, stops)

    const totalDistanceKm = optimizedStops.reduce(
      (sum, s) => sum + (s.estimatedDistanceKm ?? 0),
      0
    )

    return NextResponse.json({
      data: {
        optimizedBy: 'nearest_neighbor',
        stops: optimizedStops,
        totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Error optimizando ruta', detail: String(e) }, { status: 500 })
  }
}

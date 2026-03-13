import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET /api/stamps/config - Admin: get stamp config
export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const config = await prisma.stampConfig.findFirst({ where: { isActive: true } })
  return NextResponse.json({ data: config })
}

// PUT /api/stamps/config - Admin: update stamp config
export async function PUT(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const { stampsRequired, prizeName, prizeDescription, prizeDiscount, prizeProductId, categoryId } = body

  let config = await prisma.stampConfig.findFirst({ where: { isActive: true } })

  if (config) {
    config = await prisma.stampConfig.update({
      where: { id: config.id },
      data: {
        stampsRequired: stampsRequired ?? config.stampsRequired,
        prizeName: prizeName ?? config.prizeName,
        prizeDescription: prizeDescription ?? config.prizeDescription,
        prizeDiscount: prizeDiscount ?? config.prizeDiscount,
        prizeProductId: prizeProductId !== undefined ? prizeProductId : config.prizeProductId,
        categoryId: categoryId !== undefined ? categoryId : config.categoryId,
      },
    })
  } else {
    config = await prisma.stampConfig.create({
      data: {
        stampsRequired: stampsRequired ?? 5,
        prizeName: prizeName ?? 'Vladi Burger Gratis',
        prizeDescription: prizeDescription ?? 'Comprá 5 burgers y la 6ta te la regalamos!',
        prizeDiscount: prizeDiscount ?? 100,
        prizeProductId: prizeProductId ?? null,
        categoryId: categoryId ?? '1',
      },
    })
  }

  return NextResponse.json({ data: config })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))

  const photos = await prisma.customerPhoto.findMany({
    where: { isApproved: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const data = photos.map((p) => ({
    ...p,
    hasLiked: false, // Will be set below if user is logged in
  }))

  if (user) {
    const likes = await prisma.photoLike.findMany({
      where: { userId: user.id, photoId: { in: photos.map((p) => p.id) } },
    })
    const likedIds = new Set(likes.map((l) => l.photoId))
    for (const photo of data) {
      photo.hasLiked = likedIds.has(photo.id)
    }
  }

  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { imageUrl, caption } = await req.json()

  const photo = await prisma.customerPhoto.create({
    data: {
      userId: user.id,
      imageUrl,
      caption: caption || null,
    },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json({ data: photo }, { status: 201 })
}

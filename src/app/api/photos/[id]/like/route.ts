import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.photoLike.findUnique({
    where: { userId_photoId: { userId: user.id, photoId: id } },
  })

  if (existing) {
    // Unlike
    await prisma.photoLike.delete({ where: { id: existing.id } })
    await prisma.customerPhoto.update({ where: { id }, data: { likes: { decrement: 1 } } })
    return NextResponse.json({ data: { liked: false } })
  } else {
    // Like
    await prisma.photoLike.create({ data: { userId: user.id, photoId: id } })
    await prisma.customerPhoto.update({ where: { id }, data: { likes: { increment: 1 } } })
    return NextResponse.json({ data: { liked: true } })
  }
}

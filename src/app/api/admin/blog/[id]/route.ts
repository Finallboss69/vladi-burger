import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { id } = await params
    const { title, content, imageUrl, isPublished } = await req.json()

    const existing = await prisma.blogPost.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (title !== undefined) {
      data.title = title
      if (title !== existing.title) {
        let slug = generateSlug(title)
        const slugExists = await prisma.blogPost.findFirst({
          where: { slug, id: { not: id } },
        })
        if (slugExists) slug = `${slug}-${Date.now()}`
        data.slug = slug
      }
    }
    if (content !== undefined) data.content = content
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null
    if (isPublished !== undefined) data.isPublished = isPublished

    const post = await prisma.blogPost.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: post })
  } catch (e) {
    return NextResponse.json({ error: 'Error actualizando post', detail: String(e) }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { id } = await params
    await prisma.blogPost.delete({ where: { id } })
    return NextResponse.json({ data: { deleted: true } })
  } catch (e) {
    return NextResponse.json({ error: 'Error eliminando post', detail: String(e) }, { status: 500 })
  }
}

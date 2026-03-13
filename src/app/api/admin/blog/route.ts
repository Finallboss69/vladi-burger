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

export async function GET(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: posts })
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { title, content, imageUrl, isPublished } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Titulo y contenido son requeridos' }, { status: 400 })
    }

    let slug = generateSlug(title)

    // Ensure slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        imageUrl: imageUrl || null,
        isPublished: isPublished ?? false,
      },
    })

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Error creando post', detail: String(e) }, { status: 500 })
  }
}

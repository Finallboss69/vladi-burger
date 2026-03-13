import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, description, imageUrl } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: name.trim(),
      slug,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
    },
  })

  return NextResponse.json({ data: category })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params

  const productCount = await prisma.product.count({ where: { categoryId: id } })
  if (productCount > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${productCount} productos asociados` },
      { status: 400 },
    )
  }

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ data: { deleted: true } })
}

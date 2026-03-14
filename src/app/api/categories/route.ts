import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  const data = categories.map(({ _count, ...c }) => ({
    ...c,
    productCount: _count.products,
  }))

  const res = NextResponse.json({ data })
  res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')
  return res
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const { name, description, imageUrl } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } })

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  })

  return NextResponse.json({ data: category }, { status: 201 })
}

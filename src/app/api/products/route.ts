import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const categoryId = url.searchParams.get('categoryId')
  const categorySlug = url.searchParams.get('categorySlug')
  const search = url.searchParams.get('search')
  const slug = url.searchParams.get('slug')
  const active = url.searchParams.get('active')
  const popular = url.searchParams.get('popular')
  const limit = parseInt(url.searchParams.get('limit') ?? '50')

  // Single product by slug
  if (slug) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true, extras: true, comboItems: true },
    })
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    return NextResponse.json({ data: product })
  }

  const where: Record<string, unknown> = {}
  if (categoryId) where.categoryId = categoryId
  if (categorySlug) where.category = { slug: categorySlug }
  if (active !== 'false') where.isActive = true
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true, extras: true, comboItems: true },
    orderBy: popular ? { id: 'asc' } : { name: 'asc' },
    take: limit,
  })

  const res = NextResponse.json({ data: products })
  res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  return res
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { extras, comboItems, ...productData } = body

    if (!productData.slug && productData.name) {
      productData.slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        extras: extras?.length ? { create: extras } : undefined,
        comboItems: comboItems?.length ? { create: comboItems } : undefined,
      },
      include: { category: true, extras: true, comboItems: true },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Error creando producto', detail: String(e) }, { status: 500 })
  }
}

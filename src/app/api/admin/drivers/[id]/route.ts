import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params

  try {
    const { name, phone, email } = await req.json()

    const driver = await prisma.user.findUnique({ where: { id } })
    if (!driver || driver.role !== 'DELIVERY') {
      return NextResponse.json({ error: 'Conductor no encontrado' }, { status: 404 })
    }

    if (email && email !== driver.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
      }
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = phone
    if (email !== undefined) data.email = email

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Error actualizando conductor', detail: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params

  try {
    const driver = await prisma.user.findUnique({ where: { id } })
    if (!driver || driver.role !== 'DELIVERY') {
      return NextResponse.json({ error: 'Conductor no encontrado' }, { status: 404 })
    }

    // Deactivate by changing role instead of hard delete to preserve order history
    await prisma.user.update({
      where: { id },
      data: { role: 'CUSTOMER' },
    })

    return NextResponse.json({ message: 'Conductor desactivado' })
  } catch (e) {
    return NextResponse.json({ error: 'Error eliminando conductor', detail: String(e) }, { status: 500 })
  }
}

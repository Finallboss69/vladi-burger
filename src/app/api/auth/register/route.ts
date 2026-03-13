import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone: phone || null },
    })

    const token = signToken(user.id)
    const { passwordHash: _, ...safeUser } = user

    // Fire-and-forget welcome email
    sendWelcomeEmail({ to: email, customerName: name }).catch(() => {})

    return NextResponse.json({ data: { user: safeUser, token } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

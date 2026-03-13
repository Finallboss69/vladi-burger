import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const token = signToken(user.id)

    const { passwordHash: _, ...safeUser } = user
    return NextResponse.json({ data: { user: safeUser, token } })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

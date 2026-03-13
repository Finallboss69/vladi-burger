import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalido' }, { status: 400 })
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase().trim() },
      create: { email: email.toLowerCase().trim() },
      update: {},
    })

    return NextResponse.json({ data: { subscribed: true } })
  } catch {
    return NextResponse.json({ error: 'Error al suscribir' }, { status: 500 })
  }
}

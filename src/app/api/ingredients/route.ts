import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const ingredients = await prisma.ingredient.findMany({
    where: { isActive: true },
    orderBy: { type: 'asc' },
  })
  return NextResponse.json({ data: ingredients })
}

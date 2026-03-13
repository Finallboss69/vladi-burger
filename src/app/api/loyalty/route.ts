import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET() {
  const rewards = await prisma.loyaltyReward.findMany({
    where: { isActive: true },
  })

  const data = rewards.map((r) => ({
    ...r,
    value: JSON.parse(r.value),
  }))

  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { rewardId } = await req.json()
  const reward = await prisma.loyaltyReward.findUnique({ where: { id: rewardId } })

  if (!reward) return NextResponse.json({ error: 'Recompensa no encontrada' }, { status: 404 })
  if (user.loyaltyPoints < reward.pointsCost) {
    return NextResponse.json({ error: 'Puntos insuficientes' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { loyaltyPoints: { decrement: reward.pointsCost } },
  })

  return NextResponse.json({
    data: {
      redeemed: true,
      reward: { ...reward, value: JSON.parse(reward.value) },
      remainingPoints: user.loyaltyPoints - reward.pointsCost,
    },
  })
}

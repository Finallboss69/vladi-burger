import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET ?? 'vladi-secret-dev'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string | undefined | null) {
  if (!token) return null
  const clean = token.startsWith('Bearer ') ? token.slice(7) : token
  const payload = verifyToken(clean)
  if (!payload) return null
  return prisma.user.findUnique({ where: { id: payload.userId } })
}

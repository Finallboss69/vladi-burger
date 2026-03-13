import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  token_type: string
}

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        `${appUrl}/login?error=${encodeURIComponent('Inicio con Google cancelado')}`,
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${appUrl}/login?error=${encodeURIComponent('Codigo de autorizacion faltante')}`,
      )
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${appUrl}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${appUrl}/login?error=${encodeURIComponent('Google OAuth no configurado')}`,
      )
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect(
        `${appUrl}/login?error=${encodeURIComponent('Error al obtener token de Google')}`,
      )
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json()

    // Fetch user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    )

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        `${appUrl}/login?error=${encodeURIComponent('Error al obtener datos de Google')}`,
      )
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    if (!googleUser.email) {
      return NextResponse.redirect(
        `${appUrl}/login?error=${encodeURIComponent('No se pudo obtener el email de Google')}`,
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    })

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 12)

      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          passwordHash: randomPassword,
          avatarUrl: googleUser.picture ?? null,
          role: 'CUSTOMER',
          loyaltyPoints: 0,
          vipLevel: 'BRONZE',
        },
      })
    } else if (googleUser.picture && !user.avatarUrl) {
      // Update avatar if user exists but has no avatar
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: googleUser.picture },
      })
    }

    // Generate JWT
    const token = signToken(user.id)

    // Redirect based on role
    const roleRedirects: Record<string, string> = {
      ADMIN: '/admin',
      KITCHEN: '/cocina',
      DELIVERY: '/delivery',
    }
    const destination = roleRedirects[user.role] ?? '/'

    const redirectUrl = new URL('/login', appUrl)
    redirectUrl.searchParams.set('token', token)
    redirectUrl.searchParams.set('name', user.name)
    redirectUrl.searchParams.set('redirect', destination)

    return NextResponse.redirect(redirectUrl.toString())
  } catch (err) {
    console.error('Google OAuth error:', err)
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent('Error interno durante el inicio con Google')}`,
    )
  }
}

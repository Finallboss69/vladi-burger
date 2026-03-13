import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const contentType = req.headers.get('content-type') ?? ''

    let base64: string

    if (contentType.includes('application/json')) {
      // JSON body with base64 image
      const body = await req.json()
      if (!body.image) {
        return NextResponse.json({ error: 'No se envio imagen' }, { status: 400 })
      }
      base64 = body.image
    } else {
      // FormData with file
      const formData = await req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'No se envio archivo' }, { status: 400 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      base64 = `data:${file.type};base64,${buffer.toString('base64')}`
    }

    const result = await uploadImage(base64, 'vladi-burger')
    return NextResponse.json({ data: result })
  } catch (e) {
    return NextResponse.json({ error: 'Error subiendo imagen', detail: String(e) }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: Request) {
  const user = await getUserFromToken(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'vladi-burger'

    if (!file) {
      return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await uploadImage(base64, folder)
    return NextResponse.json({ data: result })
  } catch (e) {
    return NextResponse.json({ error: 'Error subiendo imagen', detail: String(e) }, { status: 500 })
  }
}

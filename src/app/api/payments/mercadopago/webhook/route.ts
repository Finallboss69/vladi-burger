import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPayment } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // MercadoPago sends different notification types
    // We only care about payment notifications
    if (body.type !== 'payment' && body.action !== 'payment.created' && body.action !== 'payment.updated') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Sin ID de pago' }, { status: 400 })
    }

    // Fetch the full payment details from MercadoPago
    const payment = await getPayment(String(paymentId))

    if (!payment.external_reference) {
      return NextResponse.json({ error: 'Sin referencia externa' }, { status: 400 })
    }

    const orderId = payment.external_reference

    // Map MercadoPago payment status to our status
    const statusMap: Record<string, string> = {
      approved: 'APPROVED',
      pending: 'PENDING',
      authorized: 'AUTHORIZED',
      in_process: 'IN_PROCESS',
      in_mediation: 'IN_MEDIATION',
      rejected: 'REJECTED',
      cancelled: 'CANCELLED',
      refunded: 'REFUNDED',
      charged_back: 'CHARGED_BACK',
    }

    const paymentStatus = statusMap[payment.status ?? ''] ?? payment.status ?? 'UNKNOWN'

    // Update order with payment info
    const updateData: Record<string, unknown> = {
      paymentId: String(paymentId),
      paymentStatus,
    }

    // If payment is approved, confirm the order
    if (payment.status === 'approved') {
      updateData.status = 'CONFIRMED'
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('Error procesando webhook de MercadoPago:', e)
    return NextResponse.json(
      { error: 'Error procesando notificacion', detail: String(e) },
      { status: 500 },
    )
  }
}

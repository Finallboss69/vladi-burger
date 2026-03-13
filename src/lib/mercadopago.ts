import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? ''

const client = new MercadoPagoConfig({ accessToken })

export interface OrderItem {
  name: string
  price: number
  quantity: number
}

export interface CreatePreferenceInput {
  orderId: string
  orderNumber: number
  items: OrderItem[]
  total: number
}

export async function createPreference(input: CreatePreferenceInput) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const webhookUrl = process.env.MERCADOPAGO_WEBHOOK_URL ?? `${appUrl}/api/payments/mercadopago/webhook`

  const preference = new Preference(client)

  const result = await preference.create({
    body: {
      items: input.items.map((item) => ({
        id: input.orderId,
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: 'ARS',
      })),
      back_urls: {
        success: `${appUrl}/pedido/${input.orderId}?payment=success`,
        failure: `${appUrl}/pedido/${input.orderId}?payment=failure`,
        pending: `${appUrl}/pedido/${input.orderId}?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: input.orderId,
      notification_url: webhookUrl,
      statement_descriptor: 'VLADI BURGER',
    },
  })

  return result
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(client)
  return payment.get({ id: paymentId })
}

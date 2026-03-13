// Maileroo transactional email service for Vladi.burger
// All email sending is fire-and-forget: failures are logged but never block the main flow.

const MAILEROO_API_URL = 'https://smtp.maileroo.com/v1/email/send'

function getApiKey(): string {
  return process.env.MAILEROO_API_KEY ?? ''
}

function getFromEmail(): string {
  return process.env.MAILEROO_FROM_EMAIL ?? 'pedidos@vladiburger.com'
}

function getFromName(): string {
  return process.env.MAILEROO_FROM_NAME ?? 'Vladi.burger'
}

// ---------------------------------------------------------------------------
// Base layout wrapper
// ---------------------------------------------------------------------------

function wrapInLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#1A1A1A;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A1A1A;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#2A2A2A;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:#FF6B35;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#FFFFFF;font-size:28px;font-weight:800;letter-spacing:1px;">
              🍔 Vladi.burger
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#222222;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#888888;font-size:12px;">
              &copy; ${new Date().getFullYear()} Vladi.burger &mdash; Las mejores hamburguesas artesanales
            </p>
            <p style="margin:8px 0 0;color:#666666;font-size:11px;">
              Este email fue enviado desde un sistema automatizado. No responder a este correo.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Base send function
// ---------------------------------------------------------------------------

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn('[email] MAILEROO_API_KEY no configurada, email no enviado:', subject)
    return false
  }

  try {
    const fromName = getFromName()
    const fromEmail = getFromEmail()
    const from = `${fromName} <${fromEmail}>`

    const res = await fetch(MAILEROO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ from, to, subject, html }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => 'sin detalle')
      console.error(`[email] Maileroo respondio ${res.status}: ${text}`)
      return false
    }

    console.log(`[email] Enviado exitosamente a ${to}: ${subject}`)
    return true
  } catch (err) {
    console.error('[email] Error enviando email:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Order confirmation
// ---------------------------------------------------------------------------

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface SendOrderConfirmationParams {
  to: string
  customerName: string
  orderNumber: number
  items: OrderItem[]
  total: number
}

export async function sendOrderConfirmation({
  to,
  customerName,
  orderNumber,
  items,
  total,
}: SendOrderConfirmationParams): Promise<boolean> {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:#E0E0E0;font-size:14px;border-bottom:1px solid #3A3A3A;">
          ${item.name}
        </td>
        <td style="padding:8px 0;color:#CCCCCC;font-size:14px;text-align:center;border-bottom:1px solid #3A3A3A;">
          x${item.quantity}
        </td>
        <td style="padding:8px 0;color:#F5CB5C;font-size:14px;text-align:right;border-bottom:1px solid #3A3A3A;">
          $${(item.price * item.quantity).toLocaleString('es-AR')}
        </td>
      </tr>`
    )
    .join('')

  const content = `
    <h2 style="margin:0 0 8px;color:#FF6B35;font-size:22px;">Pedido Confirmado</h2>
    <p style="color:#E0E0E0;font-size:16px;margin:0 0 24px;">
      Hola <strong>${customerName}</strong>, recibimos tu pedido correctamente.
    </p>

    <div style="background-color:#333333;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#AAAAAA;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Numero de pedido</p>
      <p style="margin:0;color:#F5CB5C;font-size:28px;font-weight:700;">#${orderNumber}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <th style="text-align:left;padding:8px 0;color:#AAAAAA;font-size:12px;text-transform:uppercase;border-bottom:2px solid #FF6B35;">Producto</th>
        <th style="text-align:center;padding:8px 0;color:#AAAAAA;font-size:12px;text-transform:uppercase;border-bottom:2px solid #FF6B35;">Cant.</th>
        <th style="text-align:right;padding:8px 0;color:#AAAAAA;font-size:12px;text-transform:uppercase;border-bottom:2px solid #FF6B35;">Precio</th>
      </tr>
      ${itemsHtml}
    </table>

    <div style="text-align:right;padding:12px 0;border-top:2px solid #FF6B35;">
      <span style="color:#AAAAAA;font-size:14px;">Total: </span>
      <span style="color:#F5CB5C;font-size:24px;font-weight:700;">$${total.toLocaleString('es-AR')}</span>
    </div>

    <p style="color:#AAAAAA;font-size:13px;margin:24px 0 0;text-align:center;">
      Te avisaremos cuando tu pedido cambie de estado.
    </p>`

  return sendEmail({
    to,
    subject: `Pedido #${orderNumber} confirmado - Vladi.burger`,
    html: wrapInLayout(content),
  })
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

interface SendWelcomeEmailParams {
  to: string
  customerName: string
}

export async function sendWelcomeEmail({ to, customerName }: SendWelcomeEmailParams): Promise<boolean> {
  const content = `
    <h2 style="margin:0 0 8px;color:#FF6B35;font-size:22px;">Bienvenido a Vladi.burger</h2>
    <p style="color:#E0E0E0;font-size:16px;margin:0 0 24px;">
      Hola <strong>${customerName}</strong>, ya formas parte de la familia Vladi.burger.
    </p>

    <div style="background-color:#333333;border-radius:8px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 12px;color:#F5CB5C;font-size:18px;font-weight:600;">
        Preparate para las mejores hamburguesas artesanales
      </p>
      <p style="margin:0;color:#CCCCCC;font-size:14px;">
        Con tu cuenta podes hacer pedidos, acumular puntos de fidelidad y acceder a promociones exclusivas.
      </p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;background-color:#FF6B35;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
        Ya podes hacer tu primer pedido
      </span>
    </div>

    <p style="color:#AAAAAA;font-size:13px;margin:24px 0 0;text-align:center;">
      Si tenes alguna consulta, no dudes en contactarnos.
    </p>`

  return sendEmail({
    to,
    subject: 'Bienvenido a Vladi.burger',
    html: wrapInLayout(content),
  })
}

// ---------------------------------------------------------------------------
// Order status update
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparacion',
  READY: 'Listo para retirar',
  DELIVERING: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_EMOJIS: Record<string, string> = {
  PENDING: '⏳',
  CONFIRMED: '✅',
  PREPARING: '👨‍🍳',
  READY: '📦',
  DELIVERING: '🛵',
  DELIVERED: '🎉',
  CANCELLED: '❌',
}

interface SendOrderStatusUpdateParams {
  to: string
  customerName: string
  orderNumber: number
  status: string
}

export async function sendOrderStatusUpdate({
  to,
  customerName,
  orderNumber,
  status,
}: SendOrderStatusUpdateParams): Promise<boolean> {
  const label = STATUS_LABELS[status] ?? status
  const emoji = STATUS_EMOJIS[status] ?? '📋'

  const content = `
    <h2 style="margin:0 0 8px;color:#FF6B35;font-size:22px;">Actualizacion de Pedido</h2>
    <p style="color:#E0E0E0;font-size:16px;margin:0 0 24px;">
      Hola <strong>${customerName}</strong>, tu pedido cambio de estado.
    </p>

    <div style="background-color:#333333;border-radius:8px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;color:#AAAAAA;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Pedido #${orderNumber}</p>
      <p style="margin:12px 0 0;font-size:36px;">${emoji}</p>
      <p style="margin:8px 0 0;color:#F5CB5C;font-size:22px;font-weight:700;">
        ${label}
      </p>
    </div>

    <p style="color:#AAAAAA;font-size:13px;margin:24px 0 0;text-align:center;">
      Gracias por elegir Vladi.burger.
    </p>`

  return sendEmail({
    to,
    subject: `Pedido #${orderNumber}: ${label} - Vladi.burger`,
    html: wrapInLayout(content),
  })
}

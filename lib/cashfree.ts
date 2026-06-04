// Cashfree Payment Gateway (Orders API v2023-08-01) — server-side helpers.
//
// Flow (replaces Razorpay):
//   1. createCashfreeOrder() → returns { orderId, paymentSessionId }
//   2. Client opens the Cashfree JS SDK modal with paymentSessionId
//   3. getCashfreeOrder() / getSuccessfulPaymentId() confirm order_status === 'PAID'
//      server-side (the source of truth — no client signature like Razorpay)
//
// Env:
//   CASHFREE_APP_ID, CASHFREE_SECRET_KEY  (server secrets)
//   CASHFREE_ENV = 'production' | 'sandbox' (default 'production')

const API_VERSION = '2023-08-01'

// Sandbox when CASHFREE_ENV is 'sandbox' (any case); production otherwise.
function isSandbox(): boolean {
  return (process.env.CASHFREE_ENV ?? '').toLowerCase() === 'sandbox'
}

function baseUrl(): string {
  return isSandbox()
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg'
}

// The `mode` the browser SDK must init with — must match the env above.
export function cashfreeMode(): 'production' | 'sandbox' {
  return isSandbox() ? 'sandbox' : 'production'
}

export function cashfreeConfigured(): boolean {
  return !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY)
}

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-version': API_VERSION,
    'x-client-id': process.env.CASHFREE_APP_ID ?? '',
    'x-client-secret': process.env.CASHFREE_SECRET_KEY ?? '',
  }
}

export type CreateOrderResult =
  | { ok: true; orderId: string; paymentSessionId: string }
  | { ok: false; status: number; error: string }

export async function createCashfreeOrder(params: {
  orderId: string
  amountInr: number            // rupees (Cashfree takes major units, not paise)
  customerId: string
  customerEmail: string
  customerPhone: string
  returnUrl?: string
}): Promise<CreateOrderResult> {
  try {
    const res = await fetch(`${baseUrl()}/orders`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        order_id: params.orderId,
        order_amount: params.amountInr,
        order_currency: 'INR',
        customer_details: {
          customer_id: params.customerId,
          customer_email: params.customerEmail,
          customer_phone: params.customerPhone,
        },
        ...(params.returnUrl ? { order_meta: { return_url: params.returnUrl } } : {}),
      }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok || !body?.payment_session_id) {
      return { ok: false, status: res.status, error: JSON.stringify(body).slice(0, 500) }
    }
    return { ok: true, orderId: body.order_id, paymentSessionId: body.payment_session_id }
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

export type OrderStatusResult =
  | { ok: true; status: string; amount: number | null }
  | { ok: false; status: number; error: string }

// order_status is one of: ACTIVE | PAID | EXPIRED | TERMINATED | TERMINATION_REQUESTED
export async function getCashfreeOrder(orderId: string): Promise<OrderStatusResult> {
  try {
    const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(orderId)}`, { headers: headers() })
    const body = await res.json().catch(() => ({}))
    if (!res.ok || !body?.order_status) {
      return { ok: false, status: res.status, error: JSON.stringify(body).slice(0, 500) }
    }
    return { ok: true, status: body.order_status, amount: body.order_amount ?? null }
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

// Returns the cf_payment_id of the SUCCESS payment for an order, for the ledger.
// Best-effort: null if the call fails or no successful payment is found yet.
export async function getSuccessfulPaymentId(orderId: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(orderId)}/payments`, { headers: headers() })
    if (!res.ok) return null
    const body = await res.json().catch(() => null)
    if (!Array.isArray(body)) return null
    const success = body.find((p: { payment_status?: string }) => p.payment_status === 'SUCCESS')
    const id = success?.cf_payment_id
    return id != null ? String(id) : null
  } catch {
    return null
  }
}

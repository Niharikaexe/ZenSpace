// List all Daily.co webhooks registered on your account (read-only).
//
// Usage:
//   DAILY_API_KEY=xxx node scripts/list-daily-webhooks.mjs
//
// Use this before register-daily-webhook.mjs to check whether a webhook already
// exists (and its state / failedCount) so you don't create a duplicate. A
// `state` of 'FAILING'/'INACTIVE' or a high `failedCount` means Daily's
// circuit-breaker disabled it after repeated non-2xx responses — delete it and
// re-register once the endpoint verifies signatures correctly.

const apiKey = process.env.DAILY_API_KEY

if (!apiKey) {
  console.error('✖ DAILY_API_KEY env var is required.')
  process.exit(1)
}

const res = await fetch('https://api.daily.co/v1/webhooks', {
  headers: { Authorization: `Bearer ${apiKey}` },
})

const body = await res.text()
if (!res.ok) {
  console.error(`✖ Daily rejected the request (HTTP ${res.status}):`)
  console.error(body)
  process.exit(1)
}

let json
try {
  json = JSON.parse(body)
} catch {
  console.log(body)
  process.exit(0)
}

const hooks = Array.isArray(json) ? json : (json.data ?? [])
if (hooks.length === 0) {
  console.log('No webhooks registered on this account.')
  process.exit(0)
}

console.log(`✓ ${hooks.length} webhook(s):\n`)
for (const h of hooks) {
  console.log('  uuid:       ', h.uuid)
  console.log('  url:        ', h.url)
  console.log('  state:      ', h.state)
  console.log('  failedCount:', h.failedCount)
  console.log('  eventTypes: ', (h.eventTypes ?? []).join(', '))
  console.log('')
}

// One-shot Daily.co webhook registration (there is no dashboard UI for this).
//
// Usage:
//   DAILY_API_KEY=xxx node scripts/register-daily-webhook.mjs https://mindcanopy.in/api/webhooks/daily
//
// On success it prints the webhook uuid and the HMAC secret — copy the secret
// into DAILY_WEBHOOK_SECRET (Vercel env, production + preview), then redeploy.
//
// Re-running creates a SECOND webhook. To list/replace existing ones use the
// GET/DELETE /v1/webhooks endpoints. Safe to run once.

const apiKey = process.env.DAILY_API_KEY
const url = process.argv[2]

if (!apiKey) {
  console.error('✖ DAILY_API_KEY env var is required.')
  process.exit(1)
}
if (!url || !/^https:\/\//.test(url)) {
  console.error('✖ Pass the public webhook URL as the first argument, e.g.')
  console.error('  node scripts/register-daily-webhook.mjs https://mindcanopy.in/api/webhooks/daily')
  process.exit(1)
}

const eventTypes = [
  'meeting.started',
  'meeting.ended',
  'participant.joined',
  'participant.left',
  'transcript.started',
  'transcript.ready-to-download',
  'transcript.error',
]

const res = await fetch('https://api.daily.co/v1/webhooks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({ url, eventTypes, retryType: 'circuit-breaker' }),
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

console.log('✓ Webhook created.')
console.log('  uuid:       ', json.uuid)
console.log('  url:        ', json.url)
console.log('  state:      ', json.state)
console.log('  eventTypes: ', (json.eventTypes ?? []).join(', '))
console.log('')
console.log('➜ Set this in Vercel as DAILY_WEBHOOK_SECRET (production + preview):')
console.log('')
console.log('  DAILY_WEBHOOK_SECRET=' + json.hmac)
console.log('')

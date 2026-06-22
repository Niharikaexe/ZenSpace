'use client'

import { useState, useTransition } from 'react'
import { sendComposedEmail, sendDiscountOfferToAllClients } from '@/app/admin/actions'
import { OwlLogo } from '@/components/home/OwlLogo'

// Admin "Send Email" tab. Lets the admin send a one-off, on-brand email to
// anyone (e.g. inviting a therapist to an interview) without touching HTML.
// The right-hand panel previews exactly how the email will look. The send goes
// through lib/email → Resend and is logged in the Emails tab.

const FROM_OPTIONS = [
  { value: 'marketing', label: 'marketing@mindcanopy.in', note: 'general outreach' },
  { value: 'admin', label: 'admin@mindcanopy.in', note: 'official / personal' },
] as const

export function ComposeTab() {
  const [to, setTo] = useState('')
  const [from, setFrom] = useState<'marketing' | 'admin'>('marketing')
  const [subject, setSubject] = useState('')
  const [heading, setHeading] = useState('')
  const [body, setBody] = useState('')
  const [ctaLabel, setCtaLabel] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')

  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [sentTo, setSentTo] = useState('')

  // First-session discount campaign (bulk send to all clients).
  const [blastPending, startBlast] = useTransition()
  const [confirmingBlast, setConfirmingBlast] = useState(false)
  const [blastResult, setBlastResult] = useState<
    { ok: boolean; sent: number; failed: number; total: number; error?: string } | null
  >(null)

  function handleBlast() {
    setBlastResult(null)
    startBlast(async () => {
      const res = await sendDiscountOfferToAllClients()
      setBlastResult(res)
      setConfirmingBlast(false)
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    const recipient = to
    startTransition(async () => {
      const fd = new FormData()
      fd.set('to', to)
      fd.set('from', from)
      fd.set('subject', subject)
      fd.set('heading', heading)
      fd.set('body', body)
      fd.set('ctaLabel', ctaLabel)
      fd.set('ctaUrl', ctaUrl)
      const res = await sendComposedEmail(fd)
      setResult(res)
      if (res.ok) {
        setSentTo(recipient)
        // Keep "from" so the next send defaults the same; clear the rest.
        setTo('')
        setSubject('')
        setHeading('')
        setBody('')
        setCtaLabel('')
        setCtaUrl('')
      }
    })
  }

  const paragraphs = body.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)
  const showButton = ctaLabel.trim() && ctaUrl.trim()

  const inputCls =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
  const labelCls = 'block text-xs font-semibold text-slate-700 mb-1'

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Send Email</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Send a one-off, on-brand email to anyone. You only type the text — we wrap it in the
          MindCanopy template. Every send is recorded in the Emails tab.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="compose-to">Recipient email</label>
            <input
              id="compose-to"
              type="email"
              required
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="prapti@example.com"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="compose-from">From</label>
            <select
              id="compose-from"
              value={from}
              onChange={e => setFrom(e.target.value as 'marketing' | 'admin')}
              className={inputCls}
            >
              {FROM_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label} — {o.note}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="compose-subject">Subject</label>
            <input
              id="compose-subject"
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="We'd like to set up a quick call"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="compose-heading">
              Heading <span className="font-normal text-slate-400">(optional — the big bold line)</span>
            </label>
            <input
              id="compose-heading"
              type="text"
              value={heading}
              onChange={e => setHeading(e.target.value)}
              placeholder="Hi Prapti,"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="compose-body">
              Message <span className="font-normal text-slate-400">(leave a blank line between paragraphs)</span>
            </label>
            <textarea
              id="compose-body"
              required
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={9}
              placeholder={
                "We loved your application and we'd like to get to know you a little better.\n\nAre you free for a 30-minute video call this week? Reply with a couple of slots that work and we'll lock one in.\n\nLooking forward to it."
              }
              className={`${inputCls} resize-y leading-relaxed`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="compose-cta-label">
                Button label <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="compose-cta-label"
                type="text"
                value={ctaLabel}
                onChange={e => setCtaLabel(e.target.value)}
                placeholder="Book a time →"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="compose-cta-url">Button link</label>
              <input
                id="compose-cta-url"
                type="url"
                value={ctaUrl}
                onChange={e => setCtaUrl(e.target.value)}
                placeholder="https://calendly.com/…"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Sending…' : 'Send email'}
            </button>

            {result?.ok && (
              <span className="text-sm font-medium text-emerald-700">
                Sent to {sentTo}. ✓
              </span>
            )}
            {result && !result.ok && (
              <span className="text-sm font-medium text-red-600">{result.error}</span>
            )}
          </div>

          <p className="text-xs text-slate-400 pt-1">
            Tip: for a warm, personal note (no template, replies come to your inbox), send it straight
            from Gmail instead. Use this for anything you want to look on-brand and tracked.
          </p>
        </form>

        {/* ── Live preview ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Preview</p>
          <div style={{ background: '#FAFAFA', padding: 24, borderRadius: 12, border: '1px solid #e8ecef' }}>
            <div style={{ maxWidth: 560, margin: '0 auto', background: '#ffffff', borderRadius: 16, border: '1px solid #e8ecef', overflow: 'hidden' }}>
              {/* header */}
              <div style={{ background: '#233551', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ background: '#FFF5F2', borderRadius: 6, padding: 4, display: 'inline-flex' }}>
                  <OwlLogo size={24} />
                </span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
                  MindCanopy
                </span>
              </div>
              {/* body */}
              <div style={{ padding: 32 }}>
                {heading.trim() && (
                  <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: '#233551', lineHeight: 1.3 }}>
                    {heading.trim()}
                  </h1>
                )}
                {paragraphs.length > 0 ? (
                  paragraphs.map((para, i) => (
                    <p key={i} style={{ margin: '16px 0 0', fontSize: 15, color: '#4a5568', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {para}
                    </p>
                  ))
                ) : (
                  <p style={{ margin: '16px 0 0', fontSize: 15, color: '#cbd5e0', lineHeight: 1.7, fontStyle: 'italic' }}>
                    Your message will appear here…
                  </p>
                )}
                {showButton && (
                  <div>
                    <span style={{ display: 'inline-block', marginTop: 24, padding: '12px 28px', background: '#233551', color: '#ffffff', fontSize: 14, fontWeight: 700, borderRadius: 100 }}>
                      {ctaLabel.trim()}
                    </span>
                  </div>
                )}
                <p style={{ margin: '32px 0 0', fontSize: 15, color: '#4a5568', lineHeight: 1.7 }}>
                  - MindCanopy team
                </p>
              </div>
              {/* footer */}
              <div style={{ background: '#f8f9fa', borderTop: '1px solid #e8ecef', padding: '20px 32px' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#9aa3ad', lineHeight: 1.6 }}>
                  Questions? Email us at <span style={{ color: '#3D8A80' }}>admin@mindcanopy.in</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Campaign: first-session discount to all clients ── */}
      <div className="mt-10 border-t border-slate-200 pt-8">
        <div className="rounded-xl border border-[#E8926A]/30 bg-[#FFF5F2] p-5 max-w-2xl">
          <h2 className="text-sm font-bold text-[#233551]">First-session discount campaign</h2>
          <p className="text-sm text-slate-600 mt-1">
            Email every client the “Special — only for you” offer (₹799 first session). Each send is
            on-brand and recorded in the Emails tab. Goes to all clients — send it once.
          </p>

          {!confirmingBlast ? (
            <button
              type="button"
              onClick={() => { setBlastResult(null); setConfirmingBlast(true) }}
              disabled={blastPending}
              className="mt-4 inline-flex items-center rounded-lg bg-[#233551] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e2d47] disabled:opacity-60 transition-colors"
            >
              Send the offer to all clients
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-[#233551]">Send to every client now?</span>
              <button
                type="button"
                onClick={handleBlast}
                disabled={blastPending}
                className="inline-flex items-center rounded-lg bg-[#C56A42] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b35e39] disabled:opacity-60 transition-colors"
              >
                {blastPending ? 'Sending…' : 'Yes, send it'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingBlast(false)}
                disabled={blastPending}
                className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {blastResult?.ok && (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              Sent to {blastResult.sent} of {blastResult.total} client{blastResult.total === 1 ? '' : 's'}
              {blastResult.failed > 0 ? ` · ${blastResult.failed} failed (check the Emails tab)` : ''}. ✓
            </p>
          )}
          {blastResult && !blastResult.ok && (
            <p className="mt-3 text-sm font-medium text-red-600">{blastResult.error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

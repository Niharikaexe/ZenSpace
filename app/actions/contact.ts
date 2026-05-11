'use server'

import { z } from 'zod'
import { logger } from '@/lib/logger'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export type ContactState = {
  error?: string
  success?: boolean
}

export async function sendContactEmail(
  _: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, email, message } = parsed.data

  if (!process.env.RESEND_API_KEY) {
    logger.warn('contact', 'RESEND_API_KEY not set — contact email not sent')
    return { success: true }
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #233551;">New contact message</h2>
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <hr style="border: none; border-top: 1px solid #e8ecef; margin: 16px 0;" />
      <p style="white-space: pre-wrap; color: #4a5568;">${message}</p>
      <hr style="border: none; border-top: 1px solid #e8ecef; margin: 16px 0;" />
      <p style="font-size: 12px; color: #9aa3ad;">Sent via the MindCanopy contact form.</p>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MindCanopy Contact <notifications@mindcanopy.in>',
        to: 'nikki1339999@gmail.com',
        reply_to: email,
        subject: `Contact form: ${name}`,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      logger.error('contact', 'Resend API error', new Error(body))
      return { error: 'Failed to send message. Please email us directly at hello@mindcanopy.in.' }
    }
  } catch (err) {
    logger.error('contact', 'Failed to send contact email', err)
    return { error: 'Failed to send message. Please email us directly at hello@mindcanopy.in.' }
  }

  logger.info('contact', 'Contact email sent', { name, email })
  return { success: true }
}

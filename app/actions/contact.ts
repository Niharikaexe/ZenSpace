'use server'

import { z } from 'zod'
import { logger } from '@/lib/logger'
import { sendAdminContactFormEmail } from '@/lib/email'

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

  const sent = await sendAdminContactFormEmail(name, email, message)

  if (!sent) {
    logger.warn('contact', 'Contact email failed to send — surfacing to user', { name, email })
    return { error: 'We could not send your message right now. Please try again, or email us directly at admin@mindcanopy.in.' }
  }

  logger.info('contact', 'Contact email sent', { name, email })
  return { success: true }
}

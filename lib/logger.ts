/**
 * Structured server-side logger for MindCanopy.
 * All logs include: timestamp, level, context, optional userId, message, data/error.
 * Use this instead of raw console.log/error throughout server code.
 */

type Level = 'info' | 'warn' | 'error'

function formatError(err: unknown): string {
  if (err == null) return 'null'
  if (typeof err === 'string') return err
  if (err instanceof Error) {
    // Pull through any extra fields the SDK attached (Supabase AuthError, PostgrestError, etc.)
    const extras: Record<string, unknown> = {}
    for (const key of ['code', 'status', 'statusCode', 'details', 'hint', '__isAuthError', 'name']) {
      const v = (err as unknown as Record<string, unknown>)[key]
      if (v !== undefined && key !== 'name') extras[key] = v
    }
    const extrasStr = Object.keys(extras).length ? ` ${JSON.stringify(extras)}` : ''
    return `${err.name}: ${err.message}${extrasStr}${err.stack ? `\n${err.stack}` : ''}`
  }
  // Plain object — Supabase sometimes returns these. Walk keys explicitly because
  // JSON.stringify(AuthError) often returns "{}" due to non-enumerable props.
  if (typeof err === 'object') {
    const o = err as Record<string, unknown>
    const fields: Record<string, unknown> = {}
    for (const key of ['message', 'code', 'status', 'statusCode', 'details', 'hint', 'name', '__isAuthError']) {
      if (o[key] !== undefined) fields[key] = o[key]
    }
    // Fallback: try to capture own enumerable props
    if (Object.keys(fields).length === 0) {
      for (const key of Object.keys(o)) fields[key] = o[key]
    }
    try {
      const out = JSON.stringify(fields)
      // If still "{}", fall back to Object.prototype.toString which at least gives us the type
      return out === '{}' ? String(o) || Object.prototype.toString.call(o) : out
    } catch {
      return String(o)
    }
  }
  return String(err)
}

function emit(level: Level, ctx: string, message: string, userId?: string, extra?: unknown, err?: unknown) {
  const ts = new Date().toISOString()
  const userTag = userId ? ` uid=${userId.slice(0, 8)}` : ''
  const prefix = `[${ts}] [${level.toUpperCase().padEnd(5)}] [${ctx}]${userTag}`

  const parts: unknown[] = [`${prefix} ${message}`]
  if (extra !== undefined) parts.push(extra)
  if (err !== undefined) parts.push('\n  ↳', formatError(err))

  if (level === 'error') console.error(...parts)
  else if (level === 'warn') console.warn(...parts)
  else console.log(...parts)
}

export const logger = {
  info(ctx: string, message: string, data?: Record<string, unknown>) {
    const { userId, ...rest } = data ?? {}
    emit('info', ctx, message, userId as string | undefined, Object.keys(rest).length ? rest : undefined)
  },

  warn(ctx: string, message: string, data?: Record<string, unknown>) {
    const { userId, ...rest } = data ?? {}
    emit('warn', ctx, message, userId as string | undefined, Object.keys(rest).length ? rest : undefined)
  },

  error(ctx: string, message: string, err?: unknown, data?: Record<string, unknown>) {
    const { userId, ...rest } = data ?? {}
    emit('error', ctx, message, userId as string | undefined, Object.keys(rest).length ? rest : undefined, err)
  },
}

/**
 * Structured server-side logger for ZenSpace.
 * All logs include: timestamp, level, context, optional userId, message, data/error.
 * Use this instead of raw console.log/error throughout server code.
 */

type Level = 'info' | 'warn' | 'error'

function formatError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}${err.stack ? `\n${err.stack}` : ''}`
  try { return JSON.stringify(err) } catch { return String(err) }
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

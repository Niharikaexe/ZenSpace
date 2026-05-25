export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

type Size = 'sm' | 'md' | 'lg'
type Variant = 'teal' | 'emerald'

const SIZE_CLASS: Record<Size, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

const VARIANT_CLASS: Record<Variant, string> = {
  teal: 'bg-[#7EC0B7]/20 text-[#3D8A80]',
  emerald: 'bg-emerald-100 text-emerald-700',
}

interface Props {
  name: string
  url?: string | null
  size?: Size
  variant?: Variant
  className?: string
}

export function Initials({ name, url, size = 'md', variant = 'teal', className }: Props) {
  const sizeCls = SIZE_CLASS[size]
  const colorCls = VARIANT_CLASS[variant]
  if (url) {
    // Local <img> — url may be from a Supabase storage signed URL whose host
    // isn't whitelisted in next.config; using next/image would 500 in that case.
    return <img src={url} alt={name} className={`${sizeCls} rounded-full object-cover flex-shrink-0 ${className ?? ''}`} />
  }
  return (
    <div
      className={`${sizeCls} ${colorCls} rounded-full font-black flex items-center justify-center flex-shrink-0 ${className ?? ''}`}
      style={{ fontFamily: 'var(--font-lato)' }}
    >
      {getInitials(name)}
    </div>
  )
}

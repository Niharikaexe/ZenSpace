import Link from 'next/link'
import { OwlLogo } from '@/components/home/OwlLogo'

interface Props {
  href?: string
  owlSize?: number
  variant?: 'teal' | 'white'
  className?: string
}

export function BrandLogo({ href = '/', owlSize = 28, variant = 'teal', className }: Props) {
  const content = (
    <span className={`flex items-center gap-2 ${className ?? ''}`}>
      {variant === 'white' ? (
        <span
          className="rounded-lg bg-[#FFF5F2] flex items-center justify-center flex-shrink-0"
          style={{ width: owlSize + 8, height: owlSize + 8 }}
        >
          <OwlLogo size={owlSize} />
        </span>
      ) : (
        <OwlLogo size={owlSize} />
      )}
      <span
        className={`font-black text-xl tracking-tight ${variant === 'white' ? 'text-white' : 'text-[#3D8A80]'}`}
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        MindCanopy
      </span>
    </span>
  )

  return <Link href={href}>{content}</Link>
}

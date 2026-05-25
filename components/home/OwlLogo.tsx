interface Props {
  size?: number
  className?: string
  variant?: 'dark' | 'light'
}

export function OwlLogo({ size = 32, className, variant = 'dark' }: Props) {
  const body = variant === 'light' ? '#ffffff' : '#233551'
  const disc  = variant === 'light' ? 'rgba(255,255,255,0.18)' : '#2a3f60'
  const wing  = variant === 'light' ? 'rgba(255,255,255,0.45)' : '#3D8A80'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Ear tufts */}
      <polygon points="10,8 12.5,13 7.5,13" fill={body} />
      <polygon points="22,8 24.5,13 19.5,13" fill={body} />

      {/* Body */}
      <ellipse cx="16" cy="21" rx="10" ry="9" fill={body} />

      {/* Head */}
      <circle cx="16" cy="13" r="9" fill={body} />

      {/* Facial disc */}
      <circle cx="16" cy="13" r="7" fill={disc} />

      {/* Chest belly */}
      <ellipse cx="16" cy="22" rx="6" ry="5.5" fill={disc} />

      {/* Left eye */}
      <circle cx="12" cy="13" r="3.2" fill="#7EC0B7" />
      <circle cx="12" cy="13" r="1.7" fill="#0f1e30" />
      <circle cx="12.7" cy="12.1" r="0.7" fill="white" />

      {/* Right eye */}
      <circle cx="20" cy="13" r="3.2" fill="#7EC0B7" />
      <circle cx="20" cy="13" r="1.7" fill="#0f1e30" />
      <circle cx="20.7" cy="12.1" r="0.7" fill="white" />

      {/* Beak */}
      <polygon points="16,15.5 14.2,18 17.8,18" fill="#E8926A" />

      {/* Wing accent lines */}
      <path d="M6.5,22 Q5,17 9,14.5" stroke={wing} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M25.5,22 Q27,17 23,14.5" stroke={wing} strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* Feet */}
      <line x1="13" y1="29" x2="11.5" y2="31.5" stroke="#E8926A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="29" x2="13" y2="31.5" stroke="#E8926A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="29" x2="14.5" y2="31.5" stroke="#E8926A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="29" x2="17.5" y2="31.5" stroke="#E8926A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="29" x2="19" y2="31.5" stroke="#E8926A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="29" x2="20.5" y2="31.5" stroke="#E8926A" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

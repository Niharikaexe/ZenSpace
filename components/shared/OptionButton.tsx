import { cn } from '@/lib/utils'

interface Props {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export function OptionButton({ selected, onClick, children, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl text-sm font-medium border-2 transition-all px-4 py-3 min-h-[48px] text-left',
        selected
          ? 'bg-[#233551] text-white border-[#233551]'
          : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:bg-[#7EC0B7]/5',
        className,
      )}
    >
      {children}
    </button>
  )
}

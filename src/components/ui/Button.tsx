/**
 * 数字花园 · 通用按钮
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent-a text-[#04211d] hover:brightness-110 border border-transparent font-semibold shadow-sm',
  secondary:
    'bg-elevated text-ink border border-line-strong hover:border-accent-a/50 hover:text-accent-a',
  ghost: 'bg-transparent text-ink-2 border border-transparent hover:text-ink hover:bg-elevated',
  danger:
    'bg-transparent text-red-400 border border-red-500/40 hover:bg-red-500/10 hover:border-red-500/70',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[13px] rounded-lg',
  md: 'px-4 py-2 text-sm rounded-[10px]',
  lg: 'px-6 py-3 text-[15px] rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

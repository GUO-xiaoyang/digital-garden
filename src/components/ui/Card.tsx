/**
 * 数字花园 · 卡片外壳
 */
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** 是否启用 hover 上浮效果（可点击的卡片用） */
  interactive?: boolean
  as?: 'div' | 'article' | 'section'
}

export function Card({ children, className = '', interactive = false, as = 'div' }: CardProps) {
  const Tag = as
  return (
    <Tag
      className={`rounded-[var(--radius)] border border-line bg-card
        ${interactive ? 'transition-all duration-200 hover:-translate-y-1 hover:border-accent-a/40 hover:shadow-[var(--shadow-hover)]' : ''}
        ${className}`}
    >
      {children}
    </Tag>
  )
}

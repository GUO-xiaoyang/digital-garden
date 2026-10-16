/**
 * 数字花园 · 空状态
 */
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-line-strong bg-card/40 px-6 py-16 text-center">
      <div className="mb-4 text-ink-3" aria-hidden="true">
        {icon ?? (
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 5h16v14H4z" strokeLinejoin="round" />
            <path d="M8 10h8M8 14h5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-[13.5px] text-ink-3">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

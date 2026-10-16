/**
 * 数字花园 · 状态角标
 */
import type { ReactNode } from 'react'

type Tone = 'accent-a' | 'accent-b' | 'muted' | 'danger'

const TONES: Record<Tone, string> = {
  'accent-a': 'border-accent-a/40 bg-accent-a/12 text-accent-a',
  'accent-b': 'border-accent-b/40 bg-accent-b/12 text-accent-b',
  muted: 'border-line-strong bg-elevated text-ink-3',
  danger: 'border-red-500/40 bg-red-500/12 text-red-400',
}

export function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11.5px] font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}

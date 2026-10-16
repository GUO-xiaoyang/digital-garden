/**
 * 数字花园 · 标签胶囊
 */
import { Link } from 'react-router-dom'

interface TagProps {
  label: string
  /** 传入则渲染为可点击的筛选链接 */
  to?: string
  /** 右侧附加数量 */
  count?: number
  active?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function Tag({ label, to, count, active = false, onClick, size = 'sm' }: TagProps) {
  const base = `inline-flex items-center gap-1 rounded-full border transition-colors duration-200 ${
    size === 'sm' ? 'px-2.5 py-0.5 text-[12px]' : 'px-3 py-1 text-[13px]'
  }`
  const tone = active
    ? 'border-accent-a/60 bg-accent-a/12 text-accent-a'
    : 'border-line-strong bg-elevated text-ink-2 hover:border-accent-a/50 hover:text-accent-a'

  const content = (
    <>
      <span>{label}</span>
      {typeof count === 'number' && <span className="text-ink-3 tabular-nums">{count}</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={`${base} ${tone}`}>
        {content}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${tone}`}>
        {content}
      </button>
    )
  }
  return <span className={`${base} ${tone}`}>{content}</span>
}

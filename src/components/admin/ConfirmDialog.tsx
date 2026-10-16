/**
 * 数字花园 · 删除二次确认弹窗
 * 所有破坏性操作必须经过本组件（AGENTS.md 铁律 13）
 */
import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确认删除',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null)

  // 打开时聚焦确认按钮，Esc 取消
  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-[15px] font-bold text-ink">
          {title}
        </h2>
        {description && <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{description}</p>}
        <p className="mt-2 text-[12.5px] text-accent-b">此操作不可撤销。</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line-strong px-4 py-2 text-[13px] text-ink-2 transition-colors hover:text-ink"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-lg border border-red-500/50 bg-red-500/15 px-4 py-2 text-[13px] font-semibold text-red-300 transition-colors hover:bg-red-500/25"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

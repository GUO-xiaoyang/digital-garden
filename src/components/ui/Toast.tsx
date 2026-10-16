/**
 * 数字花园 · 轻提示（Toast）
 * 通过 ToastProvider 提供全局 toast() 方法，无需引入第三方库。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const KIND_STYLE: Record<ToastKind, string> = {
  success: 'border-accent-a/50 bg-[#0f2a26] text-accent-a',
  error: 'border-red-500/50 bg-[#2a1416] text-red-300',
  info: 'border-line-strong bg-elevated text-ink',
}

const KIND_ICON: Record<ToastKind, string> = {
  success: '✓',
  error: '!',
  info: 'i',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const seq = useRef(0)
  const timers = useRef<number[]>([])

  const push = useCallback((kind: ToastKind, message: string) => {
    seq.current += 1
    const id = seq.current
    setItems((prev) => [...prev, { id, kind, message }])
    // 3 秒后自动消失
    const timer = window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
    timers.current.push(timer)
  }, [])

  // 卸载时清理所有定时器，避免内存泄漏
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-[min(420px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-[13.5px] shadow-[var(--shadow-card)] backdrop-blur ${KIND_STYLE[t.kind]}`}
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold">
              {KIND_ICON[t.kind]}
            </span>
            <span className="leading-relaxed">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 必须在 ToastProvider 内使用')
  return ctx
}

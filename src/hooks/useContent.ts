/**
 * 数字花园 · 内容读取 Hook
 * 统一返回 { data, loading, error } 三态（AGENTS.md 5.3）
 */
import { useCallback, useEffect, useState } from 'react'

interface ContentState<T> {
  data: T
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * 通用内容读取。传入一个同步读取函数（api 层都是同步的），
 * 包一层 loading 便于将来替换为异步后端时调用方无需改动。
 */
export function useContent<T>(loader: () => T, deps: unknown[] = []): ContentState<T> {
  const [data, setData] = useState<T>(() => loader())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    try {
      const result = loader()
      if (!cancelled) setData(result)
    } catch (err) {
      if (!cancelled) setError(err instanceof Error ? err.message : '内容读取失败')
    } finally {
      if (!cancelled) setLoading(false)
    }
    return () => {
      cancelled = true
    }
    // loader 由调用方通过 deps 控制重建时机
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { data, loading, error, reload }
}

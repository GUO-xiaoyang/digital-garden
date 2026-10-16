/**
 * 数字花园 · 站点设置 Hook
 * 读取设置并把强调色写入根元素 CSS 变量，实现"改色不用重新构建"
 */
import { useCallback, useEffect, useState } from 'react'
import { getSettings, updateSettings } from '../api/settings'
import type { SiteSettings } from '../types'

/** 把强调色同步到 :root，所有 Tailwind 令牌随之生效 */
function applyAccents(settings: SiteSettings): void {
  const root = document.documentElement
  root.style.setProperty('--accent-a', settings.accentA)
  root.style.setProperty('--accent-b', settings.accentB)
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const initial = getSettings()
    return initial
  })

  // 首次挂载即应用一次（首帧可能早于下方 effect）
  useEffect(() => {
    applyAccents(settings)
  }, [settings])

  const save = useCallback((patch: Partial<Omit<SiteSettings, 'updatedAt'>>) => {
    const next = updateSettings(patch)
    setSettings(next)
    return next
  }, [])

  const reload = useCallback(() => {
    setSettings(getSettings())
  }, [])

  return { settings, save, reload }
}

/** 不订阅变更、只同步一次强调色的轻量版本（供不希望引发重渲染的布局使用） */
export function useApplyAccentsOnce(): void {
  useEffect(() => {
    applyAccents(getSettings())
  }, [])
}

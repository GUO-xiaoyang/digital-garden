/**
 * 数字花园 · 站点设置 API
 */
import type { SiteSettings } from '../types'
import { seedSettings } from './seed'
import { has, read, write } from './storage'

const KEY = 'settings'

export function getSettings(): SiteSettings {
  if (!has(KEY)) {
    write(KEY, seedSettings)
    return seedSettings
  }
  return read<SiteSettings>(KEY, seedSettings)
}

export function updateSettings(patch: Partial<Omit<SiteSettings, 'updatedAt'>>): SiteSettings {
  const next: SiteSettings = { ...getSettings(), ...patch, updatedAt: new Date().toISOString() }
  write(KEY, next)
  return next
}

export function resetSettings(): SiteSettings {
  write(KEY, seedSettings)
  return seedSettings
}

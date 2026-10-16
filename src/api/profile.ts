/**
 * 数字花园 · 个人信息 API
 */
import type { Profile, SocialLink, TimelineItem } from '../types'
import { seedProfile } from './seed'
import { has, newId, read, write } from './storage'

const KEY = 'profile'

/** 读取个人信息；首次访问时写入种子数据 */
export function getProfile(): Profile {
  if (!has(KEY)) {
    write(KEY, seedProfile)
    return seedProfile
  }
  return read<Profile>(KEY, seedProfile)
}

export function updateProfile(patch: Partial<Omit<Profile, 'updatedAt'>>): Profile {
  const current = getProfile()
  const next: Profile = { ...current, ...patch, updatedAt: new Date().toISOString() }
  write(KEY, next)
  return next
}

// ---------------------------------------------------------------------------
// 经历时间线
// ---------------------------------------------------------------------------

export function addTimelineItem(item: Omit<TimelineItem, 'id'>): Profile {
  const current = getProfile()
  const next: TimelineItem = { ...item, id: newId() }
  return updateProfile({ timeline: [...current.timeline, next] })
}

export function updateTimelineItem(id: string, patch: Partial<TimelineItem>): Profile {
  const current = getProfile()
  return updateProfile({
    timeline: current.timeline.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  })
}

export function removeTimelineItem(id: string): Profile {
  const current = getProfile()
  return updateProfile({ timeline: current.timeline.filter((t) => t.id !== id) })
}

// ---------------------------------------------------------------------------
// 社交链接
// ---------------------------------------------------------------------------

export function addSocial(link: Omit<SocialLink, 'id'>): Profile {
  const current = getProfile()
  return updateProfile({ socials: [...current.socials, { ...link, id: newId() }] })
}

export function updateSocial(id: string, patch: Partial<SocialLink>): Profile {
  const current = getProfile()
  return updateProfile({
    socials: current.socials.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  })
}

export function removeSocial(id: string): Profile {
  const current = getProfile()
  return updateProfile({ socials: current.socials.filter((s) => s.id !== id) })
}

/** 恢复为种子数据（后台"重置"用） */
export function resetProfile(): Profile {
  write(KEY, seedProfile)
  return seedProfile
}

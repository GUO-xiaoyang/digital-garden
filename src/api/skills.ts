/**
 * 数字花园 · 技能 API
 */
import type { Skill, SkillGroup } from '../types'
import { seedSkillGroups } from './seed'
import { has, newId, read, write } from './storage'

const KEY = 'skills'

/** 读取技能分组（按 order 升序） */
export function listSkillGroups(): SkillGroup[] {
  if (!has(KEY)) {
    write(KEY, seedSkillGroups)
    return seedSkillGroups
  }
  const groups = read<SkillGroup[]>(KEY, seedSkillGroups)
  return [...groups].sort((a, b) => a.order - b.order)
}

function save(groups: SkillGroup[]): SkillGroup[] {
  write(KEY, groups)
  return groups
}

// ---------------------------------------------------------------------------
// 分组
// ---------------------------------------------------------------------------

export function addGroup(name: string): SkillGroup[] {
  const groups = listSkillGroups()
  const maxOrder = groups.reduce((m, g) => Math.max(m, g.order), 0)
  return save([...groups, { id: newId(), name, order: maxOrder + 1, skills: [] }])
}

export function renameGroup(id: string, name: string): SkillGroup[] {
  return save(listSkillGroups().map((g) => (g.id === id ? { ...g, name } : g)))
}

export function removeGroup(id: string): SkillGroup[] {
  return save(listSkillGroups().filter((g) => g.id !== id))
}

/** 上移 / 下移分组，交换相邻两项的 order */
export function moveGroup(id: string, direction: 'up' | 'down'): SkillGroup[] {
  const groups = listSkillGroups()
  const idx = groups.findIndex((g) => g.id === id)
  const target = direction === 'up' ? idx - 1 : idx + 1
  if (idx < 0 || target < 0 || target >= groups.length) return groups

  const swapped = [...groups]
  ;[swapped[idx], swapped[target]] = [swapped[target], swapped[idx]]
  // 重排 order，保证连续
  return save(swapped.map((g, i) => ({ ...g, order: i + 1 })))
}

// ---------------------------------------------------------------------------
// 技能项
// ---------------------------------------------------------------------------

export function addSkill(groupId: string, skill: Omit<Skill, 'id'>): SkillGroup[] {
  return save(
    listSkillGroups().map((g) =>
      g.id === groupId ? { ...g, skills: [...g.skills, { ...skill, id: newId() }] } : g,
    ),
  )
}

export function updateSkill(groupId: string, skillId: string, patch: Partial<Skill>): SkillGroup[] {
  return save(
    listSkillGroups().map((g) =>
      g.id === groupId
        ? { ...g, skills: g.skills.map((s) => (s.id === skillId ? { ...s, ...patch } : s)) }
        : g,
    ),
  )
}

export function removeSkill(groupId: string, skillId: string): SkillGroup[] {
  return save(
    listSkillGroups().map((g) =>
      g.id === groupId ? { ...g, skills: g.skills.filter((s) => s.id !== skillId) } : g,
    ),
  )
}

export function resetSkillGroups(): SkillGroup[] {
  write(KEY, seedSkillGroups)
  return seedSkillGroups
}

/**
 * 数字花园 · 项目 API
 */
import type { Project } from '../types'
import { seedProjects } from './seed'
import { has, newId, read, write } from './storage'

const KEY = 'projects'

/** 全部项目（含归档），后台用 */
export function listProjects(): Project[] {
  if (!has(KEY)) {
    write(KEY, seedProjects)
    return seedProjects
  }
  return read<Project[]>(KEY, seedProjects)
}

/** 前台展示用：置顶优先，其余按更新时间倒序 */
export function listVisibleProjects(): Project[] {
  return [...listProjects()].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

export function getProject(id: string): Project | null {
  return listProjects().find((p) => p.id === id) ?? null
}

function save(list: Project[]): Project[] {
  write(KEY, list)
  return list
}

export function createProject(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const now = new Date().toISOString()
  const project: Project = { ...input, id: newId(), createdAt: now, updatedAt: now }
  save([...listProjects(), project])
  return project
}

export function updateProject(id: string, patch: Partial<Project>): Project {
  const list = listProjects()
  const idx = list.findIndex((p) => p.id === id)
  if (idx < 0) throw new Error('项目不存在，可能已被删除')
  const next: Project = { ...list[idx], ...patch, updatedAt: new Date().toISOString() }
  list[idx] = next
  save(list)
  return next
}

export function deleteProject(id: string): void {
  save(listProjects().filter((p) => p.id !== id))
}

/** 收集全部项目用到的技术标签（前台筛选用） */
export function listProjectTags(): string[] {
  const set = new Set<string>()
  listProjects().forEach((p) => p.tags.forEach((t) => set.add(t)))
  return [...set].sort()
}

export function resetProjects(): Project[] {
  write(KEY, seedProjects)
  return seedProjects
}

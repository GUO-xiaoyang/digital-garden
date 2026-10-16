/**
 * 数字花园 · 笔记 API
 */
import type { Post, TagStat } from '../types'
import { seedPosts } from './seed'
import { has, newId, read, write } from './storage'

const KEY = 'posts'

/** 全部笔记（含草稿），后台用 */
export function listPosts(): Post[] {
  if (!has(KEY)) {
    write(KEY, seedPosts)
    return seedPosts
  }
  return read<Post[]>(KEY, seedPosts)
}

/** 前台用：只取已发布，置顶优先，其余按创建时间倒序 */
export function listPublishedPosts(): Post[] {
  return listPosts()
    .filter((p) => p.published)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
}

export function getPostBySlug(slug: string): Post | null {
  return listPosts().find((p) => p.slug === slug) ?? null
}

export function getPostById(id: string): Post | null {
  return listPosts().find((p) => p.id === id) ?? null
}

function save(list: Post[]): Post[] {
  write(KEY, list)
  return list
}

/** slug 冲突时追加序号，保证唯一 */
export function ensureUniqueSlug(slug: string, excludeId?: string): string {
  const taken = new Set(
    listPosts()
      .filter((p) => p.id !== excludeId)
      .map((p) => p.slug),
  )
  if (!taken.has(slug)) return slug
  let i = 2
  while (taken.has(`${slug}-${i}`)) i += 1
  return `${slug}-${i}`
}

export function createPost(input: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post {
  const now = new Date().toISOString()
  const post: Post = {
    ...input,
    slug: ensureUniqueSlug(input.slug),
    id: newId(),
    createdAt: now,
    updatedAt: now,
  }
  save([...listPosts(), post])
  return post
}

export function updatePost(id: string, patch: Partial<Post>): Post {
  const list = listPosts()
  const idx = list.findIndex((p) => p.id === id)
  if (idx < 0) throw new Error('笔记不存在，可能已被删除')

  const merged: Post = { ...list[idx], ...patch, updatedAt: new Date().toISOString() }
  // slug 可能被改动，重新消重
  if (patch.slug !== undefined) {
    merged.slug = ensureUniqueSlug(patch.slug, id)
  }
  list[idx] = merged
  save(list)
  return merged
}

export function deletePost(id: string): void {
  save(listPosts().filter((p) => p.id !== id))
}

// ---------------------------------------------------------------------------
// 检索与统计
// ---------------------------------------------------------------------------

/** 关键词搜索：标题、摘要、正文、标签 */
export function searchPosts(keyword: string): Post[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return listPublishedPosts()
  return listPublishedPosts().filter((p) => {
    return (
      p.title.toLowerCase().includes(kw) ||
      p.summary.toLowerCase().includes(kw) ||
      p.content.toLowerCase().includes(kw) ||
      p.tags.some((t) => t.toLowerCase().includes(kw))
    )
  })
}

/**
 * 标签统计：数量 + 共现关系（同一篇笔记里出现的标签互相连线）
 * 用于前台「知识网络」页
 */
export function listTagStats(): TagStat[] {
  const posts = listPublishedPosts()
  const countMap = new Map<string, number>()
  const coMap = new Map<string, Map<string, number>>()

  posts.forEach((p) => {
    const tags = [...new Set(p.tags)]
    tags.forEach((t) => {
      countMap.set(t, (countMap.get(t) ?? 0) + 1)
    })
    // 两两组合，累计共现次数
    for (let i = 0; i < tags.length; i += 1) {
      for (let j = i + 1; j < tags.length; j += 1) {
        const [a, b] = [tags[i], tags[j]]
        if (!coMap.has(a)) coMap.set(a, new Map())
        if (!coMap.has(b)) coMap.set(b, new Map())
        coMap.get(a)!.set(b, (coMap.get(a)!.get(b) ?? 0) + 1)
        coMap.get(b)!.set(a, (coMap.get(b)!.get(a) ?? 0) + 1)
      }
    }
  })

  return [...countMap.entries()]
    .map(([name, count]) => ({
      name,
      count,
      related: [...(coMap.get(name)?.entries() ?? [])]
        .map(([n, c]) => ({ name: n, count: c }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 5),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/** 相关笔记：同标签数量最多的前 N 篇 */
export function listRelatedPosts(slug: string, limit = 3): Post[] {
  const current = getPostBySlug(slug)
  if (!current) return []
  const tags = new Set(current.tags)

  return listPublishedPosts()
    .filter((p) => p.slug !== slug)
    .map((p) => ({ post: p, score: p.tags.filter((t) => tags.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime())
    .slice(0, limit)
    .map((x) => x.post)
}

export function resetPosts(): Post[] {
  write(KEY, seedPosts)
  return seedPosts
}

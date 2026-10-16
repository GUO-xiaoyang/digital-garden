/**
 * 数字花园 · 笔记管理
 * 列表（含草稿）+ 新建入口 + 编辑跳转 + 删除 + 置顶/发布开关
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePost, listPosts, updatePost } from '../../api/posts'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'
import { formatDate } from '../../lib/date'
import { readingTime } from '../../lib/readingTime'
import type { Post } from '../../types'

type Filter = 'all' | 'published' | 'draft' | 'pinned'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'published', label: '已发布' },
  { key: 'draft', label: '草稿' },
  { key: 'pinned', label: '置顶' },
]

export function PostsAdmin() {
  const toast = useToast()
  const [list, setList] = useState<Post[]>(() => listPosts())
  const [filter, setFilter] = useState<Filter>('all')
  const [keyword, setKeyword] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null)

  const reload = () => setList(listPosts())

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return list
      .filter((p) => {
        if (filter === 'published') return p.published
        if (filter === 'draft') return !p.published
        if (filter === 'pinned') return p.pinned
        return true
      })
      .filter((p) => !kw || p.title.toLowerCase().includes(kw) || p.tags.some((t) => t.toLowerCase().includes(kw)))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [list, filter, keyword])

  /** 切换发布状态 */
  const togglePublished = (p: Post) => {
    updatePost(p.id, { published: !p.published })
    reload()
    toast.success(p.published ? '已转为草稿，前台不再显示' : '已发布，前台立即可见')
  }

  /** 切换置顶 */
  const togglePinned = (p: Post) => {
    updatePost(p.id, { pinned: !p.pinned })
    reload()
    toast.success(p.pinned ? '已取消置顶' : '已置顶，会排在列表最前')
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deletePost(pendingDelete.id)
    reload()
    setPendingDelete(null)
    toast.success('笔记已删除')
  }

  const draftCount = list.filter((p) => !p.published).length

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">笔记管理</h1>
          <p className="mt-1.5 text-[13px] text-ink-3">
            共 {list.length} 篇{draftCount > 0 && ` · ${draftCount} 篇草稿`}
          </p>
        </div>
        <Link to="/admin/posts/new">
          <Button size="sm">+ 写新笔记</Button>
        </Link>
      </header>

      {/* 筛选栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                filter === f.key
                  ? 'bg-accent-a/12 text-accent-a'
                  : 'text-ink-2 hover:bg-elevated hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="按标题或标签搜索…"
          className="ml-auto w-full max-w-[240px] rounded-[10px] border border-line-strong bg-bg px-3 py-2 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent-a/60"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={list.length === 0 ? '还没有笔记' : '没有匹配的笔记'}
          description={list.length === 0 ? '写第一篇笔记，保存后前台首页立即出现。' : undefined}
          action={
            list.length === 0 ? (
              <Link to="/admin/posts/new">
                <Button>+ 写新笔记</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Card className="divide-y divide-[var(--border)]">
          {filtered.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/admin/posts/${p.id}/edit`}
                    className="truncate text-[14px] font-semibold text-ink transition-colors hover:text-accent-a"
                  >
                    {p.title || '(未命名)'}
                  </Link>
                  {p.pinned && <Badge tone="accent-b">置顶</Badge>}
                  <Badge tone={p.published ? 'accent-a' : 'muted'}>{p.published ? '已发布' : '草稿'}</Badge>
                </div>
                <p className="mt-1 line-clamp-1 text-[12.5px] text-ink-3">{p.summary || '（无摘要）'}</p>
                <p className="mt-1 text-[11.5px] text-ink-3">
                  {formatDate(p.createdAt)} · {readingTime(p.content)} 分钟 · {p.tags.join(' / ') || '无标签'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => togglePinned(p)}>
                  {p.pinned ? '取消置顶' : '置顶'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => togglePublished(p)}>
                  {p.published ? '转草稿' : '发布'}
                </Button>
                <Link to={`/admin/posts/${p.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    编辑
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setPendingDelete(p)}>
                  删除
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `确认删除笔记「${pendingDelete.title}」？` : ''}
        description="删除后该笔记将从后台与前台一并消失。"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

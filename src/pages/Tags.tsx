/**
 * 数字花园 · 知识网络（标签视图）
 * 标签云（字号按出现频率加权）+ 共现关系 + 选中标签下的笔记列表
 */
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listPublishedPosts, listTagStats } from '../api/posts'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../lib/date'
import { readingTime } from '../lib/readingTime'

/** 按出现次数映射字号，最多 4 档 */
function sizeClass(count: number, max: number): string {
  if (max <= 1) return 'text-[14px]'
  const ratio = count / max
  if (ratio > 0.75) return 'text-[19px] font-bold'
  if (ratio > 0.5) return 'text-[16.5px] font-semibold'
  if (ratio > 0.25) return 'text-[15px]'
  return 'text-[13.5px]'
}

export function Tags() {
  const { tag } = useParams<{ tag?: string }>()
  const navigate = useNavigate()

  const stats = useMemo(() => listTagStats(), [])
  const posts = useMemo(() => listPublishedPosts(), [])

  const activeTag = tag ? decodeURIComponent(tag) : null
  const maxCount = stats.reduce((m, s) => Math.max(m, s.count), 1)
  const activeStat = stats.find((s) => s.name === activeTag) ?? null
  const activePosts = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : []

  if (stats.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6">
        <EmptyState title="还没有标签" description="写第一篇带标签的笔记后，这里会生成知识网络。" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-[clamp(22px,3.4vw,30px)] font-extrabold tracking-tight">知识网络</h1>
        <p className="mt-2 text-[14px] text-ink-2">
          共 {stats.length} 个标签。字号越大表示该主题下积累的笔记越多；点击标签可查看关联笔记。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ---------------- 标签云 ---------------- */}
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-3">
            {stats.map((s) => {
              const isActive = activeTag === s.name
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => navigate(isActive ? '/tags' : `/tags/${encodeURIComponent(s.name)}`)}
                  className={`rounded-lg px-2 py-1 transition-all duration-200 ${sizeClass(s.count, maxCount)} ${
                    isActive
                      ? 'bg-accent-a/15 text-accent-a'
                      : 'text-ink-2 hover:bg-elevated hover:text-accent-a'
                  }`}
                >
                  {s.name}
                  <sup className="ml-0.5 text-[11px] text-ink-3">{s.count}</sup>
                </button>
              )
            })}
          </div>

          {/* 共现关系：同一篇笔记里出现过的标签互相连线 */}
          <div className="mt-8 border-t border-line pt-5">
            <h2 className="mb-3 text-[13.5px] font-semibold text-ink">标签关联</h2>
            <ul className="space-y-2">
              {stats.slice(0, 8).map((s) => (
                <li key={s.name} className="flex flex-wrap items-center gap-2 text-[12.5px]">
                  <span className="w-24 shrink-0 truncate text-ink-2">{s.name}</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" className="shrink-0 text-ink-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="flex flex-wrap gap-1.5">
                    {s.related.length > 0 ? (
                      s.related.map((r) => (
                        <button
                          key={r.name}
                          type="button"
                          onClick={() => navigate(`/tags/${encodeURIComponent(r.name)}`)}
                          className="rounded-full border border-line-strong bg-elevated px-2 py-0.5 text-ink-3 transition-colors hover:border-accent-a/50 hover:text-accent-a"
                        >
                          {r.name}
                        </button>
                      ))
                    ) : (
                      <span className="text-ink-3">暂无关联</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* ---------------- 选中标签的笔记 ---------------- */}
        <div>
          {activeTag ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[15px] font-bold">
                  「{activeTag}」
                  <span className="ml-2 text-[12.5px] font-normal text-ink-3">{activePosts.length} 篇</span>
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/tags')}
                  className="text-[12.5px] text-ink-3 transition-colors hover:text-accent-a"
                >
                  清除
                </button>
              </div>

              {activePosts.length === 0 ? (
                <EmptyState title="该标签下暂无已发布笔记" />
              ) : (
                <ul className="space-y-2.5">
                  {activePosts.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/posts/${p.slug}`}
                        className="group block rounded-[var(--radius-sm)] border border-line bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-a/40"
                      >
                        <p className="line-clamp-2 text-[13.5px] font-semibold text-ink transition-colors group-hover:text-accent-a">
                          {p.title}
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-[12px] text-ink-3">
                          <time dateTime={p.createdAt}>{formatDate(p.createdAt)}</time>
                          <span aria-hidden="true">·</span>
                          <span>{readingTime(p.content)} 分钟</span>
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <Card className="p-5">
              <h2 className="text-[14px] font-semibold">怎么用这个页面</h2>
              <ol className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink-2">
                <li>1. 点击任意标签，右侧列出该主题下的全部笔记</li>
                <li>2. 「标签关联」显示经常一起出现的标签，可以顺着读下去</li>
                <li>3. 标签越多，这张网络越能反映知识结构</li>
              </ol>
              {activeStat && (
                <p className="mt-4 text-[12.5px] text-ink-3">
                  当前查看：{activeStat.name}（{activeStat.count} 篇）
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

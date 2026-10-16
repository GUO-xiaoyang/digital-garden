/**
 * 数字花园 · 首页（笔记流）
 * Hero + 站点统计 + 标签筛选 + 关键词搜索 + 笔记卡片流（分页）
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPublishedPosts, listTagStats } from '../api/posts'
import { getProfile } from '../api/profile'
import { listVisibleProjects } from '../api/projects'
import { listSkillGroups } from '../api/skills'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Tag } from '../components/ui/Tag'
import { useReveal } from '../hooks/useReveal'
import { formatDate, formatRelative } from '../lib/date'
import { markdownToPlainText } from '../lib/markdown'
import { formatWordCount, readingTime } from '../lib/readingTime'
import type { Post } from '../types'

const PAGE_SIZE = 6

/** 单篇笔记卡片 */
function PostCard({ post }: { post: Post }) {
  const ref = useReveal<HTMLDivElement>()
  const plain = useMemo(() => markdownToPlainText(post.content), [post.content])

  return (
    <Card as="article" interactive className="reveal group p-5">
      <div ref={ref}>
        <Link to={`/posts/${post.slug}`} className="block">
          <div className="mb-3 flex items-center gap-2 text-[12px] text-ink-3">
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingTime(post.content)} 分钟</span>
            <span aria-hidden="true">·</span>
            <span>{formatWordCount(post.content)}</span>
            {post.pinned && (
              <span className="ml-auto rounded-md border border-accent-b/40 bg-accent-b/12 px-1.5 py-0.5 text-[11px] text-accent-b">
                置顶
              </span>
            )}
          </div>

          <h3 className="text-[16.5px] font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent-a">
            {post.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-ink-2">
            {post.summary || plain.slice(0, 100)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {post.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full border border-line-strong bg-elevated px-2 py-0.5 text-[11.5px] text-ink-3"
              >
                {t}
              </span>
            ))}
            {post.tags.length > 4 && (
              <span className="text-[11.5px] text-ink-3">+{post.tags.length - 4}</span>
            )}
          </div>
        </Link>
      </div>
    </Card>
  )
}

export function Home() {
  const profile = getProfile()
  const [keyword, setKeyword] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const allPosts = useMemo(() => listPublishedPosts(), [])
  const tagStats = useMemo(() => listTagStats(), [])
  const projects = useMemo(() => listVisibleProjects(), [])
  const skillGroups = useMemo(() => listSkillGroups(), [])
  const heroRef = useReveal<HTMLDivElement>()

  // 筛选：关键词 + 标签
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return allPosts.filter((p) => {
      const matchTag = !activeTag || p.tags.includes(activeTag)
      if (!matchTag) return false
      if (!kw) return true
      const plain = markdownToPlainText(p.content).toLowerCase()
      return (
        p.title.toLowerCase().includes(kw) ||
        p.summary.toLowerCase().includes(kw) ||
        plain.includes(kw) ||
        p.tags.some((t) => t.toLowerCase().includes(kw))
      )
    })
  }, [allPosts, keyword, activeTag])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetPage = () => setPage(1)
  const skillCount = skillGroups.reduce((sum, g) => sum + g.skills.length, 0)

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="glow-top relative overflow-hidden px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
        <div ref={heroRef} className="reveal mx-auto w-full max-w-[1200px]">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-a/30 bg-accent-a/10 px-3 py-1 text-[12.5px] text-accent-a">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-a" aria-hidden="true" />
            {profile.jobTarget}
          </p>

          <h1 className="max-w-3xl text-[clamp(26px,5vw,42px)] font-extrabold leading-[1.2] tracking-tight">
            {profile.name}
            <span className="mt-2 block text-[clamp(17px,2.6vw,23px)] font-semibold text-ink-2">
              {profile.headline}
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">
            {/* 简介是 Markdown，首屏只取第一段纯文本，避免露出 ** 等标记 */}
            {markdownToPlainText(profile.bio.split('\n')[0])}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-a px-5 py-2.5 text-[14px] font-semibold text-[#04211d] transition-all duration-200 hover:brightness-110"
            >
              看项目
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-elevated px-5 py-2.5 text-[14px] font-semibold text-ink transition-colors duration-200 hover:border-accent-a/50 hover:text-accent-a"
            >
              关于我
            </Link>
          </div>

          {/* 站点统计 */}
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line sm:grid-cols-4">
            {[
              { label: '笔记', value: allPosts.length },
              { label: '标签', value: tagStats.length },
              { label: '项目', value: projects.length },
              { label: '技能', value: skillCount },
            ].map((s) => (
              <div key={s.label} className="bg-card px-4 py-3.5">
                <dt className="text-[12px] text-ink-3">{s.label}</dt>
                <dd className="mt-0.5 text-[20px] font-bold tabular-nums text-accent-a">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- 筛选栏 ---------------- */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex flex-col gap-4 rounded-[var(--radius)] border border-line bg-card p-4 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">搜索笔记</span>
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  resetPage()
                }}
                placeholder="搜索标题、摘要、正文或标签…"
                className="w-full rounded-[10px] border border-line-strong bg-bg py-2 pl-9 pr-3 text-[13.5px] text-ink placeholder:text-ink-3 focus:border-accent-a/60 focus:outline-none"
              />
            </label>

            <div className="flex items-center gap-3 text-[12.5px] text-ink-3">
              <span>共 {filtered.length} 篇</span>
              {(keyword || activeTag) && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword('')
                    setActiveTag(null)
                    resetPage()
                  }}
                  className="rounded-lg border border-line-strong px-2.5 py-1 text-ink-2 transition-colors hover:border-accent-a/50 hover:text-accent-a"
                >
                  清除筛选
                </button>
              )}
            </div>
          </div>

          {/* 标签快捷筛选 */}
          {tagStats.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Tag label="全部" active={activeTag === null} onClick={() => { setActiveTag(null); resetPage() }} />
              {tagStats.slice(0, 12).map((t) => (
                <Tag
                  key={t.name}
                  label={t.name}
                  count={t.count}
                  active={activeTag === t.name}
                  onClick={() => {
                    setActiveTag(activeTag === t.name ? null : t.name)
                    resetPage()
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- 笔记列表 ---------------- */}
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-[1200px]">
          {pageItems.length === 0 ? (
            <EmptyState
              title={allPosts.length === 0 ? '还没有笔记' : '没有匹配的笔记'}
              description={
                allPosts.length === 0
                  ? '去后台 /admin/posts 写第一篇笔记，保存后这里会立即出现。'
                  : '换个关键词或清除标签筛选再试试。'
              }
              action={
                allPosts.length === 0 ? (
                  <Link
                    to="/admin/posts/new"
                    className="inline-flex rounded-xl bg-accent-a px-5 py-2.5 text-[14px] font-semibold text-[#04211d]"
                  >
                    去写笔记
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2" aria-label="分页">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                    className="rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-accent-a/50 hover:text-accent-a disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-ink-2"
                  >
                    上一页
                  </button>
                  <span className="px-2 text-[13px] text-ink-3 tabular-nums">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(safePage + 1)}
                    className="rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-accent-a/50 hover:text-accent-a disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-ink-2"
                  >
                    下一页
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {/* ---------------- 最近更新 ---------------- */}
      {allPosts.length > 0 && (
        <section className="px-4 pb-8 sm:px-6">
          <div className="mx-auto w-full max-w-[1200px] rounded-[var(--radius)] border border-line bg-card p-5">
            <h2 className="mb-3 text-[14px] font-semibold text-ink">最近更新</h2>
            <ul className="space-y-2">
              {allPosts.slice(0, 3).map((p) => (
                <li key={p.id} className="flex items-center gap-3 text-[13.5px]">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-accent-b" aria-hidden="true" />
                  <Link to={`/posts/${p.slug}`} className="truncate text-ink-2 transition-colors hover:text-accent-a">
                    {p.title}
                  </Link>
                  <time className="ml-auto shrink-0 text-[12px] text-ink-3" dateTime={p.updatedAt}>
                    {formatRelative(p.updatedAt)}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * 数字花园 · 笔记详情
 * Markdown 渲染 + 右侧目录（滚动高亮）+ 相关笔记 + 复制链接
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPostBySlug, listPublishedPosts, listRelatedPosts } from '../api/posts'
import { EmptyState } from '../components/ui/EmptyState'
import { Tag } from '../components/ui/Tag'
import { useToast } from '../components/ui/Toast'
import { copyText, formatDate } from '../lib/date'
import { renderMarkdown } from '../lib/markdown'
import { readingTime } from '../lib/readingTime'
import { extractToc, observeActiveHeading, type TocItem } from '../lib/toc'

export function PostDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const toast = useToast()

  const post = useMemo(() => getPostBySlug(slug), [slug])
  const related = useMemo(() => (post ? listRelatedPosts(slug, 3) : []), [slug, post])
  const html = useMemo(() => (post ? renderMarkdown(post.content) : ''), [post])

  const articleRef = useRef<HTMLDivElement | null>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')

  // 渲染完成后提取目录（标题 id 由 extractToc 写入 DOM）
  useEffect(() => {
    if (!post) return
    // 等一帧确保 DOM 已挂载
    const raf = requestAnimationFrame(() => {
      const items = extractToc(articleRef.current)
      setToc(items)
      setActiveId(items[0]?.id ?? '')
    })
    return () => cancelAnimationFrame(raf)
  }, [post, html])

  // 监听标题位置，高亮当前章节
  useEffect(() => {
    if (toc.length === 0) return
    const cleanup = observeActiveHeading(
      articleRef.current,
      toc.map((t) => t.id),
      setActiveId,
    )
    return cleanup
  }, [toc])

  // 上一篇 / 下一篇
  const { prev, next } = useMemo(() => {
    if (!post) return { prev: null, next: null }
    const list = listPublishedPosts()
    const idx = list.findIndex((p) => p.slug === post.slug)
    return {
      prev: idx > 0 ? list[idx - 1] : null,
      next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
    }
  }, [post])

  const handleCopyLink = async () => {
    const ok = await copyText(window.location.href)
    toast[ok ? 'success' : 'error'](ok ? '链接已复制' : '复制失败，请手动复制地址栏')
  }

  if (!post || !post.published) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6">
        <EmptyState
          title="这篇笔记不存在"
          description="它可能已被删除，或还是草稿状态未发布。"
          action={
            <Link
              to="/"
              className="inline-flex rounded-xl bg-accent-a px-5 py-2.5 text-[14px] font-semibold text-[#04211d]"
            >
              返回笔记列表
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6">
      {/* 返回 */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-ink-3 transition-colors hover:text-accent-a"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M19 12H6M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        返回列表
      </Link>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_216px] lg:gap-10">
        {/* ---------------- 正文 ---------------- */}
        <div className="min-w-0">
          <header className="mb-8">
            <h1 className="text-[clamp(23px,3.6vw,32px)] font-extrabold leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-ink-3">
              <time dateTime={post.createdAt}>发布于 {formatDate(post.createdAt)}</time>
              {post.updatedAt !== post.createdAt && (
                <time dateTime={post.updatedAt}>更新于 {formatDate(post.updatedAt)}</time>
              )}
              <span aria-hidden="true">·</span>
              <span>{readingTime(post.content)} 分钟读完</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1 transition-colors hover:border-accent-a/50 hover:text-accent-a"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
                </svg>
                复制链接
              </button>
            </div>

            {post.summary && (
              <p className="mt-4 rounded-[var(--radius-sm)] border-l-2 border-accent-a/60 bg-accent-a/[0.06] px-4 py-3 text-[13.5px] leading-relaxed text-ink-2">
                {post.summary}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <Tag key={t} label={t} to={`/tags/${encodeURIComponent(t)}`} />
                ))}
              </div>
            )}
          </header>

          {/* Markdown 正文（已经过 DOMPurify 消毒） */}
          <div
            ref={articleRef}
            className="prose-garden"
            dangerouslySetInnerHTML={{ __html: html }}
            style={{ maxWidth: '100%', overflowWrap: 'anywhere' }}
          />

          {/* 上一篇 / 下一篇 */}
          {(prev || next) && (
            <nav className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label="相邻笔记">
              {prev ? (
                <Link
                  to={`/posts/${prev.slug}`}
                  className="group rounded-[var(--radius-sm)] border border-line bg-card p-4 transition-colors hover:border-accent-a/40"
                >
                  <span className="text-[11.5px] text-ink-3">上一篇</span>
                  <p className="mt-1 line-clamp-2 text-[13.5px] text-ink-2 transition-colors group-hover:text-accent-a">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to={`/posts/${next.slug}`}
                  className="group rounded-[var(--radius-sm)] border border-line bg-card p-4 text-right transition-colors hover:border-accent-a/40 sm:text-right"
                >
                  <span className="text-[11.5px] text-ink-3">下一篇</span>
                  <p className="mt-1 line-clamp-2 text-[13.5px] text-ink-2 transition-colors group-hover:text-accent-a">
                    {next.title}
                  </p>
                </Link>
              )}
            </nav>
          )}

          {/* 相关笔记 */}
          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-[15px] font-bold">相关笔记</h2>
              <ul className="grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/posts/${r.slug}`}
                      className="group block h-full rounded-[var(--radius-sm)] border border-line bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-a/40"
                    >
                      <p className="line-clamp-2 text-[13.5px] font-semibold text-ink transition-colors group-hover:text-accent-a">
                        {r.title}
                      </p>
                      <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-3">{r.summary}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ---------------- 目录（桌面端） ---------------- */}
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-ink-3">目录</p>
              <nav aria-label="文章目录">
                <ul className="space-y-1.5 border-l border-line">
                  {toc.map((item) => (
                    <li key={item.id} style={{ paddingLeft: item.level === 3 ? 14 : 0 }}>
                      <a
                        href={`#${item.id}`}
                        className={`-ml-px block border-l-2 py-1 pl-3 text-[12.5px] leading-snug transition-colors duration-200 ${
                          activeId === item.id
                            ? 'border-accent-a text-accent-a'
                            : 'border-transparent text-ink-3 hover:border-line-strong hover:text-ink-2'
                        }`}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

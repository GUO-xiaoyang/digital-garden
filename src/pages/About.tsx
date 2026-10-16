/**
 * 数字花园 · 关于我
 * 简介 + 经历时间线 + 技能熟练度 + 邮箱一键复制 + 联系方式
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile } from '../api/profile'
import { listSkillGroups } from '../api/skills'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useReveal } from '../hooks/useReveal'
import { copyText } from '../lib/date'
import { renderMarkdown } from '../lib/markdown'
import type { TimelineItem } from '../types'

const TYPE_META: Record<TimelineItem['type'], { label: string; tone: 'accent-a' | 'accent-b' | 'muted' }> = {
  education: { label: '教育', tone: 'accent-a' },
  work: { label: '实习', tone: 'accent-b' },
  other: { label: '其它', tone: 'muted' },
}

export function About() {
  const profile = getProfile()
  const groups = useMemo(() => listSkillGroups(), [])
  const bioHtml = useMemo(() => renderMarkdown(profile.bio), [profile.bio])
  const [copied, setCopied] = useState(false)
  const bioRef = useReveal<HTMLDivElement>()
  const timelineRef = useReveal<HTMLDivElement>()
  const skillsRef = useReveal<HTMLDivElement>()

  const handleCopyEmail = async () => {
    const ok = await copyText(profile.email)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  // 时间线按时间倒序（字符串前缀年份可直接比较）
  const timeline = [...profile.timeline].sort((a, b) => b.period.localeCompare(a.period))

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-12 sm:px-6">
      {/* ---------------- 头部 ---------------- */}
      <header className="reveal is-visible mb-10">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl border border-accent-a/30 bg-accent-a/10 text-[22px] font-extrabold text-accent-a"
            aria-hidden="true"
          >
            {profile.name.slice(0, 1)}
          </span>
          <div>
            <h1 className="text-[clamp(22px,3.4vw,28px)] font-extrabold tracking-tight">{profile.name}</h1>
            <p className="mt-1 text-[13.5px] text-ink-2">{profile.headline}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge tone="accent-a">{profile.jobTarget}</Badge>
          <Badge tone="muted">{profile.city}</Badge>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-elevated px-4 py-2 text-[13.5px] text-ink-2 transition-colors hover:border-accent-a/50 hover:text-accent-a"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {copied ? '已复制到剪贴板 ✓' : profile.email}
          </button>

          {profile.socials.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-elevated px-4 py-2 text-[13.5px] text-ink-2 transition-colors hover:border-accent-a/50 hover:text-accent-a"
            >
              {s.label}
            </a>
          ))}

          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-a px-4 py-2 text-[13.5px] font-semibold text-[#04211d] transition-all hover:brightness-110"
            >
              下载简历
            </a>
          )}
        </div>
      </header>

      {/* ---------------- 简介 ---------------- */}
      <section className="mb-10">
        <div ref={bioRef} className="reveal">
          <h2 className="mb-4 text-[16px] font-bold">简介</h2>
          <div className="prose-garden" dangerouslySetInnerHTML={{ __html: bioHtml }} />
        </div>
      </section>

      {/* ---------------- 经历时间线 ---------------- */}
      {timeline.length > 0 && (
        <section className="mb-10">
          <div ref={timelineRef} className="reveal">
            <h2 className="mb-5 text-[16px] font-bold">经历</h2>
            <ol className="relative space-y-5 border-l border-line pl-6">
              {timeline.map((item) => {
                const meta = TYPE_META[item.type]
                return (
                  <li key={item.id} className="relative">
                    {/* 时间线节点 */}
                    <span
                      className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent-a"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <time className="text-[12.5px] tabular-nums text-ink-3">{item.period}</time>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <p className="mt-1.5 text-[15px] font-semibold text-ink">
                      {item.title}
                      {item.subtitle && <span className="ml-2 text-[13px] font-normal text-ink-3">{item.subtitle}</span>}
                    </p>
                    {item.description && (
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{item.description}</p>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ---------------- 技能 ---------------- */}
      {groups.length > 0 && (
        <section className="mb-10">
          <div ref={skillsRef} className="reveal">
            <h2 className="mb-5 text-[16px] font-bold">技能</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {groups.map((g) => (
                <Card key={g.id} className="p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold">
                    <span className="h-1 w-1 rounded-full bg-accent-a" aria-hidden="true" />
                    {g.name}
                  </h3>
                  <ul className="space-y-3.5">
                    {g.skills.map((s) => (
                      <li key={s.id}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[13.5px] text-ink">{s.name}</span>
                          <span className="text-[12px] tabular-nums text-ink-3">{s.level}%</span>
                        </div>
                        {/* 熟练度进度条 */}
                        <div
                          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated"
                          role="progressbar"
                          aria-valuenow={s.level}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${s.name} 熟练度`}
                        >
                          <span
                            className="block h-full rounded-full transition-[width] duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, s.level))}%`,
                              background: 'linear-gradient(90deg, var(--accent-a), var(--accent-b))',
                            }}
                          />
                        </div>
                        {s.note && <p className="mt-1 text-[11.5px] text-ink-3">{s.note}</p>}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- 引导 ---------------- */}
      <section className="rounded-[var(--radius)] border border-line bg-card p-5 text-center">
        <p className="text-[14px] text-ink-2">想看我最近在学什么？笔记里记录得更细。</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-a px-5 py-2.5 text-[14px] font-semibold text-[#04211d] transition-all hover:brightness-110"
        >
          去看笔记
        </Link>
      </section>
    </div>
  )
}

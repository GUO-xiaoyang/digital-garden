/**
 * 数字花园 · 项目展示
 * 卡片列表 + 技术标签筛选 + 展开查看详情（Markdown）
 */
import { useMemo, useState } from 'react'
import { listProjectTags, listVisibleProjects } from '../api/projects'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Tag } from '../components/ui/Tag'
import { useReveal } from '../hooks/useReveal'
import { renderMarkdown } from '../lib/markdown'
import type { Project } from '../types'

const STATUS_LABEL: Record<Project['status'], { text: string; tone: 'accent-a' | 'muted' | 'accent-b' }> = {
  active: { text: '进行中', tone: 'accent-a' },
  done: { text: '已完成', tone: 'muted' },
  archived: { text: '已归档', tone: 'accent-b' },
}

function ProjectCard({ project }: { project: Project }) {
  const ref = useReveal<HTMLDivElement>()
  const [expanded, setExpanded] = useState(false)
  const html = useMemo(() => renderMarkdown(project.content), [project.content])
  const status = STATUS_LABEL[project.status]

  return (
    <Card as="article" className="reveal p-5 sm:p-6">
      <div ref={ref}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-2 text-[17px] font-bold tracking-tight">
              {project.name}
              {project.featured && <Badge tone="accent-b">精选</Badge>}
            </h2>
            <p className="mt-1.5 text-[13px] text-ink-3">
              {project.role}
              {project.role && project.period && ' · '}
              {project.period}
            </p>
          </div>
          <Badge tone={status.tone}>{status.text}</Badge>
        </div>

        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{project.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {project.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line-strong bg-elevated px-2 py-0.5 text-[11.5px] text-ink-3"
            >
              {t}
            </span>
          ))}
        </div>

        {/* 展开后的详情 */}
        {expanded && (
          <div
            className="prose-garden mt-5 border-t border-line pt-5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-elevated px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-accent-a/50 hover:text-accent-a"
          >
            {expanded ? '收起详情' : '查看详情'}
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-elevated px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-accent-a/50 hover:text-accent-a"
            >
              源码
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent-a/40 bg-accent-a/12 px-3 py-1.5 text-[13px] text-accent-a transition-colors hover:bg-accent-a/20"
            >
              在线预览
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

export function Projects() {
  const all = useMemo(() => listVisibleProjects(), [])
  const tags = useMemo(() => listProjectTags(), [])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const list = activeTag ? all.filter((p) => p.tags.includes(activeTag)) : all

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-[clamp(22px,3.4vw,30px)] font-extrabold tracking-tight">项目</h1>
        <p className="mt-2 text-[14px] text-ink-2">
          共 {all.length} 个项目。点「查看详情」可以看到背景、我负责的部分和踩过的坑。
        </p>
      </header>

      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          <Tag label="全部" active={activeTag === null} onClick={() => setActiveTag(null)} />
          {tags.map((t) => (
            <Tag
              key={t}
              label={t}
              active={activeTag === t}
              onClick={() => setActiveTag(activeTag === t ? null : t)}
            />
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          title={all.length === 0 ? '还没有项目' : '该技术下暂无项目'}
          description={all.length === 0 ? '去后台 /admin/projects 添加第一个项目。' : undefined}
        />
      ) : (
        <div className="grid gap-5">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}

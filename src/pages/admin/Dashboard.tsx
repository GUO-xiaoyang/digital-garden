/**
 * 数字花园 · 后台仪表盘
 * 内容统计概览 + 最近更新 + 快捷入口
 */
import { Link } from 'react-router-dom'
import { listPosts } from '../../api/posts'
import { getProfile } from '../../api/profile'
import { listProjects } from '../../api/projects'
import { listSkillGroups } from '../../api/skills'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { formatRelative } from '../../lib/date'
import { formatWordCount } from '../../lib/readingTime'

const QUICK_LINKS = [
  { to: '/admin/posts/new', label: '写一篇笔记', desc: '左写右预览，实时渲染' },
  { to: '/admin/projects', label: '管理项目', desc: '增删改项目与详情' },
  { to: '/admin/skills', label: '更新技能', desc: '调整分组与熟练度' },
  { to: '/admin/profile', label: '改个人信息', desc: '简介、经历、联系方式' },
]

export function Dashboard() {
  const posts = listPosts()
  const projects = listProjects()
  const groups = listSkillGroups()
  const profile = getProfile()

  const publishedCount = posts.filter((p) => p.published).length
  const draftCount = posts.length - publishedCount
  const skillCount = groups.reduce((sum, g) => sum + g.skills.length, 0)
  const totalWords = posts.reduce((sum, p) => {
    const n = Number(formatWordCount(p.content).replace(/[^\d.]/g, ''))
    return sum + (formatWordCount(p.content).includes('k') ? n * 1000 : n)
  }, 0)

  // 最近更新的 5 条内容（笔记 + 项目合并排序）
  const recent = [
    ...posts.map((p) => ({ id: p.id, type: '笔记' as const, title: p.title, at: p.updatedAt, to: `/admin/posts/${p.id}/edit` })),
    ...projects.map((p) => ({ id: p.id, type: '项目' as const, title: p.name, at: p.updatedAt, to: '/admin/projects' })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 5)

  const stats = [
    { label: '已发布笔记', value: publishedCount, hint: draftCount > 0 ? `另有 ${draftCount} 篇草稿` : '无草稿' },
    { label: '项目', value: projects.length, hint: `${projects.filter((p) => p.featured).length} 个精选` },
    { label: '技能项', value: skillCount, hint: `${groups.length} 个分组` },
    { label: '正文规模', value: `≈${Math.round(totalWords / 1000)}k`, hint: '按中文等效字数' },
  ]

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[20px] font-bold tracking-tight">仪表盘</h1>
        <p className="mt-1.5 text-[13px] text-ink-3">
          {profile.name} · {profile.jobTarget}
        </p>
      </header>

      {/* 统计卡片 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-[12.5px] text-ink-3">{s.label}</p>
            <p className="mt-1 text-[24px] font-extrabold tabular-nums text-accent-a">{s.value}</p>
            <p className="mt-1 text-[11.5px] text-ink-3">{s.hint}</p>
          </Card>
        ))}
      </div>

      {/* 快捷入口 */}
      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-bold">快捷操作</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group flex items-center justify-between rounded-[var(--radius)] border border-line bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-a/40"
            >
              <span>
                <span className="block text-[14px] font-semibold text-ink transition-colors group-hover:text-accent-a">
                  {q.label}
                </span>
                <span className="mt-1 block text-[12.5px] text-ink-3">{q.desc}</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent-a"
                aria-hidden="true"
              >
                <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* 最近更新 */}
      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-bold">最近更新</h2>
        {recent.length === 0 ? (
          <Card className="p-5 text-[13px] text-ink-3">还没有内容，从「写一篇笔记」开始吧。</Card>
        ) : (
          <Card className="divide-y divide-[var(--border)]">
            {recent.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated"
              >
                <Badge tone={item.type === '笔记' ? 'accent-a' : 'accent-b'}>{item.type}</Badge>
                <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink-2">{item.title}</span>
                <time className="shrink-0 text-[12px] text-ink-3" dateTime={item.at}>
                  {formatRelative(item.at)}
                </time>
              </Link>
            ))}
          </Card>
        )}
      </section>

      {/* 数据说明 */}
      <p className="mt-8 rounded-[var(--radius)] border border-line bg-card/50 p-4 text-[12.5px] leading-relaxed text-ink-3">
        所有内容保存在当前浏览器的 localStorage 中，换设备或清理浏览器数据会丢失。
        修改后前台立即生效，无需重新部署。
      </p>
    </div>
  )
}

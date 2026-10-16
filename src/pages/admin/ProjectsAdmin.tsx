/**
 * 数字花园 · 项目管理
 * 列表 + 新建 / 编辑 / 删除（含 Markdown 详情编辑）
 */
import { useState } from 'react'
import { createProject, deleteProject, listProjects, updateProject } from '../../api/projects'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { Field } from '../../components/admin/Field'
import { MarkdownEditor } from '../../components/admin/MarkdownEditor'
import { TagInput } from '../../components/admin/TagInput'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'
import { formatDate } from '../../lib/date'
import type { Project, ProjectStatus } from '../../types'

const INPUT =
  'w-full rounded-[10px] border border-line-strong bg-bg px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent-a/60'

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: '进行中',
  done: '已完成',
  archived: '已归档',
}

/** 空白表单的初始值 */
function blankProject(): Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    summary: '',
    content: '',
    tags: [],
    role: '',
    period: '',
    repoUrl: '',
    demoUrl: '',
    status: 'done',
    featured: false,
  }
}

export function ProjectsAdmin() {
  const toast = useToast()
  const [list, setList] = useState<Project[]>(() => listProjects())
  const [editing, setEditing] = useState<Project | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState(blankProject())
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)

  const reload = () => setList(listProjects())

  // ---------------- 新建 ----------------
  const startCreate = () => {
    setCreating(true)
    setEditing(null)
    setDraft(blankProject())
  }

  const submitCreate = () => {
    if (!draft.name.trim()) {
      toast.error('项目名称不能为空')
      return
    }
    createProject({ ...draft, name: draft.name.trim() })
    reload()
    setCreating(false)
    toast.success('项目已创建，前台立即生效')
  }

  // ---------------- 编辑 ----------------
  const startEdit = (p: Project) => {
    setEditing(p)
    setCreating(false)
    setDraft({ ...p })
  }

  const submitEdit = () => {
    if (!editing) return
    if (!draft.name.trim()) {
      toast.error('项目名称不能为空')
      return
    }
    try {
      updateProject(editing.id, draft)
      reload()
      setEditing(null)
      toast.success('项目已更新')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败')
    }
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteProject(pendingDelete.id)
    reload()
    setPendingDelete(null)
    toast.success('项目已删除')
  }

  const isFormOpen = creating || editing !== null
  const patch = (p: Partial<Project>) => setDraft((prev) => ({ ...prev, ...p }))

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">项目管理</h1>
          <p className="mt-1.5 text-[13px] text-ink-3">共 {list.length} 个项目</p>
        </div>
        {!isFormOpen && (
          <Button size="sm" onClick={startCreate}>
            + 新建项目
          </Button>
        )}
      </header>

      {/* ---------------- 表单 ---------------- */}
      {isFormOpen && (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 text-[15px] font-bold">{creating ? '新建项目' : `编辑：${editing?.name}`}</h2>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="项目名称" htmlFor="p-name" required>
                <input
                  id="p-name"
                  className={INPUT}
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="如：CRM 客户关系管理系统"
                />
              </Field>

              <Field label="我的角色" htmlFor="p-role">
                <input
                  id="p-role"
                  className={INPUT}
                  value={draft.role ?? ''}
                  onChange={(e) => patch({ role: e.target.value })}
                  placeholder="如：Java 后端开发实习生"
                />
              </Field>
            </div>

            <Field label="一句话描述" htmlFor="p-summary" hint="显示在项目卡片上">
              <input
                id="p-summary"
                className={INPUT}
                value={draft.summary}
                onChange={(e) => patch({ summary: e.target.value })}
                placeholder="用一句话说清这个项目做了什么"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="时间" htmlFor="p-period">
                <input
                  id="p-period"
                  className={INPUT}
                  value={draft.period ?? ''}
                  onChange={(e) => patch({ period: e.target.value })}
                  placeholder="如：实习期间 / 2026.03"
                />
              </Field>

              <Field label="状态" htmlFor="p-status">
                <select
                  id="p-status"
                  className={INPUT}
                  value={draft.status}
                  onChange={(e) => patch({ status: e.target.value as ProjectStatus })}
                >
                  {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="是否精选" htmlFor="p-featured" hint="精选会排在前台列表前面">
                <label className="flex h-[42px] cursor-pointer items-center gap-2 rounded-[10px] border border-line-strong bg-bg px-3">
                  <input
                    id="p-featured"
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => patch({ featured: e.target.checked })}
                    className="h-4 w-4 accent-[var(--accent-a)]"
                  />
                  <span className="text-[13px] text-ink-2">{draft.featured ? '是' : '否'}</span>
                </label>
              </Field>
            </div>

            <Field label="技术标签" htmlFor="p-tags" hint="回车添加，最多 8 个">
              <TagInput value={draft.tags} onChange={(tags) => patch({ tags })} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="源码链接" htmlFor="p-repo" hint="留空则不显示按钮">
                <input
                  id="p-repo"
                  className={INPUT}
                  value={draft.repoUrl ?? ''}
                  onChange={(e) => patch({ repoUrl: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </Field>

              <Field label="在线预览链接" htmlFor="p-demo">
                <input
                  id="p-demo"
                  className={INPUT}
                  value={draft.demoUrl ?? ''}
                  onChange={(e) => patch({ demoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <Field label="项目详情（Markdown）" htmlFor="p-content">
              <MarkdownEditor
                value={draft.content}
                onChange={(content) => patch({ content })}
                placeholder={'## 项目背景\n\n## 我负责的部分\n\n## 遇到的难点\n\n## 收获'}
                minHeight={360}
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setCreating(false)
                setEditing(null)
              }}
            >
              取消
            </Button>
            <Button onClick={creating ? submitCreate : submitEdit}>
              {creating ? '创建项目' : '保存修改'}
            </Button>
          </div>
        </Card>
      )}

      {/* ---------------- 列表 ---------------- */}
      {list.length === 0 ? (
        <EmptyState
          title="还没有项目"
          description="点右上角「新建项目」添加第一个。"
          action={!isFormOpen ? <Button onClick={startCreate}>+ 新建项目</Button> : undefined}
        />
      ) : (
        <Card className="divide-y divide-[var(--border)]">
          {list.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink">{p.name}</span>
                  {p.featured && <Badge tone="accent-b">精选</Badge>}
                  <Badge tone={p.status === 'active' ? 'accent-a' : 'muted'}>{STATUS_LABEL[p.status]}</Badge>
                </div>
                <p className="mt-1 line-clamp-1 text-[12.5px] text-ink-3">{p.summary}</p>
                <p className="mt-1 text-[11.5px] text-ink-3">
                  更新于 {formatDate(p.updatedAt)} · {p.tags.slice(0, 4).join(' / ') || '无标签'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => startEdit(p)}>
                  编辑
                </Button>
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
        title={pendingDelete ? `确认删除项目「${pendingDelete.name}」？` : ''}
        description="删除后该项目会从前台消失。"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

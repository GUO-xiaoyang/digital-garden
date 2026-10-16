/**
 * 数字花园 · 个人信息管理
 * 基础信息表单 + 经历时间线增删改 + 社交链接增删改
 */
import { useState } from 'react'
import {
  addSocial,
  addTimelineItem,
  getProfile,
  removeSocial,
  removeTimelineItem,
  updateProfile,
  updateSocial,
  updateTimelineItem,
} from '../../api/profile'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { Field } from '../../components/admin/Field'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import type { Profile, TimelineItem } from '../../types'

const TYPE_LABEL: Record<TimelineItem['type'], string> = {
  education: '教育',
  work: '实习',
  other: '其它',
}

const INPUT =
  'w-full rounded-[10px] border border-line-strong bg-bg px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent-a/60'

export function ProfileAdmin() {
  const toast = useToast()
  const [profile, setProfile] = useState<Profile>(() => getProfile())
  const [dirty, setDirty] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ kind: 'timeline' | 'social'; id: string; label: string } | null>(
    null,
  )

  const patch = (p: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...p }))
    setDirty(true)
  }

  const handleSave = () => {
    if (!profile.name.trim()) {
      toast.error('姓名不能为空')
      return
    }
    updateProfile({
      name: profile.name.trim(),
      headline: profile.headline,
      bio: profile.bio,
      email: profile.email,
      city: profile.city,
      jobTarget: profile.jobTarget,
      resumeUrl: profile.resumeUrl,
      socials: profile.socials,
      timeline: profile.timeline,
    })
    setDirty(false)
    toast.success('个人信息已保存，前台立即生效')
  }

  const handleReset = () => {
    setProfile(getProfile())
    setDirty(false)
    toast.info('已放弃未保存的修改')
  }

  // ---------------- 时间线 ----------------
  const addTimeline = () => {
    const item: Omit<TimelineItem, 'id'> = {
      period: '2026.01 — 2026.06',
      title: '新的经历',
      subtitle: '',
      description: '',
      type: 'other',
    }
    const next = addTimelineItem(item)
    setProfile(next)
    toast.success('已新增一条经历，请补充内容后保存')
  }

  const editTimeline = (id: string, p: Partial<TimelineItem>) => {
    const next = updateTimelineItem(id, p)
    setProfile(next)
    setDirty(true)
  }

  // ---------------- 社交链接 ----------------
  const addSocialLink = () => {
    const next = addSocial({ label: '新链接', url: 'https://' })
    setProfile(next)
    toast.success('已新增一条链接')
  }

  const editSocial = (id: string, p: { label?: string; url?: string }) => {
    const next = updateSocial(id, p)
    setProfile(next)
    setDirty(true)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const next =
      pendingDelete.kind === 'timeline'
        ? removeTimelineItem(pendingDelete.id)
        : removeSocial(pendingDelete.id)
    setProfile(next)
    setPendingDelete(null)
    toast.success('已删除')
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">个人信息</h1>
          <p className="mt-1.5 text-[13px] text-ink-3">这些内容会显示在前台首屏与「关于我」页</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <Badge tone="accent-b">有未保存的修改</Badge>}
          {dirty && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              放弃
            </Button>
          )}
          <Button size="sm" onClick={handleSave}>
            保存
          </Button>
        </div>
      </header>

      {/* ---------------- 基础信息 ---------------- */}
      <Card className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="姓名" htmlFor="name" required>
            <input
              id="name"
              className={INPUT}
              value={profile.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="你的名字"
            />
          </Field>

          <Field label="求职方向" htmlFor="jobTarget">
            <input
              id="jobTarget"
              className={INPUT}
              value={profile.jobTarget}
              onChange={(e) => patch({ jobTarget: e.target.value })}
              placeholder="如：Java 后端研发工程师"
            />
          </Field>
        </div>

        <Field label="一句话简介" htmlFor="headline" hint="显示在姓名下方，建议 20 字以内">
          <input
            id="headline"
            className={INPUT}
            value={profile.headline}
            onChange={(e) => patch({ headline: e.target.value })}
            placeholder="如：Java 后端开发 · 把复杂的业务拆成清晰的接口"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="邮箱" htmlFor="email">
            <input
              id="email"
              type="email"
              className={INPUT}
              value={profile.email}
              onChange={(e) => patch({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="所在城市" htmlFor="city">
            <input
              id="city"
              className={INPUT}
              value={profile.city}
              onChange={(e) => patch({ city: e.target.value })}
              placeholder="如：江西抚州"
            />
          </Field>
        </div>

        <Field
          label="简介正文"
          htmlFor="bio"
          hint="支持 Markdown，会显示在「关于我」页"
        >
          <textarea
            id="bio"
            rows={7}
            className={`${INPUT} resize-y font-mono text-[13px] leading-relaxed`}
            value={profile.bio}
            onChange={(e) => patch({ bio: e.target.value })}
          />
        </Field>

        <Field label="简历链接" htmlFor="resumeUrl" hint="留空则前台隐藏「下载简历」按钮">
          <input
            id="resumeUrl"
            className={INPUT}
            value={profile.resumeUrl ?? ''}
            onChange={(e) => patch({ resumeUrl: e.target.value })}
            placeholder="https://example.com/resume.pdf"
          />
        </Field>
      </Card>

      {/* ---------------- 经历时间线 ---------------- */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">经历</h2>
          <Button variant="secondary" size="sm" onClick={addTimeline}>
            + 新增经历
          </Button>
        </div>

        {profile.timeline.length === 0 ? (
          <Card className="p-5 text-[13px] text-ink-3">还没有经历，点右上角新增。</Card>
        ) : (
          <div className="space-y-3">
            {profile.timeline.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="时间" htmlFor={`period-${item.id}`}>
                    <input
                      id={`period-${item.id}`}
                      className={INPUT}
                      value={item.period}
                      onChange={(e) => editTimeline(item.id, { period: e.target.value })}
                      placeholder="2022.09 — 2026.06"
                    />
                  </Field>

                  <Field label="类型" htmlFor={`type-${item.id}`}>
                    <select
                      id={`type-${item.id}`}
                      className={INPUT}
                      value={item.type}
                      onChange={(e) => editTimeline(item.id, { type: e.target.value as TimelineItem['type'] })}
                    >
                      {(['education', 'work', 'other'] as const).map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABEL[t]}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="标题" htmlFor={`title-${item.id}`}>
                    <input
                      id={`title-${item.id}`}
                      className={INPUT}
                      value={item.title}
                      onChange={(e) => editTimeline(item.id, { title: e.target.value })}
                      placeholder="学校 / 公司名称"
                    />
                  </Field>

                  <Field label="副标题" htmlFor={`sub-${item.id}`}>
                    <input
                      id={`sub-${item.id}`}
                      className={INPUT}
                      value={item.subtitle ?? ''}
                      onChange={(e) => editTimeline(item.id, { subtitle: e.target.value })}
                      placeholder="专业 / 职位"
                    />
                  </Field>
                </div>

                <div className="mt-3">
                  <Field label="描述" htmlFor={`desc-${item.id}`}>
                    <textarea
                      id={`desc-${item.id}`}
                      rows={2}
                      className={`${INPUT} resize-y`}
                      value={item.description ?? ''}
                      onChange={(e) => editTimeline(item.id, { description: e.target.value })}
                      placeholder="一句话说明这段经历做了什么"
                    />
                  </Field>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setPendingDelete({ kind: 'timeline', id: item.id, label: item.title })}
                  >
                    删除这条经历
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- 社交链接 ---------------- */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">联系方式 / 社交链接</h2>
          <Button variant="secondary" size="sm" onClick={addSocialLink}>
            + 新增链接
          </Button>
        </div>

        {profile.socials.length === 0 ? (
          <Card className="p-5 text-[13px] text-ink-3">还没有链接。</Card>
        ) : (
          <div className="space-y-3">
            {profile.socials.map((s) => (
              <Card key={s.id} className="flex flex-wrap items-end gap-3 p-4">
                <div className="min-w-[130px] flex-1">
                  <Field label="名称" htmlFor={`slabel-${s.id}`}>
                    <input
                      id={`slabel-${s.id}`}
                      className={INPUT}
                      value={s.label}
                      onChange={(e) => editSocial(s.id, { label: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="min-w-[220px] flex-[2]">
                  <Field label="链接" htmlFor={`surl-${s.id}`}>
                    <input
                      id={`surl-${s.id}`}
                      className={INPUT}
                      value={s.url}
                      onChange={(e) => editSocial(s.id, { url: e.target.value })}
                    />
                  </Field>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPendingDelete({ kind: 'social', id: s.id, label: s.label })}
                >
                  删除
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleSave}>
          保存全部修改
        </Button>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `确认删除「${pendingDelete.label}」？` : ''}
        description="删除后该条目将从前台消失。"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

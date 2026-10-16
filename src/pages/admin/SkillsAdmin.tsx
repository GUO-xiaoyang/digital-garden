/**
 * 数字花园 · 技能管理
 * 分组增删改 + 组内技能增删改 + 分组排序 + 熟练度调整
 */
import { useState } from 'react'
import {
  addGroup,
  addSkill,
  listSkillGroups,
  moveGroup,
  removeGroup,
  removeSkill,
  renameGroup,
  updateSkill,
} from '../../api/skills'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { Field } from '../../components/admin/Field'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import type { SkillGroup } from '../../types'

const INPUT =
  'w-full rounded-[10px] border border-line-strong bg-bg px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent-a/60'

type Pending =
  | { kind: 'group'; id: string; label: string }
  | { kind: 'skill'; groupId: string; id: string; label: string }
  | null

export function SkillsAdmin() {
  const toast = useToast()
  const [groups, setGroups] = useState<SkillGroup[]>(() => listSkillGroups())
  const [pending, setPending] = useState<Pending>(null)
  const [newGroupName, setNewGroupName] = useState('')

  const refresh = (next: SkillGroup[]) => setGroups(next)
  const reload = () => setGroups(listSkillGroups())

  // ---------------- 分组操作 ----------------
  const handleAddGroup = () => {
    const name = newGroupName.trim()
    if (!name) {
      toast.error('请输入分组名称')
      return
    }
    refresh(addGroup(name))
    setNewGroupName('')
    toast.success(`已新增分组「${name}」`)
  }

  const handleRenameGroup = (id: string, name: string) => {
    refresh(renameGroup(id, name))
  }

  // ---------------- 技能操作 ----------------
  const handleAddSkill = (groupId: string) => {
    refresh(addSkill(groupId, { name: '新技能', level: 60 }))
    toast.info('已新增技能，请修改名称与熟练度')
  }

  const confirmDelete = () => {
    if (!pending) return
    if (pending.kind === 'group') {
      refresh(removeGroup(pending.id))
      toast.success('分组已删除')
    } else {
      refresh(removeSkill(pending.groupId, pending.id))
      toast.success('技能已删除')
    }
    setPending(null)
  }

  const totalSkills = groups.reduce((n, g) => n + g.skills.length, 0)

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[20px] font-bold tracking-tight">技能管理</h1>
        <p className="mt-1.5 text-[13px] text-ink-3">
          共 {groups.length} 个分组、{totalSkills} 项技能。熟练度会显示为「关于我」页的进度条。
        </p>
      </header>

      {/* 新增分组 */}
      <Card className="mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[200px] flex-1">
          <Field label="新增分组" htmlFor="new-group">
            <input
              id="new-group"
              className={INPUT}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddGroup()
              }}
              placeholder="如：后端开发 / 数据与缓存"
            />
          </Field>
        </div>
        <Button size="md" onClick={handleAddGroup}>
          + 添加分组
        </Button>
      </Card>

      {/* 分组列表 */}
      {groups.length === 0 ? (
        <Card className="p-5 text-[13px] text-ink-3">还没有分组，先在上面添加一个。</Card>
      ) : (
        <div className="space-y-4">
          {groups.map((g, idx) => (
            <Card key={g.id} className="p-5">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[180px] flex-1">
                  <Field label="分组名称" htmlFor={`gname-${g.id}`}>
                    <input
                      id={`gname-${g.id}`}
                      className={INPUT}
                      value={g.name}
                      onChange={(e) => handleRenameGroup(g.id, e.target.value)}
                    />
                  </Field>
                </div>

                {/* 排序按钮 */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => refresh(moveGroup(g.id, 'up'))}
                    className="rounded-lg border border-line-strong px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:border-accent-a/50 hover:text-accent-a disabled:opacity-35"
                    aria-label="上移分组"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={idx === groups.length - 1}
                    onClick={() => refresh(moveGroup(g.id, 'down'))}
                    className="rounded-lg border border-line-strong px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:border-accent-a/50 hover:text-accent-a disabled:opacity-35"
                    aria-label="下移分组"
                  >
                    ↓
                  </button>
                </div>

                <Button variant="secondary" size="sm" onClick={() => handleAddSkill(g.id)}>
                  + 技能
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPending({ kind: 'group', id: g.id, label: g.name })}
                >
                  删除分组
                </Button>
              </div>

              {/* 技能项 */}
              {g.skills.length === 0 ? (
                <p className="mt-4 text-[13px] text-ink-3">该分组下暂无技能。</p>
              ) : (
                <ul className="mt-4 space-y-3 border-t border-line pt-4">
                  {g.skills.map((s) => (
                    <li key={s.id} className="grid gap-3 sm:grid-cols-[1.4fr_1fr_2fr_auto] sm:items-end">
                      <Field label="名称" htmlFor={`sn-${s.id}`}>
                        <input
                          id={`sn-${s.id}`}
                          className={INPUT}
                          value={s.name}
                          onChange={(e) => refresh(updateSkill(g.id, s.id, { name: e.target.value }))}
                        />
                      </Field>

                      <Field label={`熟练度 ${s.level}%`} htmlFor={`sl-${s.id}`}>
                        <input
                          id={`sl-${s.id}`}
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={s.level}
                          onChange={(e) =>
                            refresh(updateSkill(g.id, s.id, { level: Number(e.target.value) }))
                          }
                          className="h-9 w-full accent-[var(--accent-a)]"
                        />
                      </Field>

                      <Field label="备注" htmlFor={`snote-${s.id}`}>
                        <input
                          id={`snote-${s.id}`}
                          className={INPUT}
                          value={s.note ?? ''}
                          onChange={(e) => refresh(updateSkill(g.id, s.id, { note: e.target.value }))}
                          placeholder="如：索引设计、慢查询分析"
                        />
                      </Field>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setPending({ kind: 'skill', groupId: g.id, id: s.id, label: s.name })}
                      >
                        删除
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 rounded-[var(--radius)] border border-line bg-card/50 p-4 text-[12.5px] leading-relaxed text-ink-3">
        提示：这里的所有改动**即时保存**，不需要点保存按钮；刷新前台页面即可看到效果。
        如需恢复初始示例数据，可在浏览器控制台执行 <code className="text-accent-b">localStorage.clear()</code>。
      </p>

      <ConfirmDialog
        open={pending !== null}
        title={pending ? `确认删除「${pending.label}」？` : ''}
        description={
          pending?.kind === 'group'
            ? '该分组下的所有技能也会一并删除。'
            : '删除后该技能会从「关于我」页消失。'
        }
        onConfirm={confirmDelete}
        onCancel={() => {
          setPending(null)
          reload()
        }}
      />
    </div>
  )
}

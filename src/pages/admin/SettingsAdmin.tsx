/**
 * 数字花园 · 站点设置
 * 站名、副标题、强调色（实时预览）、页脚文案、备案号
 */
import { useState } from 'react'
import { getSettings, updateSettings } from '../../api/settings'
import { Field } from '../../components/admin/Field'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import type { SiteSettings } from '../../types'

const INPUT =
  'w-full rounded-[10px] border border-line-strong bg-bg px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent-a/60'

/** 预设配色，省去手动挑色 */
const PRESETS: { name: string; a: string; b: string }[] = [
  { name: '青绿 + 琥珀（默认）', a: '#2dd4bf', b: '#f59e0b' },
  { name: '靛蓝 + 品红', a: '#6366f1', b: '#ec4899' },
  { name: '翠绿 + 天蓝', a: '#22c55e', b: '#38bdf8' },
  { name: '橙金 + 珊瑚', a: '#f59e0b', b: '#fb7185' },
  { name: '紫罗兰 + 青柠', a: '#a78bfa', b: '#a3e635' },
]

/** 粗略计算对比度，低于 3:1 时提示可读性风险 */
function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return null
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastWithBg(hex: string): number | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const bgLum = luminance([13, 17, 23]) // 站点背景 #0D1117
  const fgLum = luminance(rgb)
  const lighter = Math.max(bgLum, fgLum)
  const darker = Math.min(bgLum, fgLum)
  return (lighter + 0.05) / (darker + 0.05)
}

export function SettingsAdmin() {
  const toast = useToast()
  const [settings, setSettings] = useState<SiteSettings>(() => getSettings())
  const [dirty, setDirty] = useState(false)

  const patch = (p: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...p }))
    setDirty(true)
  }

  const handleSave = () => {
    if (!settings.siteName.trim()) {
      toast.error('站点名称不能为空')
      return
    }
    const next = updateSettings({
      siteName: settings.siteName.trim(),
      tagline: settings.tagline,
      accentA: settings.accentA,
      accentB: settings.accentB,
      footerText: settings.footerText,
      icp: settings.icp,
    })
    setSettings(next)
    setDirty(false)
    toast.success('站点设置已保存，前台立即生效')
  }

  const applyPreset = (a: string, b: string) => {
    patch({ accentA: a, accentB: b })
    // 实时预览：立即写入 CSS 变量
    document.documentElement.style.setProperty('--accent-a', a)
    document.documentElement.style.setProperty('--accent-b', b)
  }

  const onColorChange = (key: 'accentA' | 'accentB', value: string) => {
    patch({ [key]: value } as Partial<SiteSettings>)
    document.documentElement.style.setProperty(key === 'accentA' ? '--accent-a' : '--accent-b', value)
  }

  const contrastA = contrastWithBg(settings.accentA)
  const contrastB = contrastWithBg(settings.accentB)

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">站点设置</h1>
          <p className="mt-1.5 text-[13px] text-ink-3">站点名称、强调色与页脚信息</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <Button variant="ghost" size="sm" onClick={() => { setSettings(getSettings()); setDirty(false) }}>
              放弃
            </Button>
          )}
          <Button size="sm" onClick={handleSave}>
            保存
          </Button>
        </div>
      </header>

      <Card className="space-y-4 p-5">
        <Field label="站点名称" htmlFor="siteName" required hint="显示在导航栏 Logo 旁与页脚">
          <input
            id="siteName"
            className={INPUT}
            value={settings.siteName}
            onChange={(e) => patch({ siteName: e.target.value })}
          />
        </Field>

        <Field label="站点副标题" htmlFor="tagline">
          <input
            id="tagline"
            className={INPUT}
            value={settings.tagline}
            onChange={(e) => patch({ tagline: e.target.value })}
            placeholder="如：记录理解的过程，而不只是结果"
          />
        </Field>

        <Field label="页脚文案" htmlFor="footerText" hint="一般写技术栈或版权补充说明">
          <input
            id="footerText"
            className={INPUT}
            value={settings.footerText}
            onChange={(e) => patch({ footerText: e.target.value })}
          />
        </Field>

        <Field label="备案号" htmlFor="icp" hint="留空则页脚不显示">
          <input
            id="icp"
            className={INPUT}
            value={settings.icp ?? ''}
            onChange={(e) => patch({ icp: e.target.value })}
            placeholder="如：赣ICP备xxxxxxxx号"
          />
        </Field>
      </Card>

      {/* ---------------- 强调色 ---------------- */}
      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-bold">强调色</h2>
        <Card className="space-y-5 p-5">
          <div>
            <p className="mb-2 text-[13px] text-ink-2">预设配色</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const active = settings.accentA.toLowerCase() === p.a && settings.accentB.toLowerCase() === p.b
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.a, p.b)}
                    className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[12.5px] transition-colors ${
                      active ? 'border-accent-a/60 text-ink' : 'border-line-strong text-ink-2 hover:border-accent-a/40'
                    }`}
                  >
                    <span className="flex gap-1" aria-hidden="true">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ background: p.a }} />
                      <span className="h-3.5 w-3.5 rounded-full" style={{ background: p.b }} />
                    </span>
                    {p.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="强调色 A（链接、激活态）"
              htmlFor="accentA"
              hint={
                contrastA !== null
                  ? `与背景对比度 ${contrastA.toFixed(2)}:1${contrastA < 3 ? '（偏低，可能影响可读性）' : ''}`
                  : '请输入 #RRGGBB 格式'
              }
            >
              <div className="flex gap-2">
                <input
                  id="accentA"
                  type="color"
                  value={settings.accentA}
                  onChange={(e) => onColorChange('accentA', e.target.value)}
                  className="h-[42px] w-14 shrink-0 cursor-pointer rounded-[10px] border border-line-strong bg-bg"
                />
                <input
                  className={INPUT}
                  value={settings.accentA}
                  onChange={(e) => onColorChange('accentA', e.target.value)}
                />
              </div>
            </Field>

            <Field
              label="强调色 B（置顶、熟练度）"
              htmlFor="accentB"
              hint={
                contrastB !== null
                  ? `与背景对比度 ${contrastB.toFixed(2)}:1${contrastB < 3 ? '（偏低，可能影响可读性）' : ''}`
                  : '请输入 #RRGGBB 格式'
              }
            >
              <div className="flex gap-2">
                <input
                  id="accentB"
                  type="color"
                  value={settings.accentB}
                  onChange={(e) => onColorChange('accentB', e.target.value)}
                  className="h-[42px] w-14 shrink-0 cursor-pointer rounded-[10px] border border-line-strong bg-bg"
                />
                <input
                  className={INPUT}
                  value={settings.accentB}
                  onChange={(e) => onColorChange('accentB', e.target.value)}
                />
              </div>
            </Field>
          </div>

          {/* 实时预览 */}
          <div className="rounded-[var(--radius-sm)] border border-line bg-bg p-4">
            <p className="mb-3 text-[12.5px] text-ink-3">实时预览</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-accent-a px-4 py-2 text-[13px] font-semibold text-[#04211d]">
                主按钮
              </span>
              <span className="rounded-lg border border-accent-a/50 px-4 py-2 text-[13px] text-accent-a">
                次要按钮
              </span>
              <span className="rounded-md border border-accent-b/40 bg-accent-b/12 px-2 py-0.5 text-[11.5px] text-accent-b">
                置顶
              </span>
              <span className="h-1.5 w-32 overflow-hidden rounded-full bg-elevated" aria-hidden="true">
                <span
                  className="block h-full w-3/4 rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent-a), var(--accent-b))' }}
                />
              </span>
            </div>
          </div>
        </Card>
      </section>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleSave}>
          保存全部设置
        </Button>
      </div>
    </div>
  )
}

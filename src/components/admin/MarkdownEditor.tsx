/**
 * 数字花园 · Markdown 编辑器
 * 左写右预览，滚动按百分比联动（TECH_DESIGN 7.4）
 */
import { useRef, type ChangeEvent } from 'react'
import { renderMarkdown } from '../../lib/markdown'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  error?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '用 Markdown 写正文，右侧实时预览…',
  minHeight = 420,
  error,
}: MarkdownEditorProps) {
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)

  const html = renderMarkdown(value)

  /** 左侧滚动时，右侧按相同比例跟随 */
  const syncScroll = () => {
    const ta = taRef.current
    const pv = previewRef.current
    if (!ta || !pv) return

    const taRange = ta.scrollHeight - ta.clientHeight
    const pvRange = pv.scrollHeight - pv.clientHeight
    if (taRange <= 0 || pvRange <= 0) return

    pv.scrollTop = (ta.scrollTop / taRange) * pvRange
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)

  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-2">
        {/* 编辑区 */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] text-ink-3">Markdown 源码</span>
            <span className="text-[11.5px] tabular-nums text-ink-3">{value.length} 字符</span>
          </div>
          <textarea
            ref={taRef}
            value={value}
            onChange={handleChange}
            onScroll={syncScroll}
            placeholder={placeholder}
            spellCheck={false}
            style={{ minHeight }}
            className={`w-full resize-y rounded-[10px] border bg-bg p-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-3 ${
              error ? 'border-red-500/60' : 'border-line-strong focus:border-accent-a/60'
            }`}
          />
        </div>

        {/* 预览区 */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] text-ink-3">实时预览</span>
            <span className="text-[11.5px] text-ink-3">已消毒</span>
          </div>
          <div
            ref={previewRef}
            style={{ minHeight, maxHeight: minHeight }}
            className="prose-garden overflow-y-auto rounded-[10px] border border-line-strong bg-bg p-3.5 text-[13.5px]"
            // 预览内容已通过 DOMPurify 消毒
            dangerouslySetInnerHTML={{ __html: html || '<p style="color:var(--ink-3)">预览区</p>' }}
          />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-[12px] text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

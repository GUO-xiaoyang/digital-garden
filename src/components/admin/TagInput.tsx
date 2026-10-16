/**
 * 数字花园 · 标签输入
 * 回车或逗号确认添加，退格删除最后一个，带数量上限
 */
import { useState, type KeyboardEvent } from 'react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  max?: number
}

export function TagInput({ value, onChange, placeholder = '输入后回车添加', max = 8 }: TagInputProps) {
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const tag = raw.trim().replace(/[,，]$/, '')
    if (!tag) return
    if (value.includes(tag)) {
      setDraft('')
      return
    }
    if (value.length >= max) return
    onChange([...value, tag])
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
      e.preventDefault()
      commit(draft)
      return
    }
    // 输入为空时退格删除最后一个标签
    if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeAt = (tag: string) => onChange(value.filter((t) => t !== tag))
  const reachedMax = value.length >= max

  return (
    <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-[10px] border border-line-strong bg-bg px-2.5 py-2 focus-within:border-accent-a/60">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-accent-a/35 bg-accent-a/12 px-2 py-0.5 text-[12px] text-accent-a"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeAt(tag)}
            className="text-accent-a/70 transition-colors hover:text-accent-a"
            aria-label={`移除标签 ${tag}`}
          >
            ×
          </button>
        </span>
      ))}

      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        disabled={reachedMax}
        placeholder={reachedMax ? `最多 ${max} 个标签` : placeholder}
        className="min-w-[120px] flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3 disabled:cursor-not-allowed"
      />
    </div>
  )
}

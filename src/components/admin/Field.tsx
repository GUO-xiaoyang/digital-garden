/**
 * 数字花园 · 表单字段外壳
 * 统一 label、必填标记、错误提示、说明文字
 */
import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-2">
        {label}
        {required && (
          <span className="ml-1 text-accent-b" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p className="text-[12px] text-red-400" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-[12px] text-ink-3">{hint}</p>
      )}
    </div>
  )
}

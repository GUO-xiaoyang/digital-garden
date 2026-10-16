/**
 * 数字花园 · 后台登录
 * 账号口令走构建期环境变量校验；登录成功只落盘 token（不存明文密码）
 */
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { isAuthenticated } from '../../api/auth'
import { getSettings } from '../../api/settings'
import { Field } from '../../components/admin/Field'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'

const loginSchema = z.object({
  username: z.string().min(1, '请输入账号'),
  password: z.string().min(1, '请输入密码'),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const settings = getSettings()

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  // 已登录则直接跳走，避免重复登录
  if (isAuthenticated()) {
    return <Navigate to={from} replace />
  }

  const onSubmit = (values: LoginForm) => {
    try {
      signIn(values.username, values.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError('password', {
        message: err instanceof Error ? err.message : '登录失败，请重试',
      })
    }
  }

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span
            className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-accent-a/30 bg-accent-a/10 text-accent-a"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
            </svg>
          </span>
          <h1 className="text-[19px] font-bold tracking-tight">登录 {settings.siteName} 后台</h1>
          <p className="mt-1.5 text-[13px] text-ink-3">口令由环境变量配置，不存明文</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-card)]"
          noValidate
        >
          <div className="space-y-4">
            <Field label="账号" htmlFor="username" error={errors.username?.message} required>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register('username')}
                className="w-full rounded-[10px] border border-line-strong bg-bg px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent-a/60"
                placeholder="账号"
              />
            </Field>

            <Field label="密码" htmlFor="password" error={errors.password?.message} required>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="w-full rounded-[10px] border border-line-strong bg-bg px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent-a/60"
                placeholder="密码"
              />
            </Field>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
            {isSubmitting ? '登录中…' : '登录'}
          </Button>

          <p className="mt-4 text-center text-[12.5px] text-ink-3">
            忘记口令？检查部署环境变量 <code className="text-accent-b">VITE_ADMIN_USER</code> /{' '}
            <code className="text-accent-b">VITE_ADMIN_PASSWORD</code>
          </p>
        </form>

        <p className="mt-5 text-center text-[13px]">
          <Link to="/" className="text-ink-3 transition-colors hover:text-accent-a">
            ← 返回前台
          </Link>
        </p>
      </div>
    </div>
  )
}

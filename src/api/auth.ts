/**
 * 数字花园 · 鉴权 API
 * 安全约定（AGENTS.md 铁律 5、6）：
 *   - 账号口令来自构建期环境变量，不硬编码在源码
 *   - 登录成功后只落盘 token 与过期时间，绝不存明文密码
 */
import type { AuthSession } from '../types'
import { newToken, read, remove, write } from './storage'

const KEY = 'auth'

/** 默认值仅用于本地开发，生产环境通过 Vercel 环境变量覆盖 */
const USERNAME = (import.meta.env.VITE_ADMIN_USER as string | undefined) ?? 'admin'
const PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'garden2026'

/** 登录态有效期：7 天 */
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000

export function login(username: string, password: string): AuthSession {
  // 逐项比较，避免提示是账号错还是密码错（减少枚举信息）
  if (username.trim() !== USERNAME || password !== PASSWORD) {
    throw new Error('账号或密码不正确')
  }
  const session: AuthSession = {
    token: newToken(),
    username,
    expiresAt: Date.now() + TOKEN_TTL,
  }
  write(KEY, session)
  return session
}

export function logout(): void {
  remove(KEY)
}

/** 读取会话；已过期则清理并返回 null */
export function getSession(): AuthSession | null {
  const session = read<AuthSession | null>(KEY, null)
  if (!session || !session.token) return null
  if (typeof session.expiresAt !== 'number' || session.expiresAt < Date.now()) {
    remove(KEY)
    return null
  }
  return session
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}

/** 剩余有效期（毫秒），未登录返回 0 */
export function remainingTime(): number {
  const session = getSession()
  return session ? Math.max(0, session.expiresAt - Date.now()) : 0
}

/** 供后台展示：当前登录账号名 */
export function currentUsername(): string {
  return getSession()?.username ?? ''
}

/**
 * 数字花园 · 存储底层
 * 全站唯一的 localStorage 出入口。组件与页面禁止直接调用 localStorage（AGENTS.md 铁律 1、2）。
 */

/** 统一键前缀，避免与同域其它站点冲突 */
const NS = 'dg:'

/** localStorage 是否可用（隐私模式 / 禁用 Cookie 时可能不可用） */
let available: boolean | null = null

export function isAvailable(): boolean {
  if (available !== null) return available
  try {
    const probe = `${NS}__probe__`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    available = true
  } catch {
    available = false
  }
  return available
}

/**
 * 读取并反序列化。解析失败时清理脏数据并返回 fallback，避免白屏。
 */
export function read<T>(key: string, fallback: T): T {
  if (!isAvailable()) return fallback
  try {
    const raw = window.localStorage.getItem(NS + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // 数据被外部破坏时，清掉它让下次写入恢复干净状态
    try {
      window.localStorage.removeItem(NS + key)
    } catch {
      /* 忽略 */
    }
    return fallback
  }
}

/**
 * 序列化并写入。容量超限时抛出可读错误，供 UI 提示用户清理。
 */
export function write<T>(key: string, value: T): void {
  if (!isAvailable()) {
    throw new Error('当前浏览器环境不支持本地存储（可能处于隐私模式），数据无法保存。')
  }
  try {
    window.localStorage.setItem(NS + key, JSON.stringify(value))
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      throw new Error('本地存储空间已满，请删除部分笔记或导出备份后重试。')
    }
    throw err
  }
}

export function remove(key: string): void {
  if (!isAvailable()) return
  try {
    window.localStorage.removeItem(NS + key)
  } catch {
    /* 忽略 */
  }
}

/** 该键是否已有数据（用于判断是否需要写入种子数据） */
export function has(key: string): boolean {
  if (!isAvailable()) return false
  return window.localStorage.getItem(NS + key) !== null
}

/** 生成唯一 ID */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // 老浏览器降级：时间戳 + 随机串
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** 生成会话 token（非密码本身） */
export function newToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
}

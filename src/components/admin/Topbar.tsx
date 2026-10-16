/**
 * 数字花园 · 后台顶栏
 * 移动端提供横向导航（后台页面多，用横向滚动代替汉堡菜单更直接）
 */
import { NavLink, useNavigate } from 'react-router-dom'
import { currentUsername, logout } from '../../api/auth'
import { useState } from 'react'

const MOBILE_ITEMS = [
  { to: '/admin', label: '仪表盘', end: true },
  { to: '/admin/profile', label: '个人信息' },
  { to: '/admin/skills', label: '技能' },
  { to: '/admin/projects', label: '项目' },
  { to: '/admin/posts', label: '笔记' },
  { to: '/admin/settings', label: '设置' },
]

export function Topbar() {
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="border-b border-line bg-card/60">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <span className="text-[13px] text-ink-3">
          已登录：<span className="text-ink-2">{currentUsername()}</span>
        </span>

        <div className="flex items-center gap-2">
          {confirming ? (
            <>
              <span className="hidden text-[12.5px] text-ink-3 sm:inline">确认退出登录？</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-500/40 px-3 py-1.5 text-[13px] text-red-400 transition-colors hover:bg-red-500/10"
              >
                退出
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
              >
                取消
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              退出登录
            </button>
          )}
        </div>
      </div>

      {/* 移动端导航（横向滚动） */}
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden" aria-label="后台导航（移动端）">
        {MOBILE_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `shrink-0 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                isActive ? 'bg-accent-a/12 text-accent-a' : 'text-ink-2 hover:bg-elevated'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

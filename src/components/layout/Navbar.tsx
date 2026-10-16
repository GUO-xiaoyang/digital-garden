/**
 * 数字花园 · 前台顶部导航
 * 吸顶 + 毛玻璃，滚动超过 20px 加阴影；移动端折叠为汉堡菜单
 */
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { getSettings } from '../../api/settings'

const LINKS = [
  { to: '/', label: '笔记', end: true },
  { to: '/tags', label: '知识网络' },
  { to: '/projects', label: '项目' },
  { to: '/about', label: '关于我' },
]

export function Navbar() {
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const settings = getSettings()

  // 滚动监听：rAF 节流避免高频 setState
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setStuck(window.scrollY > 20)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 路由变化时收起移动端菜单
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Esc 收起
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        stuck
          ? 'border-b border-line bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] shadow-[0_1px_0_rgba(255,255,255,0.03),0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${settings.siteName} 首页`}>
          <span
            className="grid h-7 w-7 place-items-center rounded-lg border border-accent-a/30 bg-accent-a/12 text-accent-a"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21V9M12 9c0-3 2-5 5-5 0 3-2 5-5 5ZM12 13c0-2.5-1.8-4.5-4.5-4.5 0 2.5 1.8 4.5 4.5 4.5Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[15px] font-bold tracking-tight">{settings.siteName}</span>
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-[13.5px] transition-colors duration-200 ${
                  isActive ? 'bg-elevated text-accent-a' : 'text-ink-2 hover:bg-elevated hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* 移动端汉堡按钮 */}
        <button
          type="button"
          className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg border border-line-strong md:hidden"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-[1.5px] w-4 bg-ink transition-transform duration-200 ${open ? 'translate-y-[6.5px] rotate-45' : ''}`}
          />
          <span className={`block h-[1.5px] w-4 bg-ink transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
          <span
            className={`block h-[1.5px] w-4 bg-ink transition-transform duration-200 ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`}
          />
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-line bg-[color-mix(in_srgb,var(--bg)_96%,transparent)] backdrop-blur-xl transition-[max-height,opacity] duration-300 md:hidden ${
          open ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col px-4 py-2" aria-label="移动端导航">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `border-b border-line py-3 text-[15px] last:border-0 ${
                  isActive ? 'text-accent-a' : 'text-ink-2'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

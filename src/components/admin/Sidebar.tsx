/**
 * 数字花园 · 后台侧边栏
 */
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean
}

const ITEMS: NavItem[] = [
  { to: '/admin', label: '仪表盘', icon: 'M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-4H4v4Zm10-11h6V4h-6v5Z', end: true },
  { to: '/admin/profile', label: '个人信息', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2-7 4.5V21h14v-2.5C19 16 16 14 12 14Z' },
  { to: '/admin/skills', label: '技能管理', icon: 'M4 18h7v2H4v-2Zm0-7h7v2H4v-2Zm0-7h7v2H4V4Zm10 1.5 5 4-5 4v-8Z' },
  { to: '/admin/projects', label: '项目管理', icon: 'M4 6h6l2 2h8v10H4V6Z' },
  { to: '/admin/posts', label: '笔记管理', icon: 'M6 3h9l5 5v13H6V3Zm8 1.5V9h4.5L14 4.5ZM8 12h8v1.5H8V12Zm0 4h8v1.5H8V16Z' },
  { to: '/admin/settings', label: '站点设置', icon: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5-.1 1.3 1.7 1.3-1.7 3-2-.8-1.1.7-.3 2.1h-3.4l-.3-2.1-1.1-.7-2 .8-1.7-3L9.6 13 9.5 12l.1-1.3L7.9 9.4l1.7-3 2 .8 1.1-.7.3-2.1h3.4l.3 2.1 1.1.7 2-.8 1.7 3-1.7 1.3.1 1.3Z' },
]

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-card/60 lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-line px-4">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-a/15 text-[11px] font-bold text-accent-a">
            DG
          </span>
          <span className="text-[14px] font-bold">后台管理</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3" aria-label="后台导航">
          {ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors duration-200 ${
                  isActive
                    ? 'bg-accent-a/12 text-accent-a'
                    : 'text-ink-2 hover:bg-elevated hover:text-ink'
                }`
              }
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <path d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-ink-3 transition-colors hover:bg-elevated hover:text-ink"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10 7H6v10h4M14 7h4v10h-4" strokeLinecap="round" />
            </svg>
            返回前台
          </NavLink>
        </div>
      </div>
    </aside>
  )
}

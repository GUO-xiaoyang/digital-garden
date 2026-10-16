/**
 * 数字花园 · 后台布局地基
 * 侧边栏 + 顶栏，独立于前台导航（PRD FR-49）
 */
import { Outlet } from 'react-router-dom'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AdminLayout() {
  // 后台同样应用强调色，保持与前台一致
  useSiteSettings()

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-[1000px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

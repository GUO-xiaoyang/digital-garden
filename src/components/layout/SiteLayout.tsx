/**
 * 数字花园 · 前台布局地基
 * 统一承载网格纹理背景、顶部导航、页脚，并提供路由切换回顶行为。
 */
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function SiteLayout() {
  const { pathname } = useLocation()
  // 订阅设置：强调色变化时写入 CSS 变量
  useSiteSettings()

  // 前台路由切换时回到顶部（后台不做，避免编辑时跳走）
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <div className="grid-bg relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

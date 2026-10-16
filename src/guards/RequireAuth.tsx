/**
 * 数字花园 · 路由守卫
 * 未登录访问任何 /admin/* 时跳转登录页，并记住原始目标以便登录后跳回。
 */
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../api/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location.pathname + location.search }} replace />
  }

  return <>{children}</>
}

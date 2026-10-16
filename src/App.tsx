/**
 * 数字花园 · 应用根组件
 * 全局提供 Toast，并挂载路由
 */
import { RouterProvider } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { router } from './router'

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}

/**
 * 数字花园 · 路由表
 * 前台 / 与后台 /admin 分离；后台整体包在 RequireAuth 守卫内
 */
import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import { SiteLayout } from './components/layout/SiteLayout'
import { RequireAuth } from './guards/RequireAuth'
import { About } from './pages/About'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { PostDetail } from './pages/PostDetail'
import { Projects } from './pages/Projects'
import { Tags } from './pages/Tags'
import { Dashboard } from './pages/admin/Dashboard'
import { Login } from './pages/admin/Login'
import { PostEditor } from './pages/admin/PostEditor'
import { PostsAdmin } from './pages/admin/PostsAdmin'
import { ProfileAdmin } from './pages/admin/ProfileAdmin'
import { ProjectsAdmin } from './pages/admin/ProjectsAdmin'
import { SettingsAdmin } from './pages/admin/SettingsAdmin'
import { SkillsAdmin } from './pages/admin/SkillsAdmin'

export const router = createBrowserRouter([
  // ------------------------------ 前台 ------------------------------
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'posts/:slug', element: <PostDetail /> },
      { path: 'tags', element: <Tags /> },
      { path: 'tags/:tag', element: <Tags /> },
      { path: 'projects', element: <Projects /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },

  // ------------------------------ 后台登录（不设守卫） ------------------------------
  { path: '/admin/login', element: <Login /> },

  // ------------------------------ 后台（守卫 + 独立布局） ------------------------------
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'profile', element: <ProfileAdmin /> },
      { path: 'skills', element: <SkillsAdmin /> },
      { path: 'projects', element: <ProjectsAdmin /> },
      { path: 'posts', element: <PostsAdmin /> },
      { path: 'posts/new', element: <PostEditor /> },
      { path: 'posts/:id/edit', element: <PostEditor /> },
      { path: 'settings', element: <SettingsAdmin /> },
    ],
  },
])

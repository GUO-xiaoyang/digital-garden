# 数字花园 · 技术设计文档（TECH_DESIGN）

> 文档版本：v1.0　｜　配套：[`PRD.md`](./PRD.md)、[`AGENTS.md`](./AGENTS.md)

---

## 一、技术选型与理由

| 层 | 选型 | 版本 | 为什么选它 |
| --- | --- | --- | --- |
| 构建工具 | Vite | 8.x | 冷启动 < 1s，HMR 毫秒级；产物是纯静态文件，可直接丢给 Vercel |
| UI 框架 | React | 19.x | 组件模型适合「前后台共用类型」的场景 |
| 语言 | TypeScript | 6.x | 后台表单字段多，类型能把拼写错误挡在编译期 |
| 路由 | react-router-dom | 7.x | 嵌套路由天然支持 `/admin` 独立布局；`<Outlet />` 复用地基 |
| 样式 | Tailwind CSS | 4.x | v4 走 `@tailwindcss/vite` 插件，零配置；配合 CSS 变量做主题 |
| 表单 | react-hook-form + zod | 7.x / 4.x | 非受控表单避免大表单重渲染；zod schema 同时产出校验与类型 |
| Markdown | marked + highlight.js + DOMPurify | 18.x / 11.x / 3.x | 解析、高亮、消毒三段式，职责清晰 |
| 数据 | 自建 `src/api/` + localStorage | — | 无后端即可闭环；日后换真后端只改这一层 |
| 部署 | Vercel | — | Git 集成、推送即部署、免费版够用 |

**明确不引入**：Ant Design / MUI / Chakra 等重型 UI 库（体积与主题一致性考虑）。

---

## 二、目录结构

```
digital-garden/
├── PRD.md                      # 产品需求文档
├── TECH_DESIGN.md              # 本文档
├── AGENTS.md                   # AI 协作约定
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx                # 入口，挂载 RouterProvider
    ├── router.tsx              # 全部路由定义（前台 + 后台）
    ├── index.css               # Tailwind 引入 + 设计令牌（CSS 变量）
    │
    ├── types/
    │   └── index.ts            # 全站数据模型（前后台共用，唯一真源）
    │
    ├── api/                    # ★ 统一数据层，组件内禁止直接碰 localStorage
    │   ├── storage.ts          # 底层读写 + 命名空间 + 错误兜底
    │   ├── seed.ts             # 首次访问写入的初始示例数据
    │   ├── profile.ts          # 个人信息
    │   ├── skills.ts           # 技能
    │   ├── projects.ts         # 项目
    │   ├── posts.ts            # 笔记
    │   ├── settings.ts         # 站点设置
    │   └── auth.ts             # 登录 / 登出 / 会话校验
    │
    ├── hooks/
    │   ├── useContent.ts       # 读取内容数据（带 loading / error）
    │   ├── useSiteSettings.ts  # 读取站点设置并写入 CSS 变量
    │   └── useAuth.ts          # 登录态
    │
    ├── lib/
    │   ├── markdown.ts         # marked + hljs + DOMPurify 封装
    │   ├── toc.ts              # 从渲染后的 HTML 提取目录
    │   ├── readingTime.ts      # 中英混排字数统计与阅读时长
    │   ├── date.ts             # 日期格式化
    │   └── clipboard.ts        # 复制 + 降级方案
    │
    ├── components/
    │   ├── layout/
    │   │   ├── SiteLayout.tsx  # 前台地基：网格背景 + Navbar + Footer
    │   │   ├── Navbar.tsx      # 吸顶毛玻璃导航 + 移动端汉堡菜单
    │   │   └── Footer.tsx
    │   ├── admin/
    │   │   ├── AdminLayout.tsx # 后台地基：侧边栏 + 顶栏
    │   │   ├── Sidebar.tsx
    │   │   ├── Topbar.tsx
    │   │   ├── Field.tsx       # 统一表单字段（label + error）
    │   │   ├── MarkdownEditor.tsx  # 左写右预览（含滚动联动）
    │   │   ├── TagInput.tsx    # 回车添加标签
    │   │   ├── ConfirmDialog.tsx   # 删除二次确认
    │   │   └── DataTable.tsx   # 列表通用外壳（空态 / 操作列）
    │   └── ui/
    │       ├── Card.tsx
    │       ├── Tag.tsx
    │       ├── Button.tsx
    │       ├── Badge.tsx
    │       └── EmptyState.tsx
    │
    ├── guards/
    │   └── RequireAuth.tsx     # 路由守卫
    │
    └── pages/
        ├── Home.tsx            # 笔记流（筛选 + 搜索 + 排序）
        ├── PostDetail.tsx      # 笔记详情 + TOC + 相关笔记
        ├── Tags.tsx            # 知识网络（标签视图）
        ├── Projects.tsx        # 项目展示
        ├── About.tsx           # 关于我（时间线 + 技能条）
        ├── NotFound.tsx        # 404
        └── admin/
            ├── Login.tsx
            ├── Dashboard.tsx
            ├── ProfileAdmin.tsx
            ├── SkillsAdmin.tsx
            ├── ProjectsAdmin.tsx
            ├── PostsAdmin.tsx
            ├── PostEditor.tsx      # 新建 / 编辑共用
            └── SettingsAdmin.tsx
```

---

## 三、数据模型

所有类型集中在 `src/types/index.ts`，**前后台共用同一份定义**，避免字段漂移。

```ts
/** 个人信息 */
export interface Profile {
  name: string;
  headline: string;              // 一句话简介
  bio: string;                   // 简介段落（Markdown）
  email: string;
  city: string;
  jobTarget: string;             // 求职方向
  avatarUrl?: string;
  resumeUrl?: string;            // 为空则前台隐藏下载按钮
  socials: SocialLink[];
  timeline: TimelineItem[];      // 教育 + 实习经历
  updatedAt: string;
}

export interface SocialLink { label: string; url: string; icon?: string }

export interface TimelineItem {
  id: string;
  period: string;                // "2022.09 - 2026.06"
  title: string;                 // "大连海事大学 · 计算机科学与技术"
  subtitle?: string;             // "本科"
  description?: string;
  type: 'education' | 'work' | 'other';
}

/** 技能组 */
export interface SkillGroup {
  id: string;
  name: string;                  // "后端" / "数据库" / "前端" / "工具"
  order: number;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;                  // "Spring Boot"
  level: number;                 // 0-100
  note?: string;
}

/** 项目 */
export interface Project {
  id: string;
  name: string;
  summary: string;               // 一句话描述
  content: string;               // 详情 Markdown
  tags: string[];                // 技术标签
  role?: string;                 // "Java 后端开发"
  period?: string;
  repoUrl?: string;
  demoUrl?: string;
  status: 'active' | 'done' | 'archived';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 笔记 */
export interface Post {
  id: string;
  slug: string;                  // URL 用
  title: string;
  summary: string;
  content: string;               // Markdown 正文
  tags: string[];
  pinned: boolean;
  published: boolean;            // 草稿不展示
  createdAt: string;
  updatedAt: string;
}

/** 站点设置 */
export interface SiteSettings {
  siteName: string;
  tagline: string;
  accentA: string;               // 青绿 #2DD4BF
  accentB: string;               // 琥珀 #F59E0B
  footerText: string;
  icp?: string;                  // 备案号占位
  updatedAt: string;
}

/** 后台会话（绝不存明文密码） */
export interface AuthSession {
  token: string;
  username: string;
  expiresAt: number;             // 时间戳
}
```

### 3.1 存储键命名空间

统一前缀，避免与其它站点冲突：

| 键 | 内容 |
| --- | --- |
| `dg:profile` | `Profile` |
| `dg:skills` | `SkillGroup[]` |
| `dg:projects` | `Project[]` |
| `dg:posts` | `Post[]` |
| `dg:settings` | `SiteSettings` |
| `dg:auth` | `AuthSession` |

---

## 四、数据层（`src/api/`）设计

### 4.1 分层原则

```
组件  →  hooks  →  api/*  →  storage.ts  →  localStorage
                     ↑
              未来替换真实后端时，只改 api/* 内部实现
```

**硬性约束**：任何组件 / 页面**不得**直接调用 `localStorage`。

### 4.2 storage.ts

```ts
const NS = 'dg:';

export function read<T>(key: string, fallback: T): T
export function write<T>(key: string, value: T): void
export function remove(key: string): void
export function isAvailable(): boolean      // 隐私模式下探测可用性
```

要点：
- `read` 内做 `JSON.parse` 的 try/catch，解析失败返回 `fallback` 并清理脏数据
- `write` 捕获 `QuotaExceededError`，抛出可读错误供 UI 提示
- `isAvailable` 用一次写读删探测，失败时前台降级为只读内置数据

### 4.3 auth.ts

```ts
const USERNAME = import.meta.env.VITE_ADMIN_USER ?? 'admin';
const PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'garden@2026';
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

export function login(username: string, password: string): AuthSession
export function logout(): void
export function getSession(): AuthSession | null   // 过期自动清理
export function isAuthenticated(): boolean
```

要点：
- 口令来自**构建期环境变量**，不硬编码在仓库里（`.env.local` 已 gitignore）
- 登录成功签发随机 token（`crypto.randomUUID()` + 时间戳），**密码本身不落盘**
- `getSession()` 校验 `expiresAt`，过期即 `remove` 并返回 `null`

### 4.4 其它模块

每个模块暴露统一的 CRUD 接口，例如 `posts.ts`：

```ts
export function listPosts(): Post[]                       // 含 unpublished（后台用）
export function listPublishedPosts(): Post[]              // 前台用
export function getPostBySlug(slug: string): Post | null
export function createPost(input: Omit<Post,'id'|'createdAt'|'updatedAt'>): Post
export function updatePost(id: string, patch: Partial<Post>): Post
export function deletePost(id: string): void
```

`id` 统一用 `crypto.randomUUID()`；`createdAt/updatedAt` 由 api 层维护，调用方不用管。

### 4.5 seed.ts

首次访问（对应键为空）时写入一份示例数据，保证站点开箱即有内容可看。
种子内容包括：本人信息、4 组技能、CRM 项目、6 篇笔记（覆盖 Redis / Spring / MySQL / Git 等主题）。

---

## 五、路由设计

`src/router.tsx` 用一个 `createBrowserRouter` 描述全部路由：

```tsx
createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,              // 前台：网格背景 + Navbar + Footer
    children: [
      { index: true, element: <Home /> },                  // 笔记流
      { path: 'posts/:slug', element: <PostDetail /> },    // 笔记详情
      { path: 'tags', element: <Tags /> },                 // 知识网络
      { path: 'tags/:tag', element: <Tags /> },
      { path: 'projects', element: <Projects /> },         // 项目
      { path: 'about', element: <About /> },               // 关于我
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/admin/login', element: <Login /> },            // 登录页不带守卫
  {
    path: '/admin',
    element: <RequireAuth><AdminLayout /></RequireAuth>,   // 守卫 + 独立布局
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
```

### 5.1 路由守卫

```tsx
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    // 记住原目标，登录后跳回
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
```

### 5.2 部署到静态托管的必要配置

SPA 使用 BrowserRouter，刷新子路由会 404，因此需要重写规则：

| 平台 | 配置文件 |
| --- | --- |
| Vercel | `vercel.json` → `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}` |
| Cloudflare Pages | `public/_redirects` → `/* /index.html 200` |

两份都提交入库，任选平台都能正常刷新。

---

## 六、样式系统

### 6.1 设计令牌（`src/index.css`）

```css
@import "tailwindcss";

:root {
  --bg: #0D1117;
  --bg-card: #161B22;
  --bg-elevated: #1C2128;
  --border: #21262D;
  --ink: #E6EDF3;
  --ink-2: #8B949E;
  --ink-3: #6E7681;
  --accent-a: #2DD4BF;   /* 后台可改 */
  --accent-b: #F59E0B;   /* 后台可改 */
  --radius: 14px;
}
```

Tailwind v4 用 `@theme` 把令牌暴露成工具类：

```css
@theme {
  --color-ink: var(--ink);
  --color-card: var(--bg-card);
  --color-accent-a: var(--accent-a);
  --color-accent-b: var(--accent-b);
}
```

这样就能写 `bg-card text-ink border-accent-a/30`。

### 6.2 强调色的运行时切换

`useSiteSettings()` 读取设置后写入根元素：

```ts
document.documentElement.style.setProperty('--accent-a', settings.accentA);
document.documentElement.style.setProperty('--accent-b', settings.accentB);
```

改色无需重新构建，刷新即生效。

### 6.3 网格纹理背景

纯 CSS 两层 `linear-gradient` 画 24px 网格，**不用图片**：

```css
.grid-bg {
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### 6.4 响应式策略

移动优先，断点 `sm:640px` / `md:768px` / `lg:1024px`。
`lg` 以上笔记详情启用「正文 + 右侧 TOC」双栏（`grid-cols-[minmax(0,1fr)_220px]`）。

---

## 七、关键实现细节

### 7.1 Markdown 渲染管线（`lib/markdown.ts`）

```
原始 Markdown
   ↓ marked（gfm: true, breaks: true）
HTML
   ↓ highlight.js（对 <pre><code> 逐个高亮）
带高亮的 HTML
   ↓ DOMPurify.sanitize（白名单）
安全 HTML  →  dangerouslySetInnerHTML
```

**安全要点**：DOMPurify 是必须的一环，白名单允许 `class`（hljs 用）但禁用 `script` / `iframe` / 事件属性。

### 7.2 目录提取（`lib/toc.ts`）

在渲染后的容器上查询 `h2, h3`，为其补 `id`（`slugify(文本)` 碰撞时追加序号），
返回 `{ id, text, level }[]`。滚动高亮用 `IntersectionObserver` 监听各标题。

### 7.3 阅读时长（`lib/readingTime.ts`）

中文按字符数、英文按单词数分别统计后合并：

```
总字数 = 中文字符数 + 英文单词数
分钟   = ceil(总字数 / 350)     // 中文阅读速度约 350 字/分钟
```

### 7.4 编辑器滚动联动

`MarkdownEditor` 监听 textarea 的 `scroll`，按
`preview.scrollTop = (textarea.scrollTop / (textarea.scrollHeight - clientHeight)) * (preview.scrollHeight - clientHeight)`
同步右侧预览。

### 7.5 表单校验（zod）

每个后台表单配一个 schema，例如笔记：

```ts
export const postSchema = z.object({
  title: z.string().min(2, '标题至少 2 个字').max(80),
  slug: z.string().regex(/^[a-z0-9-]+$/, '仅小写字母、数字与连字符'),
  summary: z.string().max(160, '摘要不超过 160 字'),
  content: z.string().min(1, '正文不能为空'),
  tags: z.array(z.string()).max(8, '最多 8 个标签'),
  published: z.boolean(),
  pinned: z.boolean(),
});
export type PostForm = z.infer<typeof postSchema>;   // 类型与校验同源
```

配合 `@hookform/resolvers/zod` 的 `zodResolver` 接入 react-hook-form。

---

## 八、构建与部署

### 8.1 本地开发

```bash
npm install
npm run dev      # http://localhost:5173
```

需要在 `.env.local` 配置后台口令（该文件不进仓库）：

```
VITE_ADMIN_USER=admin
VITE_ADMIN_PASSWORD=你的口令
```

### 8.2 生产构建

```bash
npm run build    # 产物在 dist/
npm run preview  # 本地预览构建结果
```

### 8.3 部署到 Vercel

**方式一：网页导入（推荐）**
GitHub 仓库 → Vercel → Add New → Project → Import Git Repository
→ Framework Preset 自动识别 **Vite** → Build Command `npm run build`
→ Output Directory `dist` → 添加环境变量 `VITE_ADMIN_USER` / `VITE_ADMIN_PASSWORD` → Deploy

**方式二：CLI**
```bash
npx vercel --prod
```

### 8.4 部署配置

`vercel.json`：
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

`public/_redirects`（Cloudflare Pages 备用）：
```
/*    /index.html   200
```

---

## 九、性能预算与优化

| 项 | 预算 | 手段 |
| --- | --- | --- |
| 首屏 JS（gzip） | < 350KB | highlight.js 只注册用到的语言；路由级 `lazy()` |
| 首屏 LCP | < 2.0s | 内容本地读取，无网络等待；字体用系统栈 |
| 长列表 | 50 条以上分页 | Home 页按 10 条/页分页 |
| 内存 | 无泄漏 | 所有 `IntersectionObserver` / 事件监听在 `useEffect` 清理 |

---

## 十、测试策略

| 层级 | 手段 |
| --- | --- |
| 类型 | `tsc --noEmit`，CI 与构建前必过 |
| 构建 | `npm run build` 无错误无警告 |
| 功能自测 | 按 PRD 第八章验收标准逐条手工验证 |
| 兼容 | Chrome / Edge / 移动端 Chrome 各过一遍 |
| 无障碍 | 键盘 Tab 全站走通；检查对比度 |

---

## 十一、遗留问题与后续演进

| 项 | 现状 | 后续 |
| --- | --- | --- |
| 数据持久化 | localStorage，换设备不带走 | v2.0 接后端 + 数据库 |
| 图片上传 | 只支持外链 URL | v2.0 接对象存储 |
| 全文检索 | 前端线性匹配 | v2.0 服务端索引 |
| 双向引用 | 仅有标签关联 | v2.0 解析 `[[笔记名]]` 生成反向链接 |
| 多用户 | 单管理员 | 不计划支持 |

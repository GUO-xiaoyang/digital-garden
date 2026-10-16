# 数字花园 · Digital Garden

> Java 后端方向的个人知识站：把学习笔记、项目复盘、踩坑记录按「标签 + 引用」组织起来。
> **带后台管理系统**，所有内容可在浏览器内增删改，无需改代码、无需重新部署。

三份项目文档：[`PRD.md`](./PRD.md)（做什么） · [`TECH_DESIGN.md`](./TECH_DESIGN.md)（怎么做） · [`AGENTS.md`](./AGENTS.md)（怎么协作）

---

## 快速开始

```bash
npm install

# 配置后台口令（该文件已被 gitignore，不会进仓库）
cp .env.example .env.local
# 编辑 .env.local 填入 VITE_ADMIN_USER / VITE_ADMIN_PASSWORD

npm run dev      # http://localhost:5173
```

生产构建与本地预览：

```bash
npm run build    # 产物在 dist/
npm run preview  # 预览构建结果
```

---

## 功能一览

### 前台（访客视图）

| 页面 | 路由 | 内容 |
| --- | --- | --- |
| 笔记流 | `/` | Hero 首屏、站点统计、关键词搜索、标签筛选、卡片流（分页）、最近更新 |
| 笔记详情 | `/posts/:slug` | Markdown 渲染 + 代码高亮、右侧目录（滚动高亮）、相关笔记、上一篇/下一篇、复制链接 |
| 知识网络 | `/tags`、`/tags/:tag` | 标签云（字号按频率加权）、标签共现关系、按标签筛选笔记 |
| 项目 | `/projects` | 项目卡片、技术标签筛选、展开查看 Markdown 详情、源码/预览外链 |
| 关于我 | `/about` | 简介、经历时间线、技能熟练度进度条、邮箱一键复制、联系方式 |
| 404 | `*` | 引导返回首页或标签页 |

### 后台（`/admin`，需登录）

| 页面 | 路由 | 能力 |
| --- | --- | --- |
| 登录 | `/admin/login` | 账号密码校验，登录态存 token（不存明文密码） |
| 仪表盘 | `/admin` | 内容统计、快捷操作、最近更新 |
| 个人信息 | `/admin/profile` | 基础信息、经历时间线增删改、社交链接增删改 |
| 技能管理 | `/admin/skills` | 分组增删改与排序、技能项增删改、熟练度滑块 |
| 项目管理 | `/admin/projects` | 列表 + 新建/编辑/删除，Markdown 详情编辑 |
| 笔记管理 | `/admin/posts` | 列表 + 筛选（全部/已发布/草稿/置顶）、置顶与发布开关、删除 |
| 笔记编辑器 | `/admin/posts/new`、`/admin/posts/:id/edit` | zod 校验、标题自动生成 slug、标签编辑、**左写右预览** |
| 站点设置 | `/admin/settings` | 站名、副标题、强调色（含预设与对比度提示）、页脚、备案号 |

---

## 技术栈

| 层 | 选型 |
| --- | --- |
| 构建 | Vite 8 |
| 框架 | React 19 + TypeScript 6 |
| 路由 | react-router-dom 7 |
| 样式 | Tailwind CSS 4（`@tailwindcss/vite` 插件 + CSS 变量令牌） |
| 表单 | react-hook-form + zod |
| Markdown | marked + highlight.js + DOMPurify |
| 数据 | `src/api/` 统一接口层 + localStorage |

**未引入任何重型 UI 库**，组件全部自行实现。

---

## 目录结构

```
digital-garden/
├── PRD.md / TECH_DESIGN.md / AGENTS.md   # 三份项目文档
├── vercel.json                            # SPA 重写规则（Vercel）
├── public/_redirects                      # SPA 重写规则（Cloudflare Pages）
└── src/
    ├── api/        数据层（storage / seed / profile / skills / projects / posts / settings / auth）
    ├── types/      全站类型定义（前后台共用）
    ├── lib/        markdown / toc / readingTime / date（纯函数）
    ├── hooks/      useAuth / useContent / useSiteSettings / useReveal
    ├── guards/     RequireAuth（路由守卫）
    ├── components/ layout（前台/后台地基）· admin（后台专用件）· ui（通用件）
    └── pages/      前台 5 页 + 后台 8 页
```

---

## 设计要点

- **深墨蓝 + 网格纹理**：背景 `#0D1117` 叠加 24px 网格线（纯 CSS，不用图片）
- **双强调色**：青绿 `#2DD4BF`（链接/激活态）+ 琥珀 `#F59E0B`（置顶/熟练度），可在后台修改，**写入 CSS 变量即时生效**
- **响应式**：`<640` 单列 / `640–1023` 两列 / `≥1024` 正文 + 右侧目录双栏；320px 无横向滚动
- **无障碍**：`:focus-visible` 明显描边、`role="progressbar"`、表单 label 关联、`prefers-reduced-motion` 关闭动效

---

## 数据说明（重要）

所有内容保存在**浏览器 localStorage**（键前缀 `dg:`），因此：

- 换设备或清理浏览器数据会丢失内容
- 首次访问会自动写入一份示例数据（`src/api/seed.ts`）
- 这是**纯静态站点实现"可编辑"的取舍**，不是缺陷。后续版本计划接入真实后端，
  届时只需替换 `src/api/` 内部实现，页面与 hook 无需改动

---

## 部署

### Vercel（推荐）

1. 把仓库推到 GitHub
2. Vercel → **Add New → Project → Import Git Repository** 选择本仓库
3. Framework Preset 会自动识别为 **Vite**，构建命令 `npm run build`，输出目录 `dist`
4. 在 **Environment Variables** 添加：
   - `VITE_ADMIN_USER`
   - `VITE_ADMIN_PASSWORD`
5. 点 **Deploy**

`vercel.json` 已配置 SPA 重写，刷新子路由不会 404。

### Cloudflare Pages（备用）

构建命令 `npm run build`，输出目录 `dist`，环境变量同上。
`public/_redirects` 已提供重写规则。

---

## 开发辅助脚本

`scripts/` 下是本地验证与截图脚本（依赖 `puppeteer-core`，非运行依赖）：

```bash
node scripts/verify-and-shoot.mjs   # 前台/后台端到端验证 + 截图
node scripts/shoot-docs.mjs         # 三份文档渲染截图
```

---

## License

MIT

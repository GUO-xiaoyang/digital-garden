# AGENTS.md · AI 协作约定

> 本文件是本仓库的**协作契约**。任何 AI 编码助手在修改本仓库前，
> 必须先读本文件与 [`PRD.md`](./PRD.md)、[`TECH_DESIGN.md`](./TECH_DESIGN.md)。
> 三份文档存在冲突时，优先级：**AGENTS.md > TECH_DESIGN.md > PRD.md**。

---

## 一、项目速览

| 项 | 值 |
| --- | --- |
| 项目 | 数字花园 · 个人知识站（Digital Garden） |
| 形态 | 纯静态 SPA，前后台同源（`/` 为访客视图，`/admin` 为管理视图） |
| 技术栈 | Vite + React 19 + TypeScript + Tailwind CSS v4 + react-router-dom v7 |
| 数据 | `src/api/` 统一接口层 + localStorage（无服务端） |
| 部署 | Vercel（备用 Cloudflare Pages） |
| 面向用户 | 站点所有者本人维护内容；访客只读浏览 |

---

## 二、铁律（违反即视为任务失败）

### 2.1 数据访问

1. **禁止在组件 / 页面中直接使用 `localStorage`**，一切读写必须经过 `src/api/`。
2. **禁止绕过 `src/api/` 自行拼装存储键**，键名集中在 `src/api/storage.ts`。
3. 新增数据实体时，必须在 `src/types/index.ts` 定义类型，并在 `src/api/` 建对应模块。

### 2.2 安全

4. **禁止移除或弱化 DOMPurify 消毒**。任何 `dangerouslySetInnerHTML` 的输入必须先过
   `lib/markdown.ts` 的渲染管线。
5. **禁止把口令、Token、密钥硬编码进源码**。后台口令只能来自
   `import.meta.env.VITE_ADMIN_USER` / `VITE_ADMIN_PASSWORD`。
6. **禁止在 localStorage 存明文密码**，只允许存签发后的 token 与过期时间。
7. 所有 `target="_blank"` 的外链必须带 `rel="noopener noreferrer"`。

### 2.3 依赖与体积

8. **禁止引入重型 UI 库**（Ant Design、MUI、Chakra、Element Plus 等）。
   需要新组件就在 `src/components/ui/` 自行实现。
9. 新增依赖前先评估：能用已有依赖或原生 API 解决的，不装新包。
10. highlight.js 只注册实际用到的语言，禁止 `import 'highlight.js'` 全量引入。

### 2.4 破坏性变更

11. **禁止删除或重命名 `src/types/index.ts` 中已有字段**而不更新全部调用点；
    需要变更时同步改 `PRD.md` / `TECH_DESIGN.md`。
12. **禁止删除 localStorage 的既有键**，会导致用户数据丢失。
    需要迁移时在 `api/storage.ts` 写一次性迁移逻辑。
13. 删除任何内容前必须弹二次确认（`ConfirmDialog`），不可静默删除。

---

## 三、目录与文件职责

| 目录 | 放什么 | 不放什么 |
| --- | --- | --- |
| `src/pages/` | 路由级页面组件 | 可复用组件 |
| `src/pages/admin/` | 后台页面 | 前台页面 |
| `src/components/layout/` | 布局地基（前台 / 后台各一套） | 业务组件 |
| `src/components/ui/` | 无业务的通用件（按钮、标签、卡片） | 含数据请求的组件 |
| `src/components/admin/` | 后台专用件（编辑器、表格外壳） | 前台用得到的件 |
| `src/api/` | 数据读写与业务规则 | 任何 React 代码 |
| `src/lib/` | 纯函数工具 | 有状态的逻辑 |
| `src/hooks/` | 组合 api 与 React 状态的钩子 | 直接操作 DOM 的业务逻辑 |
| `src/types/` | 全站类型 | 运行时值 |

**判断标准**：一个组件被两个以上页面用到，就抽到 `components/`。

---

## 四、代码规范

### 4.1 命名

| 对象 | 规范 | 示例 |
| --- | --- | --- |
| 组件文件 | 大驼峰 | `MarkdownEditor.tsx` |
| 工具文件 | 小驼峰 | `readingTime.ts` |
| 类型 / 接口 | 大驼峰 | `interface Post` |
| 函数 | 小驼峰，动词开头 | `listPublishedPosts()` |
| 布尔变量 | `is` / `has` / `should` 开头 | `isAuthenticated` |
| CSS 变量 | kebab-case | `--accent-a` |
| 存储键 | `dg:` 前缀 | `dg:posts` |

### 4.2 组件写法

- 一律**函数组件 + Hooks**，禁止 class 组件。
- Props 用具名 `interface`，不用 `React.FC`。
- 组件内部顺序：类型 → hooks → 派生值 → 事件处理 → 副作用 → return。
- 单个组件文件 **不超过 300 行**，超出则拆分。
- 列表渲染必须给稳定的 `key`（优先业务 `id`，禁止用数组下标）。

### 4.3 类型

- **禁止 `any`**；确实未知用 `unknown` 并在使用时收窄。
- 导出的函数必须有显式返回类型。
- 优先从 zod schema 推导类型（`z.infer<typeof schema>`），避免类型与校验两处维护。

### 4.4 样式

- 只用 Tailwind 工具类 + 设计令牌，**禁止内联 `style`** 写颜色（动态强调色除外）。
- 颜色/间距/圆角一律走 CSS 变量或 Tailwind token，**禁止散落魔法色值**。
- 响应式用移动优先写法：先写基础样式，再用 `sm:` / `md:` / `lg:` 覆盖。

### 4.5 注释

- **关键逻辑必须有中文注释**：复杂判断、非直觉实现、平台兼容处理。
- 不要注释显而易见的代码。
- 文件头用一句话说明文件职责。

---

## 五、必须遵守的实现模式

### 5.1 新增一个数据实体的完整步骤

1. `src/types/index.ts` 加 interface
2. `src/api/` 新建模块，导出 CRUD（`list / get / create / update / delete`）
3. `src/api/seed.ts` 加初始示例数据
4. 后台加管理页 + 路由（`src/router.tsx`）
5. 前台加展示（如果对访客可见）
6. 同步更新 `PRD.md` 功能清单与 `TECH_DESIGN.md` 数据模型章节

### 5.2 表单页的固定骨架

```
zod schema → useForm({ resolver: zodResolver(schema) })
→ Field 组件包裹输入 → 提交前二次确认（删除类）
→ 成功 toast / 失败显示字段错误
```

### 5.3 异步与副作用

- 所有 `IntersectionObserver`、`setTimeout`、事件监听必须在 `useEffect` 的 cleanup 中释放。
- 读取内容的 hook 统一返回 `{ data, loading, error }` 三态。

---

## 六、验证清单（提交前自查）

每次改动后按顺序过一遍：

- [ ] `npx tsc --noEmit` 无错误
- [ ] `npm run build` 构建成功
- [ ] 前台四个页面：首页 / 笔记详情 / 项目 / 关于我 均能正常打开
- [ ] 后台：未登录访问 `/admin` 会跳登录；登录后六个页面可访问
- [ ] 新增内容 → 前台立即可见（无需重新构建）
- [ ] 删除操作有二次确认
- [ ] 320px 宽度无横向滚动
- [ ] 浏览器控制台无 error
- [ ] 每个列表渲染都有稳定 key
- [ ] 没有引入任何重型 UI 库

---

## 七、回答用户与汇报的约定

1. **不要在没有验证的情况下声称"已完成"**。跑过构建、点过页面再说完成。
2. 发现既有代码的问题（bug、坏味道），**先说清楚再动手**，不要顺手大改。
3. 改动涉及架构或数据结构的，先说明方案与影响，得到确认再实施。
4. 无法完成的部分要**明确说出来**，并给出替代方案，不要假装做到。
5. 汇报时给出**可验证的证据**（命令输出、截图、文件路径），不要只说结论。

---

## 八、常见任务速查

| 任务 | 改动位置 |
| --- | --- |
| 改站点名称 / 强调色 | 后台 `/admin/settings`，或 `api/settings.ts` 默认值 |
| 加一篇笔记 | 后台 `/admin/posts/new`（无需改代码） |
| 改技能熟练度 | 后台 `/admin/skills` |
| 加导航菜单项 | `components/layout/Navbar.tsx` + `router.tsx` |
| 加一个前台页面 | `pages/` 新建 + `router.tsx` 注册 + Navbar 加链接 |
| 加一个后台管理页 | `pages/admin/` 新建 + `router.tsx` 注册 + `Sidebar.tsx` 加项 |
| 换掉 localStorage 为真后端 | 只改 `src/api/` 内部实现，页面与 hook 不动 |
| 新增 Markdown 支持的语言 | `lib/markdown.ts` 里注册 hljs 语言 |
| 调整主题色令牌 | `src/index.css` 的 `:root` |

---

## 九、已知限制（不要在任务中尝试"修复"）

1. **无服务端**：所有数据在本机浏览器，换设备 / 清缓存即丢失。这是设计选择，非缺陷。
2. **单管理员**：不做多用户与权限体系。
3. **无图片上传**：项目 / 笔记的图片只支持外链 URL。
4. **前端搜索**：线性匹配，数据量大时性能下降，v2.0 才会换服务端索引。
5. **后台口令走构建期环境变量**：修改口令需重新部署，这是静态托管的固有约束。

---

## 十、文档维护

- 三份文档与代码**同仓库同分支**维护，改动功能时一并更新。
- `PRD.md` 管**做什么**（功能与验收），`TECH_DESIGN.md` 管**怎么做**（架构与实现），
  `AGENTS.md` 管**怎么协作**（约束与流程）。
- 功能上线后，把 `PRD.md` 中对应条目的必要性标记从「可选」上调或勾选完成状态。

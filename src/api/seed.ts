/**
 * 数字花园 · 初始种子数据
 * 首次访问（对应存储键为空）时写入，保证站点开箱即有内容。
 * 之后所有修改都在后台进行，不会被本文件覆盖。
 */
import type { Post, Profile, Project, SiteSettings, SkillGroup } from '../types'

export const seedProfile: Profile = {
  name: '过啸阳',
  headline: 'Java 后端开发 · 把复杂的业务拆成清晰的接口',
  bio: `计算机科学与技术专业在读，方向是 **Java 后端研发**。

平时主要在做三件事：写接口、理数据、排问题。习惯把每次踩坑都记下来，
所以有了这个数字花园——它既是我的第二大脑，也是一份可以随时给人看的技术证据。

对代码的态度：能一句话说清的逻辑，不写三行；能靠约束保证的正确性，不靠人记。`,
  email: '3456614546@qq.com',
  city: '江西抚州',
  jobTarget: 'Java 后端研发工程师',
  socials: [
    { id: 's1', label: 'GitHub', url: 'https://github.com/GUO-xiaoyang' },
    { id: 's2', label: 'Email', url: 'mailto:3456614546@qq.com' },
  ],
  timeline: [
    {
      id: 't1',
      period: '2022.09 — 2026.06',
      title: '大连海事大学 · 计算机科学与技术',
      subtitle: '本科',
      description: '主修数据结构、数据库原理、计算机网络、操作系统。',
      type: 'education',
    },
    {
      id: 't2',
      period: '实习期间',
      title: '厦门易驰软件有限公司',
      subtitle: 'Java 研发实习生',
      description:
        '参与 CRM 系统后端开发：负责客户与商机模块的接口实现、SQL 优化，以及 Redis 缓存层的接入。',
      type: 'work',
    },
  ],
  updatedAt: new Date('2026-03-01').toISOString(),
}

export const seedSkillGroups: SkillGroup[] = [
  {
    id: 'g1',
    name: '后端开发',
    order: 1,
    skills: [
      { id: 'k1', name: 'Java', level: 82, note: '集合、并发、JVM 基础' },
      { id: 'k2', name: 'Spring Boot', level: 78, note: 'RESTful 接口、拦截器、全局异常' },
      { id: 'k3', name: 'Spring / Spring MVC', level: 75, note: 'IoC、AOP、MVC 分层' },
      { id: 'k4', name: 'MyBatis', level: 72, note: '动态 SQL、结果映射' },
    ],
  },
  {
    id: 'g2',
    name: '数据与缓存',
    order: 2,
    skills: [
      { id: 'k5', name: 'MySQL', level: 75, note: '索引设计、慢查询分析、事务' },
      { id: 'k6', name: 'Redis', level: 70, note: '缓存穿透/击穿、分布式锁' },
    ],
  },
  {
    id: 'g3',
    name: '前端基础',
    order: 3,
    skills: [
      { id: 'k7', name: 'HTML / CSS', level: 68, note: '语义化标签、Flex/Grid 布局' },
      { id: 'k8', name: 'JavaScript', level: 65, note: 'DOM 操作、异步与事件机制' },
    ],
  },
  {
    id: 'g4',
    name: '工程与工具',
    order: 4,
    skills: [
      { id: 'k9', name: 'Git', level: 78, note: '分支管理、冲突解决、PR 流程' },
      { id: 'k10', name: 'Maven', level: 72, note: '依赖管理与多模块构建' },
      { id: 'k11', name: 'Linux 常用命令', level: 65, note: '部署排错、日志检索' },
      { id: 'k12', name: 'Figma', level: 55, note: '能看懂设计稿并还原' },
    ],
  },
]

export const seedProjects: Project[] = [
  {
    id: 'p1',
    name: 'CRM 客户关系管理系统',
    summary: '面向中小企业的客户与商机管理后台，负责后端接口与缓存层实现。',
    content: `## 项目背景

公司内部用于管理客户线索与销售商机的系统，需要支撑销售团队日常的
**客户录入、商机跟进、合同归档** 三类核心流程。

## 我负责的部分

- **客户模块**：客户建档、标签管理、查重与合并的接口实现
- **商机模块**：商机阶段流转、跟进记录、成交率统计
- **缓存层**：把高频读取的客户详情接入 Redis，降低数据库压力
- **SQL 优化**：针对商机列表的慢查询做索引调整

## 遇到的难点

### 1. 客户查重导致的全表扫描

最初用 \`LIKE '%关键词%'\` 做查重，数据量过万后响应超过 3 秒。
改为对手机号、公司名建联合索引，并把精确匹配前置，响应降到 200ms 内。

### 2. 缓存与数据库的一致性

客户信息被多处修改，初期出现"改了资料但列表还是旧数据"。
最后采用 **更新数据库后删除缓存**，并对删除失败做重试补偿。

## 收获

第一次完整经历"接口上线 → 被真实使用 → 暴露问题 → 优化"的闭环，
也理解了索引和缓存不是"加上就好"，而是要先搞清楚访问模式。`,
    tags: ['Spring Boot', 'MyBatis', 'MySQL', 'Redis', 'Maven'],
    role: 'Java 后端开发实习生',
    period: '实习期间',
    status: 'done',
    featured: true,
    createdAt: new Date('2026-02-10').toISOString(),
    updatedAt: new Date('2026-02-28').toISOString(),
  },
  {
    id: 'p2',
    name: '数字花园 · 个人知识站',
    summary: '带后台管理的前后端同源知识站，用标签网络组织学习笔记。',
    content: `## 为什么做这个

笔记散在本地 Markdown、语雀、草稿箱里，找的时候全靠记忆。
想要一个**自己能持续维护、又能对外展示**的地方。

## 技术选型

- **Vite + React + TypeScript**：构建快，类型能挡住后台表单的低级错误
- **Tailwind CSS**：深色主题用 CSS 变量做令牌，强调色可在后台改
- **统一 API 层**：所有读写收敛到 \`src/api/\`，日后换真后端只改一层

## 有意思的点

### 后台不需要重新部署

个人信息、技能、项目、笔记全部存在浏览器本地，
在 \`/admin\` 改完前台立刻生效——这是纯静态站点能做到"可编辑"的关键。

### Markdown 渲染的安全边界

渲染管线是 \`marked → highlight.js → DOMPurify\`，
最后一步不能省：它决定了能不能安全地用 \`dangerouslySetInnerHTML\`。`,
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind'],
    role: '独立开发',
    period: '2026.03',
    status: 'active',
    featured: true,
    createdAt: new Date('2026-03-05').toISOString(),
    updatedAt: new Date('2026-03-12').toISOString(),
  },
]

export const seedPosts: Post[] = [
  {
    id: 'n1',
    slug: 'redis-cache-penetration',
    title: 'Redis 缓存穿透、击穿、雪崩：三种问题的区别与对策',
    summary:
      '名字很像但成因完全不同。用一次线上排查的经历，把三者拆开讲清楚，并给出各自适用的解决方案。',
    content: `## 先把三个词拆开

很多人把这三个混着说，其实**查询路径完全不同**：

| 问题 | 数据在缓存 | 数据在数据库 | 典型成因 |
| --- | --- | --- | --- |
| 缓存穿透 | 没有 | 也没有 | 查询不存在的数据 |
| 缓存击穿 | 没有 | **有** | 热点 key 恰好过期 |
| 缓存雪崩 | 大面积没有 | 有 | 大量 key 同时过期 |

一句话记忆：**穿透是数据根本不存在，击穿是一个热点过期，雪崩是一片同时过期。**

## 缓存穿透

### 现象

线上看到数据库 QPS 突然飙高，但缓存命中率反而没降多少——因为请求的 key
压根就不在缓存里，也不在数据库里。

典型场景：有人用脚本刷 \`/api/user?id=-1\`，每次都绕过缓存直接打数据库。

### 两种对策

**方案一：缓存空值**

\`\`\`java
public User getUser(Long id) {
    String key = "user:" + id;
    String cached = redis.get(key);
    if (cached != null) {
        // 空值用特殊标记，避免和"缓存未命中"混淆
        return "NULL".equals(cached) ? null : JSON.parseObject(cached, User.class);
    }
    User user = userMapper.selectById(id);
    if (user == null) {
        // 空结果也缓存，但过期时间要短
        redis.setex(key, 60, "NULL");
        return null;
    }
    redis.setex(key, 1800, JSON.toJSONString(user));
    return user;
}
\`\`\`

要点：空值的过期时间要**明显短于**正常数据（60s vs 1800s），
否则新增数据后会有一段时间读不到。

**方案二：布隆过滤器**

把所有存在的 id 预先放进布隆过滤器，请求先过一层判断：

\`\`\`java
if (!bloomFilter.mightContain(id)) {
    return null;   // 一定不存在，直接返回
}
\`\`\`

代价是**有误判率**（说存在但实际不存在），所以布隆过滤器只能挡"一定不存在"的请求，
后面仍然要配合空值缓存。

## 缓存击穿

热点 key（比如首页配置）过期的瞬间，大量并发请求同时打到数据库。

### 对策：互斥锁重建

\`\`\`java
public String getHotData(String key) {
    String value = redis.get(key);
    if (value != null) return value;

    String lockKey = "lock:" + key;
    // setnx 保证只有一个线程去重建
    boolean locked = redis.setnx(lockKey, "1", 10);
    if (locked) {
        try {
            value = loadFromDb(key);
            redis.setex(key, 3600, value);
            return value;
        } finally {
            redis.del(lockKey);
        }
    }
    // 没抢到锁的线程短暂等待后重试
    Thread.sleep(50);
    return getHotData(key);
}
\`\`\`

更简单的办法：**热点数据逻辑过期**——value 里存一个过期时间戳，
发现"逻辑过期"时异步起一个线程去更新，当前请求先返回旧值。
这样不会有请求被阻塞。

## 缓存雪崩

大量 key 在同一时刻过期（常见于凌晨批量预热），或 Redis 实例整体挂掉。

### 对策

1. **过期时间加随机扰动**：\`base + random(0, 300)\` 秒，把过期点打散
2. **多级缓存**：本地缓存（Caffeine）+ Redis，Redis 挂了还有一层
3. **熔断降级**：Redis 不可用时限制数据库流量，而不是全部放行

\`\`\`java
// 给过期时间加随机偏移，避免同一批 key 同时失效
int ttl = 1800 + ThreadLocalRandom.current().nextInt(300);
redis.setex(key, ttl, value);
\`\`\`

## 排查时的一个教训

出现问题时**先看监控再改代码**。我们那次盲目加了布隆过滤器，
后来看调用链路才发现是某个接口的 key 拼错了（少拼了租户 ID），
根本不是穿透。**先把问题定位准，再选方案。**`,
    tags: ['Redis', '缓存', 'Java'],
    pinned: true,
    published: true,
    createdAt: new Date('2026-02-20').toISOString(),
    updatedAt: new Date('2026-03-08').toISOString(),
  },
  {
    id: 'n2',
    slug: 'mysql-index-slow-query',
    title: '一次慢查询优化：从 3.2 秒到 180 毫秒',
    summary:
      '用 EXPLAIN 定位到全表扫描，通过调整索引与改写 SQL 把商机列表接口的响应时间降了 94%。',
    content: `## 问题现象

CRM 的商机列表接口，数据量到 1.2 万条后响应时间从 400ms 涨到 **3.2 秒**，
前端转圈圈，销售同事开始抱怨。

## 第一步：找到慢在哪

先开慢查询日志：

\`\`\`sql
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;
\`\`\`

定位到这条 SQL：

\`\`\`sql
SELECT * FROM opportunity
WHERE tenant_id = 88
  AND status IN ('FOLLOWING', 'QUOTED')
  AND customer_name LIKE '%科技%'
ORDER BY updated_at DESC
LIMIT 20;
\`\`\`

## 第二步：EXPLAIN 看执行计划

\`\`\`sql
EXPLAIN SELECT ...;
\`\`\`

关键几列的结果：

| 列 | 值 | 说明 |
| --- | --- | --- |
| type | ALL | **全表扫描**，最差的一档 |
| rows | 12480 | 估算扫描 1.2 万行 |
| Extra | Using where; Using filesort | 额外排序，无法用索引 |

两个问题：**没走索引**，而且**排序要额外做 filesort**。

## 第三步：为什么没走索引

当时表上只有 \`PRIMARY KEY(id)\` 和 \`KEY idx_tenant(tenant_id)\`。

- \`tenant_id = 88\` 本身有索引，但选择度太低——88 这个租户占了 60% 的数据，
  优化器算了一下觉得走索引再回表还不如直接全扫，**主动放弃了索引**。
- \`status IN (...)\` 和 \`LIKE '%科技%'\` 都用不上索引。
- 前导模糊匹配 \`LIKE '%xxx%'\` **天然无法走 B+ 树索引**，这是原理决定的。

## 第四步：怎么改

### 索引调整

建一个覆盖「过滤 + 排序」的联合索引：

\`\`\`sql
ALTER TABLE opportunity
  ADD INDEX idx_tenant_status_updated (tenant_id, status, updated_at DESC);
\`\`\`

顺序有讲究：

1. \`tenant_id\` 等值查询，放最左
2. \`status\` 等值/IN 查询，放中间
3. \`updated_at\` 排序字段，放最后

这样过滤和排序**都能用上同一个索引**，filesort 消失。

### SQL 改写

前导模糊匹配无法优化，只能换需求实现方式：

\`\`\`sql
-- 改前：前后都模糊，无法用索引
WHERE customer_name LIKE '%科技%'

-- 改后：只做前缀匹配，可以用索引
WHERE customer_name LIKE '科技%'
\`\`\`

同时和产品确认：搜索场景其实用户**输入的是公司名开头**，
改成前缀匹配完全满足需求。

### 结果

| 指标 | 优化前 | 优化后 |
| --- | --- | --- |
| 响应时间 | 3.2s | **180ms** |
| type | ALL | range |
| Extra | Using filesort | Using index condition |

## 几个容易踩的坑

1. **索引不是越多越好**：写操作要维护索引，且优化器选择成本变高。
   这次是先删了一个几乎用不上的单列索引再加联合索引。
2. **联合索引有最左前缀原则**：\`(a,b,c)\` 能支持 \`a\`、\`a+b\`、\`a+b+c\`，
   但不支持单独的 \`b\`。
3. **\`IN\` 之后的字段用不上索引排序**：所以我把排序字段放在最后。
4. **\`EXPLAIN\` 的 rows 是估算值**，真实行数要用 \`EXPLAIN ANALYZE\`（MySQL 8.0.18+）。

## 排查套路总结

\`\`\`
慢查询日志定位 SQL
   → EXPLAIN 看 type / key / rows / Extra
   → 判断是"没走索引"还是"走了但低效"
   → 调索引 或 改写 SQL 或 改需求实现
   → 再次 EXPLAIN 验证
\`\`\``,
    tags: ['MySQL', '索引', 'SQL 优化'],
    pinned: false,
    published: true,
    createdAt: new Date('2026-02-25').toISOString(),
    updatedAt: new Date('2026-03-06').toISOString(),
  },
  {
    id: 'n3',
    slug: 'spring-boot-global-exception',
    title: 'Spring Boot 全局异常处理：让接口错误返回统一格式',
    summary:
      '用 @RestControllerAdvice 收敛散落各处的 try-catch，配合自定义业务异常与参数校验，统一错误响应结构。',
    content: `## 为什么要做统一异常处理

项目初期每个 Controller 里都是这样：

\`\`\`java
@GetMapping("/{id}")
public Result<User> get(@PathVariable Long id) {
    try {
        User user = userService.getById(id);
        return Result.success(user);
    } catch (Exception e) {
        log.error("查询用户失败", e);
        return Result.fail("系统繁忙");
    }
}
\`\`\`

问题很明显：

- **重复代码**：几十个接口，每个都抄一遍
- **格式不一致**：有的返回 \`"系统繁忙"\`，有的返回 \`e.getMessage()\`，前端没法统一处理
- **日志噪音**：参数校验失败这种"预期内"的错误也打了 error 级别

## 定义统一的响应结构

\`\`\`java
@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> r = new Result<>();
        r.code = 0;
        r.message = "ok";
        r.data = data;
        return r;
    }

    public static <T> Result<T> fail(int code, String message) {
        Result<T> r = new Result<>();
        r.code = code;
        r.message = message;
        return r;
    }
}
\`\`\`

约定：\`code = 0\` 表示成功，其余为业务错误码。

## 自定义业务异常

\`\`\`java
public class BizException extends RuntimeException {
    private final int code;

    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
\`\`\`

Service 层直接抛，不用管怎么返回：

\`\`\`java
public User getById(Long id) {
    User user = userMapper.selectById(id);
    if (user == null) {
        throw new BizException(40401, "用户不存在");
    }
    return user;
}
\`\`\`

## 全局处理器

\`\`\`java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /** 业务异常：预期内的错误，打 warn 即可 */
    @ExceptionHandler(BizException.class)
    public Result<Void> handleBiz(BizException e) {
        log.warn("业务异常: code={}, msg={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    /** 参数校验失败：把第一个字段错误返回给前端 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("参数不合法");
        return Result.fail(40000, msg);
    }

    /** 兜底：非预期异常，打 error 并带堆栈，但不把细节暴露给前端 */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleOther(Exception e) {
        log.error("系统异常", e);
        return Result.fail(50000, "系统繁忙，请稍后重试");
    }
}
\`\`\`

## 三个关键点

### 1. 日志级别要分开

| 异常类型 | 级别 | 原因 |
| --- | --- | --- |
| 业务异常 | warn | 属于正常业务分支，不是故障 |
| 参数校验失败 | warn | 前端问题，不需要半夜被叫起来 |
| 其它异常 | **error** | 真正的故障，必须带堆栈 |

一开始全部用 error，告警群里天天响，后来把前两类降到 warn 才清净。

### 2. 不要泄露内部细节

兜底分支**绝不能**把 \`e.getMessage()\` 返回给前端——
里面可能有 SQL 片段、表名、文件路径。对外只说"系统繁忙"，
细节写进日志，用 traceId 关联。

### 3. HTTP 状态码怎么选

两种风格：

- **始终返回 200**，靠 body 里的 \`code\` 区分 → 简单，前端只看 body
- **返回真实状态码**（404 / 400 / 500）→ RESTful，但前端要同时处理两层

我们选了第一种，因为前端 axios 拦截器只需要处理一层，
但**要额外注意**：这样 HTTP 200 不代表成功，监控系统配置时不能只看状态码。

## 需要注意的坑

\`@RestControllerAdvice\` **只拦截 Controller 层抛出的异常**。
拦截器（Interceptor）、过滤器（Filter）里抛的异常它管不着，
那些地方要么自己处理，要么让异常继续往上抛到容器层。

另外：如果异常已经在拦截器里被 \`response.getWriter().write()\` 写过响应了，
全局处理器再去写会导致响应内容拼接出错。

## 效果

改造后：

- Controller 里 **一行 try-catch 都不剩**
- 前端只需要判断 \`code === 0\`
- 日志按预期/非预期分开，告警不再误报`,
    tags: ['Spring Boot', 'Java', '异常处理'],
    pinned: false,
    published: true,
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date('2026-03-10').toISOString(),
  },
  {
    id: 'n4',
    slug: 'git-workflow-basics',
    title: 'Git 协作中最常用的几个命令与我的分支习惯',
    summary:
      '从实习里学到的实用 Git 流程：分支命名、提交粒度、冲突解决，以及几个救命命令。',
    content: `## 我踩过的第一个坑

第一次提交代码，把 \`target/\` 目录一起提交上去了，
同事 pull 之后满屏的编译产物，review 时被指出来才意识到**要先写 .gitignore**。

\`\`\`gitignore
# 编译产物
target/
build/
dist/

# IDE
.idea/
.vscode/
*.iml

# 本地配置与密钥（这条最容易忘，且后果最严重）
.env
.env.local
*.local

# 系统文件
.DS_Store
Thumbs.db
\`\`\`

**关键点**：\`.env\` 这类文件一旦提交过一次，后面加进 \`.gitignore\` 也**不会自动删除**，
必须显式 \`git rm --cached .env\` 并从历史里清掉。

## 日常流程

\`\`\`bash
# 1. 开始新工作前先同步主干，避免基于过期代码开发
git checkout main
git pull origin main

# 2. 建分支（命名带上类型和内容，别人一眼看懂）
git checkout -b feature/opportunity-list

# 3. 开发中随时看状态
git status

# 4. 提交：尽量小步，一次做一件事
git add src/main/java/.../OpportunityController.java
git commit -m "feat: 商机列表支持按状态筛选"

# 5. 推送前再拉一次，尽量在本地解决冲突
git pull --rebase origin main

# 6. 推送
git push origin feature/opportunity-list
\`\`\`

## 提交信息怎么写

约定式提交（Conventional Commits），前缀决定语义：

| 前缀 | 用途 |
| --- | --- |
| \`feat\` | 新功能 |
| \`fix\` | 修 bug |
| \`refactor\` | 重构，不改行为 |
| \`perf\` | 性能优化 |
| \`docs\` | 文档 |
| \`chore\` | 构建、依赖等杂项 |

反例：\`git commit -m "改了一下"\` —— 两周后自己都看不懂改了什么。

好的提交信息回答三个问题：**做了什么、为什么、有什么影响**。

## 冲突怎么解决

\`\`\`bash
git pull origin main
# 出现冲突后，文件里会有这些标记：
\`\`\`

\`\`\`
<<<<<<< HEAD
    return Result.success(userService.list());
=======
    return Result.success(userService.listWithCache());
>>>>>>> origin/main
\`\`\`

处理顺序：

1. **先搞清楚两边各自想干什么**，不要盲目选一边
2. 手动合并成正确结果，**删掉所有冲突标记**（\`<<<\` \`===\` \`>>>\`）
3. \`git add\` 标记已解决
4. \`git rebase --continue\` 或 \`git commit\`

\`\`\`bash
# 搞砸了想重来
git rebase --abort
\`\`\`

## 几个救命命令

\`\`\`bash
# 看谁改的这行、什么时候改的（排查问题的神器）
git blame src/main/java/.../UserService.java

# 看某次提交具体改了什么
git show a1b2c3d

# 撤销工作区未提交的修改（危险，改动会丢）
git checkout -- 文件名

# 把上一次提交的信息改掉（还没推送到远端时）
git commit --amend -m "新的提交信息"

# 暂存当前改动，去处理别的事，回来再恢复
git stash
git stash pop
\`\`\`

## 实习里学到的一条经验

**push 之前一定先 pull。** 我有次直接 push，被拒绝后再 pull 产生了
一堆冲突，花半小时才理清。养成"先拉后推"的习惯后基本没再出过问题。

\`\`\`bash
git pull --rebase origin main && git push
\`\`\`

用 \`--rebase\` 而不是默认 merge，提交历史是**一条直线**，不会有一堆
"Merge branch 'main' into feature/xxx" 的噪音提交。`,
    tags: ['Git', '工程化'],
    pinned: false,
    published: true,
    createdAt: new Date('2026-03-03').toISOString(),
    updatedAt: new Date('2026-03-11').toISOString(),
  },
  {
    id: 'n5',
    slug: 'internship-review',
    title: '实习复盘：从「能跑」到「能用」中间隔着什么',
    summary:
      '三个月实习里最有价值的三个认知：需求要问清、边界要想全、上线只是开始。',
    content: `## 写在前面

去之前我以为实习就是"按需求写接口"。
三个月下来发现，**写代码只占三分之一时间**，剩下的是搞清需求、
想全边界、以及上线后的问题处理。

## 认知一：需求不是拿来就做的

### 我的第一次翻车

需求写着："商机列表支持按客户名称搜索"。

我当天就写完提交了，用 \`LIKE '%关键词%'\` 实现。
测试环境数据少，没问题。上线后数据量上来，接口 3 秒起步。

问题不在实现，在**我从没问过**：

- 搜索框用户实际会怎么输入？（输入公司名开头，不是中间任意片段）
- 数据量级大概多少？（销售团队几万条商机）
- 有没有性能要求？

如果一开始问清这三点，就会知道该用前缀匹配 + 索引，而不是前导模糊。

**教训**：需求文档写的是"做什么"，**"怎么算做好"必须自己问出来**。

## 认知二：边界情况才是代码质量的分水岭

一个"查询客户详情"的接口，能跑通的版本十行就够了：

\`\`\`java
public User getById(Long id) {
    return userMapper.selectById(id);
}
\`\`\`

但真正上线要考虑的：

| 情况 | 处理 |
| --- | --- |
| id 为 null | 直接返回参数错误，不查库 |
| id 不存在 | 抛业务异常，返回明确提示而不是 null |
| id 是负数 | 同上，避免无意义的数据库查询 |
| 客户已删除 | 状态字段判断，给前端可区分的错误码 |
| 并发查询同一客户 | 加缓存时要注意缓存穿透 |
| 租户隔离 | 必须校验该客户属于当前租户，否则是越权 |

写完之后自问一句：**"如果用户乱传参数，会发生什么？"**
这一问能挡掉大部分线上问题。

## 认知三：上线不是结束，是开始

上线后遇到的两类问题，都让我印象很深：

### 类型一：环境差异

测试环境正常，生产报错。原因是配置项没同步——
本地 \`application-dev.yml\` 里配了 Redis 地址，生产的配置漏了。

**对策**：上线前对照检查清单逐项过配置，不要靠记忆。

### 类型二：真实使用方式的意外

我们设计列表接口时默认"用户会翻页"，结果销售同事习惯**一直往下滚**，
触发了深度分页，\`LIMIT 10000, 20\` 变得极慢。

**对策**：\`LIMIT\` 偏移量大时改用游标分页（\`WHERE id > last_id LIMIT 20\`）。

## 三个月里最有用的一句话

带我的师兄说过：

> **先让它对，再让它快，最后让它好看。**
> 反过来做，三件事都要返工。

我一开始总想一次写到位，结果在"好看"上花太久，
核心逻辑反而有边界没覆盖到。按这个顺序做之后效率高很多。

## 还想继续补的

1. **并发**：目前只处理过缓存层的简单并发，JVM 层面的线程安全还不熟
2. **分布式**：分布式锁、分布式事务只停留在概念
3. **性能分析**：会用 \`EXPLAIN\` 看 SQL，但 JVM 调优、火焰图还没上手

这些是接下来要继续填的坑。`,
    tags: ['实习复盘', '成长', 'Java'],
    pinned: true,
    published: true,
    createdAt: new Date('2026-03-05').toISOString(),
    updatedAt: new Date('2026-03-12').toISOString(),
  },
  {
    id: 'n6',
    slug: 'maven-dependency-conflict',
    title: 'Maven 依赖冲突排查：NoSuchMethodError 是怎么来的',
    summary:
      '同一个类出现在两个版本的 jar 里，编译通过但运行报错。用 dependency:tree 定位并排除冲突依赖。',
    content: `## 现象

项目编译完全正常，启动后调用某个接口报错：

\`\`\`
java.lang.NoSuchMethodError:
  com.google.common.collect.ImmutableList.copyOf([Ljava/lang/Object;)
  Lcom/google/common/collect/ImmutableList;
\`\`\`

**编译期能找到方法，运行期找不到**——这是依赖冲突的典型特征。

## 为什么会这样

编译时用的是 A 版本的 jar，运行时类路径里加载的却是 B 版本。
当 B 版本里没有那个方法，就抛 \`NoSuchMethodError\`。

Maven 的依赖调解规则是：**路径最短优先，同长度先声明优先**。
这可能导致你想要的版本被一个更浅的传递依赖覆盖。

## 定位步骤

### 第一步：确认实际生效的版本

\`\`\`bash
mvn dependency:tree -Dincludes=com.google.guava:guava
\`\`\`

输出：

\`\`\`
[INFO] +- com.example:my-app:jar:1.0.0
[INFO] |  +- com.google.guava:guava:jar:18.0:compile
[INFO] |  \\- org.apache.hadoop:hadoop-common:jar:3.3.1:compile
[INFO] |     \\- com.google.guava:guava:jar:27.0-jre:compile (omitted for conflict)
\`\`\`

看到 \`omitted for conflict\` 就说明这里发生了冲突，
生效的是**没有被 omit 的那个**（18.0）。

### 第二步：确认要哪个版本

到仓库里查这个方法在哪个版本存在：

\`\`\`bash
# 直接看 jar 里的类
javap -classpath guava-18.0.jar com.google.common.collect.ImmutableList | grep copyOf
\`\`\`

发现 \`copyOf(Object[])\` 是在 20.0 之后才加的，所以必须用 27.0。

### 第三步：排除并显式声明

\`\`\`xml
<dependency>
    <groupId>org.apache.hadoop</groupId>
    <artifactId>hadoop-common</artifactId>
    <version>3.3.1</version>
    <exclusions>
        <!-- 排掉它带进来的旧版 guava -->
        <exclusion>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- 显式声明需要的版本（直接依赖路径最短，一定生效） -->
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>27.0-jre</version>
</dependency>
\`\`\`

**关键点**：显式声明为**直接依赖**，路径长度是 1，一定赢过任何传递依赖。

## 更省事的办法：dependencyManagement

如果项目模块多，在父 POM 里统一锁版本：

\`\`\`xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
            <version>27.0-jre</version>
        </dependency>
    </dependencies>
</dependencyManagement>
\`\`\`

\`dependencyManagement\` **不引入依赖**，只锁版本。
子模块用到时自动采用这个版本。

## 常用排查命令

| 命令 | 用途 |
| --- | --- |
| \`mvn dependency:tree\` | 看完整依赖树 |
| \`mvn dependency:tree -Dincludes=组:构件\` | 只看某个依赖的来源 |
| \`mvn dependency:tree -Dverbose\` | 显示被省略的冲突项 |
| \`mvn dependency:analyze\` | 找出声明了但没用的依赖 |
| \`mvn dependency:purge-local-repository\` | 疑似本地仓库损坏时重下 |

## 三个经验

1. **别急着删本地仓库**。先 \`dependency:tree\` 定位，直接删是把问题藏起来。
2. **冲突信号词**：\`NoSuchMethodError\`、\`NoClassDefFoundError\`、
   \`ClassNotFoundException\`、\`AbstractMethodError\` —— 见到就想到依赖冲突。
3. **锁定版本比排除更省心**。项目大了之后到处写 \`<exclusions>\` 很难维护，
   在父 POM 用 \`dependencyManagement\` 统一收敛。`,
    tags: ['Maven', '依赖管理', 'Java', '排错'],
    pinned: false,
    published: true,
    createdAt: new Date('2026-03-08').toISOString(),
    updatedAt: new Date('2026-03-13').toISOString(),
  },
]

export const seedSettings: SiteSettings = {
  siteName: '数字花园',
  tagline: '记录理解的过程，而不只是结果',
  accentA: '#2dd4bf',
  accentB: '#f59e0b',
  footerText: '用 React + Vite 手写，数据存在浏览器本地',
  icp: '',
  updatedAt: new Date('2026-03-01').toISOString(),
}

/**
 * 数字花园 · 端到端验证与截图
 * 覆盖：前台四页 + 后台登录/六页 + 新建笔记后前台立即出现
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const CHROME = 'C:\\Users\\34566\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://127.0.0.1:4173'
const OUT = 'C:\\Users\\34566\\Downloads\\考核截图3'
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'garden2026'

fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--lang=zh-CN', '--force-device-scale-factor=1'],
  defaultViewport: { width: 1440, height: 1000, deviceScaleFactor: 2 },
})

const page = await browser.newPage()
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console] ${m.text()}`)
})
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))

const shot = async (name, opts = {}) => {
  await page.screenshot({ path: `${OUT}\\${name}.png`, ...opts })
  console.log('  saved', name + '.png')
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// ===========================================================================
console.log('\n=== 1. 前台 ===')
await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(2000)
await shot('02-前台-首页-首屏')
await shot('02-前台-首页-整页', { fullPage: true })

// 首页上的关键内容断言
const homeInfo = await page.evaluate(() => ({
  title: document.title,
  h1: document.querySelector('h1')?.innerText.trim().replace(/\n/g, ' | '),
  cards: document.querySelectorAll('article').length,
  hasSearch: !!document.querySelector('input[type="search"]'),
  tags: [...document.querySelectorAll('button')].filter((b) => /Redis|MySQL|Git/.test(b.textContent || '')).length,
}))
console.log('  首页信息:', JSON.stringify(homeInfo))

// 搜索交互
await page.type('input[type="search"]', 'Redis')
await wait(1200)
const searchCount = await page.evaluate(() => document.querySelectorAll('article').length)
console.log('  搜索「Redis」命中卡片数:', searchCount)
await shot('02-前台-首页-搜索筛选')
await page.evaluate(() => {
  const i = document.querySelector('input[type="search"]')
  if (i) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(i, '')
    i.dispatchEvent(new Event('input', { bubbles: true }))
  }
})
await wait(800)

// 笔记详情
await page.goto(BASE + '/posts/redis-cache-penetration', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1800)
await shot('02-前台-笔记详情-首屏')
await shot('02-前台-笔记详情-整页', { fullPage: true })
const detailInfo = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.innerText.trim(),
  tocItems: document.querySelectorAll('aside a[href^="#"]').length,
  codeBlocks: document.querySelectorAll('pre code').length,
  hljsReady: document.querySelectorAll('.hljs-keyword, .hljs-string').length > 0,
  related: document.querySelectorAll('section a[href^="/posts/"]').length,
}))
console.log('  详情页信息:', JSON.stringify(detailInfo))

// 知识网络
await page.goto(BASE + '/tags', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1500)
await shot('02-前台-知识网络')
await page.goto(BASE + '/tags/Redis', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1200)
await shot('02-前台-知识网络-按标签')

// 项目
await page.goto(BASE + '/projects', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1500)
await shot('02-前台-项目列表')
// 展开详情（用 evaluate 触发，避免元素动画期间不可点击）
const expanded = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-expanded]')
  if (!btn) return false
  btn.click()
  return true
})
console.log('  展开项目详情:', expanded)
await wait(1500)
await shot('02-前台-项目详情展开')

// 关于我
await page.goto(BASE + '/about', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1500)
await shot('02-前台-关于我')
await shot('02-前台-关于我-整页', { fullPage: true })
const aboutInfo = await page.evaluate(() => ({
  bars: document.querySelectorAll('[role="progressbar"]').length,
  timeline: document.querySelectorAll('ol li time').length,
}))
console.log('  关于我:', JSON.stringify(aboutInfo))

// 移动端
await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 3 })
await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1500)
await shot('02-前台-移动端-首页', { fullPage: false })
const mobileOverflow = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
}))
console.log('  375px 横向溢出检查:', JSON.stringify(mobileOverflow))
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 })

// ===========================================================================
console.log('\n=== 2. 路由守卫 ===')
await page.goto(BASE + '/admin', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1500)
const guardUrl = page.url()
console.log('  未登录访问 /admin →', guardUrl)
console.log('  守卫生效:', guardUrl.includes('/admin/login'))
await shot('03-后台-登录页')

// ===========================================================================
console.log('\n=== 3. 后台 ===')
await page.type('#username', ADMIN_USER)
await page.type('#password', ADMIN_PASS)
await page.evaluate(() => {
  const btn = document.querySelector('button[type="submit"]')
  if (btn) btn.click()
})
await wait(2500)
console.log('  登录后 URL:', page.url())
await shot('03-后台-仪表盘')

const nav = async (path, name, full = false) => {
  await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 60000 })
  await wait(1600)
  await shot(name, full ? { fullPage: true } : {})
}

await nav('/admin/profile', '03-后台-个人信息')
await nav('/admin/skills', '03-后台-技能管理')
await nav('/admin/projects', '03-后台-项目管理')
await nav('/admin/posts', '03-后台-笔记管理')
await nav('/admin/settings', '03-后台-站点设置')

// 编辑器（左写右预览）
await nav('/admin/posts/new', '03-后台-笔记编辑器')

// ===========================================================================
console.log('\n=== 4. 端到端：新建笔记 → 前台立即出现 ===')
const NEW_TITLE = '端到端验证：从后台新建一篇笔记'
const slug = `e2e-check-${Date.now().toString(36)}`

await page.goto(BASE + '/admin/posts/new', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1500)
await page.type('#title', NEW_TITLE)

// slug：选中已有内容后覆盖（用真实交互，避免 setter 类型不匹配）
await page.click('#slug', { clickCount: 3 })
await page.keyboard.press('Backspace')
await page.type('#slug', slug)

await page.type('#summary', '这条笔记用于验证「后台保存 → 前台立即可见」，无需重新部署。')

// 正文：追加一段带代码块与表格的内容
await page.click('textarea[placeholder*="Markdown"]', { clickCount: 1 })
await page.keyboard.type('## 验证目的\n\n')
await page.keyboard.type('确认后台新增内容后，前台无需重新构建即可读取。\n\n')
await page.keyboard.type('```java\npublic class Demo {\n    public static void main(String[] args) {\n        System.out.println("hello garden");\n    }\n}\n```\n\n')
await page.keyboard.type('| 检查项 | 结果 |\n| --- | --- |\n| 保存 | 通过 |\n| 前台可见 | 通过 |')
await wait(1500)
await shot('03-后台-编辑器-填充内容')

// 提交（用 evaluate 触发，避免动画期间点击失败）
const submitted = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button[type="submit"]')].pop()
  if (!btn) return false
  btn.click()
  return true
})
console.log('  触发提交:', submitted)
await wait(2500)
console.log('  提交后 URL:', page.url())
await shot('03-后台-笔记列表-新增后')

// 回前台确认
await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1800)
const appeared = await page.evaluate((t) => document.body.innerText.includes(t), NEW_TITLE)
console.log('  前台首页是否出现新笔记:', appeared)
await shot('04-端到端-前台立即出现新笔记')

// 打开这篇新笔记
await page.goto(`${BASE}/posts/${slug}`, { waitUntil: 'networkidle2', timeout: 60000 })
await wait(1600)
const newPostOk = await page.evaluate((t) => ({
  title: document.querySelector('h1')?.innerText.trim(),
  matched: document.querySelector('h1')?.innerText.includes(t) ?? false,
  codeBlocks: document.querySelectorAll('pre code').length,
}), NEW_TITLE)
console.log('  新笔记详情页:', JSON.stringify(newPostOk))
await shot('04-端到端-新笔记详情')

// ===========================================================================
console.log('\n=== 5. 控制台错误汇总 ===')
const realErrors = errors.filter((e) => !/favicon|Download the React DevTools/i.test(e))
console.log('  错误数:', realErrors.length)
realErrors.slice(0, 10).forEach((e) => console.log('   -', e))

fs.writeFileSync(`${OUT}\\_report.json`, JSON.stringify({
  homeInfo, detailInfo, aboutInfo, mobileOverflow, searchCount, appeared, newPostOk,
  guardUrl, errors: realErrors,
}, null, 2), 'utf8')

await browser.close()
console.log('\nDONE')

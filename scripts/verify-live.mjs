/**
 * 数字花园 · 线上部署验证与截图（问卷 04）
 * 在生产域名上走一遍：前台 → 守卫 → 登录 → 后台 → 端到端新增
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const CHROME = 'C:\\Users\\34566\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'https://digital-garden-nu-one.vercel.app'
const OUT = 'C:\\Users\\34566\\Downloads\\考核截图3'
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'garden2026'

fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  // 用独立 profile，避免读到上一次本地验证残留的 localStorage 数据
  userDataDir: process.env.FRESH_PROFILE || undefined,
  args: ['--no-sandbox', '--lang=zh-CN', '--force-device-scale-factor=1'],
  defaultViewport: { width: 1440, height: 1000, deviceScaleFactor: 2 },
})

const page = await browser.newPage()
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console] ${m.text()}`)
})
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = async (name, opts = {}) => {
  await page.screenshot({ path: `${OUT}\\${name}.png`, ...opts })
  console.log('  saved', name + '.png')
}

console.log('\n=== 线上验证 ===')
console.log('  目标站点:', BASE)

// ---------------- 前台首页 ----------------
await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 90000 })
await wait(2500)
await shot('04-线上-首页-首屏')
await shot('04-线上-首页-整页', { fullPage: true })

const home = await page.evaluate(() => ({
  title: document.title,
  h1: document.querySelector('h1')?.innerText.trim().split('\n')[0],
  cards: document.querySelectorAll('article').length,
  url: location.href,
}))
console.log('  首页:', JSON.stringify(home))

// ---------------- 笔记详情 ----------------
await page.goto(BASE + '/posts/redis-cache-penetration', { waitUntil: 'networkidle2', timeout: 90000 })
await wait(2200)
await shot('04-线上-笔记详情')
const detail = await page.evaluate(() => ({
  toc: document.querySelectorAll('aside a[href^="#"]').length,
  code: document.querySelectorAll('pre code').length,
  hljs: document.querySelectorAll('.hljs-keyword, .hljs-string').length > 0,
}))
console.log('  详情页:', JSON.stringify(detail))

// ---------------- 知识网络 / 项目 / 关于我 ----------------
await page.goto(BASE + '/tags', { waitUntil: 'networkidle2', timeout: 90000 })
await wait(1800)
await shot('04-线上-知识网络')

await page.goto(BASE + '/projects', { waitUntil: 'networkidle2', timeout: 90000 })
await wait(1800)
await shot('04-线上-项目')

await page.goto(BASE + '/about', { waitUntil: 'networkidle2', timeout: 90000 })
await wait(1800)
await shot('04-线上-关于我')

// ---------------- 路由守卫（线上） ----------------
await page.goto(BASE + '/admin', { waitUntil: 'networkidle2', timeout: 90000 })
await wait(2000)
const guardUrl = page.url()
console.log('  未登录访问 /admin →', guardUrl)
console.log('  守卫生效:', guardUrl.includes('/admin/login'))
await shot('04-线上-后台登录页')

// ---------------- 登录 ----------------
await page.type('#username', ADMIN_USER)
await page.type('#password', ADMIN_PASS)
await page.evaluate(() => document.querySelector('button[type="submit"]')?.click())
await wait(2800)
console.log('  登录后 URL:', page.url())
const loggedIn = page.url().includes('/admin') && !page.url().includes('login')
console.log('  登录成功:', loggedIn)
await shot('04-线上-后台仪表盘')

if (loggedIn) {
  for (const [path, name] of [
    ['/admin/posts', '04-线上-后台-笔记管理'],
    ['/admin/skills', '04-线上-后台-技能管理'],
    ['/admin/settings', '04-线上-后台-站点设置'],
    ['/admin/posts/new', '04-线上-后台-编辑器'],
  ]) {
    await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 90000 })
    await wait(1800)
    await shot(name)
  }

  // ---------------- 线上端到端：新增笔记 ----------------
  console.log('\n=== 线上端到端：后台新增 → 前台可见 ===')
  const TITLE = '线上验证：部署后仍可在后台直接改内容'
  const slug = `live-check-${Date.now().toString(36)}`

  await page.goto(BASE + '/admin/posts/new', { waitUntil: 'networkidle2', timeout: 90000 })
  await wait(1800)
  await page.type('#title', TITLE)
  await page.click('#slug', { clickCount: 3 })
  await page.keyboard.press('Backspace')
  await page.type('#slug', slug)
  await page.type('#summary', '这条笔记是在 Vercel 生产环境的后台里创建的，用来证明「部署后无需重新发布即可改内容」。')
  await page.click('textarea[placeholder*="Markdown"]')
  await page.keyboard.type('## 说明\n\n页面数据存在浏览器本地，后台改动前台立即生效。\n\n```bash\nnpm run build && vercel deploy --prod\n```')
  await wait(1600)
  await shot('04-线上-编辑器-填充')

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button[type="submit"]')].pop()
    if (btn) btn.click()
  })
  await wait(2800)
  console.log('  提交后 URL:', page.url())
  await shot('04-线上-笔记列表-新增后')

  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 90000 })
  await wait(2200)
  const appeared = await page.evaluate((t) => document.body.innerText.includes(t), TITLE)
  console.log('  前台首页出现新笔记:', appeared)
  await shot('04-线上-端到端-新笔记已出现')
}

console.log('\n=== 控制台错误 ===')
const real = errors.filter((e) => !/favicon|DevTools/i.test(e))
console.log('  错误数:', real.length)
real.slice(0, 8).forEach((e) => console.log('   -', e))

fs.writeFileSync(
  `${OUT}\\_线上验证报告.json`,
  JSON.stringify({ base: BASE, home, detail, guardUrl, loggedIn, errors: real }, null, 2),
  'utf8',
)

await browser.close()
console.log('\nDONE')

/**
 * 数字花园 · 文档截图
 * 把 PRD.md / TECH_DESIGN.md / AGENTS.md 渲染为带排版的页面并截图（问卷 03）
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Users\\34566\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
const PROJ = 'C:\\Users\\34566\\Documents\\deepseek-harness\\default-workspace\\digital-garden'
const OUT = 'C:\\Users\\34566\\Downloads\\考核截图3'

fs.mkdirSync(OUT, { recursive: true })

const DOCS = [
  { file: 'PRD.md', name: '01a-文档-PRD', desc: '产品需求文档' },
  { file: 'TECH_DESIGN.md', name: '01b-文档-TECH_DESIGN', desc: '技术设计文档' },
  { file: 'AGENTS.md', name: '01c-文档-AGENTS', desc: 'AI 协作约定' },
]

/** 极简 Markdown → HTML（只处理文档里用到的语法，避免引入依赖） */
function mdToHtml(md) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = md.split('\n')
  const out = []
  let inCode = false
  let inTable = false
  let inList = false

  const closeList = () => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }
  const closeTable = () => {
    if (inTable) {
      out.push('</tbody></table></div>')
      inTable = false
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]

    // 代码块
    if (line.trim().startsWith('```')) {
      if (inCode) {
        out.push('</code></pre>')
        inCode = false
      } else {
        closeList(); closeTable()
        out.push('<pre><code>')
        inCode = true
      }
      continue
    }
    if (inCode) {
      out.push(esc(line))
      continue
    }

    // 表格
    if (/^\s*\|/.test(line)) {
      const cells = line.split('|').slice(1, -1).map((c) => c.trim())
      const isSep = cells.every((c) => /^:?-{2,}:?$/.test(c))
      if (isSep) continue
      if (!inTable) {
        closeList()
        out.push('<div class="tw"><table><tbody>')
        inTable = true
      }
      const tag = out[out.length - 1] === '<div class="tw"><table><tbody>' ? 'th' : 'td'
      out.push(`<tr>${cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`)
      continue
    }
    closeTable()

    // 标题
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) {
      closeList()
      const lvl = h[1].length
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`)
      continue
    }

    // 引用
    if (/^>\s?/.test(line)) {
      closeList()
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`)
      continue
    }

    // 列表
    const li = line.match(/^\s*[-*]\s+(.*)$/)
    const oli = line.match(/^\s*\d+\.\s+(.*)$/)
    if (li || oli) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${inline((li || oli)[1])}</li>`)
      continue
    }
    closeList()

    if (line.trim() === '') continue
    if (line.trim() === '---') {
      out.push('<hr/>')
      continue
    }
    out.push(`<p>${inline(line)}</p>`)
  }
  closeList(); closeTable()
  return out.join('\n')

  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--lang=zh-CN'],
  defaultViewport: { width: 1200, height: 1400, deviceScaleFactor: 2 },
})

const page = await browser.newPage()

for (const doc of DOCS) {
  const md = fs.readFileSync(path.join(PROJ, doc.file), 'utf8')
  const body = mdToHtml(md)
  const stat = fs.statSync(path.join(PROJ, doc.file))
  const lineCount = md.split('\n').length

  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0d1117;color:#e6edf3;font-family:-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;
       font-size:14.5px;line-height:1.8;-webkit-font-smoothing:antialiased}
  .bar{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:14px 40px;
       background:rgba(13,17,23,.92);backdrop-filter:blur(12px);border-bottom:1px solid #21262d;z-index:5}
  .dot{width:11px;height:11px;border-radius:50%;background:#30363d}
  .dot:nth-child(1){background:#ff5f57}.dot:nth-child(2){background:#febc2e}.dot:nth-child(3){background:#28c840}
  .fname{margin-left:6px;font-family:ui-monospace,Consolas,monospace;font-size:13px;color:#e6edf3}
  .meta{margin-left:auto;font-size:12px;color:#8b949e;font-family:ui-monospace,Consolas,monospace}
  .wrap{max-width:900px;margin:0 auto;padding:36px 40px 80px}
  h1{font-size:26px;font-weight:800;letter-spacing:-.02em;margin:0 0 18px;padding-bottom:12px;border-bottom:1px solid #21262d}
  h2{font-size:19px;font-weight:700;margin:30px 0 12px;padding-bottom:7px;border-bottom:1px solid #21262d}
  h3{font-size:16px;font-weight:700;margin:22px 0 9px}
  h4{font-size:14.5px;font-weight:700;margin:18px 0 7px;color:#8b949e}
  p{margin:9px 0}
  strong{color:#fff;font-weight:700}
  a{color:#2dd4bf;text-decoration:none}
  hr{border:0;border-top:1px solid #21262d;margin:22px 0}
  blockquote{margin:12px 0;padding:9px 16px;border-left:3px solid #2dd4bf;background:rgba(45,212,191,.07);
             border-radius:0 8px 8px 0;color:#8b949e}
  ul{margin:9px 0 9px 22px}
  li{margin:5px 0}
  li::marker{color:#2dd4bf}
  code{font-family:ui-monospace,Consolas,monospace;font-size:12.5px;padding:2px 6px;border-radius:5px;
       color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2)}
  pre{margin:14px 0;padding:15px 17px;background:#0b0f14;border:1px solid #21262d;border-radius:10px;overflow-x:auto}
  pre code{background:none;border:0;padding:0;color:#c9d1d9;font-size:12.5px;line-height:1.7}
  .tw{margin:14px 0;overflow-x:auto;border:1px solid #21262d;border-radius:10px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{padding:8px 13px;border-bottom:1px solid #21262d;text-align:left}
  th{background:#161b22;font-weight:600;color:#e6edf3}
  tr:last-child td{border-bottom:0}
  td{color:#8b949e}
  </style></head><body>
  <div class="bar">
    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    <span class="fname">${doc.file}</span>
    <span class="meta">${doc.desc} · ${lineCount} 行 · ${(stat.size / 1024).toFixed(1)} KB</span>
  </div>
  <div class="wrap">${body}</div>
  </body></html>`

  const tmp = path.join(PROJ, `.docview-${doc.file}.html`)
  fs.writeFileSync(tmp, html, 'utf8')
  await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'load' })
  await new Promise((r) => setTimeout(r, 900))

  // 首屏 + 整页
  await page.screenshot({ path: `${OUT}\\${doc.name}-首屏.png` })
  console.log('saved', doc.name + '-首屏.png')
  await page.screenshot({ path: `${OUT}\\${doc.name}-整页.png`, fullPage: true })
  console.log('saved', doc.name + '-整页.png')

  fs.unlinkSync(tmp)
}

await browser.close()
console.log('DONE')

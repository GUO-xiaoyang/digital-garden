/**
 * 数字花园 · Markdown 渲染管线
 *
 * 管线顺序（TECH_DESIGN 7.1，不可省略最后一步）：
 *   原始 Markdown → marked → highlight.js 高亮 → DOMPurify 消毒 → 安全 HTML
 */
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import { Marked } from 'marked'

// 按需注册语言：只引入笔记里真正会用到的，控制包体积（AGENTS.md 铁律 10）
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)

const marked = new Marked({
  gfm: true,
  breaks: true,
})

/**
 * 转义 HTML 特殊字符（用于代码块回退与纯文本展示）
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 自定义代码块渲染：交给 highlight.js 处理并补语言标签
marked.use({
  renderer: {
    code({ text, lang }) {
      const language = (lang ?? '').trim().split(/\s+/)[0]
      let highlighted: string
      if (language && hljs.getLanguage(language)) {
        try {
          highlighted = hljs.highlight(text, { language, ignoreIllegals: true }).value
        } catch {
          highlighted = escapeHtml(text)
        }
      } else {
        highlighted = escapeHtml(text)
      }
      const label = language ? `<span class="code-lang">${escapeHtml(language)}</span>` : ''
      return `<pre class="code-block">${label}<code class="hljs language-${escapeHtml(language || 'text')}">${highlighted}</code></pre>`
    },
  },
})

/**
 * 渲染 Markdown 为安全 HTML。
 * 组件里使用 dangerouslySetInnerHTML 前必须经过本函数。
 */
export function renderMarkdown(source: string): string {
  if (!source) return ''
  const rawHtml = marked.parse(source, { async: false }) as string

  return DOMPurify.sanitize(rawHtml, {
    // 允许 hljs 需要的 class，允许标题 id（TOC 锚点用）
    ADD_ATTR: ['id', 'target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'srcdoc'],
  })
}

/**
 * 从 Markdown 中提取纯文本，用于摘要与搜索
 */
export function markdownToPlainText(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, ' ')      // 代码块
    .replace(/`[^`]*`/g, ' ')             // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')   // 标题标记
    .replace(/^\s{0,3}>\s?/gm, '')        // 引用
    .replace(/^\s{0,3}[-*+]\s+/gm, '')    // 无序列表
    .replace(/^\s{0,3}\d+\.\s+/gm, '')    // 有序列表
    .replace(/[*_~]{1,3}/g, '')           // 强调符号
    .replace(/\|/g, ' ')                  // 表格分隔
    .replace(/\s+/g, ' ')
    .trim()
}

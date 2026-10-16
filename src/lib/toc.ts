/**
 * 数字花园 · 目录（TOC）提取与滚动高亮
 */

export interface TocItem {
  id: string
  text: string
  level: number
}

/** 把标题文本转为可用作 id 的 slug（保留中文） */
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 在已渲染的容器上提取 h2/h3，并为其补上唯一 id。
 * 必须先调用本函数，TOC 里的锚点才有目标。
 */
export function extractToc(container: HTMLElement | null): TocItem[] {
  if (!container) return []

  const headings = Array.from(container.querySelectorAll('h2, h3')) as HTMLElement[]
  const used = new Set<string>()
  const items: TocItem[] = []

  headings.forEach((el) => {
    const text = el.textContent?.trim() ?? ''
    if (!text) return

    let id = el.id || slugify(text) || `section-${items.length + 1}`
    // 处理 id 碰撞：追加序号
    if (used.has(id)) {
      let i = 2
      while (used.has(`${id}-${i}`)) i += 1
      id = `${id}-${i}`
    }
    used.add(id)
    el.id = id

    items.push({ id, text, level: el.tagName === 'H2' ? 2 : 3 })
  })

  return items
}

/**
 * 监听标题滚动位置，返回当前激活的标题 id。
 * 返回清理函数，调用方必须在 useEffect 的 cleanup 中执行。
 */
export function observeActiveHeading(
  container: HTMLElement | null,
  ids: string[],
  onChange: (id: string) => void,
): () => void {
  if (!container || ids.length === 0) return () => {}

  const elements = ids
    .map((id) => container.querySelector<HTMLElement>(`#${CSS.escape(id)}`))
    .filter((el): el is HTMLElement => el !== null)

  if (elements.length === 0) return () => {}

  const visible = new Set<string>()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id
        if (entry.isIntersecting) visible.add(id)
        else visible.delete(id)
      })

      // 取当前可见标题中最靠上的那个
      if (visible.size > 0) {
        const first = ids.find((id) => visible.has(id))
        if (first) onChange(first)
      }
    },
    {
      // 顶部留出吸顶导航的高度，底部收窄避免"下一个标题一出现就抢焦点"
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0,
    },
  )

  elements.forEach((el) => observer.observe(el))
  return () => observer.disconnect()
}

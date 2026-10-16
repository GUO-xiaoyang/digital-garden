/**
 * 数字花园 · 阅读时长估算
 * 中文按字符数、英文按单词数分别统计（TECH_DESIGN 7.3）
 */

/** 中文阅读速度约 350 字/分钟，英文约 200 词/分钟 */
const CJK_PER_MINUTE = 350
const WORD_PER_MINUTE = 200

export function countWords(text: string): number {
  if (!text) return 0
  // 先剔除代码块，代码不计入阅读量
  const plain = text.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ')

  const cjkCount = (plain.match(/[\u4e00-\u9fa5]/g) ?? []).length
  const wordCount = (plain.match(/[A-Za-z0-9_]+/g) ?? []).length

  // 折算成"中文等效字数"，便于给出统一的总字数
  return cjkCount + Math.round(wordCount * (CJK_PER_MINUTE / WORD_PER_MINUTE))
}

/** 返回阅读时长（分钟），最小 1 分钟 */
export function readingTime(text: string): number {
  const words = countWords(text)
  if (words === 0) return 1
  return Math.max(1, Math.ceil(words / CJK_PER_MINUTE))
}

/** 展示用：估算字数，超过 1000 显示为 k */
export function formatWordCount(text: string): string {
  const n = countWords(text)
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k 字` : `${n} 字`
}

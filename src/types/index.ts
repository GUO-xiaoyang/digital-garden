// 数字花园 · 全站数据模型
// 前后台共用同一份定义，避免字段漂移（AGENTS.md 铁律 3）

/** 经历条目（教育 / 实习） */
export interface TimelineItem {
  id: string
  period: string
  title: string
  subtitle?: string
  description?: string
  type: 'education' | 'work' | 'other'
}

/** 社交 / 联系方式 */
export interface SocialLink {
  id: string
  label: string
  url: string
}

/** 个人信息 */
export interface Profile {
  name: string
  headline: string
  bio: string
  email: string
  city: string
  jobTarget: string
  resumeUrl?: string
  socials: SocialLink[]
  timeline: TimelineItem[]
  updatedAt: string
}

/** 单个技能 */
export interface Skill {
  id: string
  name: string
  /** 熟练度 0-100 */
  level: number
  note?: string
}

/** 技能分组 */
export interface SkillGroup {
  id: string
  name: string
  order: number
  skills: Skill[]
}

/** 项目状态 */
export type ProjectStatus = 'active' | 'done' | 'archived'

/** 项目 */
export interface Project {
  id: string
  name: string
  summary: string
  content: string
  tags: string[]
  role?: string
  period?: string
  repoUrl?: string
  demoUrl?: string
  status: ProjectStatus
  featured: boolean
  createdAt: string
  updatedAt: string
}

/** 笔记 */
export interface Post {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  tags: string[]
  pinned: boolean
  published: boolean
  createdAt: string
  updatedAt: string
}

/** 站点设置 */
export interface SiteSettings {
  siteName: string
  tagline: string
  /** 强调色 A：青绿 */
  accentA: string
  /** 强调色 B：琥珀 */
  accentB: string
  footerText: string
  icp?: string
  updatedAt: string
}

/** 后台会话（只存 token，绝不存明文密码） */
export interface AuthSession {
  token: string
  username: string
  expiresAt: number
}

/** 标签统计（知识网络用） */
export interface TagStat {
  name: string
  count: number
  /** 共现的其它标签及次数 */
  related: { name: string; count: number }[]
}

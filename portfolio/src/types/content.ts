/**
 * 全站内容模型 —— 前台展示与后台管理共用的唯一数据契约。
 * 后台编辑的字段必须与此处一致；新增字段时两处同步。
 */

export interface ExperienceItem {
  id: string
  /**排序值，越小越靠前 */
  order: number
  type: 'work' | 'edu'
  /**显示的时间区间，如 "2022.06 – 至今" */
  time: string
  org: string
  role: string
  achievement: string
  tags: string[]
}

export interface AbilityItem {
  id: string
  order: number
  group: string
  name: string
  /**0-100 */
  level: number
  label: string
}

export interface ProjectItem {
  id: string
  order: number
  category: 'work' | 'academic' | 'personal'
  name: string
  role: string
  result: string
  techs: string[]
  /**项目封面图URL */
  cover: string
  star: {
    bg: string
    role: string
    solve: string
    result: string
  }
}

export interface AiSkillItem {
  id: string
  order: number
  icon: string
  title: string
  tag: string
  /**已落地/ 探索中 / 规划中 */
  status: 'done' | 'exploring' | 'planned'
  desc: string
  techs: string[]
  /**Demo 截图或视频封面 URL */
  cover: string
  /**Demo 链接 */
  demoUrl: string
  repoUrl: string
}

export interface HonorItem {
  id: string
  order: number
  category: 'work' | 'school' | 'cert'
  /**"2024.08" */
  date: string
  event: string
  place: string
  desc: string
  location: string
  /**证书图片 URL */
  image: string
}

export interface BlogSection {
  id: string
  level: 2 | 3
  title: string
}

export interface BlogPostItem {
  id: string
  order: number
  title: string
  /**YYYY-MM-DD */
  date: string
  readMin: number
  tags: string[]
  summary: string
  cover: string
  /**正文 HTML */
  content: string
  /**目录 */
  sections: BlogSection[]
}

export interface ContactItem {
  id: string
  order: number
  /**phone / email / github / wechat / other */
  kind: 'phone' | 'email' | 'github' | 'wechat' | 'other'
  icon: string
  label: string
  value: string
  url: string
}

export interface SiteItem {
  id: string
  order: number
  icon: string
  name: string
  desc: string
  url: string
}

export interface StatItem {
  id: string
  order: number
  num: string
  label: string
}

export interface OverviewItem {
  id: string
  order: number
  icon: string
  title: string
  desc: string
  /**对应跳转页面：home / experience / projects / ai / honors / blog */
  link: 'home' | 'experience' | 'projects' | 'ai' | 'honors' | 'blog'
}

export interface Profile {
  name: string
  headline: string
  roles: string
  intro: string
  avatar: string
  /**代码卡片里的字段 */
  codeCard: {
    exp: string
    focus: string[]
    open: boolean
  }
  seoDescription: string
}

/** 全站内容快照 */
export interface SiteContent {
  profile: Profile
  experiences: ExperienceItem[]
  abilities: AbilityItem[]
  projects: ProjectItem[]
  aiSkills: AiSkillItem[]
  honors: HonorItem[]
  posts: BlogPostItem[]
  contacts: ContactItem[]
  sites: SiteItem[]
  stats: StatItem[]
  overviews: OverviewItem[]
}

/** 可编辑的内容分区（后台左侧导航） */
export type SectionKey =
  | 'profile'
  | 'experiences'
  | 'abilities'
  | 'projects'
  | 'aiSkills'
  | 'honors'
  | 'posts'
  | 'contacts'
  | 'sites'
  | 'stats'
  | 'overviews'

export const SECTION_LABELS: Record<SectionKey, string> = {
  profile: '基本信息',
  experiences: '工作经历',
  abilities: '能力矩阵',
  projects: '项目经历',
  aiSkills: 'AI 技能',
  honors: '荣誉墙',
  posts: '博客文章',
  contacts: '联系方式',
  sites: '我的站点',
  stats: '数据统计',
  overviews: '关于我',
}
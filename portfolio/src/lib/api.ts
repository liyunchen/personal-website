import type { SiteContent } from '../types/content'
import { defaultContent } from '../data/defaultContent'

/**
 * 内容 API 客户端。
 * 约定：所有请求走同源 /api，前缀由 Nginx 反代到后端服务。
 * 任何失败都不抛给调用方，而是回退到 defaultContent —— 保证前台永远可访问。
 */

const API_BASE = '/api'
const TOKEN_KEY = 'lyc_admin_token'

export interface AuthResult {
  ok: boolean
  token?: string
  error?: string
}

/* ────────────────── 公开读取 ────────────────── */

let cache: SiteContent | null = null
let inflight: Promise<SiteContent> | null = null

/** 前台读取全站内容。云端不可用时返回默认内容。 */
export async function fetchContent(): Promise<SiteContent> {
  if (cache) return cache
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch(`${API_BASE}/content`, { signal: ctrl.signal })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as SiteContent
      // 合并默认值，确保新增字段不会因旧数据缺失而报错
      cache = mergeWithDefaults(data)
      return cache
    } catch {
      // 静默降级：网络异常或后端未启动时展示默认内容
      cache = structuredClone(defaultContent)
      return cache
    } finally {
      inflight = null
    }
  })()

  return inflight
}

/** 清除缓存（后台保存后调用，让前台下次读取最新数据） */
export function invalidateCache() {
  cache = null
}

/* ────────────────── 鉴权 ────────────────── */

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* 隐私模式下写入失败，登录态仅本次会话有效 */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export async function login(user: string, password: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: data.error || '登录失败' }
    if (!data.token) return { ok: false, error: '服务器未返回登录凭证' }
    setToken(data.token)
    return { ok: true, token: data.token }
  } catch {
    return { ok: false, error: '无法连接服务器，请检查网络' }
  }
}

/** 校验当前 token 是否仍有效 */
export async function verifyToken(): Promise<boolean> {
  const token = getToken()
  if (!token) return false
  try {
    const res = await fetch(`${API_BASE}/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}

/* ────────────────── 后台写入 ────────────────── */

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${API_BASE}${path}`, { ...init, headers })
}

/** 保存全站内容 */
export async function saveContent(content: SiteContent): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await authedFetch('/content', {
      method: 'PUT',
      body: JSON.stringify(content),
    })
    if (res.status === 401) {
      clearToken()
      return { ok: false, error: '登录已过期，请重新登录' }
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: data.error || `保存失败 (HTTP ${res.status})` }
    invalidateCache()
    return { ok: true }
  } catch {
    return { ok: false, error: '无法连接服务器，数据未保存' }
  }
}

/** 上传图片，返回可访问的 URL */
export async function uploadImage(file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
  const token = getToken()
  if (!token) return { ok: false, error: '请先登录' }

  // 客户端预检：类型与体积，避免无谓的上传
  if (!file.type.startsWith('image/')) return { ok: false, error: '只能上传图片文件' }
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: '图片不能超过 5MB' }

  try {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    if (res.status === 401) {
      clearToken()
      return { ok: false, error: '登录已过期，请重新登录' }
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: data.error || `上传失败 (HTTP ${res.status})` }
    if (!data.url) return { ok: false, error: '服务器未返回图片地址' }
    return { ok: true, url: data.url }
  } catch {
    return { ok: false, error: '上传失败，请检查网络' }
  }
}

/* ────────────────── 工具 ────────────────── */

/**
 * 用默认值补齐缺失字段。
 * 后台新增字段后，旧数据不会导致页面白屏——这是向前兼容的关键。
 */
export function mergeWithDefaults(input: Partial<SiteContent> | null | undefined): SiteContent {
  const d = defaultContent
  if (!input || typeof input !== 'object') return structuredClone(d)

  const mergeList = <K extends keyof SiteContent>(key: K) => {
    const incoming = input[key]
    const fallback = d[key]
    if (!Array.isArray(incoming) || incoming.length === 0) return structuredClone(fallback as never)
    return incoming
  }

  return {
    profile: { ...d.profile, ...(input.profile ?? {}) },
    experiences: mergeList('experiences'),
    abilities: mergeList('abilities'),
    projects: mergeList('projects'),
    aiSkills: mergeList('aiSkills'),
    honors: mergeList('honors'),
    posts: mergeList('posts'),
    contacts: mergeList('contacts'),
    sites: mergeList('sites'),
    stats: mergeList('stats'),
    overviews: mergeList('overviews'),
  }
}

/** 生成不重复的 ID */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}
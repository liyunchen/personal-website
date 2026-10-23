import { useEffect, useState } from 'react'
import { fetchContent } from '../lib/api'
import type { SiteContent } from '../types/content'

/**
 * 全站内容 hook。
 * 首次进入时从 /api 拉取，失败自动降级到默认内容，页面永远有内容可渲染。
 */
export function useSiteContent() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchContent().then(data => {
      if (!cancelled) {
        setContent(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { content, loading }
}

/** 按 order 升序排序的辅助函数 */
export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}
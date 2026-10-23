import { useEffect, useRef, useState } from 'react'
import type { BlogPostItem } from '../types/content'

export default function BlogDetail({
  post,
  related,
  onBack,
}: {
  post: BlogPostItem
  related: BlogPostItem[]
  onBack: () => void
}) {
  const barRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string>(post.sections[0]?.id ?? '')

  // 阅读进度条
  useEffect(() => {
    const update = () => {
      const el = bodyRef.current
      const bar = barRef.current
      if (!el || !bar) return
      const rect = el.getBoundingClientRect()
      const scrolled = -rect.top
      const total = Math.max(el.offsetHeight - window.innerHeight * 0.4, 1)
      bar.style.width = `${Math.min(100, Math.max(0, (scrolled / total) * 100))}%`
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [post.id])

  // 目录高亮跟随滚动
  useEffect(() => {
    const els = post.sections
      .map(s => document.getElementById(s.id))
      .filter((x): x is HTMLElement => x !== null)
    if (els.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [post.id, post.sections])

  return (
    <>
      <div ref={barRef} id="readingBar" />
      <div className="article-wrap">
        <article>
          <button className="article-back" onClick={onBack}>
            ← 返回博客列表
          </button>
          <div className="tech-row" style={{ marginBottom: 12 }}>
            {post.tags.map(t => (
              <span className="chip" key={t}>
                {t}
              </span>
            ))}
          </div>
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readMin} 分钟阅读</span>
          </div>
          <div
            ref={bodyRef}
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {related.length > 0 && (
            <div className="related-wrap">
              <div className="related-title">相关文章</div>
              <div className="related-grid">
                {related.map(p => (
                  <div className="card related-card" key={p.id} onClick={onBack}>
                    <div className="tech-row" style={{ marginBottom: 8 }}>
                      {p.tags.slice(0, 3).map(t => (
                        <span className="chip chip-sm" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="related-name">{p.title}</div>
                    <div className="post-meta" style={{ marginTop: 6 }}>
                      {p.readMin} 分钟 · {p.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {post.sections.length > 0 && (
          <nav className="toc-wrap" aria-label="文章目录">
            <div className="toc-title">目录</div>
            <ul className="toc-list">
              {post.sections.map(s => (
                <li
                  key={s.id}
                  className={`toc-item${s.level === 3 ? ' toc-h3' : ''}${
                    activeId === s.id ? ' toc-active' : ''
                  }`}
                  onClick={() =>
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  {s.title}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  )
}
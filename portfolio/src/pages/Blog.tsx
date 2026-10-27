import type { BlogPostItem } from '../types/content'
import { sortByOrder } from '../hooks/useSiteContent'

export default function Blog({
  posts,
  onOpen,
}: {
  posts: BlogPostItem[]
  onOpen: (id: string) => void
}) {
  const sorted = sortByOrder(posts)

  return (
    <div className="container section">
      <div className="section-eyebrow">Blog</div>
      <div className="section-title">技术博客</div>
      <div className="section-sub">测试工程、AI 实践、团队管理，记录每一次深度思考</div>

      {sorted.length === 0 ? (
        <div className="empty-hint">暂无文章</div>
      ) : (
        <div className="card-grid">
          {sorted.map(p => (
            <div
              className="card"
              style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
              key={p.id}
              onClick={() => onOpen(p.id)}
            >
              <div className="card-thumb thumb-blog">
                {p.cover ? (
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="thumb-img"
                    onError={e => {
                      e.currentTarget.style.visibility = 'hidden'
                    }}
                  />
                ) : (
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>封面图占位</span>
                )}
              </div>
              <div className="card-body">
                <div className="tech-row" style={{ marginBottom: 10 }}>
                  {p.tags.map(t => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="post-title">{p.title}</div>
                <p className="post-summary">{p.summary}</p>
                <div className="post-meta">
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.readMin} 分钟阅读</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
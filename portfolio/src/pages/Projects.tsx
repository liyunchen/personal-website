import { useState } from 'react'
import type { ProjectItem } from '../types/content'
import { sortByOrder } from '../hooks/useSiteContent'

const CAT_LABEL: Record<string, string> = {
  all: '全部',
  work: '工作项目',
  academic: '学术项目',
  personal: '个人项目',
}

const CAT_THUMB: Record<string, string> = {
  work: 'thumb-work',
  academic: 'thumb-academic',
  personal: 'thumb-personal',
}

const STAR_LABELS = ['背景', '我的角色', '解决方案', '最终结果'] as const
const STAR_KEYS = ['bg', 'role', 'solve', 'result'] as const

export default function Projects({ projects }: { projects: ProjectItem[] }) {
  const [activeCat, setActiveCat] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const sorted = sortByOrder(projects)
  const list = activeCat === 'all' ? sorted : sorted.filter(p => p.category === activeCat)

  return (
    <div className="container section">
      <div className="section-eyebrow">Projects</div>
      <div className="section-title">项目经历</div>
      <div className="section-sub">用 STAR 法则还原每个项目的背景、角色、方法与结果</div>

      <div className="tag-row">
        {Object.entries(CAT_LABEL).map(([k, v]) => (
          <button
            key={k}
            className={`tag-filter${activeCat === k ? ' active-tag' : ''}`}
            onClick={() => setActiveCat(k)}
          >
            {v}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-hint">该分类下暂无项目</div>
      ) : (
        <div className="card-grid">
          {list.map(p => {
            const isOpen = openId === p.id
            return (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }} key={p.id}>
                <div className={`card-thumb ${CAT_THUMB[p.category] ?? 'thumb-work'}`}>
                  {p.cover ? (
                    <img src={p.cover} alt={p.name} className="thumb-img" />
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>Demo 截图占位</span>
                  )}
                </div>
                <div className="card-body">
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                    {CAT_LABEL[p.category]}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.4 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>
                    角色：{p.role}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, marginBottom: 10 }}>
                    ✓ {p.result}
                  </div>
                  <div className="tech-row">
                    {p.techs.map(t => (
                      <span className="tech-badge" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    className="btn btn-outline btn-block"
                    onClick={() => setOpenId(isOpen ? null : p.id)}
                  >
                    {isOpen ? '收起 ↑' : '查看 STAR 详情 ↓'}
                  </button>
                  <div className={`project-detail${isOpen ? ' open' : ''}`}>
                    <div className="star-list">
                      {STAR_KEYS.map((k, i) => (
                        <div className="star-block" key={k}>
                          <div className="star-label">{STAR_LABELS[i]}</div>
                          <div className="star-text">{p.star[k]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
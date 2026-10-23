import { useState } from 'react'
import type { HonorItem } from '../types/content'
import { sortByOrder } from '../hooks/useSiteContent'

const CAT_LABEL: Record<string, string> = {
  all: '全部',
  school: '在校荣誉',
  work: '工作荣誉',
  cert: '认证证书',
}

const CAT_COLOR: Record<string, { dot: string; chipBg: string; chipClr: string }> = {
  work: { dot: 'var(--accent)', chipBg: 'var(--accent-lt)', chipClr: 'var(--accent)' },
  school: { dot: 'var(--purple)', chipBg: 'var(--purple-lt)', chipClr: 'var(--purple)' },
  cert: { dot: 'var(--amber)', chipBg: 'var(--amber-lt)', chipClr: 'var(--amber)' },
}

export default function Honors({ honors }: { honors: HonorItem[] }) {
  const [activeCat, setActiveCat] = useState('all')

  const sorted = sortByOrder(honors)
  const list = activeCat === 'all' ? sorted : sorted.filter(h => h.category === activeCat)

  return (
    <div className="container section">
      <div className="section-eyebrow">Honors</div>
      <div className="section-title">荣誉墙</div>
      <div className="section-sub">在校获奖、工作认可、专业认证，记录每一个值得铭记的时刻</div>

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
        <div className="empty-hint">该分类下暂无记录</div>
      ) : (
        <div className="timeline">
          {list.map(h => {
            const c = CAT_COLOR[h.category] ?? CAT_COLOR.work
            return (
              <div className="tl-item" key={h.id}>
                <div
                  className="tl-dot honor-dot"
                  style={{ background: c.dot, boxShadow: `0 0 0 2px ${c.dot}` }}
                />
                <div className="card honor-card">
                  <div className="honor-main">
                    <div className="tl-head">
                      <span className="tl-time">{h.date}</span>
                      <span
                        className="tl-kind honor-chip"
                        style={{ background: c.chipBg, color: c.chipClr }}
                      >
                        {h.place}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{h.location}</span>
                    </div>
                    <div className="tl-org">{h.event}</div>
                    <p className="tl-achv" style={{ marginBottom: 0 }}>
                      {h.desc}
                    </p>
                  </div>
                  <div className="honor-img">
                    {h.image ? (
                      <img src={h.image} alt={h.event} />
                    ) : (
                      <span>证书图片占位</span>
                    )}
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
import { useState } from 'react'
import type { AbilityItem, ExperienceItem } from '../types/content'
import { sortByOrder } from '../hooks/useSiteContent'

const GROUP_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  测试管理: { icon: '🧪', color: 'var(--accent)', bg: 'var(--accent-lt)' },
  'AI 测试': { icon: '🤖', color: 'var(--green)', bg: 'var(--green-lt)' },
  自动化: { icon: '⚙️', color: 'var(--purple)', bg: 'var(--purple-lt)' },
  '性能 & 安全': { icon: '📊', color: 'var(--amber)', bg: 'var(--amber-lt)' },
}

function groupStyle(name: string) {
  return (
    GROUP_STYLE[name] ?? { icon: '📌', color: 'var(--accent)', bg: 'var(--accent-lt)' }
  )
}

function Timeline({ items }: { items: ExperienceItem[] }) {
  return (
    <div className="timeline">
      {sortByOrder(items).map(e => (
        <div className="tl-item" key={e.id}>
          <div className={`tl-dot${e.type === 'edu' ? ' edu' : ''}`} />
          <div className="card">
            <div className="tl-head">
              <span className="tl-time">{e.time}</span>
              <span className={`tl-kind${e.type === 'edu' ? ' edu' : ''}`}>
                {e.type === 'edu' ? '🎓 教育' : '💼 工作'}
              </span>
            </div>
            <div className="tl-org">{e.org}</div>
            <div className="tl-role">{e.role}</div>
            <p className="tl-achv">{e.achievement}</p>
            <div className="tl-tags">
              {e.tags.map(t => (
                <span className="tech-badge" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AbilityMatrix({ items }: { items: AbilityItem[] }) {
  // 按 group 分组，保持首次出现顺序
  const groups: { name: string; rows: AbilityItem[] }[] = []
  for (const it of sortByOrder(items)) {
    let g = groups.find(x => x.name === it.group)
    if (!g) {
      g = { name: it.group, rows: [] }
      groups.push(g)
    }
    g.rows.push(it)
  }

  if (groups.length === 0) return <div className="empty-hint">暂无能力数据</div>

  return (
    <div>
      {groups.map(g => {
        const s = groupStyle(g.name)
        return (
          <div className="ability-group" key={g.name}>
            <div className="ability-group-title">
              <div className="ability-group-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <span style={{ color: s.color }}>{g.name}</span>
            </div>
            {g.rows.map(item => (
              <div className="ability-row" key={item.id}>
                <div className="ability-name">{item.name}</div>
                <div className="ability-bar-wrap">
                  <div className="ability-bar">
                    <div
                      className="ability-fill"
                      style={{
                        width: `${Math.max(0, Math.min(100, item.level))}%`,
                        background: `linear-gradient(90deg,${s.color},${s.color}88)`,
                      }}
                    />
                  </div>
                  <div className="ability-level">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default function Experience({
  experiences,
  abilities,
}: {
  experiences: ExperienceItem[]
  abilities: AbilityItem[]
}) {
  const [view, setView] = useState<'timeline' | 'ability'>('timeline')

  return (
    <div className="container section">
      <div className="section-eyebrow">Experience</div>
      <div className="section-title">工作经历</div>
      <div className="section-sub">测试领域 10 年+ 深耕，从一线执行到团队管理</div>

      <div className="view-toggle">
        <button className={view === 'timeline' ? 'active' : ''} onClick={() => setView('timeline')}>
          📅 经历时间线
        </button>
        <button className={view === 'ability' ? 'active' : ''} onClick={() => setView('ability')}>
          📊 能力矩阵
        </button>
      </div>

      {view === 'timeline' ? <Timeline items={experiences} /> : <AbilityMatrix items={abilities} />}
    </div>
  )
}
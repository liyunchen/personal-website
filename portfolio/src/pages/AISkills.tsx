import type { AiSkillItem } from '../types/content'
import { sortByOrder } from '../hooks/useSiteContent'

const STATUS_META = {
  done: { label: '已落地', bg: 'var(--green-lt)', clr: 'var(--green)', bdr: 'oklch(82% .1 152)' },
  exploring: { label: '探索中', bg: 'var(--amber-lt)', clr: 'var(--amber)', bdr: 'oklch(85% .1 82)' },
  planned: { label: '规划中', bg: 'var(--purple-lt)', clr: 'var(--purple)', bdr: 'oklch(85% .08 300)' },
} as const

export default function AISkills({ skills }: { skills: AiSkillItem[] }) {
  return (
    <div className="container section">
      <div className="section-eyebrow">AI Skills</div>
      <div className="section-title">AI 测试技能矩阵</div>
      <div className="section-sub">
        已落地与探索中的 AI 辅助测试能力，覆盖用例生成、维护、报告、分析全链路
      </div>

      {skills.length === 0 ? (
        <div className="empty-hint">暂无技能数据</div>
      ) : (
        <div className="card-grid">
          {sortByOrder(skills).map(s => {
            const meta = STATUS_META[s.status] ?? STATUS_META.exploring
            return (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }} key={s.id}>
                <div className="card-thumb thumb-ai" style={{ position: 'relative' }}>
                  {s.cover ? (
                    <img src={s.cover} alt={s.title} className="thumb-img" />
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>Demo 截图 / 视频占位</span>
                  )}
                  <span
                    className="pill"
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: meta.bg,
                      color: meta.clr,
                      border: `1px solid ${meta.bdr}`,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="card-body">
                  <div className="ai-head">
                    <span style={{ fontSize: 26 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</div>
                      <div className="ai-tag">{s.tag}</div>
                    </div>
                  </div>
                  <p className="ai-desc">{s.desc}</p>
                  <div className="tech-row">
                    {s.techs.map(t => (
                      <span className="tech-badge" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="btn-row">
                    {s.demoUrl && (
                      <a
                        className="btn btn-outline"
                        href={s.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ▶ 在线演示
                      </a>
                    )}
                    {s.repoUrl && (
                      <a
                        className="btn btn-outline"
                        href={s.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ⑂ GitHub
                      </a>
                    )}
                    {!s.demoUrl && !s.repoUrl && <span className="muted-xs">链接待补充</span>}
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
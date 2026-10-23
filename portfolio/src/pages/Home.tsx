import type { SiteContent } from '../types/content'
import { sortByOrder } from '../hooks/useSiteContent'

interface HomeProps {
  content: SiteContent
  onNavigate: (page: string) => void
  onScrollContact: () => void
}

/** 联系方式与站点的强调色（按类型分配，与原设计一致） */
function contactStyle(kind: string) {
  switch (kind) {
    case 'phone':
      return { bar: 'var(--accent)', bg: 'var(--accent-lt)', border: 'var(--a-200)' }
    case 'email':
      return { bar: 'var(--green)', bg: 'var(--green-lt)', border: 'oklch(82% .1 152)' }
    case 'github':
      return { bar: 'var(--purple)', bg: 'var(--purple-lt)', border: 'oklch(85% .08 300)' }
    default:
      return { bar: 'var(--amber)', bg: 'var(--amber-lt)', border: 'oklch(85% .1 82)' }
  }
}

const SITE_COLORS = ['var(--accent)', 'var(--green)', 'var(--purple)', 'var(--amber)']
const OVERVIEW_COLORS = ['var(--accent)', 'var(--green)', 'var(--amber)', 'var(--purple)']
const STAT_COLORS = ['var(--a-500)', 'var(--green)', 'var(--purple)', 'var(--amber)', 'var(--a-500)']

export default function Home({ content, onNavigate, onScrollContact }: HomeProps) {
  const { profile, contacts, sites, stats, overviews } = content

  return (
    <>
      {/* ===== HERO ===== */}
      <div className="hero-section">
        <div className="hero">
          <div>
            <div className="avatar-wrap">
              <div className="avatar-ring">
                <img className="avatar-img" src={profile.avatar} alt={profile.name} />
              </div>
            </div>
            <h1 className="hero-name">
              {profile.headline}
              <em>{profile.name}</em>
            </h1>
            <p className="hero-role">{profile.roles}</p>
            <p className="hero-desc">{profile.intro}</p>
            <div className="hero-btns">
              <button className="btn btn-primary" onClick={() => onNavigate('experience')}>
                查看经历 →
              </button>
              <button className="btn btn-outline" onClick={onScrollContact}>
                联系我
              </button>
            </div>
          </div>

          {/* 代码卡片 */}
          <div>
            <div className="code-card">
              <div className="cc-dots">
                <span style={{ background: 'oklch(65% .18 25)' }} />
                <span style={{ background: 'oklch(75% .17 82)' }} />
                <span style={{ background: 'oklch(68% .16 152)' }} />
                <em>profile.ts</em>
              </div>
              <div className="cc-cmt">// {profile.name} · 个人名片</div>
              <div>
                <span className="cc-kw">const</span> <span className="cc-fn">engineer</span> = {'{'}
              </div>
              <div className="cc-ind">
                <span className="cc-key">name</span>: <span className="cc-str">"{profile.name}"</span>,
              </div>
              <div className="cc-ind">
                <span className="cc-key">role</span>: <span className="cc-str">"测试专家 / 测试主管"</span>,
              </div>
              <div className="cc-ind">
                <span className="cc-key">exp</span>: <span className="cc-str">"{profile.codeCard.exp}"</span>,
              </div>
              <div className="cc-ind">
                <span className="cc-key">focus</span>: [
              </div>
              {profile.codeCard.focus.map(f => (
                <div className="cc-ind2" key={f}>
                  <span className="cc-str">"{f}"</span>
                  ,
                </div>
              ))}
              <div className="cc-ind">],</div>
              <div className="cc-ind">
                <span className="cc-key">open</span>:{' '}
                <span className="cc-bool">{String(profile.codeCard.open)}</span>{' '}
                <span className="cc-cmt">// 求职中</span>
              </div>
              <div>{'}'};</div>
              <div className="cc-tail">
                <span className="cc-kw">export default</span> <span className="cc-fn">engineer</span>;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONNECT HUB ===== */}
      <div id="connectHub" className="connect-hub">
        <div className="container">
          <div className="hub-label">
            <span className="hub-label-dot" />
            <span className="hub-label-text">CONNECT HUB</span>
          </div>
          <div className="hub-grid">
            <div className="hub-contact-list">
              {sortByOrder(contacts).map(c => {
                const s = contactStyle(c.kind)
                return (
                  <div
                    key={c.id}
                    className="hub-contact-card"
                    style={
                      {
                        '--bar': s.bar,
                        '--bar-bg': s.bg,
                        '--bar-border': s.border,
                      } as React.CSSProperties
                    }
                    onClick={() => c.url && window.open(c.url, '_blank', 'noopener')}
                  >
                    <div className="hub-contact-icon">{c.icon}</div>
                    <div className="hub-contact-info">
                      <div className="hub-contact-key">{c.label}</div>
                      <div className="hub-contact-val">{c.value}</div>
                    </div>
                    {c.url && <span className="hub-contact-go">→</span>}
                  </div>
                )
              })}
            </div>

            <div className="hub-sites-wrap">
              <div className="hub-sites-label">我的站点</div>
              <div className="hub-sites-grid">
                {sortByOrder(sites).map((s, i) => (
                  <div
                    key={s.id}
                    className="hub-site-card"
                    style={{ '--site-bar': SITE_COLORS[i % SITE_COLORS.length] } as React.CSSProperties}
                    onClick={() => s.url && window.open(s.url, '_blank', 'noopener')}
                  >
                    <div>
                      <div className="hub-site-icon">{s.icon}</div>
                      <div className="hub-site-name">{s.name}</div>
                      <div className="hub-site-desc">{s.desc}</div>
                    </div>
                    <span className="hub-site-arrow">↗</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATS BAR ===== */}
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="stats-bar">
          {sortByOrder(stats).map((s, i) => (
            <div className="stat-item" key={s.id}>
              <div
                className="stat-num"
                style={
                  {
                    backgroundImage: `linear-gradient(135deg, ${STAT_COLORS[i % STAT_COLORS.length]}, var(--purple))`,
                  } as React.CSSProperties
                }
              >
                {s.num}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* ===== OVERVIEW ===== */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 72 }}>
        <div className="section-eyebrow">Overview</div>
        <div className="section-title">关于我</div>
        <div className="section-sub">测试领域的全链路实践者，从执行到管理，从传统到 AI</div>
        <div className="overview-grid">
          {sortByOrder(overviews).map((o, i) => {
            const color = OVERVIEW_COLORS[i % OVERVIEW_COLORS.length]
            return (
              <div
                key={o.id}
                className="card ov-card"
                style={{ '--ov-color': color, '--ov-bg': 'var(--accent-lt)' } as React.CSSProperties}
                onClick={() => onNavigate(o.link)}
              >
                <div className="ov-icon">{o.icon}</div>
                <div className="ov-title">{o.title}</div>
                <div className="ov-desc">{o.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
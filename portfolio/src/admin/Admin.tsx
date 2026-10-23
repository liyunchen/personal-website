import { useCallback, useEffect, useRef, useState } from 'react'
import AdminLogin from './AdminLogin'
import { EditorShell, ImageField, SelectField, TagsField, TextArea, TextField } from './Fields'
import {
  clearToken,
  getToken,
  mergeWithDefaults,
  newId,
  saveContent,
  verifyToken,
} from '../lib/api'
import { defaultContent } from '../data/defaultContent'
import { SECTION_LABELS } from '../types/content'
import type { SectionKey, SiteContent } from '../types/content'

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export default function Admin({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [content, setContent] = useState<SiteContent>(() => structuredClone(defaultContent))
  const [section, setSection] = useState<SectionKey>('profile')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [message, setMessage] = useState('')
  const timerRef = useRef<number | null>(null)
  /** 标记「远端加载」而非「本地编辑」，用于跳过自动保存 */
  const skipSaveRef = useRef(true)

  /* 校验登录态 */
  useEffect(() => {
    let cancelled = false
    if (!getToken()) {
      setAuthed(false)
      return
    }
    verifyToken().then(ok => {
      if (!cancelled) setAuthed(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])

  /* 登录后拉取云端内容 */
  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/content')
      if (res.ok) {
        const data = await res.json()
        // 拉取远端内容属于「加载」而非「编辑」，跳过自动保存
        skipSaveRef.current = true
        setContent(mergeWithDefaults(data))
      }
    } catch {
      setMessage('无法连接服务器，正在编辑默认内容')
    }
  }, [])

  useEffect(() => {
    if (authed) void load()
  }, [authed, load])

  /* 自动保存（防抖 1.2s） */
  const scheduleSave = useCallback((next: SiteContent) => {
    setSaveState('dirty')
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      void persist(next)
    }, 1200)
  }, [])

  const persist = useCallback(async (payload: SiteContent) => {
    setSaveState('saving')
    const res = await saveContent(payload)
    if (res.ok) {
      setSaveState('saved')
      setMessage('')
      window.setTimeout(() => setSaveState(s => (s === 'saved' ? 'idle' : s)), 2400)
    } else {
      setSaveState('error')
      setMessage(res.error ?? '保存失败')
    }
  }, [])

  /* 离开页面前提示未保存 */
  useEffect(() => {
    if (saveState !== 'dirty' && saveState !== 'saving') return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [saveState])

  /**
   * 内容更新入口。
   * 注意：updater 必须是纯函数且不可变 —— React 18 StrictMode 会在开发期
   * 双重调用 updater，若其中做副作用或原地修改入参，
   * 一次操作会生效两次（例如点一次「上移」却移动两格）。
   * 保存触发放在独立的 effect 里，只在内容真正变化后跑一次。
   */
  function update(updater: (c: SiteContent) => SiteContent) {
    setContent(prev => updater(prev))
  }

  /* 内容变化后触发自动保存（首次加载不触发） */
  const contentRef = useRef(content)
  useEffect(() => {
    if (contentRef.current === content) return
    contentRef.current = content
    if (skipSaveRef.current) {
      skipSaveRef.current = false
      return
    }
    scheduleSave(content)
  }, [content, scheduleSave])

  /** 各类列表的空白项模板，保证新增项字段完整（不出现 undefined） */
  const BLANK: Partial<Record<SectionKey, Record<string, unknown>>> = {
    experiences: { type: 'work', time: '', org: '', role: '', achievement: '', tags: [] },
    abilities: { group: '测试管理', name: '', level: 60, label: '掌握' },
    projects: {
      category: 'work',
      name: '',
      role: '',
      result: '',
      techs: [],
      cover: '',
      star: { bg: '', role: '', solve: '', result: '' },
    },
    aiSkills: {
      icon: '🤖',
      title: '',
      tag: '',
      status: 'planned',
      desc: '',
      techs: [],
      cover: '',
      demoUrl: '',
      repoUrl: '',
    },
    honors: { category: 'work', date: '', event: '', place: '', desc: '', location: '', image: '' },
    posts: {
      title: '',
      date: new Date().toISOString().slice(0, 10),
      readMin: 5,
      tags: [],
      summary: '',
      cover: '',
      sections: [],
      content: '<h2 id="s1">小标题</h2><p>正文…</p>',
    },
    contacts: { kind: 'other', icon: '🔗', label: '', value: '', url: '' },
    sites: { icon: '🔗', name: '', desc: '', url: '' },
    stats: { num: '', label: '' },
    overviews: { icon: '⭐', title: '', desc: '', link: 'home' },
  }

  /** ID 前缀映射，保证新增项 id 可读且唯一 */
  const PREFIX: Partial<Record<SectionKey, string>> = {
    experiences: 'exp',
    abilities: 'ab',
    projects: 'pr',
    aiSkills: 'ai',
    honors: 'ho',
    posts: 'bl',
    contacts: 'ct',
    sites: 'st',
    stats: 'stt',
    overviews: 'ov',
  }

  /** 通用列表操作：新增 / 更新 / 删除 / 移动 */
  function listOps(section: SectionKey) {
    const key = section as keyof SiteContent
    return {
      add: () =>
        update(c => {
          const arr = (c[key] as unknown as { id: string; order: number }[])
            .slice()
            .sort((a, b) => a.order - b.order)
          const blank = { ...(BLANK[section] ?? {}) }
          // 先归一化 order（消除历史重复值），新项固定排在末尾。
          // 全程不可变，不修改任何已有对象。
          const normalized = arr.map((x, k) => ({ ...x, order: k + 1 }))
          const item = {
            ...blank,
            id: newId(PREFIX[section] ?? 'item'),
            order: normalized.length + 1,
          }
          return { ...c, [key]: [...normalized, item] as never }
        }),
      update: (id: string, patch: Record<string, unknown>) =>
        update(c => ({
          ...c,
          [key]: (c[key] as unknown as { id: string }[]).map(x =>
            x.id === id ? { ...x, ...patch } : x
          ) as never,
        })),
      remove: (id: string) =>
        update(c => ({
          ...c,
          [key]: (c[key] as unknown as { id: string }[]).filter(x => x.id !== id) as never,
        })),
      move: (id: string, dir: -1 | 1) =>
        update(c => {
          // 纯函数 + 不可变更新：先排序，再复制对象，最后重排 order。
          // 任何环节都不修改原数组或原对象。
          const sorted = [
            ...(c[key] as unknown as { id: string; order: number }[]),
          ]
            .slice()
            .sort((a, b) => a.order - b.order)

          const i = sorted.findIndex(x => x.id === id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= sorted.length) return c

          const next = sorted.slice()
          next[i] = { ...next[i] }
          next[j] = { ...next[j] }
          const tmp = next[i]
          next[i] = next[j]
          next[j] = tmp

          return {
            ...c,
            [key]: next.map((x, k) => ({ ...x, order: k + 1 })) as never,
          }
        }),
    }
  }

  function logout() {
    clearToken()
    setAuthed(false)
    setContent(structuredClone(defaultContent))
    setSaveState('idle')
  }

  if (authed === null) {
    return (
      <div className="admin-loading">
        <div className="loader" />
      </div>
    )
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />
  }

  const p = content.profile

  return (
    <div className="admin">
      {/* 侧栏 */}
      <aside className="admin-side">
        <div className="admin-side-logo">
          LI<span>.</span>YC
          <em>管理后台</em>
        </div>
        <nav className="admin-nav">
          {(Object.keys(SECTION_LABELS) as SectionKey[]).map(k => (
            <button
              key={k}
              className={`admin-nav-item${section === k ? ' active' : ''}`}
              onClick={() => setSection(k)}
            >
              {SECTION_LABELS[k]}
            </button>
          ))}
        </nav>
        <div className="admin-side-foot">
          <button className="btn btn-outline btn-block btn-sm" onClick={onExit}>
            ← 返回网站
          </button>
          <button className="btn btn-outline btn-block btn-sm btn-danger" onClick={logout}>
            退出登录
          </button>
        </div>
      </aside>

      {/* 主区 */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-title">{SECTION_LABELS[section]}</h1>
          <div className="admin-status">
            {message && <span className="admin-msg">{message}</span>}
            <span className={`admin-save save-${saveState}`}>
              {saveState === 'dirty' && '有未保存修改'}
              {saveState === 'saving' && '保存中…'}
              {saveState === 'saved' && '✓ 已保存'}
              {saveState === 'error' && '✕ 保存失败'}
              {saveState === 'idle' && '内容已同步'}
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => void persist(content)}
              disabled={saveState === 'saving'}
            >
              立即保存
            </button>
          </div>
        </header>

        <div className="admin-body">
          {/* ---- 基本信息 ---- */}
          {section === 'profile' && (
            <div className="admin-panel">
              <TextField
                label="姓名"
                value={p.name}
                onChange={v => update(c => ({ ...c, profile: { ...c.profile, name: v } }))}
              />
              <TextField
                label="标题前缀"
                value={p.headline}
                onChange={v => update(c => ({ ...c, profile: { ...c.profile, headline: v } }))}
                placeholder="如：欢迎访问，"
              />
              <TextField
                label="职位头衔（· 分隔）"
                value={p.roles}
                onChange={v => update(c => ({ ...c, profile: { ...c.profile, roles: v } }))}
              />
              <TextArea
                label="个人简介"
                rows={3}
                value={p.intro}
                onChange={v => update(c => ({ ...c, profile: { ...c.profile, intro: v } }))}
              />
              <ImageField
                label="个人头像"
                value={p.avatar}
                onChange={v => update(c => ({ ...c, profile: { ...c.profile, avatar: v } }))}
              />
              <TextField
                label="经验年限（代码卡片）"
                value={p.codeCard.exp}
                onChange={v =>
                  update(c => ({ ...c, profile: { ...c.profile, codeCard: { ...c.profile.codeCard, exp: v } } }))
                }
              />
              <TagsField
                label="专注方向（代码卡片）"
                values={p.codeCard.focus}
                onChange={v =>
                  update(c => ({ ...c, profile: { ...c.profile, codeCard: { ...c.profile.codeCard, focus: v } } }))
                }
              />
              <SelectField
                label="代码卡片 · 求职状态"
                value={p.codeCard.open ? 'yes' : 'no'}
                options={[
                  { value: 'yes', label: '求职中' },
                  { value: 'no', label: '暂不求职' },
                ]}
                onChange={v =>
                  update(c => ({ ...c, profile: { ...c.profile, codeCard: { ...c.profile.codeCard, open: v === 'yes' } } }))
                }
              />
              <TextArea
                label="SEO 描述"
                rows={2}
                value={p.seoDescription}
                onChange={v => update(c => ({ ...c, profile: { ...c.profile, seoDescription: v } }))}
              />
            </div>
          )}

          {/* ---- 工作经历 ---- */}
          {section === 'experiences' && (
            <EditorShell
              items={content.experiences}
              addLabel="+ 新增经历"
              {...listOps('experiences')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['experiences'][number]
                return (
                  <>
                    <div className="grid-2">
                      <SelectField
                        label="类型"
                        value={it.type}
                        options={[
                          { value: 'work', label: '💼 工作' },
                          { value: 'edu', label: '🎓 教育' },
                        ]}
                        onChange={v => upd({ type: v })}
                      />
                      <TextField label="时间" value={it.time} onChange={v => upd({ time: v })} placeholder="2022.06 – 至今" />
                    </div>
                    <TextField label="机构 / 公司" value={it.org} onChange={v => upd({ org: v })} />
                    <TextField label="角色 / 专业" value={it.role} onChange={v => upd({ role: v })} />
                    <TextArea label="主要成就" rows={3} value={it.achievement} onChange={v => upd({ achievement: v })} />
                    <TagsField label="标签" values={it.tags} onChange={v => upd({ tags: v })} />
                  </>
                )
              }}
            />
          )}

          {/* ---- 能力矩阵 ---- */}
          {section === 'abilities' && (
            <EditorShell
              items={content.abilities}
              addLabel="+ 新增能力项"
              {...listOps('abilities')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['abilities'][number]
                return (
                  <>
                    <div className="grid-2">
                      <TextField label="分组" value={it.group} onChange={v => upd({ group: v })} placeholder="测试管理" />
                      <TextField label="能力名" value={it.name} onChange={v => upd({ name: v })} />
                    </div>
                    <div className="grid-2">
                      <label className="fld">
                        <span className="fld-label">熟练度：{it.level}%</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={it.level}
                          className="fld-range"
                          onChange={e => upd({ level: Number(e.target.value) })}
                        />
                      </label>
                      <TextField label="等级标签" value={it.label} onChange={v => upd({ label: v })} placeholder="熟练" />
                    </div>
                  </>
                )
              }}
            />
          )}

          {/* ---- 项目经历 ---- */}
          {section === 'projects' && (
            <EditorShell
              items={content.projects}
              addLabel="+ 新增项目"
              {...listOps('projects')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['projects'][number]
                const setStar = (k: keyof typeof it.star, v: string) => upd({ star: { ...it.star, [k]: v } })
                return (
                  <>
                    <div className="grid-2">
                      <SelectField
                        label="分类"
                        value={it.category}
                        options={[
                          { value: 'work', label: '工作项目' },
                          { value: 'academic', label: '学术项目' },
                          { value: 'personal', label: '个人项目' },
                        ]}
                        onChange={v => upd({ category: v })}
                      />
                      <TextField label="项目名称" value={it.name} onChange={v => upd({ name: v })} />
                    </div>
                    <div className="grid-2">
                      <TextField label="我的角色" value={it.role} onChange={v => upd({ role: v })} />
                      <TextField label="成果摘要" value={it.result} onChange={v => upd({ result: v })} />
                    </div>
                    <TagsField label="技术栈" values={it.techs} onChange={v => upd({ techs: v })} />
                    <ImageField label="项目封面" value={it.cover} onChange={v => upd({ cover: v })} />
                    <div className="sub-panel">
                      <div className="sub-panel-title">STAR 详情</div>
                      <TextArea label="背景" rows={2} value={it.star.bg} onChange={v => setStar('bg', v)} />
                      <TextArea label="我的角色" rows={2} value={it.star.role} onChange={v => setStar('role', v)} />
                      <TextArea label="解决方案" rows={3} value={it.star.solve} onChange={v => setStar('solve', v)} />
                      <TextArea label="最终结果" rows={2} value={it.star.result} onChange={v => setStar('result', v)} />
                    </div>
                  </>
                )
              }}
            />
          )}

          {/* ---- AI 技能 ---- */}
          {section === 'aiSkills' && (
            <EditorShell
              items={content.aiSkills}
              addLabel="+ 新增技能"
              {...listOps('aiSkills')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['aiSkills'][number]
                return (
                  <>
                    <div className="grid-3">
                      <TextField label="图标（emoji）" value={it.icon} onChange={v => upd({ icon: v })} />
                      <TextField label="标题" value={it.title} onChange={v => upd({ title: v })} />
                      <TextField label="分类标签" value={it.tag} onChange={v => upd({ tag: v })} />
                    </div>
                    <div className="grid-2">
                      <SelectField
                        label="状态"
                        value={it.status}
                        options={[
                          { value: 'done', label: '已落地' },
                          { value: 'exploring', label: '探索中' },
                          { value: 'planned', label: '规划中' },
                        ]}
                        onChange={v => upd({ status: v })}
                      />
                      <TextField label="演示链接" value={it.demoUrl} onChange={v => upd({ demoUrl: v })} placeholder="https://" />
                    </div>
                    <TextArea label="描述" rows={3} value={it.desc} onChange={v => upd({ desc: v })} />
                    <TagsField label="技术栈" values={it.techs} onChange={v => upd({ techs: v })} />
                    <div className="grid-2">
                      <ImageField label="封面图" value={it.cover} onChange={v => upd({ cover: v })} />
                      <TextField label="GitHub 仓库" value={it.repoUrl} onChange={v => upd({ repoUrl: v })} placeholder="https://github.com/..." />
                    </div>
                  </>
                )
              }}
            />
          )}

          {/* ---- 荣誉墙 ---- */}
          {section === 'honors' && (
            <EditorShell
              items={content.honors}
              addLabel="+ 新增荣誉"
              {...listOps('honors')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['honors'][number]
                return (
                  <>
                    <div className="grid-3">
                      <SelectField
                        label="分类"
                        value={it.category}
                        options={[
                          { value: 'work', label: '工作荣誉' },
                          { value: 'school', label: '在校荣誉' },
                          { value: 'cert', label: '认证证书' },
                        ]}
                        onChange={v => upd({ category: v })}
                      />
                      <TextField label="日期" value={it.date} onChange={v => upd({ date: v })} placeholder="2024.08" />
                      <TextField label="地点" value={it.location} onChange={v => upd({ location: v })} />
                    </div>
                    <TextField label="奖项名称" value={it.event} onChange={v => upd({ event: v })} />
                    <TextField label="奖项级别" value={it.place} onChange={v => upd({ place: v })} placeholder="一等奖" />
                    <TextArea label="说明" rows={2} value={it.desc} onChange={v => upd({ desc: v })} />
                    <ImageField label="证书图片" value={it.image} onChange={v => upd({ image: v })} />
                  </>
                )
              }}
            />
          )}

          {/* ---- 博客 ---- */}
          {section === 'posts' && (
            <EditorShell
              items={content.posts}
              addLabel="+ 新增文章"
              {...listOps('posts')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['posts'][number]
                return (
                  <>
                    <TextField label="标题" value={it.title} onChange={v => upd({ title: v })} />
                    <div className="grid-3">
                      <TextField label="发布日期" value={it.date} onChange={v => upd({ date: v })} placeholder="2026-01-01" />
                      <TextField
                        label="阅读时长（分钟）"
                        value={String(it.readMin)}
                        onChange={v => upd({ readMin: Number(v) || 0 })}
                      />
                      <TextField label="封面图URL" value={it.cover} onChange={v => upd({ cover: v })} />
                    </div>
                    <TagsField label="标签" values={it.tags} onChange={v => upd({ tags: v })} />
                    <TextArea label="摘要" rows={2} value={it.summary} onChange={v => upd({ summary: v })} />
                    <ImageField label="封面图" value={it.cover} onChange={v => upd({ cover: v })} />
                    <TextArea
                      label="正文（HTML）"
                      rows={12}
                      value={it.content}
                      onChange={v => upd({ content: v })}
                      placeholder="<h2 id='s1'>小标题</h2><p>正文…</p>"
                    />
                    <span className="fld-hint">
                      正文支持 HTML。小标题请用 &lt;h2 id="唯一ID"&gt;，目录会自动同步到前台。
                    </span>
                  </>
                )
              }}
            />
          )}

          {/* ---- 联系方式 ---- */}
          {section === 'contacts' && (
            <EditorShell
              items={content.contacts}
              addLabel="+ 新增联系方式"
              {...listOps('contacts')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['contacts'][number]
                return (
                  <>
                    <div className="grid-3">
                      <SelectField
                        label="类型"
                        value={it.kind}
                        options={[
                          { value: 'phone', label: '📱 手机' },
                          { value: 'email', label: '📧 邮箱' },
                          { value: 'github', label: '🐙 GitHub' },
                          { value: 'wechat', label: '💬 公众号/微信' },
                          { value: 'other', label: '🔗 其他' },
                        ]}
                        onChange={v => upd({ kind: v })}
                      />
                      <TextField label="图标" value={it.icon} onChange={v => upd({ icon: v })} />
                      <TextField label="标签" value={it.label} onChange={v => upd({ label: v })} />
                    </div>
                    <TextField label="显示值" value={it.value} onChange={v => upd({ value: v })} />
                    <TextField label="跳转链接（可空）" value={it.url} onChange={v => upd({ url: v })} placeholder="mailto: / https://" />
                  </>
                )
              }}
            />
          )}

          {/* ---- 我的站点 ---- */}
          {section === 'sites' && (
            <EditorShell
              items={content.sites}
              addLabel="+ 新增站点"
              {...listOps('sites')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['sites'][number]
                return (
                  <>
                    <div className="grid-2">
                      <TextField label="图标" value={it.icon} onChange={v => upd({ icon: v })} />
                      <TextField label="名称" value={it.name} onChange={v => upd({ name: v })} />
                    </div>
                    <TextField label="描述" value={it.desc} onChange={v => upd({ desc: v })} />
                    <TextField label="链接" value={it.url} onChange={v => upd({ url: v })} placeholder="https://" />
                  </>
                )
              }}
            />
          )}

          {/* ---- 数据统计 ---- */}
          {section === 'stats' && (
            <EditorShell
              items={content.stats}
              addLabel="+ 新增统计"
              {...listOps('stats')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['stats'][number]
                return (
                  <div className="grid-2">
                    <TextField label="数值" value={it.num} onChange={v => upd({ num: v })} placeholder="10+" />
                    <TextField label="说明" value={it.label} onChange={v => upd({ label: v })} placeholder="年测试经验" />
                  </div>
                )
              }}
            />
          )}

          {/* ---- 关于我卡片 ---- */}
          {section === 'overviews' && (
            <EditorShell
              items={content.overviews}
              addLabel="+ 新增卡片"
              {...listOps('overviews')}
              renderItem={(item: never, upd) => {
                const it = item as SiteContent['overviews'][number]
                return (
                  <>
                    <div className="grid-3">
                      <TextField label="图标" value={it.icon} onChange={v => upd({ icon: v })} />
                      <TextField label="标题" value={it.title} onChange={v => upd({ title: v })} />
                      <SelectField
                        label="点击跳转"
                        value={it.link}
                        options={[
                          { value: 'home', label: '首页' },
                          { value: 'experience', label: '经历' },
                          { value: 'projects', label: '项目' },
                          { value: 'ai', label: 'AI 技能' },
                          { value: 'honors', label: '荣誉墙' },
                          { value: 'blog', label: '博客' },
                        ]}
                        onChange={v => upd({ link: v })}
                      />
                    </div>
                    <TextArea label="描述" rows={2} value={it.desc} onChange={v => upd({ desc: v })} />
                  </>
                )
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}
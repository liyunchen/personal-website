import { useRef, useState } from 'react'
import { uploadImage } from '../lib/api'

/* ───────────���─────── 基础字段 ────────────────────── */

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
}) {
  return (
    <label className="fld">
      <span className="fld-label">{label}</span>
      <input
        className={`fld-input${mono ? ' mono' : ''}`}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <label className="fld">
      <span className="fld-label">{label}</span>
      <textarea
        className="fld-input fld-textarea"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  )
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <label className="fld">
      <span className="fld-label">{label}</span>
      <select className="fld-input" value={value} onChange={e => onChange(e.target.value as T)}>
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** 逗号分隔的字符串数组编辑器 */
export function TagsField({
  label,
  values,
  onChange,
  placeholder = '用逗号分隔，如：Python, Pytest',
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [text, setText] = useState(values.join(', '))

  function commit() {
    const arr = text
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean)
    onChange(arr)
  }

  return (
    <label className="fld">
      <span className="fld-label">{label}</span>
      <input
        className="fld-input"
        value={text}
        placeholder={placeholder}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
      />
      <span className="fld-hint">当前：{values.length ? values.join('、') : '（空）'}</span>
    </label>
  )
}

/* ────────────────────── 图片上传 ────────────────────── */

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErr('')
    setBusy(true)
    const res = await uploadImage(file)
    setBusy(false)
    if (res.ok && res.url) {
      onChange(res.url)
    } else {
      setErr(res.error ?? '上传失败')
    }
    // 清空以便再次选择同一文件
    e.target.value = ''
  }

  return (
    <div className="fld">
      <span className="fld-label">{label}</span>
      <div className="img-field">
        {value ? (
          <div className="img-preview">
            <img src={value} alt="预览" />
            <div className="img-preview-actions">
              <button type="button" className="btn btn-mini" onClick={() => inputRef.current?.click()}>
                更换
              </button>
              <button type="button" className="btn btn-mini btn-danger" onClick={() => onChange('')}>
                移除
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="img-upload"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? '上传中…' : '＋ 上传图片'}
          </button>
        )}
        {value && (
          <button
            type="button"
            className="img-upload img-upload-inline"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? '上传中…' : '重新上传'}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={pick}
        style={{ display: 'none' }}
      />
      {err && <span className="fld-error">{err}</span>}
      <span className="fld-hint">支持 jpg / png / webp / gif，不超过 5MB</span>
    </div>
  )
}

/* ────────────────────── 列表容器 ────────────────────── */

export function EditorShell({
  items,
  add,
  update,
  remove,
  move,
  renderItem,
  addLabel = '+ 新增',
}: {
  items: { id: string; order: number }[]
  add: () => void
  update: (id: string, patch: Record<string, unknown>) => void
  remove: (id: string) => void
  move: (id: string, dir: -1 | 1) => void
  renderItem: (item: never, update: (patch: Record<string, unknown>) => void) => React.ReactNode
  addLabel?: string
}) {
  const sorted = [...items].sort((a, b) => a.order - b.order)

  return (
    <div className="editor-list">
      {sorted.length === 0 && <div className="empty-hint">暂无数据，点击下方按钮新增</div>}
      {sorted.map((it, idx) => (
        <div className="editor-item" key={it.id}>
          <div className="editor-item-bar">
            <span className="editor-idx">{idx + 1}</span>
            <div className="editor-order-btns">
              <button
                type="button"
                className="icon-btn"
                disabled={idx === 0}
                onClick={() => move(it.id, -1)}
                title="上移"
              >
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                disabled={idx === sorted.length - 1}
                onClick={() => move(it.id, 1)}
                title="下移"
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              className="icon-btn danger"
              onClick={() => {
                if (confirm('确定删除这一条？此操作不可撤销。')) remove(it.id)
              }}
              title="删除"
            >
              ✕
            </button>
          </div>
          <div className="editor-item-body">
            {renderItem(it as never, patch => update(it.id, patch))}
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-block" onClick={add}>
        {addLabel}
      </button>
    </div>
  )
}
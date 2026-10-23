import { useState } from 'react'
import { login } from '../lib/api'

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setError('')

    if (!user.trim() || !password) {
      setError('请输入账号和密码')
      return
    }

    setBusy(true)
    const res = await login(user.trim(), password)
    setBusy(false)

    if (res.ok) {
      onSuccess()
    } else {
      setError(res.error ?? '登录失败')
      setPassword('')
    }
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login" onSubmit={handleSubmit}>
        <div className="admin-login-logo">
          LI<span>.</span>YC
        </div>
        <h1 className="admin-login-title">内容管理后台</h1>
        <p className="admin-login-sub">请使用管理员账号登录</p>

        <label className="fld">
          <span className="fld-label">账号</span>
          <input
            className="fld-input"
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="请输入账号"
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className="fld">
          <span className="fld-label">密码</span>
          <input
            className="fld-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
          />
        </label>

        {error && <div className="admin-login-error">{error}</div>}

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? '登录中…' : '登录'}
        </button>

        <button type="button" className="admin-login-back" onClick={onSuccess}>
          返回网站首页
        </button>
      </form>
    </div>
  )
}
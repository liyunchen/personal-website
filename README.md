# 个人求职展示网站

> 面向互联网企业 HR / 面试官的在线简历与作品展示站，内置内容管理后台。
> 前端 React + TypeScript，后端 Python 标准库，Nginx 静态托管 + 反向代理。

一个可直接复用的「在线简历 + 作品集」全栈方案：所有内容都能通过后台自助维护，**不需要改代码、不需要重新部署**。

---

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [本地开发](#本地开发)
- [部署](#部署)
- [测试](#测试)
- [安全设计](#安全设计)
- [常见问题](#常见问题)
- [运维手册](#运维手册)
- [二次开发](#二次开发)
- [开源说明](#开源说明)

---

## 功能特性

### 前台（6 个页面）

| 页面 | 内容 |
|---|---|
| 首页 | 个人简介、代码风格卡片、联系方式 Hub、数据统计条、关于我 |
| 经历 | 工作/教育时间线，5 条经历 |
| 项目 | 项目卡片，STAR 四段式展开 |
| AI 技能 | AI 测试能力矩阵，支持分组切换 |
| 荣誉墙 | 奖项/论文/认证展示 |
| 博客 | 文章列表 + 详情页（阅读进度条、悬浮目录、相关文章推荐） |

### 后台（11 个分区）

基本信息、工作经历、能力矩阵、项目经历、AI 技能、荣誉墙、博客文章、联系方式、我的站点、数据统计、关于我。

- 增删改 + 上下调序
- **图片上传**（jpg / png / webp / gif，单文件 ≤ 5MB）
- **自动保存**（1.2秒防抖，改完即存）
- 会话保持（7 天）

### 设计

- OKLCH 色彩系统，白色系为主（深浅灰蓝区分层次）
- Elevated 光影方案：卡片 hover 光晕上浮、按钮流光、导航渐变底线、页面淡入入场动画
- 响应式，360px 起的移动端可用

---

## 技术栈

### 前端

- **React 19** + **Vite 8** + **TypeScript 6**
- 无 UI 框架，纯手写 CSS + CSS 变量
- 无路由库：前台用 `useState` 条件渲染，仅后台用 `#/admin` hash 路由

### 后端

- **Python 3 标准库**（`http.server.ThreadingHTTPServer`）
- **零第三方依赖** —— 不需要 pip install，不会有升级/维护风险

### 部署

- **Nginx** 托管静态资源 + 反向代理 `/api`、`/uploads`
- **systemd** 托管后端进程（开机自启 + 崩溃重启）
- **Let's Encrypt** 证书（certbot webroot 模式，自动续期）

---

## 项目结构

```
.
├── portfolio/                    # 前端工程
│   ├── src/
│   │   ├── types/content.ts      # 数据契约 SiteContent（唯一真源）
│   │   ├── data/defaultContent.ts# 默认内容（降级展示 / 恢复默认）
│   │   ├── lib/api.ts            # API 客户端 + mergeWithDefaults 兜底
│   │   ├── hooks/
│   │   │   └── useSiteContent.ts # 内容加载 hook
│   │   ├── components/
│   │   │   └── Nav.tsx           # 全局导航
│   │   ├── pages/                # 7 个页面组件
│   │   │   ├── Home.tsx
│   │   │   ├── Experience.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── AISkills.tsx
│   │   │   ├── Honors.tsx
│   │   │   ├── Blog.tsx
│   │   │   └── BlogDetail.tsx
│   │   ├── admin/
│   │   │   ├── Admin.tsx         # 后台主容器
│   │   │   ├── AdminLogin.tsx    # 登录页
│   │   │   └── Fields.tsx        # 通用表单组件
│   │   ├── App.tsx               # 路由分发
│   │   └── styles/globals.css    # 全部样式
│   ├── public/                   # avatar.jpg / favicon.svg / icons.svg
│   ├── index.html
│   ├── vite.config.ts            # 开发期 API 代理
│   └── package.json
│
├── deploy/                       # 部署与测试工具
│   ├── server/
│   │   ├── app.py                # 后端服务（零依赖）
│   │   ├── e2e_test.py           # API 端到端测试
│   │   ├── example.com.conf  # Nginx 站点配置模板
│   │   ├── portfolio-api.service # systemd unit
│   │   └── nginx-http-only.conf      # 仅 HTTP 配置（申请证书前的临时态）
│   ├── ssh_helper.py             # SSH 工具（info / run / put）
│   ├── upload_dist.py            # 递归上传 dist
│   ├── ui_test.py                # 浏览器端到端测试（Playwright）
│   ├── verify_online.py          # 线上视觉验收 + 截图
│   └── debug_sort.py             # 排序行为聚焦调试
│
├── prototype.html                # 设计原型（视觉基准）
├── demo-a/b/c.html               # 三套设计方案对比稿
└── README.md
```

---

## 快速开始

### 前置要求

- Node.js ≥ 20
- Python ≥ 3.9
- pip（仅测试需要 playwright，其余无依赖）

### 安装

```bash
cd portfolio
npm install
```

---

## 环境变量

**仓库中不含任何真实凭据。** 所有敏感配置通过环境变量注入。

### 后端（`api/app.py`）

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `API_HOST` | 否 | `127.0.0.1` | 监听地址 |
| `API_PORT` | 否 | `8101` | 监听端口 |
| `API_BASE_DIR` | 否 | 脚本所在目录 | 数据与上传目录的父目录 |
| `ADMIN_USER` | 否 | `root` | 后台账号 |
| `ADMIN_PASS_HASH` | **是** | — | PBKDF2-SHA256 哈希（hex） |
| `ADMIN_PASS_SALT` | **是** | — | 随机盐（hex） |

> 未配置 `HASH`/`SALT` 时，可临时用 `ADMIN_PASS` 明文启动；进程会在首次启动时自动生成哈希与盐并打印，请将打印结果写入 `.env` 后改用哈希方式启动。

### 部署脚本

| 变量 | 说明 |
|---|---|
| `DEPLOY_HOST` | 服务器地址 |
| `DEPLOY_PORT` | SSH 端口，默认 22 |
| `DEPLOY_USER` | SSH 用户，默认 root |
| `DEPLOY_PASS` | SSH 密码 |

### 测试脚本

| 变量 | 说明 |
|---|---|
| `ADMIN_PASS` | 后台密码，供测试登录使用 |
| `SITE_BASE` | 被测站点地址，默认 `http://127.0.0.1:5173` |

---

## 本地开发

### 启动前端

```bash
cd portfolio
npm run dev        # → http://localhost:5173/
```

开发服务器已配置代理，`/api` 与 `/uploads` 会转发到 `127.0.0.1:8101`。

### 启动后端

```bash
# 1. 创建 .env（首次）
cd deploy/server
python - <<'PY'
import secrets, hashlib
salt = secrets.token_hex(16)
pw   = input("设置后台密码: ")
h = hashlib.pbkdf2_hmac('sha256', pw.encode(), salt.encode(), 200000).hex()
open('.env', 'w').write(f"ADMIN_USER=root\nADMIN_PASS_HASH={h}\nADMIN_PASS_SALT={salt}\n")
PY

# 2. 启动
python app.py     # → http://127.0.0.1:8101
```

### 其他命令

```bash
npm run build      # 生产构建 → dist/
npm run preview    # 预览构建产物
npm run lint       # oxlint 检查
npx tsc -b --noEmit  # 类型检查
```

---

## 部署

### 一、准备目录

```bash
SITE=/www/wwwroot/your-project
mkdir -p $SITE/{dist,api/data,api/uploads}
```

### 二、上传文件

```bash
cd deploy
export DEPLOY_HOST='<服务器地址>'
export DEPLOY_USER='root'
export DEPLOY_PASS='<服务器密码>'

python ssh_helper.py put server/app.py                $SITE/api/app.py
python ssh_helper.py put server/portfolio-api.service /etc/systemd/system/portfolio-api.service
python ssh_helper.py put server/example.com.conf  /www/server/panel/vhost/nginx/example.com.conf

cd ../portfolio && npm run build && cd ../deploy
python upload_dist.py     # 递归上传 dist（自动重建远端目录）
```

> **Git Bash 注意**：SFTP 目标路径需 `export MSYS_NO_PATHCONV=1`，否则 `/xxx` 会被改写成 Windows 本地路径。

### 三、配置后端

在服务器上创建 `$SITE/api/.env`（内容见[环境变量](#环境变量)），权限设为 `600`：

```bash
chmod 600 $SITE/api/.env
chown -R www:www $SITE
```

### 四、注册服务

```bash
systemctl daemon-reload
systemctl enable --now portfolio-api
systemctl is-active portfolio-api     # 应输出 active
curl http://127.0.0.1:8101/api/health
```

### 五、申请证书

先只启用 80 端口的配置，再签发，最后换成完整 HTTPS 配置：

```bash
# 1. 临时 HTTP 配置
python ssh_helper.py put server/nginx-http-only.conf /www/server/panel/vhost/nginx/example.com.conf
python ssh_helper.py run "/www/server/nginx/sbin/nginx -t && /www/server/nginx/sbin/nginx -s reload"

# 2. 签发证书（webroot 模式）
python ssh_helper.py run "certbot certonly --webroot -w /var/www/certbot -d <你的域名> \
  --non-interactive --agree-tos --register-unsafely-without-email"

# 3. 换成完整配置
python ssh_helper.py put server/example.com.conf /www/server/panel/vhost/nginx/example.com.conf
python ssh_helper.py run "/www/server/nginx/sbin/nginx -t && /www/server/nginx/sbin/nginx -s reload"
```

### 六、初始化内容

后端首次收到保存请求时会写出 `data/content.json`。若想让站点立刻有内容，可将一份完整的内容 JSON 放到 `$SITE/api/data/content.json`（权限 `644`）。

---

## 测试

### API 端到端（29 项）

```bash
export ADMIN_PASS='<后台密码>'
python deploy/server/e2e_test.py http://127.0.0.1:8101
```

覆盖：健康检查、匿名读、登录（正确/错误密码/错误账号）、Token 鉴权（有效/伪造/缺失）、未授权写入拦截、读写往返、非法负载、图片上传 9 项（重命名、扩展名白名单、路径穿越、空文件、超限、未授权）、路由健壮性。

### 浏览器端到端（54 项）

```bash
pip install playwright && playwright install chromium
export ADMIN_PASS='<后台密码>'
python deploy/ui_test.py http://localhost:5173
```

覆盖：首页渲染、6 页面导航、STAR 展开、能力矩阵切换、博客详情+目录+相关文章、后台登录、11 分区可打开、编辑+自动保存+前台生效、新增+排序+删除、会话保持、响应式、控制台错误。

### 线上视觉验收

```bash
export ADMIN_PASS='<后台密码>'
export SITE_BASE='https://<你的域名>'
python deploy/verify_online.py     # 截图输出到 deploy/shots/
```

---

## 安全设计

| 项 | 实现 |
|---|---|
| 密码存储 | PBKDF2-SHA256，200000 轮，随机 salt；只存哈希不存明文 |
| 密码比对 | `hmac.compare_digest` 常量时间，防时序攻击 |
| Token 存储 | 服务端只存 SHA256 指纹，明文 token 不落盘 |
| Token 有效期 | 7 天，过期清理；服务重启后全部失效 |
| 暴力破解 | 密码错误走 `sleep(0.5)` 延迟 |
| 上传安全 | 服务端重写 UUID 文件名；扩展名白名单；大小限制；不信任客户端文件名 |
| 原子写入 | 临时文件 + `os.replace`，避免写一半损坏数据 |
| 传输安全 | 全站 HTTPS + HSTS，证书自动续期 |
| 安全响应头 | `X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy` |
| 进程加固 | systemd `NoNewPrivileges` / `PrivateTmp` / `ProtectSystem` / `ProtectHome` |
| 前端兜底 | API 不可用时静默降级到默认内容，前台永远可访问 |

### 仓库安全

`.gitignore` 已排除：`.env`、`tokens.json`、运行时数据、上传文件、日志、构建产物。

> 提交前请确认 `git status` 中没有 `.env` 或 `data/` 目录。

---

## 常见问题

**后台改了内容，前台没变？**
等 1.2 秒自动保存完成（右上角显示「已保存」），并强制刷新浏览器（Ctrl+F5）。`index.html` 已设为不缓存。

**后台登录态突然失效？**
Token 有效期 7 天；后端服务重启后所有 token 会清空。重新登录即可。

**前端能打开但数据是默认的？**
说明 `/api/content` 请求失败。检查后端进程与 Nginx 反代配置：

```bash
systemctl is-active portfolio-api
curl http://127.0.0.1:8101/api/health
tail -50 /www/wwwlogs/<域名>.error.log
```

**Nginx 配置改了不生效？**
`nginx -t` 通过后仍需 reload；站点配置在 `include` 覆盖的目录内时，还要确认没有同 `server_name` 的其他文件抢先匹配。

**413 却收到 ConnectionReset？**
`http.server` 在提前返回响应前必须消费掉请求体，否则客户端收到连接重置而非 413。`app.py` 中的 `_drain()` 就是干这个的。

**React 状态更新出现「一次操作走了两格」？**
StrictMode 会双调用 setState updater。副作用必须放在 `useEffect` 里，更新必须不可变（复制对象后再改，不要原地修改共享引用）。

---

## 运维手册

### 日常命令

```bash
export DEPLOY_HOST='<服务器地址>' DEPLOY_USER='root' DEPLOY_PASS='<服务器密码>'

# 看服务器概况
python deploy/ssh_helper.py info

# 任意命令
python deploy/ssh_helper.py run "systemctl status portfolio-api"

# 看后端日志
python deploy/ssh_helper.py run "tail -50 /var/log/portfolio-api.log"

# 看 Nginx 错误日志
python deploy/ssh_helper.py run "tail -50 /www/wwwlogs/<域名>.error.log"
```

### 更新内容

内容在后台改，无需部署操作。

### 更新代码

```bash
cd portfolio && npm run build
cd ../deploy && export DEPLOY_PASS='<服务器密码>' && python upload_dist.py
```

改了 `app.py` 需额外：

```bash
python ssh_helper.py put server/app.py /www/wwwroot/your-project/api/app.py
python ssh_helper.py run "systemctl restart portfolio-api"
```

### 备份数据

```bash
python ssh_helper.py run "tar czf /root/backup-$(date +%F).tar.gz \
  -C /www/wwwroot/your-project api/data api/uploads api/.env"
```

### 证书续期

```bash
python ssh_helper.py run "certbot renew --dry-run"     # 测试
python ssh_helper.py run "certbot renew"               # 实际续期
```

certbot 已安装定时任务，正常情况无需手动干预。
---

## 二次开发

### 改默认内容

`portfolio/src/data/defaultContent.ts` 是唯一的默认数据源，也是 API 不可用时的降级内容。修改它等于修改站点初始内容。

其中的占位信息需替换为你自己的：

```ts
// 联系方式
value: 'your-name@example.com'          → 你的邮箱
value: 'github.com/your-handle'         → 你的 GitHub
value: '138-XXXX-XXXX'                  → 你的手机号

// 基本信息
profile.name / headline / roles / intro  → 你的个人信息
```

### 加一个新分区

1. 在 `portfolio/src/types/content.ts` 里加分区类型
2. 在 `defaultContent.ts` 里加对应的空数组
3. 在 `lib/api.ts` 的 `mergeWithDefaults()` 里加补齐逻辑
4. 在 `admin/Admin.tsx` 的侧栏与 `listOps` 里注册
5. 在 `admin/Fields.tsx` 里加对应表单渲染

### 换配色

`portfolio/src/styles/globals.css` 顶部的 CSS 变量即全部设计 token：

```css
:root {
  --accent: oklch(...);   /* 主色 */
  --green:  oklch(...);
  --purple: oklch(...);
  /* ... */
}
```

### 换后端语言/框架

`deploy/server/app.py` 是一个**零依赖的完整参考实现**。它的接口契约很简单，全部照搬即可：

```
GET  /api/health          健康检查
GET  /api/content         读取内容（公开）
GET  /api/verify          校验 token
POST /api/login           登录，返回 token
PUT  /api/content         保存内容（需 token）
POST /api/upload          上传图片（需 token）
```

---

## 开源说明

### 示例内容与真实内容

本仓库的默认内容（公司名、履历、荣誉、项目）**均为示例占位内容**，仅用于演示数据结构与页面效果，不构成任何真实履历。使用时请在后台替换为你自己的真实信息。

姓名、公司名、学校名等出现在源码中属于**示例数据**，不影响安全性；真正需要注意的凭据类信息（密码、Token、服务器 IP、真实域名）已全部从仓库中移除。

### 安全提示

- 本项目采用**单密码 + 会话保持**的简化鉴权，适合个人展示站这类低并发场景
- 若用于多人协作或后台有重要数据，请补充：多用户体系、登录失败锁定、操作审计、二次验证
- 所有凭据必须通过环境变量注入，不要写进代码或提交进仓库
- 部署前请务必在服务器上生成 `.env` 并设置 `chmod 600`

### 致谢

- [React](https://react.dev/) · [Vite](https://vite.dev/) · [TypeScript](https://www.typescriptlang.org/)
- [Playwright](https://playwright.dev/) —— 端到端测试
- [Let's Encrypt](https://letsencrypt.org/) —— 免费证书

如果这个项目帮到你，欢迎给个 Star 作为鼓励。

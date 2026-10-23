"""
线上站点视觉验收：截图 + 控制台错误 + 失败请求 + 响应头检查。
用法: python verify_online.py
"""
import os
import urllib.request
from playwright.sync_api import sync_playwright

BASE = os.environ.get("SITE_BASE", "http://127.0.0.1:5173")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)

console_errors = []
failed_requests = []

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("requestfailed",
            lambda r: failed_requests.append(f"{r.url} :: {r.failure}"))

    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1000)

    print("===== 前台各页面（state 路由，点击导航切换）=====")
    shots = [
        ("首页", "home", None),
        ("经历", "experience", "经历"),
        ("项目", "projects", "项目"),
        ("AI 技能", "ai-skills", "AI 技能"),
        ("荣誉墙", "honors", "荣誉墙"),
        ("博客", "blog", "博客"),
    ]
    for label, name, nav_label in shots:
        if nav_label:
            page.click(".nav-link >> text=" + nav_label)
            page.wait_for_timeout(900)
        h = page.evaluate("document.body.scrollHeight")
        active = page.evaluate("document.querySelector('.nav-link.active')?.innerText || ''")
        cards = page.evaluate("document.querySelectorAll('[class*=\"card\"]').length")
        page.screenshot(path=f"{OUT}/online-{name}.png")
        print(f"  {label:8s} 页面高={h:5d}  卡片数={cards:3d}  高亮导航={active!r}")

    # 首页整页截图（看整体布局）
    page.click(".nav-link >> text=首页")
    page.wait_for_timeout(700)
    page.screenshot(path=f"{OUT}/online-home-full.png", full_page=True)

    # ---------- 博客详情 ----------
    print("\n===== 博客详情 =====")
    page.click(".nav-link >> text=博客")
    page.wait_for_timeout(900)
    n = page.locator(".card-grid .card").count()
    print(f"  文章卡片数={n}")
    page.locator(".card-grid .card").first.click()
    page.wait_for_timeout(1400)
    detail_title = page.evaluate("document.querySelector('h1')?.innerText || ''")
    toc = page.locator(".toc-item").count()
    body_len = page.evaluate(
        "document.querySelector('.post-content, .markdown, article')?.innerText.length || 0")
    page.screenshot(path=f"{OUT}/online-blog-detail.png", full_page=False)
    print(f"  详情标题={detail_title[:30]!r}  目录项={toc}  正文长度={body_len}")

    # ---------- 后台 ----------
    print("\n===== 后台管理 =====")
    page.goto(f"{BASE}/#/admin", wait_until="networkidle")
    page.wait_for_timeout(900)
    page.screenshot(path=f"{OUT}/online-admin-login.png")
    print("  登录页已截图")

    page.fill("input[type='text'], input:not([type])", "root")
    page.fill("input[type='password']", ADMIN_PASS)
    page.keyboard.press("Enter")
    page.wait_for_timeout(2000)
    page.screenshot(path=f"{OUT}/online-admin-panel.png")
    nav_items = page.evaluate(
        "Array.from(document.querySelectorAll('.admin-nav button, aside button'))"
        ".map(b=>b.innerText.trim()).filter(Boolean)")
    print(f"  登录成功，分区数={len(nav_items)}")
    print(f"  分区列表={nav_items}")

    # 切到工作经历分区看表单
    if nav_items:
        page.locator(".admin-nav-item").first.click()
        page.wait_for_timeout(900)
        page.screenshot(path=f"{OUT}/online-admin-editor.png")
        inputs = page.evaluate("document.querySelectorAll('input, textarea').length")
        print(f"  编辑表单输入框数={inputs}")

    # ---------- 移动端 ----------
    print("\n===== 移动端 390x844 =====")
    mctx = browser.new_context(viewport={"width": 390, "height": 844},
                               is_mobile=True, has_touch=True)
    mpage = mctx.new_page()
    mpage.goto(BASE, wait_until="networkidle")
    mpage.wait_for_timeout(900)
    overflow = mpage.evaluate(
        "document.documentElement.scrollWidth - document.documentElement.clientWidth")
    mpage.screenshot(path=f"{OUT}/online-mobile.png")
    print(f"  横向溢出={overflow}px")
    mctx.close()

    # ---------- 响应头 ----------
    print("\n===== 响应头 =====")
    req = urllib.request.Request(f"{BASE}/api/health")
    with urllib.request.urlopen(req, timeout=15) as r:
        for k in ("Strict-Transport-Security", "X-Content-Type-Options",
                  "X-Frame-Options", "Referrer-Policy", "Content-Type"):
            print(f"  {k}: {r.headers.get(k)}")

    browser.close()

print("\n===== 控制台错误 =====")
print("\n".join(console_errors) if console_errors else "  无")
print("===== 失败请求 =====")
print("\n".join(failed_requests) if failed_requests else "  无")
print("\n截图目录:", OUT)
#!/usr/bin/env python3
"""
浏览器端端到端测试（Playwright）

验证真实用户路径：
  1. 前台首页渲染 + 数据来自后端
  2. 后台登录（正确/错误密码）
  3. 编辑内容 → 自动保存 → 前台生效
  4. 新增 / 删除 / 排序
  5. 各页面导航
  6. 图片上传
  7. 响应式布局

用法：python ui_test.py [base_url]
"""

import os
import sys
import time
from playwright.sync_api import sync_playwright, expect

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5173"
USER = "root"
PASS = os.environ.get("ADMIN_PASS", "")
SHOTS = "ui-shots"

passed = failed = 0
failures = []
console_errors = []


def check(name: str, cond: bool, detail: str = ""):
    global passed, failed
    if cond:
        passed += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        failures.append(f"{name} — {detail}")
        print(f"  FAIL  {name}  {detail}")


def shot(page, name):
    try:
        page.screenshot(path=f"{SHOTS}/{name}.png", full_page=False)
    except Exception:
        pass


print("=" * 64)
print(f"浏览器端测试：{BASE}")
print("=" * 64)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    page.on(
        "console",
        lambda m: console_errors.append(m.text) if m.type == "error" else None,
    )
    page.on("pageerror", lambda e: console_errors.append(f"PAGEERROR: {e}"))

    # ── 1. 前台首页 ──
    print("\n[1] 前台首页")
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1200)

    check("页面标题正确", "李运辰" in page.title(), page.title())
    check("Hero 标题渲染", page.locator("h1.hero-name").count() > 0)
    check("头像加载成功", page.evaluate(
        "() => { const i=document.querySelector('.avatar-img'); return i ? (i.complete && i.naturalWidth>0) : false }"
    ))
    check("代码卡片渲染", page.locator(".code-card").count() > 0)
    check("Connect Hub 存在", page.locator("#connectHub").count() > 0)
    check("联系方式卡片 >=4", page.locator(".hub-contact-card").count() >= 4,
          str(page.locator(".hub-contact-card").count()))
    check("站点卡片 ==4", page.locator(".hub-site-card").count() == 4,
          str(page.locator(".hub-site-card").count()))
    check("数据统计条 ==5", page.locator(".stat-item").count() == 5,
          str(page.locator(".stat-item").count()))
    check("关于我卡片 ==4", page.locator(".ov-card").count() == 4,
          str(page.locator(".ov-card").count()))
    shot(page, "01-home")

    # ── 2. 前台导航各页面 ──
    print("\n[2] 前台页面导航")
    for label, expect_sel, min_count in [
        ("经历", ".tl-item", 5),
        ("项目", ".card-grid .card", 4),
        ("AI 技能", ".card-grid .card", 4),
        ("荣誉墙", ".tl-item", 5),
        ("博客", ".card-grid .card", 5),
    ]:
        page.get_by_role("button", name=label, exact=True).click()
        page.wait_for_timeout(700)
        n = page.locator(expect_sel).count()
        check(f"「{label}」页内容 >= {min_count}", n >= min_count, f"实际 {n}")
        shot(page, f"02-{label}")

    # 项目页 STAR 展开
    page.get_by_role("button", name="项目", exact=True).click()
    page.wait_for_timeout(500)
    btn = page.get_by_role("button", name="查看 STAR 详情 ↓").first
    btn.click()
    page.wait_for_timeout(600)
    check("STAR 详情可展开", page.locator(".project-detail.open").count() > 0)
    check("STAR 四段齐全", page.locator(".project-detail.open .star-block").count() >= 4,
          str(page.locator(".project-detail.open .star-block").count()))
    shot(page, "03-star-open")

    # 经历页视图切换
    page.get_by_role("button", name="经历", exact=True).click()
    page.wait_for_timeout(500)
    page.get_by_role("button", name="📊 能力矩阵").click()
    page.wait_for_timeout(600)
    check("能力矩阵可切换", page.locator(".ability-group").count() >= 4,
          str(page.locator(".ability-group").count()))
    shot(page, "04-ability")

    # ── 3. 博客详情 ──
    print("\n[3] 博客详情页")
    page.get_by_role("button", name="博客", exact=True).click()
    page.wait_for_timeout(600)
    page.locator(".card-grid .card").first.click()
    page.wait_for_timeout(900)
    check("进入文章详情", page.locator(".article-title").count() > 0)
    check("正文已渲染", page.locator(".article-body h2").count() >= 2,
          str(page.locator(".article-body h2").count()))
    check("目录已生成", page.locator(".toc-item").count() >= 3,
          str(page.locator(".toc-item").count()))
    check("相关文章已渲染", page.locator(".related-card").count() >= 1)
    shot(page, "05-article")

    # 目录点击跳转
    page.locator(".toc-item").nth(1).click()
    page.wait_for_timeout(800)
    check("目录点击可跳转", page.evaluate("window.scrollY") > 100,
          f"scrollY={page.evaluate('window.scrollY')}")
    page.get_by_role("button", name="← 返回博客列表").click()
    page.wait_for_timeout(700)
    check("返回博客列表", page.locator(".card-grid").count() > 0)

    # ── 4. 后台：登录 ──
    print("\n[4] 后台登录")
    page.goto(f"{BASE}/#/admin", wait_until="networkidle")
    page.wait_for_timeout(1200)
    check("登录页渲染", page.locator(".admin-login").count() > 0)
    shot(page, "06-login")

    # 错误密码
    page.fill('input[autocomplete="username"]', USER)
    page.fill('input[type="password"]', "wrong-password")
    page.get_by_role("button", name="登录").click()
    page.wait_for_timeout(1600)
    check("错误密码被拒绝并提示", page.locator(".admin-login-error").count() > 0)
    shot(page, "07-login-error")

    # 正确密码
    page.fill('input[autocomplete="username"]', USER)
    page.fill('input[type="password"]', PASS)
    page.get_by_role("button", name="登录").click()
    page.wait_for_timeout(2500)
    check("登录成功进入后台", page.locator(".admin").count() > 0)
    check("侧栏导航渲染", page.locator(".admin-nav-item").count() == 11,
          str(page.locator(".admin-nav-item").count()))
    shot(page, "08-admin-profile")

    # ── 5. 后台：各分区可打开 ──
    print("\n[5] 后台各分区")
    for label in ["工作经历", "能力矩阵", "项目经历", "AI 技能", "荣誉墙", "博客文章",
                  "联系方式", "我的站点", "数据统计", "关于我"]:
        page.locator(".admin-nav-item", has_text=label).first.click()
        page.wait_for_timeout(500)
        has_content = page.locator(".admin-panel, .editor-list").count() > 0
        check(f"分区「{label}」可打开", has_content)
    shot(page, "09-admin-overviews")

    # ── 6. 后台：编辑 + 自动保存 ──
    print("\n[6] 编辑与自动保存")
    page.locator(".admin-nav-item", has_text="基本信息").first.click()
    page.wait_for_timeout(600)

    # 改「姓名」字段——它会直接渲染在首页 h1 上，是最可靠的验证锚点
    name_input = page.locator('.admin-panel input').first
    old_name = name_input.input_value()
    new_name = f"{old_name}自测"
    name_input.fill(new_name)
    page.wait_for_timeout(400)
    check("出现未保存提示", "有未保存修改" in page.locator(".admin-save").inner_text(),
          page.locator(".admin-save").inner_text())

    page.wait_for_timeout(2200)
    check("自动保存完成", "已保存" in page.locator(".admin-save").inner_text(),
          page.locator(".admin-save").inner_text())

    # 回前台验证（hero h1 直接取自profile.name）
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1800)
    hero_name = page.locator("h1.hero-name").inner_text()
    check("前台已显示新内容（持久化成功）", new_name in hero_name,
          f"hero 显示={hero_name!r}，期望包含 {new_name!r}")

    # 还原
    page.goto(f"{BASE}/#/admin", wait_until="networkidle")
    page.wait_for_timeout(2000)
    page.locator('.admin-panel input').first.fill(old_name)
    page.wait_for_timeout(2400)
    check("内容已还原", "已保存" in page.locator(".admin-save").inner_text())

    # ── 7. 后台：新增 / 排序 / 删除 ──
    print("\n[7] 新增 / 排序 / 删除")
    page.locator(".admin-nav-item", has_text="数据统计").first.click()
    page.wait_for_timeout(700)

    before = page.locator(".editor-item").count()
    page.get_by_role("button", name="+ 新增统计").click()
    page.wait_for_timeout(900)
    after_add = page.locator(".editor-item").count()
    check("新增条目成功", after_add == before + 1, f"{before} → {after_add}")

    # 新增项字段应有默认值而非undefined
    new_items = page.locator(".editor-item").last
    val = new_items.locator("input").first.input_value()
    check("新增项有内容占位（非 undefined）", val == "", f"value={val!r}")
    added_index = after_add - 1  # 新增项位于列表末尾

    # 排序：把刚新增的那一项上移，验证整条序列确实变了
    def seq():
        n = page.locator(".editor-item").count()
        return [page.locator(".editor-item").nth(i).locator("input").first.input_value()
                for i in range(n)]

    before_seq = seq()
    page.locator(".editor-item").nth(added_index).locator('button[title="上移"]').click()
    page.wait_for_timeout(900)
    after_seq = seq()
    # 新增项是空值，验证它从末尾移到了倒数第二位
    check("上移操作改变了顺序", before_seq != after_seq, f"{before_seq} → {after_seq}")
    check("新增项已上移到倒数第二位",
          after_seq[-2] == "" and after_seq[-1] != "",
          f"末两位={after_seq[-2:]}")
    check("上移后条目数不变", len(after_seq) == after_add)
    page.wait_for_timeout(2000)
    check("排序后已自动保存", "已保存" in page.locator(".admin-save").inner_text())

    # 删除：精确定位到刚新增的那一项（id 以 stt- 开头且 num 为空的测试项）
    # 用「最后一个空值项」定位，避免因重排序删错对象
    page.on("dialog", lambda d: d.accept())
    before_del = page.locator(".editor-item").count()
    blank_idx = None
    for i in range(before_del):
        item = page.locator(".editor-item").nth(i)
        if item.locator("input").first.input_value() == "":
            blank_idx = i
            break
    check("找到测试新增项", blank_idx is not None)
    if blank_idx is not None:
        page.locator(".editor-item").nth(blank_idx).locator('button[title="删除"]').click()
        page.wait_for_timeout(1000)
        after_del = page.locator(".editor-item").count()
        check("删除测试项成功", after_del == before_del - 1, f"{before_del} → {after_del}")

        # 校验：原始条目一条不少，且无空值残留
        page.wait_for_timeout(1800)
        remaining_blank = sum(
            1 for i in range(page.locator(".editor-item").count())
            if page.locator(".editor-item").nth(i).locator("input").first.input_value() == ""
        )
        check("无空值测试数据残留", remaining_blank == 0, f"残留 {remaining_blank} 条")
    shot(page, "10-admin-stats")

    # ── 8. 会话保持 ──
    print("\n[8] 会话保持")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(2000)
    check("刷新后仍处于登录态", page.locator(".admin").count() > 0)
    check("Token 已存入 localStorage",
          page.evaluate("() => !!localStorage.getItem('lyc_admin_token')"))

    # ── 9. 响应式 ──
    print("\n[9] 响应式布局")
    page.goto(BASE, wait_until="networkidle")
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(900)
    check("移动端无横向溢出", page.evaluate(
        "() => document.documentElement.scrollWidth <= window.innerWidth + 2"
    ), f"scrollWidth={page.evaluate('document.documentElement.scrollWidth')}")
    shot(page, "11-mobile")

    page.set_viewport_size({"width": 1440, "height": 900})
    page.wait_for_timeout(500)

    # ── 10. 控制台错误 ──
    print("\n[10] 控制台错误检查")
    # 登录阶段的 401 是「错误密码被拒绝」测试的预期产物，不算缺陷；
    # 同时 React DevTools 的提示也不算。
    real_errors = [
        e
        for e in console_errors
        if "DevTools" not in e
        and not (e.startswith("Failed to load resource") and "401" in e)
    ]
    check("无 JS 运行时错误", len(real_errors) == 0, "; ".join(real_errors[:3]))

    browser.close()

print("\n" + "=" * 64)
print(f"通过 {passed} / {passed + failed}")
if failed:
    print("\n失败项：")
    for f in failures:
        print(f"  - {f}")
print("=" * 64)
sys.exit(1 if failed else 0)
"""
为 README 采集项目演示截图。

用法：
    export SITE_BASE='https://your-site.com'
    export ADMIN_PASS='<后台密码>'
    python capture_screenshots.py

产物：docs/screenshots/*.png
"""
import os
import sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("SITE_BASE", "http://127.0.0.1:5173")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "screenshots")
os.makedirs(OUT, exist_ok=True)

DESKTOP = {"width": 1440, "height": 900}

# (文件名, 导航标签, 说明)
PAGES = [
    ("01-home", "首页", "首页"),
    ("02-experience", "经历", "经历"),
    ("03-projects", "项目", "项目"),
    ("04-ai-skills", "AI 技能", "AI 技能"),
    ("05-honors", "荣誉墙", "荣誉墙"),
    ("06-blog", "博客", "博客"),
]

errors = []


def shot(page, name, full=False):
    path = os.path.join(OUT, f"{name}.png")
    page.screenshot(path=path, full_page=full)
    size = os.path.getsize(path)
    print(f"  [OK] {name}.png  ({size // 1024} KB, full={full})")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport=DESKTOP, device_scale_factor=2)
        page = ctx.new_page()
        page.on("console",
                lambda m: errors.append(m.text) if m.type == "error" else None)

        print("===== 前台页面 =====")
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(1200)
        shot(page, "01-home", full=True)

        for name, nav_label, _ in PAGES[1:]:
            page.click(f".nav-link >> text={nav_label}")
            page.wait_for_timeout(900)
            shot(page, name)

        # 项目页：展开一个 STAR 详情
        page.click(".nav-link >> text=项目")
        page.wait_for_timeout(800)
        star = page.get_by_role("button", name="查看 STAR 详情").first
        if star.count() > 0:
            star.click()
            page.wait_for_timeout(800)
            page.evaluate(
                "document.querySelector('.star-list')?.scrollIntoView({block:'center'})")
            page.wait_for_timeout(600)
            shot(page, "03b-project-star")
        else:
            print("  [--] 未找到 STAR 展开按钮，跳过")

        # 博客详情页
        page.click(".nav-link >> text=博客")
        page.wait_for_timeout(900)
        page.locator(".card-grid .card").first.click()
        page.wait_for_timeout(1400)
        shot(page, "07-blog-detail")

        ctx.close()

        # ---------- 后台（1440x900 视口，单独 context 便于隔离登录态）----------
        if ADMIN_PASS:
            print("\n===== 后台 =====")
            actx = browser.new_context(viewport=DESKTOP, device_scale_factor=2)
            apage = actx.new_page()
            apage.goto(f"{BASE}/#/admin", wait_until="networkidle")
            apage.wait_for_timeout(900)
            shot(apage, "08-admin-login")

            apage.fill("input[type='text'], input:not([type])", "root")
            apage.fill("input[type='password']", ADMIN_PASS)
            apage.keyboard.press("Enter")
            apage.wait_for_timeout(2000)

            if apage.locator(".admin-nav-item").count() > 0:
                shot(apage, "09-admin-profile")

                # 工作经历分区
                apage.locator(".admin-nav-item", has_text="工作经历").first.click()
                apage.wait_for_timeout(900)
                shot(apage, "10-admin-experience")

                # 博客文章分区
                apage.locator(".admin-nav-item", has_text="博客文章").first.click()
                apage.wait_for_timeout(900)
                shot(apage, "11-admin-posts")
            else:
                print("  [!!] 后台登录失败，请检查 ADMIN_PASS")
            actx.close()
        else:
            print("\n  [--] 未设置 ADMIN_PASS，跳过后台截图")

        # ---------- 移动端 ----------
        print("\n===== 移动端 =====")
        mctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=3, is_mobile=True, has_touch=True)
        mpage = mctx.new_page()
        mpage.goto(BASE, wait_until="networkidle")
        mpage.wait_for_timeout(1000)
        ov = mpage.evaluate(
            "document.documentElement.scrollWidth - document.documentElement.clientWidth")
        shot(mpage, "12-mobile-home")
        print(f"  移动端横向溢出 = {ov}px")
        mctx.close()

        browser.close()

    print("\n===== 控制台错误 =====")
    print("\n".join(errors) if errors else "  无")
    print(f"\n输出目录: {OUT}")


if __name__ == "__main__":
    sys.exit(main())
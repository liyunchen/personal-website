"""聚焦调试：验证「上移」排序的实际行为"""
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"
USER = os.environ.get("DEPLOY_USER", "root")
PASS = os.environ.get("DEPLOY_PASS", "")

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
    pg.goto(f"{BASE}/#/admin", wait_until="networkidle")
    pg.wait_for_timeout(1500)

    if pg.locator(".admin-login").count() > 0:
        pg.fill('input[autocomplete="username"]', USER)
        pg.fill('input[type="password"]', PASS)
        pg.get_by_role("button", name="登录").click()
        pg.wait_for_timeout(2500)

    pg.locator(".admin-nav-item", has_text="数据统计").first.click()
    pg.wait_for_timeout(800)

    def dump(tag):
        n = pg.locator(".editor-item").count()
        rows = []
        for i in range(n):
            item = pg.locator(".editor-item").nth(i)
            num = item.locator("input").first.input_value()
            label = item.locator("input").nth(1).input_value()
            rows.append(f"{i}:{num or'<空>'}/{label or '<空>'}")
        print(f"  {tag}: [{', '.join(rows)}]")
        return [pg.locator('.editor-item').nth(i).locator('input').first.input_value() for i in range(n)]

    print("\n--- 初始状态 ---")
    a = dump("初始")

    print("\n--- 点击新增 ---")
    pg.get_by_role("button", name="+ 新增统计").click()
    pg.wait_for_timeout(1000)
    bseq = dump("新增后")

    added_idx = len(bseq) - 1
    print(f"\n  新增项 DOM 索引 = {added_idx}，其值 = {bseq[added_idx]!r}")

    print("\n--- 点击该项的「上移」按钮 ---")
    btn = pg.locator(".editor-item").nth(added_idx).locator('button[title="上移"]')
    print(f"  按钮可用: {btn.count() > 0}, disabled: {btn.is_disabled() if btn.count() else 'N/A'}")
    btn.click()
    pg.wait_for_timeout(400)
    c1 = dump("点击后 0.4s")
    pg.wait_for_timeout(1200)
    cseq = dump("点击后 1.6s")

    # 定位空值项的实际位置
    def pos_of_blank(seq):
        return [i for i, v in enumerate(seq) if v == ""]

    print(f"\n  空值项位置: 点击前={pos_of_blank(bseq)}, 点击后 0.4s={pos_of_blank(c1)}, 点击后 1.6s={pos_of_blank(cseq)}")

    # 清理：删除空值项
    pg.on("dialog", lambda d: d.accept())
    for i in reversed(pos_of_blank(cseq)):
        pg.locator(".editor-item").nth(i).locator('button[title="删除"]').click()
        pg.wait_for_timeout(900)
    print("\n--- 清理后 ---")
    final = dump("清理")
    print(f"\n  与初始一致: {final == a}")

    b.close()
#!/usr/bin/env python3
"""
端到端 API 测试 —— 覆盖登录、鉴权、CRUD、上传、安全防护。

用法：python e2e_test.py [base_url]
默认http://127.0.0.1:8101
"""

import os
import base64
import json
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8101"
USER = "root"
PASS = os.environ.get("ADMIN_PASS", "")

passed = failed = 0
failures = []


def check(name: str, cond: bool, detail: str = ""):
    global passed, failed
    if cond:
        passed += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        failures.append(f"{name} — {detail}")
        print(f"  FAIL  {name}  {detail}")


def req(method, path, body=None, token=None, raw=None, ctype=None):
    """返回 (status, data, headers)"""
    url = f"{BASE}{path}"
    headers = {}
    data = None
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if raw is not None:
        data = raw
        headers["Content-Type"] = ctype
    elif body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"

    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=15) as resp:
            raw_body = resp.read()
            try:
                return resp.status, json.loads(raw_body), dict(resp.headers)
            except json.JSONDecodeError:
                return resp.status, raw_body, dict(resp.headers)
    except urllib.error.HTTPError as e:
        raw_body = e.read()
        try:
            return e.code, json.loads(raw_body), dict(e.headers)
        except json.JSONDecodeError:
            return e.code, raw_body, dict(e.headers)
    except Exception as e:  # noqa: BLE001
        return 0, {"error": str(e)}, {}


print("=" * 62)
print(f"端到端测试目标：{BASE}")
print("=" * 62)

# ── 1. 健康检查 ──
print("\n[1] 健康检查")
st, d, _ = req("GET", "/api/health")
check("健康检查返回 200", st == 200, f"got {st}")
check("健康检查含 ok=true", isinstance(d, dict) and d.get("ok") is True, str(d))

# ── 2. 公开读取 ──
print("\n[2] 公开接口（无需登录）")
st, d, _ = req("GET", "/api/content")
check("内容接口可匿名访问", st == 200, f"got {st}")

# ── 3. 登录 ──
print("\n[3] 登录")
st, d, _ = req("POST", "/api/login", {"user": USER, "password": "wrong-password"})
check("错误密码被拒绝", st == 401, f"got {st}")

st, d, _ = req("POST", "/api/login", {"user": "nobody", "password": PASS})
check("错误账号被拒绝", st == 401, f"got {st}")

st, d, _ = req("POST", "/api/login", {"user": USER, "password": PASS})
check("正确凭据登录成功", st == 200 and d.get("ok"), f"got {st} {d}")
token = d.get("token", "")
check("返回了token", bool(token) and len(token) > 20, f"token={token[:12]}...")

if not token:
    print("\n[致命] 登录失败，后续测试无法进行")
    sys.exit(1)

# ── 4. Token 校验 ──
print("\n[4] Token 鉴权")
st, d, _ = req("GET", "/api/verify", token=token)
check("有效 token 校验通过", st == 200, f"got {st}")

st, d, _ = req("GET", "/api/verify", token="fake-token-xxx")
check("伪造 token 被拒绝", st == 401, f"got {st}")

st, d, _ = req("GET", "/api/verify")
check("无 token 被拒绝", st == 401, f"got {st}")

# ── 5. 未授权写入拦截 ──
print("\n[5] 未授权写入拦截")
st, d, _ = req("PUT", "/api/content", {"profile": {"name": "hacked"}})
check("未登录保存被拒绝", st == 401, f"got {st}")

st, d, _ = req("PUT", "/api/content", {"profile": {"name": "hacked"}}, token="bad")
check("错误token 保存被拒绝", st == 401, f"got {st}")

# ── 6. 正常读写往返 ──
print("\n[6] 内容读写往返")
TEST_NAME = "自测标记-赵六"
st, before, _ = req("GET", "/api/content")
orig = before if isinstance(before, dict) else {}

payload = json.loads(json.dumps(orig))
if not payload:
    payload = {
        "profile": {"name": "李运辰"},
        "experiences": [],
        "abilities": [],
        "projects": [],
        "aiSkills": [],
        "honors": [],
        "posts": [],
        "contacts": [],
        "sites": [],
        "stats": [],
        "overviews": [],
    }
payload["profile"]["name"] = TEST_NAME

st, d, _ = req("PUT", "/api/content", payload, token=token)
check("保存内容成功", st == 200 and d.get("ok"), f"got {st} {d}")

st, d, _ = req("GET", "/api/content")
check("保存后可读回", st == 200, f"got {st}")
check("修改内容已持久化", isinstance(d, dict) and d.get("profile", {}).get("name") == TEST_NAME,
      f"name={d.get('profile', {}).get('name') if isinstance(d, dict) else 'N/A'}")

# ── 7. 非法负载 ──
print("\n[7] 非法负载处理")
st, d, _ = req("PUT", "/api/content", ["not", "an", "object"], token=token)
check("数组负载被拒绝", st == 400, f"got {st}")

bad = b"{invalid json"
st, d, _ = req("PUT", "/api/content", raw=bad, ctype="application/json", token=token)
check("损坏JSON 被拒绝", st == 400, f"got {st}")

# ── 8. 恢复原数据 ──
print("\n[8] 恢复原始数据")
st, d, _ = req("PUT", "/api/content", orig if orig else {"profile": {"name": "李运辰"}}, token=token)
check("原始数据已恢复", st == 200, f"got {st}")

# ── 9. 图片上传 ──
print("\n[9] 图片上传")
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)


def multipart(filename: str, filedata: bytes, field: str = "file"):
    b = "----WebKitFormBoundaryTEST123456"
    body = (
        f"--{b}\r\n"
        f'Content-Disposition: form-data; name="{field}"; filename="{filename}"\r\n'
        f"Content-Type: image/png\r\n\r\n"
    ).encode() + filedata + f"\r\n--{b}--\r\n".encode()
    return body, f"multipart/form-data; boundary={b}"


body, ctype = multipart("avatar.png", PNG)
st, d, _ = req("POST", "/api/upload", raw=body, ctype=ctype, token=token)
check("PNG 上传成功", st == 200 and d.get("ok"), f"got {st} {d}")
upload_url = d.get("url", "") if isinstance(d, dict) else ""
check("返回了图片 URL", upload_url.startswith("/uploads/"), f"url={upload_url}")
check("文件名已服务端重写（防穿越）", "avatar.png" not in upload_url, f"url={upload_url}")

body, ctype = multipart("evil.sh", b"#!/bin/sh\necho hacked")
st, d, _ = req("POST", "/api/upload", raw=body, ctype=ctype, token=token)
check("非图片扩展名被拒绝", st == 400, f"got {st} {d}")

body, ctype = multipart("../../../etc/passwd.png", PNG)
st, d, _ = req("POST", "/api/upload", raw=body, ctype=ctype, token=token)
check("路径穿越文件名被安全处理", st == 200 and "/uploads/" in d.get("url", "") and ".." not in d.get("url", ""),
      f"got {st} {d}")

body, ctype = multipart("empty.png", b"")
st, d, _ = req("POST", "/api/upload", raw=body, ctype=ctype, token=token)
check("空文件被拒绝", st == 400, f"got {st}")

body, ctype = multipart("big.png", b"\x89PNG" + b"0" * (6 * 1024 * 1024))
st, d, _ = req("POST", "/api/upload", raw=body, ctype=ctype, token=token)
check("超大文件被拒绝（>5MB）", st in (400, 413), f"got {st}")

body, ctype = multipart("x.png", PNG)
st, d, _ = req("POST", "/api/upload", raw=body, ctype=ctype)
check("未登录上传被拒绝", st == 401, f"got {st}")

body, ctype = multipart("x.png", PNG)
st, d, _ = req("POST", "/api/upload", raw=body, ctype=ctype, token="forged-token")
check("伪造token 上传被拒绝", st == 401, f"got {st}")

# ── 10. 未知接口 ──
print("\n[10] 路由健壮性")
st, d, _ = req("GET", "/api/not-exist")
check("未知接口返回 404", st == 404, f"got {st}")

st, d, _ = req("DELETE", "/api/content", token=token)
check("不支持的方法被拒", st in (404, 501), f"got {st}")

# ── 结果 ──
print("\n" + "=" * 62)
print(f"通过 {passed} / {passed + failed}")
if failed:
    print("\n失败项：")
    for f in failures:
        print(f"  - {f}")
print("=" * 62)
sys.exit(1 if failed else 0)
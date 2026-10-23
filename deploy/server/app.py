#!/usr/bin/env python3
"""
李运辰个人站 · 后端 API 服务

零第三方依赖，仅用Python 标准库。基于 http.server，适合单人使用的管理后台。

接口：
  GET    /api/content      读取全站内容（公开，无需登录）
  POST   /api/login        登录，返回 token
  GET    /api/verify       校验 token
  PUT    /api/content      保存全站内容（需登录）
  POST   /api/upload       上传图片（需登录）
  GET    /api/health       健康检查

设计要点：
  - 密码不存明文，配置文件里存 PBKDF2 哈希
  - token 存哈希到内存 + 落盘，重启后需重新登录（可接受）
  - 内容存储为单个 JSON 文件，写入用「临时文件 + 原子替换」
  - 上传文件校验类型与大小，文件名服务端重新生成（防路径穿越）
"""

import hashlib
import hmac
import json
import os
import secrets
import sys
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

# ────────────────────── 配置 ──────────────────────

HOST = os.environ.get("API_HOST", "127.0.0.1")
PORT = int(os.environ.get("API_PORT", "8101"))
BASE_DIR = os.environ.get("API_BASE_DIR", os.path.dirname(os.path.abspath(__file__)))

DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
CONTENT_FILE = os.path.join(DATA_DIR, "content.json")
TOKEN_FILE = os.path.join(DATA_DIR, "tokens.json")

ADMIN_USER = os.environ.get("ADMIN_USER", "root")
ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH", "")
ADMIN_PASS_SALT = os.environ.get("ADMIN_PASS_SALT", "")

MAX_BODY = 12 * 1024 * 1024# 12MB（内容 JSON 可能较大）
MAX_UPLOAD = 5 * 1024 * 1024      # 5MB
TOKEN_TTL = 7 * 24 * 3600        # 7 天

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}

for d in (DATA_DIR, UPLOAD_DIR):
    os.makedirs(d, exist_ok=True)


# ────────────────────── 工具函数 ──────────────────────

def hash_pass(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()


def gen_salt() -> str:
    return secrets.token_hex(16)


def new_token() -> str:
    return secrets.token_urlsafe(32)


def token_fingerprint(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()


def read_json(path: str, default):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json_atomic(path: str, data) -> bool:
    """原子写入：先写临时文件再替换，避免进程中断导致文件损坏。"""
    tmp = f"{path}.tmp.{os.getpid()}"
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
        return True
    except OSError:
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
            except OSError:
                pass
        return False


def load_tokens() -> dict:
    data = read_json(TOKEN_FILE, {})
    now = time.time()
    # 顺手清理过期 token
    live = {k: v for k, v in data.items() if v.get("exp", 0) > now}
    if len(live) != len(data):
        write_json_atomic(TOKEN_FILE, live)
    return live


def verify_token(headers) -> bool:
    auth = headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return False
    fp = token_fingerprint(auth[7:].strip())
    return fp in load_tokens()


def ensure_credentials() -> None:
    """首次启动若未配置密码哈希，用环境变量里的明文生成并打印配置建议。"""
    global ADMIN_PASS_HASH, ADMIN_PASS_SALT
    if ADMIN_PASS_HASH and ADMIN_PASS_SALT:
        return
    plain = os.environ.get("ADMIN_PASS")
    if not plain:
        print("[FATAL] 未配置 ADMIN_PASS_HASH / ADMIN_PASS_SALT", file=sys.stderr)
        sys.exit(1)
    ADMIN_PASS_SALT = gen_salt()
    ADMIN_PASS_HASH = hash_pass(plain, ADMIN_PASS_SALT)
    print(f"[SETUP] ADMIN_PASS_HASH={ADMIN_PASS_HASH}")
    print(f"[SETUP] ADMIN_PASS_SALT={ADMIN_PASS_SALT}")


# ────────────────────── 请求处理器 ──────────────────────

class Handler(BaseHTTPRequestHandler):
    server_version = "PortfolioAPI/1.0"
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        # 只记录异常，屏蔽正常的 GET 日志噪音
        if args and len(args) > 1 and str(args[1]).startswith(("4", "5")):
            print(f"[HTTP] {self.address_string()} {fmt % args}", file=sys.stderr)

    # ---- 响应工具 ----

    def _send(self, code: int, body: bytes, ctype: str, extra: dict | None = None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def json_response(self, code: int, data, extra: dict | None = None):
        self._send(code, json.dumps(data, ensure_ascii=False).encode("utf-8"),
                   "application/json; charset=utf-8", extra)

    def error(self, code: int, msg: str):
        self.json_response(code, {"error": msg})

    def read_body(self, limit: int = MAX_BODY) -> bytes | None:
        """读取请求体。超过 limit 时返回 (None) 并已发送错误响应。"""
        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            self.error(400, "Content-Length 无效")
            return None
        if length > limit:
            # 关键：必须先把剩余请求体消费掉，再返回错误。
            # 否则客户端在收到响应前就看到连接重置，拿不到状态码。
            self._drain(length)
            self.error(413, f"请求体过大（上限 {limit // 1024 // 1024}MB）")
            return None
        try:
            return self.rfile.read(length)
        except (TimeoutError, ConnectionResetError):
            return None

    def _drain(self, length: int, chunk: int = 64 * 1024) -> None:
        """丢弃超限请求体，让连接能正常收尾。"""
        remaining = length
        while remaining > 0:
            try:
                n = self.rfile.read(min(chunk, remaining))
            except (TimeoutError, ConnectionResetError, OSError):
                return
            if not n:
                return
            remaining -= len(n)

    # ---- 路由 ----

    def do_GET(self):
        path = urlparse(self.path).path.rstrip("/") or "/"

        if path == "/api/health":
            self.json_response(200, {"ok": True, "ts": int(time.time())})
        elif path in ("/api/content", "/api"):
            self.json_response(200, read_json(CONTENT_FILE, {}))
        elif path == "/api/verify":
            if verify_token(self.headers):
                self.json_response(200, {"ok": True})
            else:
                self.json_response(401, {"ok": False, "error": "登录已失效"})
        else:
            self.error(404, "接口不存在")

    def do_POST(self):
        path = urlparse(self.path).path.rstrip("/") or "/"

        if path == "/api/login":
            self.handle_login()
        elif path == "/api/upload":
            self.handle_upload()
        else:
            self.error(404, "接口不存在")

    def do_PUT(self):
        path = urlparse(self.path).path.rstrip("/") or "/"
        if path in ("/api/content", "/api"):
            self.handle_save()
        else:
            self.error(404, "接口不存在")

    # ---- 业务处理 ----

    def handle_login(self):
        body = self.read_body()
        if body is None:
            return
        try:
            data = json.loads(body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return self.error(400, "请求格式错误")

        user = str(data.get("user", ""))
        password = str(data.get("password", ""))

        # 恒定时间比较，避免时序侧信道
        user_ok = hmac.compare_digest(user, ADMIN_USER)
        pass_ok = hmac.compare_digest(hash_pass(password, ADMIN_PASS_SALT), ADMIN_PASS_HASH)

        if not (user_ok and pass_ok):
            time.sleep(0.5)  # 简单限速
            return self.error(401, "账号或密码错误")

        token = new_token()
        tokens = load_tokens()
        tokens[token_fingerprint(token)] = {
            "exp": time.time() + TOKEN_TTL,
            "ua": self.headers.get("User-Agent", "")[:120],
        }
        write_json_atomic(TOKEN_FILE, tokens)
        self.json_response(200, {"ok": True, "token": token})

    def handle_save(self):
        if not verify_token(self.headers):
            return self.error(401, "请先登录")
        body = self.read_body()
        if body is None:
            return
        try:
            data = json.loads(body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return self.error(400, "请求格式错误")
        if not isinstance(data, dict):
            return self.error(400, "数据格式错误")

        if write_json_atomic(CONTENT_FILE, data):
            self.json_response(200, {"ok": True, "ts": int(time.time())})
        else:
            self.error(500, "保存失败，请检查服务器磁盘空间")

    def handle_upload(self):
        if not verify_token(self.headers):
            return self.error(401, "请先登录")

        ctype = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ctype:
            return self.error(400, "请求格式错误")

        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            return self.error(400, "Content-Length 无效")
        if length > MAX_UPLOAD + 4096:
            self._drain(length)
            return self.error(413, "图片超过 5MB 限制")

        body = self.read_body(MAX_UPLOAD + 8192)
        if body is None:
            return

        # 解析 multipart：定位 filename 与文件内容
        boundary = ""
        for part in ctype.split(";"):
            part = part.strip()
            if part.startswith("boundary="):
                boundary = part[9:].strip('"')
        if not boundary:
            return self.error(400, "缺少 boundary")

        marker = f"--{boundary}".encode()
        segments = body.split(marker)
        payload = None
        original_name = ""

        for seg in segments:
            if b"filename" in seg and b"\r\n\r\n" in seg:
                head, data = seg.split(b"\r\n\r\n", 1)
                data = data.rstrip(b"\r\n-")
                # 只取第一段，避免误取其它字段
                if not filename_in_head(head):
                    continue
                for line in head.split(b"\r\n"):
                    if b"filename" in line:
                        original_name = line.split(b"filename=")[1].strip().strip(b'"').decode(
                            "utf-8", "replace"
                        )
                        break
                payload = data
                break

        if not payload:
            return self.error(400, "未找到上传的文件")

        ext = os.path.splitext(original_name)[1].lower()
        if ext not in ALLOWED_IMAGE_EXT:
            return self.error(400, "只支持 jpg / png / webp / gif")
        if len(payload) > MAX_UPLOAD:
            return self.error(413, "图片超过 5MB 限制")
        if not payload:
            return self.error(400, "文件为空")

        # 服务端重新生成文件名，杜绝路径穿越与同名覆盖
        fname = f"{uuid.uuid4().hex}{ext}"
        fpath = os.path.join(UPLOAD_DIR, fname)
        try:
            with open(fpath, "wb") as f:
                f.write(payload)
        except OSError:
            return self.error(500, "保存图片失败")

        url = f"/uploads/{fname}"
        self.json_response(200, {"ok": True, "url": url, "size": len(payload)})

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Allow", "GET, POST, PUT, OPTIONS")
        self.end_headers()


def filename_in_head(head: bytes) -> bool:
    return b"filename=" in head


# ────────────────────── 启动 ──────────────────────

def main():
    ensure_credentials()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"[OK] API 已启动 http://{HOST}:{PORT}", flush=True)
    print(f"[OK] 数据目录 {DATA_DIR}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[EXIT] 已停止", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
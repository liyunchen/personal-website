"""
SSH 辅助工具：连接 Ubuntu 服务器执行命令 / 上传文件。
密码仅从环境变量 DEPLOY_PASS 读取，不写入磁盘、不打印。
"""
import os
import sys
import posixpath
import paramiko

HOST = os.environ.get("DEPLOY_HOST", "127.0.0.1")
PORT = int(os.environ.get("DEPLOY_PORT", "22"))
USER = os.environ.get("DEPLOY_USER", "root")
PASS = os.environ.get("DEPLOY_PASS", "")


def connect(timeout: int = 20) -> paramiko.SSHClient:
    if not PASS:
        raise SystemExit("环境变量 DEPLOY_PASS 未设置")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        hostname=HOST,
        port=PORT,
        username=USER,
        password=PASS,
        timeout=timeout,
        banner_timeout=timeout,
        auth_timeout=timeout,
        look_for_keys=False,
        allow_agent=False,
    )
    return client


def run(client, cmd: str, timeout: int = 300, show: bool = True):
    """执行命令，返回 (exit_code, stdout, stderr)。"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    if show:
        tag = "OK " if code == 0 else "ERR"
        print(f"[{tag}] exit={code}")
        if out.strip():
            print(out.rstrip())
        if err.strip():
            print("--- stderr ---")
            print(err.rstrip())
    return code, out, err


def _normalize_remote(path: str) -> str:
    """把 Windows 风格的绝对路径转成 SFTP 能识别的 POSIX 绝对路径。

    Git Bash 会把 /www/... 改写成 <msys-root>/www/...，
    这里显式还原成真正的 POSIX 路径。
    """
    # Git Bash 的伪根，形如 D:/rj/.../PortableGit
    for marker in ("/PortableGit/", "/Git/"):
        idx = path.find(marker)
        if idx != -1:
            return "/" + path[idx + len(marker):]
    return path


def upload(client, local: str, remote: str):
    """上传单个文件，确保远端目录存在。"""
    remote = _normalize_remote(remote)
    sftp = client.open_sftp()
    parent = posixpath.dirname(remote)
    if parent:
        try:
            sftp.stat(parent)
        except FileNotFoundError:
            run(client, f'mkdir -p "{parent}"', show=False)
    local = _normalize_remote(os.path.abspath(local))
    sftp.put(local, remote)
    size = sftp.stat(remote).st_size
    sftp.close()
    print(f"[UPLOAD] {local} -> {remote} ({size} bytes)")


def main():
    action = sys.argv[1] if len(sys.argv) > 1 else "info"

    client = connect()
    try:
        if action == "info":
            run(
                client,
                "echo '=== OS ==='; cat /etc/os-release | head -3; "
                "echo '=== UPTIME ==='; uptime; "
                "echo '=== WEB SERVERS ==='; which nginx apache2 caddy 2>/dev/null; "
                "echo '=== PORTS ==='; ss -tlnp | grep -E ':(80|443|22)\\s' || netstat -tlnp 2>/dev/null | grep -E ':(80|443|22)'; "
                "echo '=== NGINX SITES ==='; ls -la /etc/nginx/sites-enabled/ 2>/dev/null; "
                "echo '=== NODE ==='; node -v 2>/dev/null || echo 'no node'; "
                "echo '=== PYTHON ==='; python3 -V 2>/dev/null; "
                "echo '=== CERTBOT ==='; certbot --version 2>/dev/null || echo 'no certbot'; "
                "echo '=== DISK ==='; df -h / | tail -1",
            )
        elif action == "run":
            run(client, sys.argv[2])
        elif action == "put":
            upload(client, _normalize_remote(sys.argv[2]), sys.argv[3])
    finally:
        client.close()


if __name__ == "__main__":
    main()
"""
批量上传前端 dist 产物到服务器。
递归遍历本地 dist，所有文件逐个 SFTP 上传。
"""
import os
import sys
import posixpath
import ssh_helper as H

LOCAL_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "portfolio", "dist")
REMOTE_DIST = os.environ.get(
    "REMOTE_DIST", "/www/wwwroot/your-project/dist")


def walk(local_dir, remote_dir, client, results):
    if not os.path.isdir(local_dir):
        print(f"[SKIP] 目录不存在: {local_dir}")
        return
    H.run(client, f'mkdir -p "{remote_dir}"', show=False)
    for name in sorted(os.listdir(local_dir)):
        lp = os.path.join(local_dir, name)
        rp = posixpath.join(remote_dir, name)
        if os.path.isdir(lp):
            walk(lp, rp, client, results)
        else:
            try:
                H.upload(client, lp, rp)
                results.append((rp, "ok"))
            except Exception as exc:  # noqa: BLE001
                print(f"[FAIL] {lp} -> {rp}: {exc}")
                results.append((rp, f"fail: {exc}"))


def main():
    client = H.connect()
    results = []
    try:
        H.run(client, f'rm -rf "{REMOTE_DIST}" && mkdir -p "{REMOTE_DIST}"')
        walk(LOCAL_DIST, REMOTE_DIST, client, results)
        H.run(client, f'chmod -R 755 "{REMOTE_DIST}"; echo "=== 远端文件清单 ==="; '
                      f'ls -laR "{REMOTE_DIST}"')
    finally:
        client.close()

    ok = sum(1 for _, s in results if s == "ok")
    bad = [r for r, s in results if s != "ok"]
    print("\n===== 上传汇总 =====")
    print(f"成功 {ok} 个，失败 {len(bad)} 个")
    for r, s in bad:
        print(f"  FAIL {r}: {s}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
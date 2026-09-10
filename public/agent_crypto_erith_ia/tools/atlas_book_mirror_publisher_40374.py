#!/usr/bin/env python3
"""Agent-Crypto 40.3.74 — trusted local Book Mirror publisher.

Runs ONLY on the Ryzen producer and binds to 127.0.0.1. The GitHub Pages UI
never receives or stores a GitHub token. This companion accepts one validated
Book mirror payload and updates exactly one repository path.

Authentication order:
  1. AGENT_CRYPTO_GITHUB_TOKEN or GITHUB_TOKEN environment variable
  2. `gh auth token` (GitHub CLI credential store)
  3. Git Credential Manager (`git credential fill`)

The credential needs Contents: read/write access to BlueAzur-Hub/erith-ia-memory.
"""
from __future__ import annotations

import argparse, base64, json, os, re, shutil, subprocess, sys, threading, urllib.error, urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

BUILD = "40.3.74"
SCHEMA = "agent_crypto_book_mirror_v36"
DEFAULT_REPO = "BlueAzur-Hub/erith-ia-memory"
DEFAULT_BRANCH = "main"
DEFAULT_PATH = "public/agent_crypto_erith_ia/administrator/book_mirror.json"
ALLOWED_ORIGINS = {
    "https://blueazur-hub.github.io",
    "http://127.0.0.1",
    "http://localhost",
}
FINGERPRINT_RE = re.compile(r"^(?:sha256:)?[0-9a-fA-F]{64}$")
MAX_BODY = 2_500_000


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def get_token() -> tuple[str, str]:
    for key in ("AGENT_CRYPTO_GITHUB_TOKEN", "GITHUB_TOKEN"):
        value = os.environ.get(key, "").strip()
        if value:
            return value, f"env:{key}"
    gh = shutil.which("gh")
    if gh:
        try:
            cp = subprocess.run([gh, "auth", "token"], capture_output=True, text=True, timeout=8, check=True)
            value = cp.stdout.strip()
            if value:
                return value, "gh-cli"
        except Exception:
            pass
    git = shutil.which("git")
    if git:
        try:
            cp = subprocess.run(
                [git, "credential", "fill"],
                input="protocol=https\nhost=github.com\n\n",
                capture_output=True, text=True, timeout=12, check=True
            )
            fields = dict(line.split("=", 1) for line in cp.stdout.splitlines() if "=" in line)
            value = str(fields.get("password") or "").strip()
            if value:
                return value, "git-credential-manager"
        except Exception:
            pass
    return "", "none"


def api_request(method: str, url: str, token: str, payload: dict[str, Any] | None = None) -> tuple[int, dict[str, Any]]:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": f"Agent-Crypto-Book-Mirror-Publisher/{BUILD}",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if data is not None:
        headers["Content-Type"] = "application/json; charset=utf-8"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            raw = r.read().decode("utf-8", "replace")
            return r.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        try: body = json.loads(raw) if raw else {}
        except Exception: body = {"message": raw}
        return e.code, body


def validate_mirror(payload: Any) -> tuple[bool, str]:
    if not isinstance(payload, dict): return False, "payload JSON objet requis"
    if payload.get("schema") != SCHEMA: return False, f"schema attendu: {SCHEMA}"
    if payload.get("observation_only") is not True: return False, "observation_only doit être true"
    fp = str(payload.get("fingerprint") or "").strip()
    if not FINGERPRINT_RE.match(fp): return False, "fingerprint SHA-256 invalide"
    execution = payload.get("execution") or {}
    if str(execution.get("producer") or "").lower() != "ryzen": return False, "producteur Ryzen requis"
    if execution.get("book_ollama") is not False or execution.get("book_bridge") is not False:
        return False, "contrat Book STOP requis"
    pkg = payload.get("package")
    if not isinstance(pkg, dict): return False, "package absent"
    status = pkg.get("status") or {}
    if str(status.get("atlas_reports") or "") != "4/4": return False, "Atlas 4/4 requis"
    conclusion = pkg.get("conclusion") or {}
    if not str(conclusion.get("answer") or "").strip(): return False, "conclusion Aerith absente"
    handoff = pkg.get("handoff") or {}
    if str(handoff.get("destination_role") or "") != "transformer_book_readonly":
        return False, "destination Book lecture seule requise"
    return True, "ok"


class Publisher:
    def __init__(self, repo: str, branch: str, path: str):
        self.repo, self.branch, self.path = repo, branch, path
        self.lock = threading.Lock()
        self.last_fp = ""
        self.last_at = ""
        self.last_commit = ""

    def health(self) -> dict[str, Any]:
        token, mode = get_token()
        return {
            "ok": True,
            "ready": bool(token),
            "service": "agent-crypto-book-mirror-publisher",
            "build": BUILD,
            "auth_mode": mode,
            "target": f"{self.repo}:{self.branch}/{self.path}",
            "detail": "Prêt à publier." if token else "Authentification GitHub locale absente. Utilise gh auth login ou AGENT_CRYPTO_GITHUB_TOKEN.",
            "last_fingerprint": self.last_fp or None,
            "last_published_at": self.last_at or None,
            "last_commit": self.last_commit or None,
        }

    def publish(self, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
        ok, detail = validate_mirror(payload)
        if not ok: return 400, {"ok": False, "error": detail}
        token, mode = get_token()
        if not token: return 503, {"ok": False, "error": "Authentification GitHub locale absente. Lance `gh auth login` ou définis AGENT_CRYPTO_GITHUB_TOKEN."}
        fp = str(payload["fingerprint"]).strip()
        with self.lock:
            if fp == self.last_fp:
                return 200, {"ok": True, "changed": False, "fingerprint": fp, "auth_mode": mode, "commit": self.last_commit or None}
            contents_url = f"https://api.github.com/repos/{self.repo}/contents/{self.path}?ref={self.branch}"
            status, remote = api_request("GET", contents_url, token)
            sha = remote.get("sha") if status == 200 else None
            if status not in (200, 404):
                return 502, {"ok": False, "error": f"GitHub lecture HTTP {status}: {remote.get('message','erreur')}"}
            # Refuse a rollback when a newer mirror is already public.
            if status == 200 and remote.get("content"):
                try:
                    existing = json.loads(base64.b64decode(remote["content"]).decode("utf-8"))
                    existing_fp = str(existing.get("fingerprint") or "").strip()
                    if existing_fp == fp:
                        self.last_fp, self.last_at = fp, now_iso()
                        return 200, {"ok": True, "changed": False, "fingerprint": fp, "auth_mode": mode, "commit": None, "detail": "Miroir déjà public."}
                    old_at = str(existing.get("generated_at") or "")
                    new_at = str(payload.get("generated_at") or "")
                    if old_at and new_at and old_at > new_at:
                        return 409, {"ok": False, "error": f"Rollback refusé: miroir public {old_at} plus récent que {new_at}."}
                except Exception:
                    pass
            raw = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=False).encode("utf-8") + b"\n"
            body = {
                "message": f"agent-crypto: publish Book mirror {fp.replace('sha256:','')[:12]}",
                "content": base64.b64encode(raw).decode("ascii"),
                "branch": self.branch,
            }
            if sha: body["sha"] = sha
            put_url = f"https://api.github.com/repos/{self.repo}/contents/{self.path}"
            code, result = api_request("PUT", put_url, token, body)
            if code not in (200, 201):
                return 502, {"ok": False, "error": f"GitHub publication HTTP {code}: {result.get('message','erreur')}"}
            commit_sha = str((result.get("commit") or {}).get("sha") or "")
            self.last_fp, self.last_at, self.last_commit = fp, now_iso(), commit_sha
            return 200, {"ok": True, "changed": True, "fingerprint": fp, "published_at": self.last_at, "auth_mode": mode, "commit": commit_sha}


class Handler(BaseHTTPRequestHandler):
    server_version = f"AgentCryptoBookMirror/{BUILD}"

    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stdout.write(f"[{now_iso()}] {self.address_string()} {fmt % args}\n")
        sys.stdout.flush()

    def cors_origin(self) -> str:
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS: return origin
        return ""

    def send_json(self, code: int, payload: dict[str, Any]) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        origin = self.cors_origin()
        if origin: self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Vary", "Origin")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers(); self.wfile.write(raw)

    def origin_allowed(self) -> bool:
        origin = self.headers.get("Origin", "")
        return (not origin) or origin in ALLOWED_ORIGINS

    def do_OPTIONS(self) -> None:
        if not self.origin_allowed(): return self.send_json(403, {"ok": False, "error": "Origin refusée"})
        self.send_response(204)
        origin = self.cors_origin()
        if origin: self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Agent-Crypto-Reason")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()

    def do_GET(self) -> None:
        if not self.origin_allowed(): return self.send_json(403, {"ok": False, "error": "Origin refusée"})
        if self.path.rstrip("/") == "/health": return self.send_json(200, self.server.publisher.health())
        return self.send_json(404, {"ok": False, "error": "route inconnue"})

    def do_POST(self) -> None:
        if not self.origin_allowed(): return self.send_json(403, {"ok": False, "error": "Origin refusée"})
        if self.path.rstrip("/") != "/book-mirror/publish": return self.send_json(404, {"ok": False, "error": "route inconnue"})
        try: length = int(self.headers.get("Content-Length", "0"))
        except Exception: length = 0
        if length <= 0 or length > MAX_BODY: return self.send_json(413, {"ok": False, "error": "taille payload refusée"})
        try: payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception as e: return self.send_json(400, {"ok": False, "error": f"JSON invalide: {e}"})
        code, result = self.server.publisher.publish(payload)
        return self.send_json(code, result)


class Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    def __init__(self, addr, handler, publisher):
        super().__init__(addr, handler); self.publisher = publisher


def main() -> int:
    ap = argparse.ArgumentParser(description="Agent-Crypto trusted local Book mirror publisher")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", default=8788, type=int)
    ap.add_argument("--repo", default=DEFAULT_REPO)
    ap.add_argument("--branch", default=DEFAULT_BRANCH)
    ap.add_argument("--path", default=DEFAULT_PATH)
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        sample={"schema":SCHEMA,"observation_only":True,"fingerprint":"sha256:"+"a"*64,"execution":{"producer":"ryzen","book_ollama":False,"book_bridge":False},"package":{"status":{"atlas_reports":"4/4"},"conclusion":{"answer":"ok"},"handoff":{"destination_role":"transformer_book_readonly"}}}
        ok, detail=validate_mirror(sample)
        print(json.dumps({"ok":ok,"detail":detail,"build":BUILD},ensure_ascii=False)); return 0 if ok else 1
    if args.host not in ("127.0.0.1", "localhost"):
        print("REFUS: ce service doit rester loopback-only (127.0.0.1).", file=sys.stderr); return 2
    pub=Publisher(args.repo,args.branch,args.path)
    server=Server(("127.0.0.1",args.port),Handler,pub)
    health=pub.health()
    print(f"Agent-Crypto Book Mirror Publisher {BUILD}")
    print(f"Loopback : http://127.0.0.1:{args.port}")
    print(f"Cible    : {health['target']}")
    print(f"Auth     : {health['auth_mode']} · {'PRÊT' if health['ready'] else 'À CONFIGURER'}")
    if not health['ready']: print("Action unique: `gh auth login` (recommandé) ou variable AGENT_CRYPTO_GITHUB_TOKEN.")
    print("CTRL+C pour arrêter.")
    try: server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt: pass
    finally: server.server_close()
    return 0

if __name__ == "__main__": raise SystemExit(main())

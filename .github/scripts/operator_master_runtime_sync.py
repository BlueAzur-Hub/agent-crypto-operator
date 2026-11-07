#!/usr/bin/env python3
"""Sync public MASTER runtime to the Operator candidate without copying private data.

The Operator remains a separate deployment. This script proposes executable public
runtime updates only; Yoann's role, Bridge and TRADUS files remain Operator-owned.
No deletion, private repository, credential or real-order capability is transferred.
"""
import argparse
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path("public/agent_crypto_erith_ia")
PREFIX = "public/agent_crypto_erith_ia/"
EXCLUDED_DIRS = {
    "data", "assets", "vendor", "tests", "qa", "releases",
    "downloads", "architecture", "manifests",
}
PROTECTED = {
    "administrator/yohan.html",
    "administrator/js/yohan-operator-profile.js",
    "administrator/js/yohan-operator-bridge-client.js",
    "administrator/operator-version.json",
    "administrator/build.json",
    "trader/trading-desk.html",
    "trader/trader-runtime-mirror.js",
    "trader/trader-okx-account.js",
    "trader/ai-ct-contract.js",
    "trader/ai-asset-reading-view.js",
    "trader/trader-tradus-readonly.js",
    "trader/build.json",
    "trader/trader-paper-lab-view.js",
}
ENTRY = PREFIX + "administrator/index.html"
ROUTER_TAG = b'<script src="../web/vault-data-router.js" data-erith-vault-data-router="true"></script>\n'
MAX_FILES = 80
MAX_BYTES = 12 * 1024 * 1024


def git(directory, *args):
    return subprocess.check_output(["git", "-C", str(directory), *args])


def is_runtime(path):
    if not path.startswith(PREFIX):
        return False
    relative = path[len(PREFIX):]
    segments = pathlib.PurePosixPath(relative).parts
    if len(segments) < 2 or segments[0] not in {"administrator", "trader"}:
        return False
    if any(segment in EXCLUDED_DIRS for segment in segments[1:-1]):
        return False
    if relative in PROTECTED:
        return False
    name = segments[-1].lower()
    if name.startswith(("test-", "test_")) or re.search(r"\.(test|spec)\.", name):
        return False
    if name.endswith((".test.js", ".test.cjs", ".test.mjs")):
        return False
    return pathlib.PurePosixPath(relative).suffix.lower() in {".js", ".css", ".html", ".mjs"}


def source_files(master):
    listing = git(master, "ls-tree", "-r", "HEAD", "--", PREFIX).decode()
    files = {}
    for line in listing.splitlines():
        metadata, path = line.split("\t", 1)
        mode, kind, sha = metadata.split()
        if kind == "blob" and mode == "100644" and is_runtime(path):
            files[path] = sha
    if len(files) < 250:
        raise RuntimeError(f"Unexpectedly small MASTER runtime: {len(files)} files")
    return files


def git_hash(path):
    if not path.is_file() or path.is_symlink():
        return None
    return subprocess.check_output(["git", "hash-object", str(path)], text=True).strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--master", required=True, help="Local bare or partial Git clone of public MASTER")
    parser.add_argument("--apply", action="store_true", help="Prepare public runtime changes on this branch")
    parser.add_argument("--check", action="store_true", help="Fail if the Operator runtime differs from MASTER")
    args = parser.parse_args()
    if args.apply == args.check:
        parser.error("Specify exactly one of --apply or --check")
    master = pathlib.Path(args.master).resolve()
    if not (master / ".git").exists():
        raise RuntimeError("MASTER checkout is not a valid Git repository")

    sources = source_files(master)
    changes = []
    for path, sha in sorted(sources.items()):
        target = pathlib.Path(path)
        if path != ENTRY and git_hash(target) == sha:
            continue
        content = git(master, "show", f"HEAD:{path}")
        if path == ENTRY:
            if ROUTER_TAG in content:
                raise RuntimeError("MASTER unexpectedly contains Operator router")
            if content.count(b"<head>\n") != 1:
                raise RuntimeError("Cannot safely insert Operator public-data router")
            content = content.replace(b"<head>\n", b"<head>\n" + ROUTER_TAG, 1)
        if target.is_file() and target.read_bytes() == content:
            continue
        changes.append((path, content))

    total = sum(len(data) for _, data in changes)
    print(f"MASTER runtime files: {len(sources)}")
    print(f"Candidate changes: {len(changes)} files, {total} bytes")
    for path, _ in changes:
        print(f"  {path}")
    if len(changes) > MAX_FILES or total > MAX_BYTES:
        raise RuntimeError("Candidate exceeds safe scope; manual review required")
    if args.check:
        if changes:
            raise SystemExit("STOP: Operator candidate is not aligned to the public MASTER runtime")
        print("MIRROR_CODE_PARITY_PASS")
        return
    for path, data in changes:
        target = pathlib.Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    print("MIRROR_CANDIDATE_APPLIED; protected Operator files untouched")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"STOP: {error}", file=sys.stderr)
        sys.exit(2)

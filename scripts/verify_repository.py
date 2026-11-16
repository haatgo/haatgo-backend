"""Standalone snapshot/isolation checker. Copied into each independent repository."""
import argparse
import hashlib
import json
from pathlib import Path

TEXT_SNAPSHOT_SUFFIXES = {".css", ".js", ".json", ".md", ".ts", ".tsx"}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def snapshot_digest(path):
    data = path.read_bytes()
    if path.suffix.lower() in TEXT_SNAPSHOT_SUFFIXES:
        data = data.replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    return digest(data)


def verify(root, release=False):
    errors = []
    lock_path = root / "integration/sync-lock.json"
    if not lock_path.is_file():
        return ["Missing integration/sync-lock.json; run local workspace sync."]
    lock = json.loads(lock_path.read_text(encoding="utf-8"))
    for name, expected in lock["files"].items():
        path = (root / name).resolve()
        if not path.is_relative_to(root.resolve()):
            errors.append(f"Unsafe snapshot path: {name}")
        elif not path.is_file() or snapshot_digest(path) != expected:
            errors.append(f"Snapshot changed or missing: {name}")
    # Scan repository source/config, without traversing dependency caches or .git.
    skipped = {".git", "node_modules", ".gradle", "build", "dist", "__pycache__"}
    def walk(directory):
        for path in directory.iterdir():
            if path.is_symlink() or path.is_junction():
                errors.append(f"Linked path is forbidden: {path.relative_to(root)}")
            elif path.name not in skipped:
                if path.is_dir():
                    yield from walk(path)
                else:
                    yield path
    for path in walk(root):
        if path.name == "package.json":
            package = json.loads(path.read_text(encoding="utf-8"))
            if "workspaces" in package:
                errors.append("npm workspaces forbidden")
            for key in ("dependencies", "devDependencies", "optionalDependencies", "peerDependencies"):
                for name, version in package.get(key, {}).items():
                    if str(version).startswith(("file:", "link:", "workspace:", "../", "..\\")):
                        errors.append(f"External local dependency forbidden: {name}")
        if path.suffix in {".ts", ".tsx", ".js", ".jsx"}:
            import re
            content = path.read_text(encoding="utf-8")
            for specifier in re.findall(r'''(?:from\s*|import\s*|require\s*\(\s*|import\s*\(\s*)["']([^"']+)["']''', content):
                if specifier.startswith(".") and not (path.parent / specifier).resolve().is_relative_to(root.resolve()):
                    errors.append(f"Import escapes repository: {path.relative_to(root)} -> {specifier}")
                if specifier.startswith(("file:", "workspace:", "link:", "@haatgo/")):
                    errors.append(f"Cross-project import forbidden: {specifier}")
    if release:
        review = json.loads((root / "integration/contract-review.json").read_text(encoding="utf-8"))
        if review.get("reviewedSnapshotSha256") != digest(lock_path.read_bytes()):
            errors.append("Integration review is pending/stale for current backend and contract revision")
        if not review.get("reviewer") or not review.get("evidence"):
            errors.append("Integration review requires reviewer and repository-local test evidence files")
        for name in review.get("evidence", []):
            path = (root / name).resolve()
            if not path.is_relative_to(root.resolve()) or not path.is_file():
                errors.append(f"Missing/unsafe evidence file: {name}")
    return errors


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release", action="store_true", help="Also require current integration review evidence")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    failures = verify(root, args.release)
    for failure in failures:
        print(f"FAIL: {failure}")
    print("PASS: repository snapshots and isolation" if not failures else f"{len(failures)} failure(s)")
    raise SystemExit(bool(failures))

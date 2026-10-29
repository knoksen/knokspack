"""Offline advisory read model. No credentials, network, source writes or executor."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from html import escape
import json
from pathlib import Path
import re

REQUIRED_CHECKS = frozenset({
    "ci", "independent_review", "access_control", "privacy",
    "deployment_map", "backup_restore", "security",
})
STATUSES = frozenset({"PASS", "FAIL", "UNKNOWN", "BLOCKED"})
ROLES = frozenset({"operator", "reviewer", "security"})
SHA = re.compile(r"^[0-9a-f]{40}$")
ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$")


def exact(value, fields):
    if not isinstance(value, dict) or set(value) != set(fields):
        raise ValueError("Invalid contract fields")


def identifier(value):
    if not isinstance(value, str) or not ID.fullmatch(value):
        raise ValueError("Invalid identifier")
    return value


def timestamp(value):
    if not isinstance(value, str):
        raise ValueError("Timestamp must be text")
    try:
        result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        raise ValueError("Invalid timestamp") from None
    if result.tzinfo is None:
        raise ValueError("Timestamp requires timezone")
    return result.astimezone(timezone.utc)


def validate_snapshot(snapshot):
    exact(snapshot, {"schema_version", "repository", "revision", "environment", "checks"})
    if type(snapshot["schema_version"]) is not int or snapshot["schema_version"] != 1:
        raise ValueError("Unsupported schema version")
    identifier(snapshot["repository"])
    identifier(snapshot["environment"])
    if not isinstance(snapshot["revision"], str) or not SHA.fullmatch(snapshot["revision"]):
        raise ValueError("Full commit SHA required")
    if not isinstance(snapshot["checks"], list) or len(snapshot["checks"]) > 100:
        raise ValueError("Invalid checks")
    seen = set()
    for check in snapshot["checks"]:
        exact(check, {"name", "status", "revision", "observed_at", "evidence_ref"})
        if check["name"] not in REQUIRED_CHECKS or check["name"] in seen:
            raise ValueError("Unknown or duplicate check")
        seen.add(check["name"])
        if check["status"] not in STATUSES:
            raise ValueError("Invalid check status")
        if not isinstance(check["revision"], str) or not SHA.fullmatch(check["revision"]):
            raise ValueError("Invalid check revision")
        timestamp(check["observed_at"])
        # Internal evidence IDs only: no credentials, query strings or raw logs.
        identifier(check["evidence_ref"])
    return snapshot


def evaluate(snapshot, *, now=None, max_age_seconds=3600):
    """Return advisory review readiness; never authorize merge/deploy."""
    validate_snapshot(snapshot)
    if type(max_age_seconds) is not int or not 1 <= max_age_seconds <= 86400:
        raise ValueError("Freshness must be 1..86400 seconds")
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        raise ValueError("Clock requires timezone")
    checks = {check["name"]: check for check in snapshot["checks"]}
    reasons = []
    for name in sorted(REQUIRED_CHECKS):
        check = checks.get(name)
        if check is None:
            reasons.append(name + ": missing")
            continue
        if check["status"] != "PASS":
            reasons.append(name + ": " + check["status"])
        if check["revision"] != snapshot["revision"]:
            reasons.append(name + ": revision mismatch")
        age = (now - timestamp(check["observed_at"])).total_seconds()
        if age < 0 or age > max_age_seconds:
            reasons.append(name + ": future or stale evidence")
    return {
        "repository": snapshot["repository"],
        "revision": snapshot["revision"],
        "environment": snapshot["environment"],
        "ready_for_review": not reasons,
        "release_authorized": False,
        "reasons": reasons,
        "approval_required": True,
    }


def audit_event(result, *, actor_id, correlation_id, event_id, now=None):
    """Build metadata only. Caller must use a protected sink in production."""
    exact(result, {"repository", "revision", "environment", "ready_for_review",
                   "release_authorized", "reasons", "approval_required"})
    if result["release_authorized"] is not False or result["approval_required"] is not True:
        raise ValueError("Advisory result cannot authorize release")
    return {
        "schema_version": 1,
        "event_id": identifier(event_id),
        "actor_id": identifier(actor_id),
        "correlation_id": identifier(correlation_id),
        "observed_at": (now or datetime.now(timezone.utc)).isoformat(),
        "action": "release.evaluate",
        "target": identifier(result["repository"]),
        "revision": result["revision"],
        "environment": identifier(result["environment"]),
        "decision": "reviewable" if result["ready_for_review"] else "blocked",
        "release_authorized": False,
    }


def eligible_chunks(chunks, *, tenant_id, project_id, roles, now=None):
    """Synthetic ACL projection only; identity/ACL must come from trusted adapters."""
    identifier(tenant_id)
    identifier(project_id)
    if not isinstance(roles, (set, frozenset)) or not roles or not roles <= ROLES:
        raise ValueError("Unknown or missing role")
    if not isinstance(chunks, list) or len(chunks) > 10000:
        raise ValueError("Invalid chunk batch")
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        raise ValueError("Clock requires timezone")
    output = []
    for chunk in chunks:
        exact(chunk, {"chunk_id", "tenant_id", "project_id", "allowed_roles",
                      "deleted", "expires_at", "source_ref", "text"})
        for field in ("chunk_id", "tenant_id", "project_id", "source_ref"):
            identifier(chunk[field])
        allowed = chunk["allowed_roles"]
        if (not isinstance(allowed, list) or not allowed
                or any(not isinstance(role, str) for role in allowed)
                or len(allowed) != len(set(allowed)) or not set(allowed) <= ROLES):
            raise ValueError("Invalid source ACL")
        if type(chunk["deleted"]) is not bool:
            raise ValueError("Invalid tombstone")
        if not isinstance(chunk["text"], str) or not 0 < len(chunk["text"]) <= 24000:
            raise ValueError("Invalid chunk text")
        expires = timestamp(chunk["expires_at"])
        if (chunk["tenant_id"] == tenant_id and chunk["project_id"] == project_id
                and not chunk["deleted"] and expires > now and roles & set(allowed)):
            # Copy: do not mutate source record. Text stays data, never instructions.
            output.append(dict(chunk))
    return output


def render(snapshot, result):
    """Self-contained read-only HTML; all source-derived text is escaped."""
    rows = "".join(
        "<tr><td>" + escape(check["name"]) + "</td><td>" + escape(check["status"])
        + "</td><td>" + escape(check["observed_at"]) + "</td><td>"
        + escape(check["evidence_ref"]) + "</td></tr>"
        for check in snapshot["checks"]
    )
    issues = "".join("<li>" + escape(reason) + "</li>" for reason in result["reasons"])
    state = "Klar for gjennomgang" if result["ready_for_review"] else "Blokkert"
    return (
        '<!doctype html><html lang="nb"><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<meta http-equiv="Content-Security-Policy" content="default-src &apos;none&apos;; '
        'style-src &apos;unsafe-inline&apos;; base-uri &apos;none&apos;; form-action &apos;none&apos;">'
        '<title>Jarlhalla — Release Gate</title><style>'
        'body{font:17px system-ui;background:#111827;color:#f3f6f8;max-width:1000px;'
        'margin:40px auto;padding:20px}h1{color:#93c5fd}table{border-collapse:collapse;'
        'width:100%}td,th{text-align:left;border-bottom:1px solid #6b7e93;padding:12px}'
        'code{overflow-wrap:anywhere}.table{overflow:auto}</style><main>'
        '<p>Jarlhalla · Lokal lesebasert demonstrasjon</p><h1>Release Gate: ' + state
        + '</h1><p>Ingen produksjonstilkobling. Ingen release er autorisert. '
        'Eksplisitt godkjenning kreves.</p><p>' + escape(result["repository"])
        + ' · ' + escape(result["environment"]) + '</p><code>'
        + escape(result["revision"]) + '</code><ul>' + issues
        + '</ul><div class="table"><table><caption>Innsendte observasjoner — '
        'ikke uavhengig verifisert av dette verktøyet</caption><thead><tr>'
        '<th scope="col">Kontroll</th><th scope="col">Status</th>'
        '<th scope="col">Observert</th><th scope="col">Bevisreferanse</th>'
        '</tr></thead><tbody>' + rows + '</tbody></table></div></main></html>'
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("--html", type=Path)
    args = parser.parse_args()
    try:
        if args.snapshot.stat().st_size > 1_000_000:
            raise ValueError("Snapshot exceeds size limit")
        snapshot = json.loads(args.snapshot.read_text(encoding="utf-8"))
        result = evaluate(snapshot)
        if args.html:
            # Exclusive creation: never overwrite source or an existing artifact.
            with args.html.open("x", encoding="utf-8") as output:
                output.write(render(snapshot, result))
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if result["ready_for_review"] else 1
    except (ValueError, TypeError, KeyError, OSError):
        print(json.dumps({"error": "Invalid snapshot or output destination",
                          "release_authorized": False}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

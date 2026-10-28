# Offline governance foundation

Advisory release-gate evaluation and a local read-only HTML projection. Python 3.12 standard library only. No live adapter, endpoint, network request, credential use, deploy hook, source write or runtime change.

Run from this directory:

```text
python -m unittest discover -v
python governance.py example.snapshot.json --html local-preview.html
```

CLI exit codes: 0 = fresh complete evidence is ready for independent review; 1 = missing/failing/stale evidence blocks review readiness; 2 = invalid input/output destination. Every result sets release_authorized=false. A PASS field from a file is an assertion, not authenticated CI or human approval.

Seven required checks are fixed in code: ci, independent_review, access_control, privacy, deployment_map, backup_restore, security. Evidence must match the full target commit SHA, use timezone-aware time and be no older than one hour by default. Future evidence is rejected; skipped/cancelled/unknown checks never pass. A partial snapshot remains blocked.

The snapshot example is synthetic and deliberately blocked. Do not relabel it as live measurement. HTML output escapes source text, has no scripts, external resources, forms or action buttons, and is created exclusively without overwriting files. It is not connected to the existing workspace.

eligible_chunks is an offline ACL boundary prototype: exact tenant/project, explicit known roles, valid ACL, unexpired source and no tombstone. It performs no embedding/search/model calls. Production must bind identity and ACL through trusted server-side adapters, apply filtering before vector retrieval, recheck before prompts, invalidate caches on revoke/delete and validate citation IDs. This function alone is not a RAG system.

audit_event creates minimized metadata only; it does not write logs or provide tamper protection. Production needs an authenticated actor and protected append sink.

Validation command is also provided in a separate PR-only workflow with contents:read and no secrets or deploy steps. Existing frontend/PHP validation is unchanged. Existing project tests were not rerun because no runtime code or dependencies are changed.

Rollback: close the unmerged PR or revert these additive files. Do not execute deployment/bootstrap scripts to try this module.

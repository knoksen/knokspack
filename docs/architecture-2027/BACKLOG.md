# Implementation backlog

All owners below are roles to be assigned, not claims of named responsibility. Estimates depend on missing inventory.

| ID | Priority / owner | Dependency | Isolated deliverable and acceptance | Approval port |
| --- | --- | --- | --- | --- |
| B01 | P0 / Ops + owner | Reader access | Verify VPS/WP runtime, deployment triggers, backup/restore; redact evidence, identify actual services | G0; reading only |
| B02 | P0 / Security + maintainer | B01 | Verify full protection, reviews, bypass and agent identities; correlate historical merges with audit logs, no unsupported attribution | G0; settings changes need approval |
| B03 | P0 / Ops | Cloud Build reader | Identify queued build, service account, source SHA and target; map PR/branch deploy effects | G0; no rerun/cancel |
| B04 | P0 / Frontend + Security | WP reader | Norway/EEA consent test on fresh browser for none/reject/accept/revoke; prepare separate minimal fix with regression evidence | G1 then G2/G3 |
| B05 | P0 / Security | B01 | Secret dependency map, generated-asset checks, rotation/rollback runbook; verify Firebase restriction and named rules target | Rotation/deploy explicit |
| B06 | P0 / Architect | Existing code review | Add AGENTS.md, evidence register, contracts, approval matrix; retain specialized analyst runtime guidance | Draft PR A |
| B07 | P0 / Security | B06 | Offline fail-closed gate, UTC freshness, revision binding, sanitized local audit event and negative tests | Draft PR B; advisory only |
| B08 | P1 / Identity owner | B02 | Scoped identity matrix for operator, reviewer, executor and reader; server-verified identity/ACL, deny unknown roles | G1/G2; credential changes explicit |
| B09 | P1 / Platform | B07/B08 | Connect authenticated read-only Command Center route to bounded adapters; no write controls; missing/stale/source failures visible | G1/G2 |
| B10 | P1 / Data steward | B01/B08 | GitHub reader: paginated repos/PRs/CI at pinned SHA; no deploy requests; timeout/rate-limit tests | G1/G2 |
| B11 | P1 / Data steward | B08 + source schema | Notion reader: selected sources, revision, ACL and idempotency; drift/conflict/deletion tests | G1/G2 |
| B12 | P1 / Data steward | B04/B08 | Published WordPress reader; canonical/status filter, bounded pagination; no private content | G1/G2 |
| B13 | P1 / Ops | B01/B08 | Allowlisted telemetry reader and protected append audit sink; retention/access/tamper and error-path tests | G1/G2 |
| B14 | P1 / Ops | B01 | Isolated restore + real tunnel reconnect test; agree RPO/RTO and monitor thresholds | Explicit staging approval |
| B15 | P2 / Domain owners | B10-B13 | Versioned semantic project/document/asset mapping; no title-based joins; glossary and provenance test set | G1/G2 |
| B16 | P2 / Knowledge owner | B08/B15 | Synthetic ACL-first retrieval + citation validation, prompt injection and revocation tests | Offline PR then G2 |
| B17 | P2 / Knowledge owner | B16 + data policy | Approved-source RAG pilot; evaluate recall/groundedness/leakage/latency/cost with agreed thresholds | G2; data transfer approval |
| B18 | P2 / Workflow owner | All P0 + B13 | Bounded action proposal/executor separation; signed approval bound to SHA/environment/expiry, replay rejection | G3 explicit for each action |
| B19 | P1 / Maintainer | Owner decision | Resolve README/package/SECURITY version/contact drift; approved brand source and named reviewers | G1 |

## Release and risk register

- R01 Critical: unknown external automation may merge/deploy feature work; inspect all known workflow files before pushing, keep PRs draft and do not enable auto-merge. GitHub-side workflows inspected here contain validation, not deployment, for knokspack; external webhooks/installed apps remain unverified.
- R02 High: shared root/user credentials obscure actor attribution. No production key is read or copied. Provision separate identities only after approval.
- R03 High: prior WordPress tracking before consent remains unresolved until a fresh browser network test. A visible banner does not prove blocking.
- R04 High: unverified Cloud Build and restore state block rollout, not offline code preparation.
- R05 High: ACL filtering must precede both retrieval and prompt assembly; no cache without tenant/project/role/revision scope.
- R06 Medium: local audit JSONL may be modified by its filesystem owner; production evidence needs restricted storage and retention.
- R07 Medium: offline dashboard can contain operational metadata; keep it local/internal and serve behind authentication only after review.

## Review packet

Each PR: problem and resulting behavior; baseline/head SHA; changed files; executed tests with results; skipped tests; security/data impact; rollback; exact approval needed. Do not merge these PRs as part of this task. Subsequent rollout is a separate human decision.

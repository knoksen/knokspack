# Data contracts v1 — proposed, review required

Contracts are for derived read projections; they grant no access and do not change source schemas. Transport authentication, signature verification and identity binding must precede validation. Source content is untrusted.

## Common observation envelope

| Field | Type / rule | Meaning |
| --- | --- | --- |
| schema_version | literal 1 | Reject unknown major versions |
| source | github / notion / wordpress / vps | Fixed connector family |
| source_id | nonempty string | Stable source-native object ID, not title |
| source_url | HTTPS URL, no embedded credentials | Human evidence reference |
| revision | nonempty string | Commit SHA or source revision; timestamp-only sources must document limitations |
| observed_at | timezone-aware ISO-8601 | Actual collection time, never build time substituted for measurement |
| tenant_id / project_id | nonempty strings | Verified namespace from source mapping |
| classification | public / internal / restricted | Owner-assigned sensitivity |
| allowed_roles | nonempty array of role IDs | Server-controlled source ACL projection |
| deleted | boolean | Tombstone; never retrieved |
| payload | source-specific object | Minimized fields only; no secrets, raw audit logs or user exports |

## Connector-specific contracts

- GitHub revision/CI: repository, head SHA, workflow run/job/check name, status/conclusion, evidence URL and observation time. Bind all check results to the same head SHA. Missing/skipped/cancelled/timed-out required checks do not pass.
- Notion project/task: page ID, data-source ID, last_edited_time, actual property names/types, source URL and ACL. Existing Tasks source aaa9420a-4015-4bdb-b942-59ad083bf347 uses Task, Status, Area, Priority, Owner Role and Source URL. Read projection cannot change status. Any later upsert requires expected_revision and stable idempotency key.
- WordPress content: site origin, post ID, revision/modified_gmt, canonical URL, status, locale and content digest. Initial reader accepts published content only; omit author email, users, member/payment data and private drafts.
- VPS telemetry: allowlisted service ID, sample time, health enum, latency/unit and evidence reference. Never accept arbitrary shell commands, request-provided paths or service names.
- Audit decision: event ID, actor ID, correlation ID, action, target revision/environment, decision, time and evidence/approval reference. Store sanitized metadata only, restricted append access, documented retention. Hash chaining alone does not prevent privileged rewrite.
- KnowledgeChunk: document source key/revision, chunk ID/content digest, text, project/tenant, source ACL, deletion flag, license/provenance and freshness deadline. Proposed production adapter must validate citations against retrieved IDs and current access.

## Evolution and delivery

1. Reject missing/unknown fields in versioned machine contracts; unknown major versions go to quarantine.
2. Keep a versioned fixture for valid and invalid payloads; CI covers schema drift, cross-project access, deletion, future timestamps and stale evidence.
3. At-least-once ingestion uses (source, source_id, revision) as dedup key. Do not advance checkpoint until validation and durable write succeed.
4. Bounded timeout/retries with backoff and provider limits; retry only read/idempotent operations. Redact upstream error bodies.
5. Preserve lineage and source observation time. Define per-source freshness with owner before live ingestion.
6. Tombstones/revocations delete or disable derived chunks and invalidate caches before next query. Production retention and deletion SLA require owner approval.
7. Reject ambiguous tenant mapping; no default global/public namespace. Read-only index cannot become authoritative.
8. Never include credentials, raw approval tokens, unrestricted prompts or personal fields in fixtures.

The offline governance module implements a narrower gate snapshot contract and a synthetic ACL filter. These are not authenticated adapters or production enforcement.

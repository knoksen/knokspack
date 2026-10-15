# Chat startup error repair — 15 October 2026

The backend previously committed HTTP 200 before advancing the provider generator.
Provider startup exceptions therefore escaped the route's error handling and
aborted an apparently successful response. The route now reads the first text
chunk before returning StreamingResponse, maps quota/credit failures to HTTP 503,
and suppresses raw upstream error details. Successful responses retain the
existing plain-text streaming contract used by the admin console.

Health reports configuration only; it does not verify credits, model access,
provider availability, or gateway integration. Mid-stream failures after text
has started can still interrupt the stream; changing that behavior requires a
framed streaming protocol and corresponding frontend changes.

## Verification

Install the existing requirements plus pytest and httpx, then run from repo root:

```sh
python -m pytest server/jarlhalla-ai/tests -q
```

Tests mock provider calls; they do not spend credits or prove live availability.

## Deployment boundary

This patch has not been deployed. SSH from the repair environment to
45.132.114.61:22 returned Network is unreachable. Do not run the broad platform
bootstrap merely to apply this backend-only patch.

From an existing authorized VPS session, record service status and back up the
current /opt/jarlhalla-ai/app.py. Compare its contents with this repository before
replacing it: the deployed version may differ. Apply the reviewed backend change
only, compile it with the service virtualenv, restart jarlhalla-ai.service and
check /health locally. Test /chat with the actual request schema:

```sh
curl --fail-with-body --max-time 60 -N \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Reply with OK only.","provider":"openai"}' \
  http://127.0.0.1:8787/chat
```

A live chat request may incur provider usage. Credits must be available for a
successful OpenAI response. Never paste API keys or environment-file contents
into logs or chat. Verify the authenticated admin /api/jarlhalla-ai/chat route
separately. If startup regresses, restore the backed-up app.py and restart only
the AI service. WordPress, DNS, Nginx and SSH configuration are outside this patch.

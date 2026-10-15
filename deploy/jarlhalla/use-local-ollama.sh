#!/usr/bin/env bash
# Backend configuration only: retain deployed app.py and all provider support.
set -euo pipefail
[[ ${EUID} -eq 0 ]] || { echo 'Run as root.' >&2; exit 1; }
MODEL="${1:-qwen3.5:4b}"
[[ "$MODEL" =~ ^[a-zA-Z0-9._:/-]+$ ]] || { echo 'Invalid model name.' >&2; exit 1; }
PORT=11436
TAGS=$(curl --fail --silent --show-error --max-time 15 "http://127.0.0.1:$PORT/api/tags")
printf '%s' "$TAGS" | /opt/jarlhalla-ai/venv/bin/python -c 'import json,sys; names=[m["name"] for m in json.load(sys.stdin).get("models",[])]; sys.exit(0 if sys.argv[1] in names else "Requested model not available through tunnel")' "$MODEL"
DROPIN=/etc/systemd/system/jarlhalla-ai.service.d/90-local-ollama.conf
install -d -m 755 "$(dirname "$DROPIN")"
BACKUP=$(mktemp -d /root/jarlhalla-ollama-backup-XXXXXXXX)
chmod 700 "$BACKUP"
HAD_OLD=0
if [[ -f "$DROPIN" ]]; then cp -a "$DROPIN" "$BACKUP/previous.conf"; HAD_OLD=1; fi
rollback() {
    if [[ $HAD_OLD -eq 1 ]]; then cp -a "$BACKUP/previous.conf" "$DROPIN"; else rm -f "$DROPIN"; fi
    systemctl daemon-reload
    systemctl restart jarlhalla-ai.service
    echo "Previous configuration restored. Backup: $BACKUP" >&2
}
# EnvironmentFile entries override Environment=; use a final EnvironmentFile.
cat > "$BACKUP/ollama.env" <<EOF
JARLHALLA_AI_PROVIDER=ollama
JARLHALLA_OLLAMA_MODEL=$MODEL
OLLAMA_BASE_URL=http://127.0.0.1:$PORT/v1
EOF
chmod 600 "$BACKUP/ollama.env"
cat > "$DROPIN" <<EOF
[Service]
EnvironmentFile=$BACKUP/ollama.env
EOF
systemctl daemon-reload
if ! systemctl restart jarlhalla-ai.service; then rollback; exit 1; fi
READY=0
for attempt in {1..15}; do
    if curl --fail --silent --max-time 2 http://127.0.0.1:8787/health > "$BACKUP/health.json"; then READY=1; break; fi
    sleep 1
done
if [[ $READY -ne 1 ]] || ! /opt/jarlhalla-ai/venv/bin/python -c 'import json,sys; h=json.load(open(sys.argv[1])); sys.exit(0 if h.get("provider")=="ollama" and h.get("model")==sys.argv[2] else 1)' "$BACKUP/health.json" "$MODEL"; then rollback; exit 1; fi
# Verify real text, not merely the HTTP 200 emitted before provider startup.
if ! curl --fail --silent --show-error --max-time 180 -H 'Content-Type: application/json' -d "{\"prompt\":\"Reply with OK only.\",\"provider\":\"ollama\",\"model\":\"$MODEL\"}" http://127.0.0.1:8787/chat > "$BACKUP/chat.txt" || [[ ! -s "$BACKUP/chat.txt" ]]; then
    rollback; exit 1
fi
printf 'PASS: Ollama chat returned text. Model: %s\nBackup/config: %s\n' "$MODEL" "$BACKUP"
cat "$BACKUP/chat.txt"
printf '\nPC and SSH tunnel must remain running.\n'

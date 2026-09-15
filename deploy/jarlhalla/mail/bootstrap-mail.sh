#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

TARGET_DIR="${TARGET_DIR:-/opt/jarlhalla-mail}"
CREDENTIAL_FILE="${CREDENTIAL_FILE:-/root/jarlhalla-mail-recovery.txt}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker before running this script." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required." >&2
  exit 1
fi

for port in 25 465 587 143 993 4190; do
  if ss -ltn "sport = :$port" | grep -q LISTEN; then
    echo "Port $port is already in use. Resolve the conflict before installing Stalwart." >&2
    exit 1
  fi
done

mkdir -p "$TARGET_DIR/etc" "$TARGET_DIR/data"
cp "$SCRIPT_DIR/docker-compose.yml" "$TARGET_DIR/docker-compose.yml"

recovery_password="$(openssl rand -hex 24)"
cat > "$TARGET_DIR/.env" <<EOF
STALWART_RECOVERY_ADMIN=admin:${recovery_password}
EOF
chmod 600 "$TARGET_DIR/.env"

cat > "$CREDENTIAL_FILE" <<EOF
Jarlhalla Stalwart recovery administrator
Generated: $(date -Is)
Local admin URL: http://127.0.0.1:8088/admin
Username: admin
Password: ${recovery_password}

Remove STALWART_RECOVERY_ADMIN from /opt/jarlhalla-mail/.env after creating a permanent administrator in Stalwart.
EOF
chmod 600 "$CREDENTIAL_FILE"

cd "$TARGET_DIR"
docker compose pull
docker compose up -d

for _ in $(seq 1 30); do
  if curl -fsS --max-time 2 http://127.0.0.1:8088/admin >/dev/null 2>&1; then
    echo "Stalwart management endpoint is responding."
    echo "Recovery credentials: $CREDENTIAL_FILE"
    echo "Open via an SSH tunnel until mail.jarlhalla.com HTTPS is configured:"
    echo "  ssh -L 8088:127.0.0.1:8088 knoksen@45.132.114.61"
    echo "Then browse to http://127.0.0.1:8088/admin"
    exit 0
  fi
  sleep 2
done

echo "Stalwart container started but the management endpoint did not become ready in time." >&2
docker compose ps >&2
exit 1

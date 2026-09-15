#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

if [ "${EUID}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

TARGET_DIR="${TARGET_DIR:-/opt/jarlhalla-mail}"
CREDENTIAL_FILE="${CREDENTIAL_FILE:-/root/jarlhalla-mail-recovery.txt}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

install_docker_if_needed() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    return 0
  fi

  echo "Installing Docker Engine and Compose from Ubuntu packages..."
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    docker.io docker-compose-v2 ca-certificates curl openssl

  systemctl enable --now docker

  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker installation failed." >&2
    exit 1
  fi

  if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose v2 installation failed." >&2
    exit 1
  fi
}

install_docker_if_needed

echo "Docker: $(docker --version)"
echo "Compose: $(docker compose version)"

for port in 25 465 587 143 993 4190; do
  if ss -ltn "sport = :$port" | grep -q LISTEN; then
    echo "Port $port is already in use. Resolve the conflict before installing Stalwart." >&2
    ss -ltnp "sport = :$port" >&2 || true
    exit 1
  fi
done

mkdir -p "$TARGET_DIR/etc" "$TARGET_DIR/data"
cp "$SCRIPT_DIR/docker-compose.yml" "$TARGET_DIR/docker-compose.yml"

if [ -f "$TARGET_DIR/.env" ] && grep -q '^STALWART_RECOVERY_ADMIN=' "$TARGET_DIR/.env"; then
  echo "Existing Stalwart recovery environment found; leaving it unchanged."
else
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

Remove STALWART_RECOVERY_ADMIN from /opt/jarlhalla-mail/.env after creating and verifying a permanent administrator in Stalwart.
EOF
  chmod 600 "$CREDENTIAL_FILE"
fi

cd "$TARGET_DIR"
docker compose pull
docker compose up -d

for _ in $(seq 1 45); do
  if curl -fsS --max-time 2 http://127.0.0.1:8088/admin >/dev/null 2>&1; then
    echo "Stalwart management endpoint is responding."
    echo "Recovery credentials: $CREDENTIAL_FILE"
    echo "Local status:"
    docker compose ps
    echo
    echo "Until mail.jarlhalla.com HTTPS is configured, you can use an SSH tunnel:"
    echo "  ssh -L 8088:127.0.0.1:8088 knoksen@45.132.114.61"
    echo "Then browse to http://127.0.0.1:8088/admin"
    exit 0
  fi
  sleep 2
done

echo "Stalwart container started but the management endpoint did not become ready in time." >&2
docker compose ps >&2
docker compose logs --tail=100 stalwart >&2 || true
exit 1

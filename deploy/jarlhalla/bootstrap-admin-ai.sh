#!/usr/bin/env bash
set -Eeuo pipefail

if [ "${EUID}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.jarlhalla.com}"
ADMIN_ROOT="${ADMIN_ROOT:-/var/www/admin.jarlhalla.com}"
AI_ROOT="${AI_ROOT:-/opt/jarlhalla-ai}"
AI_USER="${AI_USER:-jarlhalla-ai}"
PUBLIC_IP="${PUBLIC_IP:-45.132.114.61}"
CERT_EMAIL="${CERT_EMAIL:-jarle@jarlhalla.com}"
NODE_MAJOR="${NODE_MAJOR:-22}"

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  nginx apache2-utils python3-venv python3-pip rsync dnsutils certbot python3-certbot-nginx \
  ca-certificates curl gnupg

# Ubuntu 24.04's stock Node.js is too old for the current Knokspack/Vite stack.
# Install a signed NodeSource repository instead of executing a remote setup script.
install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
  | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
chmod 0644 /etc/apt/keyrings/nodesource.gpg
cat > /etc/apt/sources.list.d/nodesource.list <<EOF
deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main
EOF
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs

NODE_ACTUAL_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_ACTUAL_MAJOR" -lt 22 ]; then
  echo "Node.js 22+ is required; found $(node --version)." >&2
  exit 1
fi

echo "Node: $(node --version)"
echo "npm:  $(npm --version)"

if ! id "$AI_USER" >/dev/null 2>&1; then
  useradd --system --home "$AI_ROOT" --shell /usr/sbin/nologin "$AI_USER"
fi

mkdir -p "$AI_ROOT"
cp "$REPO_ROOT/server/jarlhalla-ai/app.py" "$AI_ROOT/app.py"
cp "$REPO_ROOT/server/jarlhalla-ai/requirements.txt" "$AI_ROOT/requirements.txt"
python3 -m venv "$AI_ROOT/venv"
"$AI_ROOT/venv/bin/pip" install --upgrade pip
"$AI_ROOT/venv/bin/pip" install -r "$AI_ROOT/requirements.txt"
chown -R "$AI_USER:$AI_USER" "$AI_ROOT"

if [ ! -f /etc/jarlhalla-ai.env ]; then
  cp "$REPO_ROOT/deploy/jarlhalla/jarlhalla-ai.env.example" /etc/jarlhalla-ai.env
  chmod 600 /etc/jarlhalla-ai.env
  echo "Created /etc/jarlhalla-ai.env. Add an OpenAI or Anthropic API key, or use Ollama, before using chat."
fi

cp "$REPO_ROOT/deploy/jarlhalla/jarlhalla-ai.service" /etc/systemd/system/jarlhalla-ai.service
systemctl daemon-reload
systemctl enable --now jarlhalla-ai.service

cd "$REPO_ROOT"
npm ci
npm run build -- --base=/
mkdir -p "$ADMIN_ROOT"
rsync -a --delete "$REPO_ROOT/dist/" "$ADMIN_ROOT/"
chown -R www-data:www-data "$ADMIN_ROOT"
find "$ADMIN_ROOT" -type d -exec chmod 755 {} +
find "$ADMIN_ROOT" -type f -exec chmod 644 {} +

if [ ! -f /etc/nginx/.htpasswd-jarlhalla-admin ]; then
  echo
  echo "Create the outer login for $ADMIN_DOMAIN."
  htpasswd -c /etc/nginx/.htpasswd-jarlhalla-admin jarle
  chmod 640 /etc/nginx/.htpasswd-jarlhalla-admin
  chown root:www-data /etc/nginx/.htpasswd-jarlhalla-admin
fi

cp "$REPO_ROOT/deploy/jarlhalla/nginx-admin.conf" /etc/nginx/sites-available/admin.jarlhalla.com
ln -sfn /etc/nginx/sites-available/admin.jarlhalla.com /etc/nginx/sites-enabled/admin.jarlhalla.com
nginx -t
systemctl reload nginx

AI_HEALTH="$(curl -fsS http://127.0.0.1:8787/health || true)"
echo "JarlhallaAI health: ${AI_HEALTH:-unavailable}"

DNS_IP="$(dig +short A "$ADMIN_DOMAIN" @1.1.1.1 | tail -n1 || true)"
if [ "$DNS_IP" = "$PUBLIC_IP" ]; then
  certbot --nginx \
    -d "$ADMIN_DOMAIN" \
    -m "$CERT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --redirect \
    --non-interactive
else
  echo "HTTPS not requested yet: $ADMIN_DOMAIN currently resolves to '${DNS_IP:-nothing}', expected $PUBLIC_IP."
fi

echo
echo "Admin deployment complete."
echo "Portal: https://$ADMIN_DOMAIN/#/jarlhalla-ai (after DNS/TLS)"
echo "AI env: /etc/jarlhalla-ai.env"
echo "AI providers: OpenAI, Anthropic Claude, Ollama"
echo "WordPress: https://jarlhalla.com/wp-admin/"

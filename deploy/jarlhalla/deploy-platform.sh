#!/usr/bin/env bash
set -Eeuo pipefail

if [ "${EUID}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_IP="${PUBLIC_IP:-45.132.114.61}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.jarlhalla.com}"
MAIL_DOMAIN="${MAIL_DOMAIN:-mail.jarlhalla.com}"
ROOT_DOMAIN="${ROOT_DOMAIN:-jarlhalla.com}"

run_wordpress=0
run_admin_ai=0
run_mail=0
run_stats=0

case "${1:---all}" in
  --all)
    run_wordpress=1
    run_admin_ai=1
    run_mail=1
    run_stats=1
    ;;
  --wordpress)
    run_wordpress=1
    ;;
  --admin-ai)
    run_admin_ai=1
    ;;
  --mail)
    run_mail=1
    ;;
  --stats)
    run_stats=1
    ;;
  *)
    echo "Usage: sudo $0 [--all|--wordpress|--admin-ai|--mail|--stats]" >&2
    exit 2
    ;;
esac

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y dnsutils curl ca-certificates

dns_a() {
  dig +short A "$1" @1.1.1.1 | tail -n1
}

print_dns_status() {
  local host="$1"
  local actual
  actual="$(dns_a "$host" || true)"
  printf '%-28s %s\n' "$host" "${actual:-NO A RECORD}"
}

echo "=============================================="
echo " JARLHALLA PLATFORM DEPLOYMENT"
echo " $(date -Is)"
echo "=============================================="
echo
echo "Public DNS before deployment:"
print_dns_status "$ROOT_DOMAIN"
print_dns_status "$ADMIN_DOMAIN"
print_dns_status "$MAIL_DOMAIN"
echo

if [ "$run_wordpress" -eq 1 ]; then
  echo "=== WORDPRESS ADMIN ==="
  bash "$SCRIPT_DIR/bootstrap-wordpress-admin.sh"
  echo
fi

if [ "$run_admin_ai" -eq 1 ]; then
  echo "=== ADMIN + JARLHALLAAI ==="
  if [ "$(dns_a "$ADMIN_DOMAIN" || true)" != "$PUBLIC_IP" ]; then
    echo "NOTE: $ADMIN_DOMAIN does not yet resolve to $PUBLIC_IP."
    echo "The portal and AI backend will be installed, but Certbot will be skipped until DNS is ready."
  fi
  bash "$SCRIPT_DIR/bootstrap-admin-ai.sh"
  echo
fi

if [ "$run_stats" -eq 1 ]; then
  echo "=== AWSTATS + WEBALIZER ==="
  ROOT_DOMAIN="$ROOT_DOMAIN" bash "$SCRIPT_DIR/bootstrap-stats.sh"
  echo
fi

if [ "$run_mail" -eq 1 ]; then
  echo "=== MAIL SERVER ==="
  if [ "$(dns_a "$MAIL_DOMAIN" || true)" != "$PUBLIC_IP" ]; then
    echo "NOTE: $MAIL_DOMAIN does not yet resolve to $PUBLIC_IP."
    echo "Stalwart can be staged locally, but public mail TLS will wait for DNS."
  fi

  bash "$SCRIPT_DIR/mail/bootstrap-mail.sh"
  bash "$SCRIPT_DIR/bootstrap-mail-proxy.sh"
  echo
  echo "Mail server staged. MX is intentionally NOT changed by this script."
  echo "Only publish MX after SMTP/IMAP, TLS, PTR and outbound TCP/25 are verified."
  echo "If mail.$ROOT_DOMAIN is a CNAME, do not use that CNAME as the MX target."
  echo
fi

echo "=== FINAL LOCAL CHECKS ==="
printf 'WordPress: '
curl -fsSI --max-time 15 "https://$ROOT_DOMAIN/" | head -n1 || true

if systemctl is-active --quiet jarlhalla-ai.service; then
  printf 'JarlhallaAI: '
  curl -fsS --max-time 5 http://127.0.0.1:8787/health || true
  echo
fi

if systemctl is-active --quiet jarlhalla-stats.timer; then
  printf 'Stats timer: '
  systemctl is-active jarlhalla-stats.timer || true
fi

if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -Fxq jarlhalla-mail; then
  printf 'Stalwart admin local: '
  curl -fsSI --max-time 5 http://127.0.0.1:8088/admin | head -n1 || true
fi

echo
echo "=============================================="
echo " DEPLOYMENT STAGE COMPLETE"
echo "=============================================="
echo "WordPress login: https://$ROOT_DOMAIN/wp-admin/"
echo "WordPress credentials: /root/jarlhalla-wordpress-admin.txt"
echo "Admin portal: https://$ADMIN_DOMAIN/"
echo "JarlhallaAI: https://$ADMIN_DOMAIN/#/jarlhalla-ai"
echo "AI provider config: /etc/jarlhalla-ai.env"
echo "AWStats: https://$ADMIN_DOMAIN/stats/awstats/"
echo "Webalizer: https://$ADMIN_DOMAIN/stats/webalizer/"
echo "Mail admin: https://$MAIL_DOMAIN/admin"
echo "Mail recovery credentials: /root/jarlhalla-mail-recovery.txt"
echo
echo "Secrets are intentionally not printed by this orchestrator."

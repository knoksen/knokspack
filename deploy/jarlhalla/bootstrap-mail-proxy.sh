#!/usr/bin/env bash
set -Eeuo pipefail

if [ "${EUID}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MAIL_DOMAIN="${MAIL_DOMAIN:-mail.jarlhalla.com}"
PUBLIC_IP="${PUBLIC_IP:-45.132.114.61}"
CERT_EMAIL="${CERT_EMAIL:-jarle@jarlhalla.no}"

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx dnsutils ufw

cp "$REPO_ROOT/deploy/jarlhalla/nginx-mail.conf" /etc/nginx/sites-available/mail.jarlhalla.com
ln -sfn /etc/nginx/sites-available/mail.jarlhalla.com /etc/nginx/sites-enabled/mail.jarlhalla.com
nginx -t
systemctl reload nginx

for port in 25 465 587 143 993 4190; do
  ufw allow "$port/tcp" >/dev/null || true
done

DNS_IP="$(dig +short A "$MAIL_DOMAIN" @1.1.1.1 | tail -n1 || true)"
if [ "$DNS_IP" = "$PUBLIC_IP" ]; then
  certbot --nginx \
    -d "$MAIL_DOMAIN" \
    -m "$CERT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --redirect \
    --non-interactive
else
  echo "HTTPS not requested yet: $MAIL_DOMAIN resolves to '${DNS_IP:-nothing}', expected $PUBLIC_IP."
fi

echo "Mail proxy prepared."
echo "Required PTR/rDNS at the VPS provider: $PUBLIC_IP -> $MAIL_DOMAIN"
echo "After Stalwart is configured, import the Certbot certificate into Stalwart for SMTP/IMAP TLS."

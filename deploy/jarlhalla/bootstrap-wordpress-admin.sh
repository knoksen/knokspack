#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

WP_PATH="${WP_PATH:-/var/www/jarlhalla.no}"
WP_USER="${WP_USER:-jarle-admin}"
WP_EMAIL="${WP_EMAIL:-jarle@jarlhalla.com}"
CREDENTIAL_FILE="${CREDENTIAL_FILE:-/root/jarlhalla-wordpress-admin.txt}"

if ! command -v wp >/dev/null 2>&1; then
  echo "wp-cli is required but was not found." >&2
  exit 1
fi

if ! sudo -u www-data wp --path="$WP_PATH" core is-installed >/dev/null 2>&1; then
  echo "WordPress is not installed at $WP_PATH" >&2
  exit 1
fi

password="$(openssl rand -base64 30 | tr -d '\n')"

if sudo -u www-data wp --path="$WP_PATH" user get "$WP_USER" --field=ID >/dev/null 2>&1; then
  sudo -u www-data wp --path="$WP_PATH" user update "$WP_USER" \
    --user_email="$WP_EMAIL" \
    --role=administrator \
    --user_pass="$password" >/dev/null
  action="updated"
else
  sudo -u www-data wp --path="$WP_PATH" user create "$WP_USER" "$WP_EMAIL" \
    --role=administrator \
    --user_pass="$password" >/dev/null
  action="created"
fi

cat > "$CREDENTIAL_FILE" <<EOF
Jarlhalla WordPress administrator
Generated: $(date -Is)
URL: https://jarlhalla.com/wp-admin/
Username: $WP_USER
Email: $WP_EMAIL
Password: $password
EOF

chmod 600 "$CREDENTIAL_FILE"

echo "WordPress administrator $action: $WP_USER"
echo "Credentials stored root-only at: $CREDENTIAL_FILE"
echo "Read once with: sudo cat $CREDENTIAL_FILE"

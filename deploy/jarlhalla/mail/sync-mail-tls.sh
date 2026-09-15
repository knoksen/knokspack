#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

if [ "${EUID}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

MAIL_HOST="${MAIL_HOST:-mail.jarlhalla.com}"
TARGET_DIR="${TARGET_DIR:-/opt/jarlhalla-mail/etc/tls}"
CONTAINER_NAME="${CONTAINER_NAME:-jarlhalla-mail}"
LE_DIR="/etc/letsencrypt/live/${MAIL_HOST}"
CERT_SRC="${LE_DIR}/fullchain.pem"
KEY_SRC="${LE_DIR}/privkey.pem"

for file in "$CERT_SRC" "$KEY_SRC"; do
  if [ ! -r "$file" ]; then
    echo "Required certificate file is not readable by root: $file" >&2
    exit 1
  fi
done

install -d -o 2000 -g 2000 -m 0750 "$TARGET_DIR"
install -o 2000 -g 2000 -m 0644 -T "$CERT_SRC" "$TARGET_DIR/fullchain.pem"
install -o 2000 -g 2000 -m 0600 -T "$KEY_SRC" "$TARGET_DIR/privkey.pem"

openssl x509 \
  -in "$TARGET_DIR/fullchain.pem" \
  -noout -checkend 0 -subject -issuer -dates -ext subjectAltName

cert_pub="$(openssl x509 -in "$TARGET_DIR/fullchain.pem" -pubkey -noout | openssl pkey -pubin -outform pem | sha256sum | awk '{print $1}')"
key_pub="$(openssl pkey -in "$TARGET_DIR/privkey.pem" -pubout -outform pem | sha256sum | awk '{print $1}')"
if [ "$cert_pub" != "$key_pub" ]; then
  echo "Certificate and private key do not match." >&2
  exit 1
fi

echo "Certificate/key pair verified."
echo "Stalwart certificate path: /etc/stalwart/tls/fullchain.pem"
echo "Stalwart private-key path: /etc/stalwart/tls/privkey.pem"

if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"; then
  docker exec "$CONTAINER_NAME" test -r /etc/stalwart/tls/fullchain.pem
  docker exec "$CONTAINER_NAME" test -r /etc/stalwart/tls/privkey.pem
  echo "Stalwart container can read both TLS files."
fi

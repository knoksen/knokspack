#!/usr/bin/env bash
# CI-only: never point this runner at an existing site or database.
set -Eeuo pipefail
if [[ "${GITHUB_ACTIONS:-}" != true || "${KNOKSPACK_INTEGRATION_TEST:-}" != 1 || -z "${RUNNER_TEMP:-}" ]]; then
  echo "Refusing to run outside an explicitly enabled disposable GitHub runner" >&2
  exit 1
fi
umask 077
REPO="$(pwd)"
SANDBOX="$(mktemp -d "$RUNNER_TEMP/knokspack-wp.XXXXXX")"
export TEST_PRIVATE_DIR="$SANDBOX/private"
mkdir -p "$SANDBOX/site" "$TEST_PRIVATE_DIR"
export TEST_TLS_KEY="$SANDBOX/fixture.key"
export TEST_TLS_CERT="$SANDBOX/fixture.crt"
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj /CN=127.0.0.1 \
  -addext subjectAltName=IP:127.0.0.1 -keyout "$TEST_TLS_KEY" -out "$TEST_TLS_CERT" >/dev/null 2>&1
export NODE_EXTRA_CA_CERTS="$TEST_TLS_CERT"
request() { curl --cacert "$TEST_TLS_CERT" "$@"; }
trap 'if [[ -f "$SANDBOX/site/wp-content/debug.log" ]]; then tail -n 60 "$SANDBOX/site/wp-content/debug.log"; fi' ERR
curl --fail --silent --show-error --location --retry 3   https://github.com/wp-cli/wp-cli/releases/download/v2.12.0/wp-cli-2.12.0.phar -o "$SANDBOX/wp-cli.phar"
printf '%s  %s\n' ce34ddd838f7351d6759068d09793f26755463b4a4610a5a5c0a97b68220d85c "$SANDBOX/wp-cli.phar" | sha256sum --check
wp() { php "$SANDBOX/wp-cli.phar" --path="$SANDBOX/site" "$@"; }
# System unzip preserves long paths in newer WordPress distributions.
curl --fail --silent --show-error --location --retry 3 "https://wordpress.org/wordpress-$TEST_WORDPRESS_VERSION.zip" -o "$SANDBOX/core.zip"
unzip -q "$SANDBOX/core.zip" -d "$SANDBOX/core"
cp -a "$SANDBOX/core/wordpress/." "$SANDBOX/site/"
wp core verify-checksums --version="$TEST_WORDPRESS_VERSION" --locale=en_US
wp config create --dbname=knokspack_integration --dbuser=knokspack_integration   --dbpass="$TEST_DB_PASSWORD" --dbhost=127.0.0.1:3306 --extra-php <<'PHP'
define('KNOKSPACK_INTEGRATION_TEST', true);
define('WP_HOME', 'https://127.0.0.1:8092');
define('WP_SITEURL', 'https://127.0.0.1:8092');
define('KNOKSPACK_PRIVATE_BACKUP_DIR', getenv('TEST_PRIVATE_DIR'));
define('DISABLE_WP_CRON', true);
define('WP_HTTP_BLOCK_EXTERNAL', true);
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
// The CI-only TLS proxy is local and always overwrites this header.
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) === true
    && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https'
    && ($_SERVER['REMOTE_ADDR'] ?? '') === '127.0.0.1') {
    $_SERVER['HTTPS'] = 'on';
}
PHP
export TEST_ADMIN_PASSWORD="$(openssl rand -hex 24)"
export TEST_SUBSCRIBER_PASSWORD="$(openssl rand -hex 24)"
export TEST_EDITOR_PASSWORD="$(openssl rand -hex 24)"
wp core install --url=https://127.0.0.1:8092 --title=Knokspack-integration   --admin_user=integration_admin --admin_password="$TEST_ADMIN_PASSWORD"   --admin_email=integration@example.invalid --skip-email
unzip -q "$REPO/build/knokspack.zip" -d "$SANDBOX/site/wp-content/plugins"
wp plugin activate knokspack
wp eval-file "$REPO/tests/wordpress/assertions.php"
wp eval-file "$REPO/tests/wordpress/roundtrip.php"
mkdir -p "$SANDBOX/site/wp-content/mu-plugins"
cp "$REPO/tests/wordpress/session-fixture.php" "$SANDBOX/site/wp-content/mu-plugins/knokspack-integration.php"
wp user update integration_subscriber --user_pass="$TEST_SUBSCRIBER_PASSWORD"
wp user create integration_editor editor@example.invalid --role=editor --user_pass="$TEST_EDITOR_PASSWORD"
php -S 127.0.0.1:8091 -t "$SANDBOX/site" >"$SANDBOX/server.log" 2>&1 &
server_pid=$!
node "$REPO/tests/wordpress/tls-proxy.mjs" >"$SANDBOX/proxy.log" 2>&1 &
proxy_pid=$!
trap 'kill "$proxy_pid" "$server_pid" 2>/dev/null || true' EXIT
for attempt in {1..30}; do
  if request --silent --fail https://127.0.0.1:8092/ > /dev/null; then break; fi
  echo "Waiting for disposable HTTP server (attempt $attempt)"
  sleep 1
done
nonce="$(wp eval 'echo wp_create_nonce("knokspack_analytics_consent");')"
endpoint=https://127.0.0.1:8092/wp-admin/admin-ajax.php
cookies="$SANDBOX/cookies"
preference() {
  request --silent --show-error --fail-with-body --cookie "$cookies" --cookie-jar "$cookies"     --header 'Origin: https://127.0.0.1:8092' --data-urlencode action=knokspack_set_analytics_consent     --data-urlencode "nonce=$nonce" --data-urlencode "consent=$1" "$endpoint"     | python -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] is True, d'
}
count_views() { wp eval 'global $wpdb; echo $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}knokspack_analytics");'; }
page_view() { request --silent --show-error --fail --cookie "$cookies" -A 'Mozilla/5.0 integration' https://127.0.0.1:8092/ > /dev/null; }
before="$(count_views)"
preference denied
page_view
[[ "$(count_views)" == "$before" ]]
preference granted
page_view
[[ "$(count_views)" == "$((before + 1))" ]]
preference denied
page_view
[[ "$(count_views)" == "$((before + 1))" ]]
status="$(request --silent --output "$SANDBOX/rejected.json" --write-out '%{http_code}'   --header 'Origin: https://attacker.invalid' --data-urlencode action=knokspack_set_analytics_consent   --data-urlencode "nonce=$nonce" --data-urlencode consent=granted "$endpoint")"
[[ "$status" == 403 ]]
status="$(request --silent --output "$SANDBOX/guest-backup.json" --write-out '%{http_code}'   --data-urlencode action=knokspack_restore_backup "$endpoint")"
[[ "$status" == 400 ]]
echo "PASS: real HTTP consent grant/withdrawal, collection gate, cross-origin rejection and guest restore denial"
node "$REPO/tests/wordpress/authenticated.mjs"
wp eval 'global $wpdb; if ((int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}knokspack_analytics_events") !== 1) { throw new RuntimeException("Unexpected event rows after consent withdrawal"); }'
wp plugin deactivate knokspack
wp eval 'if (get_option("knokspack_integration_marker") !== "synthetic-only") { throw new RuntimeException("Deactivation lost fixture data"); }'
echo "PASS: packaged plugin activation/deactivation preserved fixture data"
# The runner and its service database are destroyed by GitHub; no existing paths or databases are deleted here.

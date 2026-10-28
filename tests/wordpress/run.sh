#!/usr/bin/env bash
# CI-only: never point this runner at an existing site or database.
set -euo pipefail
if [[ "${GITHUB_ACTIONS:-}" != true || "${KNOKSPACK_INTEGRATION_TEST:-}" != 1 || -z "${RUNNER_TEMP:-}" ]]; then
  echo "Refusing to run outside an explicitly enabled disposable GitHub runner" >&2
  exit 1
fi
umask 077
REPO="$(pwd)"
SANDBOX="$(mktemp -d "$RUNNER_TEMP/knokspack-wp.XXXXXX")"
export TEST_PRIVATE_DIR="$SANDBOX/private"
mkdir -p "$SANDBOX/site" "$TEST_PRIVATE_DIR"
curl --fail --silent --show-error --location --retry 3   https://github.com/wp-cli/wp-cli/releases/download/v2.12.0/wp-cli-2.12.0.phar -o "$SANDBOX/wp-cli.phar"
printf '%s  %s\n' ce34ddd838f7351d6759068d09793f26755463b4a4610a5a5c0a97b68220d85c "$SANDBOX/wp-cli.phar" | sha256sum --check
wp() { php "$SANDBOX/wp-cli.phar" --path="$SANDBOX/site" "$@"; }
wp core download --version="$TEST_WORDPRESS_VERSION" --locale=en_US
wp core verify-checksums --version="$TEST_WORDPRESS_VERSION" --locale=en_US
wp config create --dbname=knokspack_integration --dbuser=knokspack_integration   --dbpass="$TEST_DB_PASSWORD" --dbhost=127.0.0.1:3306 --extra-php <<'PHP'
define('KNOKSPACK_INTEGRATION_TEST', true);
define('KNOKSPACK_PRIVATE_BACKUP_DIR', getenv('TEST_PRIVATE_DIR'));
define('DISABLE_WP_CRON', true);
define('WP_HTTP_BLOCK_EXTERNAL', true);
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
PHP
wp core install --url=http://127.0.0.1:8091 --title=Knokspack-integration   --admin_user=integration_admin --admin_password="$(openssl rand -hex 24)"   --admin_email=integration@example.invalid --skip-email
unzip -q "$REPO/build/knokspack.zip" -d "$SANDBOX/site/wp-content/plugins"
wp plugin activate knokspack
wp eval-file "$REPO/tests/wordpress/assertions.php"
php -S 127.0.0.1:8091 -t "$SANDBOX/site" >"$SANDBOX/server.log" 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
for attempt in {1..30}; do
  if curl --silent --fail http://127.0.0.1:8091/ > /dev/null; then break; fi
  sleep 1
done
nonce="$(wp eval 'echo wp_create_nonce("knokspack_analytics_consent");')"
endpoint=http://127.0.0.1:8091/wp-admin/admin-ajax.php
cookies="$SANDBOX/cookies"
preference() {
  curl --silent --show-error --fail-with-body --cookie "$cookies" --cookie-jar "$cookies"     --header 'Origin: http://127.0.0.1:8091' --data-urlencode action=knokspack_set_analytics_consent     --data-urlencode "nonce=$nonce" --data-urlencode "consent=$1" "$endpoint"     | python -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] is True, d'
}
count_views() { wp eval 'global $wpdb; echo $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}knokspack_analytics");'; }
page_view() { curl --silent --show-error --fail --cookie "$cookies" -A 'Mozilla/5.0 integration' http://127.0.0.1:8091/ > /dev/null; }
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
status="$(curl --silent --output "$SANDBOX/rejected.json" --write-out '%{http_code}'   --header 'Origin: https://attacker.invalid' --data-urlencode action=knokspack_set_analytics_consent   --data-urlencode "nonce=$nonce" --data-urlencode consent=granted "$endpoint")"
[[ "$status" == 403 ]]
status="$(curl --silent --output "$SANDBOX/guest-backup.json" --write-out '%{http_code}'   --data-urlencode action=knokspack_restore_backup "$endpoint")"
[[ "$status" == 400 ]]
echo "PASS: real HTTP consent grant/withdrawal, collection gate, cross-origin rejection and guest restore denial"
wp plugin deactivate knokspack
wp eval 'if (get_option("knokspack_integration_marker") !== "synthetic-only") { throw new RuntimeException("Deactivation lost fixture data"); }'
echo "PASS: packaged plugin activation/deactivation preserved fixture data"
# The runner and its service database are destroyed by GitHub; no existing paths or databases are deleted here.

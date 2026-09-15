#!/usr/bin/env bash
set -Eeuo pipefail

if [ "${EUID}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

ROOT_DOMAIN="${ROOT_DOMAIN:-jarlhalla.com}"
ADMIN_ROOT="${ADMIN_ROOT:-/var/www/admin.jarlhalla.com}"
ACCESS_LOG="${JARLHALLA_ACCESS_LOG:-/var/log/nginx/jarlhalla.com.access.log}"
ERROR_LOG="${JARLHALLA_ERROR_LOG:-/var/log/nginx/jarlhalla.com.error.log}"
AWOUT="$ADMIN_ROOT/stats/awstats"
WEBOUT="$ADMIN_ROOT/stats/webalizer"

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y awstats webalizer

VHOST="${JARLHALLA_NGINX_VHOST:-}"
if [ -z "$VHOST" ]; then
  while IFS= read -r candidate; do
    resolved="$(readlink -f "$candidate")"
    if python3 - "$resolved" "$ROOT_DOMAIN" <<'PY' >/dev/null 2>&1
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
domain = sys.argv[2]
text = path.read_text()
for match in re.finditer(r"server_name\s+([^;]+);", text):
    names = match.group(1).split()
    if domain in names:
        raise SystemExit(0)
raise SystemExit(1)
PY
    then
      VHOST="$resolved"
      break
    fi
  done < <(find /etc/nginx/sites-enabled -maxdepth 1 \( -type f -o -type l \) 2>/dev/null | sort)
else
  VHOST="$(readlink -f "$VHOST")"
fi

if [ -z "$VHOST" ] || [ ! -f "$VHOST" ]; then
  echo "Unable to find the active Nginx vhost serving $ROOT_DOMAIN." >&2
  echo "Set JARLHALLA_NGINX_VHOST=/path/to/vhost and run again." >&2
  exit 1
fi

BACKUP="${VHOST}.before-stats-$(date +%Y%m%d-%H%M%S)"
cp -a "$VHOST" "$BACKUP"

env VHOST="$VHOST" ROOT_DOMAIN="$ROOT_DOMAIN" ACCESS_LOG="$ACCESS_LOG" ERROR_LOG="$ERROR_LOG" python3 <<'PY'
import os
import re
from pathlib import Path

path = Path(os.environ["VHOST"])
domain = os.environ["ROOT_DOMAIN"]
access_log = os.environ["ACCESS_LOG"]
error_log = os.environ["ERROR_LOG"]
text = path.read_text()

if access_log in text and error_log in text:
    raise SystemExit(0)

matches = list(re.finditer(r"server_name\s+([^;]+);", text))
target = None
for match in matches:
    if domain in match.group(1).split():
        target = match
        break

if target is None:
    raise SystemExit(f"No server_name block contains {domain}")

insert = ""
if access_log not in text:
    insert += f"\n    access_log {access_log} combined;"
if error_log not in text:
    insert += f"\n    error_log {error_log};"

text = text[:target.end()] + insert + text[target.end():]
path.write_text(text)
PY

nginx -t
systemctl reload nginx

# Never truncate existing logs. Create them only when absent.
touch "$ACCESS_LOG" "$ERROR_LOG"
chown www-data:adm "$ACCESS_LOG" "$ERROR_LOG" 2>/dev/null || true
chmod 0640 "$ACCESS_LOG" "$ERROR_LOG" 2>/dev/null || true

install -d -o www-data -g www-data -m 0755 "$AWOUT" "$AWOUT/icon" "$WEBOUT"

AWCONF="/etc/awstats/awstats.${ROOT_DOMAIN}.conf"
if [ ! -f "$AWCONF" ]; then
  cp /etc/awstats/awstats.conf "$AWCONF"
fi

env AWCONF="$AWCONF" ROOT_DOMAIN="$ROOT_DOMAIN" ACCESS_LOG="$ACCESS_LOG" python3 <<'PY'
import os
import re
from pathlib import Path

path = Path(os.environ["AWCONF"])
domain = os.environ["ROOT_DOMAIN"]
log = os.environ["ACCESS_LOG"]
text = path.read_text()
values = {
    "LogFile": f'"{log}"',
    "SiteDomain": f'"{domain}"',
    "HostAliases": f'"www.{domain} localhost 127.0.0.1"',
    "DNSLookup": "0",
    "AllowToUpdateStatsFromBrowser": "0",
    "DirIcons": '"/stats/awstats/icon"',
}
for key, value in values.items():
    pattern = re.compile(rf"(?m)^{re.escape(key)}=.*$")
    replacement = f"{key}={value}"
    if pattern.search(text):
        text = pattern.sub(replacement, text, count=1)
    else:
        text += f"\n{replacement}\n"
path.write_text(text)
PY

install -d -m 0755 /etc/webalizer
cat > "/etc/webalizer/${ROOT_DOMAIN}.conf" <<EOF
LogFile        $ACCESS_LOG
OutputDir      $WEBOUT
HostName       $ROOT_DOMAIN
Incremental    yes
Quiet          yes
ReallyQuiet    yes
HistoryName    webalizer.hist
IncrementalName webalizer.current
HideSite       $ROOT_DOMAIN
HideReferrer   $ROOT_DOMAIN
EOF

cat > /usr/local/sbin/jarlhalla-stats-update.sh <<EOF
#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DOMAIN="$ROOT_DOMAIN"
ACCESS_LOG="$ACCESS_LOG"
AWOUT="$AWOUT"
WEBOUT="$WEBOUT"

mkdir -p "\$AWOUT/icon" "\$WEBOUT"
test -f "\$ACCESS_LOG" || { echo "Missing Nginx log: \$ACCESS_LOG" >&2; exit 1; }

/usr/lib/cgi-bin/awstats.pl -config="\$ROOT_DOMAIN" -update
/usr/share/awstats/tools/awstats_buildstaticpages.pl \
  -config="\$ROOT_DOMAIN" \
  -dir="\$AWOUT" \
  -awstatsprog=/usr/lib/cgi-bin/awstats.pl

if [ -d /usr/share/awstats/icon ]; then
  cp -a /usr/share/awstats/icon/. "\$AWOUT/icon/"
fi

if [ -f "\$AWOUT/awstats.\$ROOT_DOMAIN.html" ]; then
  ln -sfn "awstats.\$ROOT_DOMAIN.html" "\$AWOUT/index.html"
fi

/usr/bin/webalizer -c "/etc/webalizer/\$ROOT_DOMAIN.conf"
chown -R www-data:www-data "${ADMIN_ROOT}/stats"
EOF
chmod 0750 /usr/local/sbin/jarlhalla-stats-update.sh

cat > /etc/systemd/system/jarlhalla-stats.service <<'EOF'
[Unit]
Description=Generate Jarlhalla AWStats and Webalizer reports
After=nginx.service
Wants=nginx.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/jarlhalla-stats-update.sh
EOF

cat > /etc/systemd/system/jarlhalla-stats.timer <<'EOF'
[Unit]
Description=Update Jarlhalla web statistics every 30 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=30min
AccuracySec=1min
Unit=jarlhalla-stats.service

[Install]
WantedBy=timers.target
EOF

systemd-analyze verify /etc/systemd/system/jarlhalla-stats.service /etc/systemd/system/jarlhalla-stats.timer
systemctl daemon-reload
systemctl reset-failed jarlhalla-stats.service jarlhalla-stats.timer 2>/dev/null || true
systemctl enable --now jarlhalla-stats.timer

# Generate the first report. An empty access log is valid immediately after setup.
systemctl start jarlhalla-stats.service

echo
echo "Jarlhalla statistics deployment complete."
echo "Active vhost: $VHOST"
echo "Vhost backup: $BACKUP"
echo "Access log: $ACCESS_LOG"
echo "AWStats: https://admin.jarlhalla.com/stats/awstats/"
echo "Webalizer: https://admin.jarlhalla.com/stats/webalizer/"
systemctl --no-pager --full status jarlhalla-stats.timer || true

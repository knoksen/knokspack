#!/usr/bin/env bash
# Read-only. Never prints environment values, headers, tokens or log content.
set -u
printf '=== EXISTING GATEWAY ===\n'
python3 - <<'PY'
import urllib.request, urllib.error, json
url='http://127.0.0.1:8080/health'
try:
    with urllib.request.urlopen(url,timeout=8) as response:
        data=json.load(response)
        print('Gateway HTTP:',response.status)
        print('Gateway health confirmed:',data.get('ok') is True)
except urllib.error.HTTPError as e:
    print('Gateway HTTP:',e.code,'(authentication or route needs verification)')
except Exception:
    print('Gateway health: NOT VERIFIED (connection or response failed)')
PY
printf '\n=== CONFIGURATION PRESENCE (NO VALUES) ===\n'
python3 - <<'PY'
from pathlib import Path
roots=[Path('/opt/jarlhalla'),Path('/opt/knokspack-jarlhalla')]
for root in roots:
    print(str(root), 'exists:',root.is_dir())
    for name in ['.env','.env.example','docker-compose.yml','compose.yml','JARLHALLA-AGENT.md']:
        f=root/name
        if f.is_file():
            print('Found:',str(f))
            if name=='.env':
                try:
                    keys={line.split('=',1)[0].strip() for line in f.read_text().splitlines() if '=' in line and not line.lstrip().startswith('#')}
                    for key in ['NOTION_TOKEN','NOTION_DATABASE_ID','NOTION_TASKS_DATABASE_ID','HARPA_SECRET']:
                        print(key,'key present:',key in keys)
                except OSError:
                    print('Environment key names: unreadable')
PY

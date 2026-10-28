#!/usr/bin/env python3
"""Run interactively as root on the VPS. Never print credentials."""
import datetime
import getpass
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import urllib.error
import urllib.request

ROOT = Path('/opt/jarlhalla/app')
ENV = ROOT / '.env'
CONTAINER = 'jarlhalla-control-gateway'


def environment():
    raw = subprocess.check_output(['docker', 'inspect', CONTAINER], text=True)
    return dict(item.split('=', 1) for item in json.loads(raw)[0]['Config']['Env'] if '=' in item)


def validate(token, parent, version):
    for resource in ['/users/me', '/pages/' + parent]:
        request = urllib.request.Request('https://api.notion.com/v1' + resource,
            headers={'Authorization': 'Bearer ' + token, 'Notion-Version': version})
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                if response.status != 200:
                    raise RuntimeError('Notion validation failed')
        except urllib.error.HTTPError as exc:
            raise RuntimeError(f'Notion HTTP {exc.code}. Check token and page connection. Nothing saved.') from None
        except (urllib.error.URLError, TimeoutError):
            raise RuntimeError('Notion connection failed. Nothing saved.') from None


def replace_token(source, token):
    lines = source.splitlines()
    lines = [line for line in lines if not re.match(r'^\s*(?:export\s+)?NOTION_TOKEN\s*=', line)]
    return '\n'.join(lines) + '\nNOTION_TOKEN=' + token + '\n'


def write_private(path, text):
    fd, temporary = tempfile.mkstemp(dir=path.parent, prefix='.notion-update-')
    try:
        with os.fdopen(fd, 'w') as file:
            file.write(text)
            file.flush()
            os.fsync(file.fileno())
        os.chmod(temporary, 0o600)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def recreate():
    result = subprocess.run(['docker', 'compose', '-f', str(ROOT / 'docker-compose.yml'),
        'up', '-d', '--no-deps', '--force-recreate', 'gateway'], cwd=ROOT,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if result.returncode:
        raise RuntimeError('Gateway recreation failed')


def main():
    if os.geteuid() != 0:
        raise RuntimeError('Run as root.')
    env = environment()
    parent = env.get('NOTION_SYNC_PARENT_PAGE_ID', '').strip()
    if not re.fullmatch(r'[0-9a-fA-F-]{32,36}', parent):
        raise RuntimeError('Parent page ID is missing or invalid. Nothing changed.')
    token = getpass.getpass('Notion integration token (hidden): ').strip()
    if not re.fullmatch(r'[A-Za-z0-9_-]{20,}', token):
        raise RuntimeError('Invalid token format. Nothing changed.')
    validate(token, parent, env.get('NOTION_VERSION') or '2022-06-28')
    source = ENV.read_text()
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S-%f')
    backup = ROOT / ('.env.backup-notion-' + stamp)
    shutil.copy2(ENV, backup)
    backup.chmod(0o600)
    write_private(ENV, replace_token(source, token))
    try:
        recreate()
        updated = environment()
        if updated.get('NOTION_TOKEN') != token:
            raise RuntimeError('Container did not receive token')
    except Exception:
        write_private(ENV, source)
        try:
            recreate()
        except Exception:
            raise RuntimeError('Restore of configuration saved, but gateway restart failed. Check service manually.') from None
        raise RuntimeError('Gateway update failed. Previous configuration restored.') from None
    print('PASS: token and parent-page access verified; gateway recreated with the token.')
    print('Backup:', backup)
    print('No Notion content was written. Gateway status and controlled sync still require verification.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        # Only known error messages are emitted; never serialize provider bodies or env.
        if isinstance(exc, RuntimeError):
            print('STOP:', str(exc))
        else:
            print('STOP:', type(exc).__name__, '(details suppressed)')
        raise SystemExit(1)

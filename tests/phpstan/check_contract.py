"""Verify supported legacy args pass and malformed args/missing symbols still fail."""
import json
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[2]
php = sys.argv[1] if len(sys.argv) > 1 else 'php'
for fixture, expected in [('block-positive.php', 0), ('block-negative.php', 3)]:
    result = subprocess.run([php, str(root / 'vendor/bin/phpstan'), 'analyse',
                             str(Path(__file__).with_name(fixture)), '--no-progress',
                             '--memory-limit=2G', '--error-format=json'],
                            cwd=root, capture_output=True, text=True, encoding='utf-8')
    data = json.loads(result.stdout)
    messages = [message for file in data['files'].values() for message in file['messages']]
    if data['errors'] or len(messages) != expected or result.returncode != (1 if expected else 0):
        raise SystemExit('Contract validation failed: ' + fixture + '\n' + result.stdout + result.stderr)
    if expected and sorted(message['identifier'] for message in messages) != [
            'argument.type', 'argument.type', 'constant.notFound']:
        raise SystemExit('Unexpected negative-case diagnostics')
    print(f'PASS: {fixture} ({expected} expected errors)')

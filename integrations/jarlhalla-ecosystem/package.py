"""Build a minimal, deterministic installation ZIP; excludes tests and repo code."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import argparse
import hashlib

root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, default=root / 'dist/jarlhalla-ecosystem-0.1.0.zip')
args = parser.parse_args()
args.output.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(args.output, 'w', compression=ZIP_DEFLATED) as archive:
    for name in ['jarlhalla-ecosystem.php', 'workflow.php', 'registry.json', 'assets/directory.css', 'README.md']:
        info = ZipInfo('jarlhalla-ecosystem/' + name, date_time=(2026, 10, 28, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, (root / name).read_bytes())
print(str(args.output.resolve()))
print('SHA256 ' + hashlib.sha256(args.output.read_bytes()).hexdigest())

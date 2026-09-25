#!/usr/bin/env bash
# Builds the admin app and packs an installable plugin ZIP: build/knokspack.zip
# Usage: npm run package
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

OUT=build
STAGE="$OUT/knokspack"
rm -rf "$OUT"
mkdir -p "$STAGE"

cp wp-site-suite.php readme.txt license.txt "$STAGE/"
cp -r includes modules templates assets dist "$STAGE/"
# Empty module stubs are not loaded; leave them out of the release.
find "$STAGE/modules" -name '*.php' -size 0 -delete

(cd "$OUT" && zip -rq knokspack.zip knokspack)
echo "Wrote $OUT/knokspack.zip ($(du -h "$OUT/knokspack.zip" | cut -f1))"

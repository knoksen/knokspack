#!/usr/bin/env bash
# Compatibility entrypoint. Python builds and validates only the root source.
set -euo pipefail
cd "$(dirname "$0")/.."
python scripts/package.py

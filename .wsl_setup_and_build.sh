#!/usr/bin/env bash
set -e
cd /mnt/e/Github/knokspack

if command -v node >/dev/null 2>&1; then
  echo "node present: $(node -v)"
else
  echo "Installing nvm and Node LTS..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh -o /tmp/install_nvm.sh
  bash /tmp/install_nvm.sh
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install --lts
  nvm use --lts
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
node -v
npm -v
npm ci
npm run build
npm test

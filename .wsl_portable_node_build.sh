#!/usr/bin/env bash
set -e
cd /mnt/e/Github/knokspack
echo "CWD: $(pwd)"
mkdir -p .local_node
NODE_VER=node-v18.19.1-linux-x64
NODE_DIR=.local_node/$NODE_VER
if [ ! -d "$NODE_DIR" ]; then
  echo "Downloading Node 18.19.1..."
  curl -fsSL -o /tmp/node.tar.xz https://nodejs.org/dist/v18.19.1/node-v18.19.1-linux-x64.tar.xz
  tar -xf /tmp/node.tar.xz -C .local_node
fi
export PATH="$(pwd)/$NODE_DIR/bin:$PATH"
echo "Using node: $(which node)"
node -v

echo "Using npm: $(which npm)"
npm -v

echo "Running npm install (legacy-peer-deps)..."
npm install --legacy-peer-deps

echo "Running npm run build..."
npm run build

echo "Running npm test..."
npm test

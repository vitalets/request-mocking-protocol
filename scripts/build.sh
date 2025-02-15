#!/bin/bash

# Exit on any error
set -euo pipefail

rm -rf ./dist
npx tsc -p tsconfig.build.json

# copy to 'node_modules/mock-server-request' to allow import from 'mock-server-request' in examples
rm -rf ./node_modules/mock-server-request
mkdir -p ./node_modules/mock-server-request
cp -R ./dist ./node_modules/mock-server-request/
cp ./package.json ./node_modules/mock-server-request/package.json

#!/bin/bash

# Exit on any error
set -euo pipefail

rm -rf ./dist
npx tsc -p tsconfig.build.json

# copy to 'examples/node_modules/mock-server-request' to allow import from 'mock-server-request' in examples
rm -rf examples/node_modules/mock-server-request
mkdir -p examples/node_modules/mock-server-request
cp -R ./dist examples/node_modules/mock-server-request/
cp ./package.json examples/node_modules/mock-server-request/package.json

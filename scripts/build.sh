#!/bin/bash

# Exit on any error
set -euo pipefail

rm -rf ./dist
npx tsc -p tsconfig.build.json

# copy to 'examples/node_modules/' to allow import by name from examples
rm -rf examples/node_modules/request-mocking-protocol
mkdir -p examples/node_modules/request-mocking-protocol
cp -R ./dist examples/node_modules/request-mocking-protocol/
cp ./package.json examples/node_modules/request-mocking-protocol/package.json

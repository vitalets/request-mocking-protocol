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

# also copy to 'examples/nextjs-playwright/node_modules/'
# because Next.js in turbopack mode can't import from upper dir (for some reason)
rm -rf examples/nextjs-playwright/node_modules/request-mocking-protocol
mkdir -p examples/nextjs-playwright/node_modules/request-mocking-protocol
cp -R ./dist examples/nextjs-playwright/node_modules/request-mocking-protocol/
cp ./package.json examples/nextjs-playwright/node_modules/request-mocking-protocol/package.json
# also copy dependencies
cp -R ./node_modules/lodash ./node_modules/urlpattern-polyfill examples/nextjs-playwright/node_modules/
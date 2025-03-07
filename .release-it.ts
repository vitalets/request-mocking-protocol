import type { Config } from 'release-it';

export default {
  git: {
    requireCleanWorkingDir: false,
  },
  hooks: {
    'before:init': [
      'npm run lint',
      'npm run prettier',
      'npm run tsc',
      'npm ci',
      'npm run build',
      'npm test',
    ],
  },
  plugins: {
    '@release-it/keep-a-changelog': {
      filename: 'CHANGELOG.md',
      addUnreleased: true,
      addVersionUrl: true,
    },
  },
} satisfies Config;

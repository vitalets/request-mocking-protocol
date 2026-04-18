/**
 * Finalizes CHANGELOG.md for a release: stamps the [Unreleased] section with
 * the given version and today's date, opens a fresh [Unreleased] section above
 * it, and prints the release notes to stdout for use in CI (e.g. GitHub Release body).
 *
 * Usage:
 *   node scripts/release-changelog.ts <version>
 */
import fs from 'node:fs';

const CHANGELOG_PATH = 'CHANGELOG.md';
const logger = console;

const version = process.argv[2];

main();

function main() {
  if (!version) {
    logger.error('Usage: release-changelog.ts <version>');
    process.exit(1);
  }

  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const newContent = stampChangelog(content, version);
  fs.writeFileSync(CHANGELOG_PATH, newContent);
  const releaseNotes = extractReleaseNotes(newContent, version);
  logger.log(releaseNotes);
}

function stampChangelog(text: string, version: string) {
  const date = new Date().toISOString().slice(0, 10);
  const updated = text.replace('## [Unreleased]', `## [Unreleased]\n\n## [${version}] - ${date}`);
  if (updated === text) {
    logger.error('Could not find "## [Unreleased]" section in CHANGELOG.md');
    process.exit(1);
  }
  return updated;
}

function extractReleaseNotes(text: string, version: string) {
  const lines = text.split('\n');
  const headingIndex = lines.findIndex((l) => l.startsWith(`## [${version}]`));
  const bodyLines = [];
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (lines[i]?.startsWith('## ')) break;
    bodyLines.push(lines[i]);
  }
  return bodyLines.join('\n').trim();
}

import { execFileSync } from 'node:child_process';

const COMMITTER_DATE_ISO_FORMAT = '%cI';
const CURRENT_POSTS_PREFIX = 'blog/posts/';
const LEGACY_POSTS_PREFIX = 'src/content/blog/';

interface FileCommitDates {
  createdAt: Date;
  updatedAt: Date;
}

function normalizeGitPath(filePath: string) {
  return filePath.replaceAll('\\', '/').replace(/^\.\//, '');
}

function getCommitDates(filePath: string): Date[] {
  try {
    const output = execFileSync(
      'git',
      [
        'log',
        `--format=${COMMITTER_DATE_ISO_FORMAT}`,
        '--diff-filter=AM',
        '--',
        filePath,
      ],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    ).trim();

    return output
      .split(/\r?\n/g)
      .filter(Boolean)
      .map(value => new Date(value))
      .filter(date => !Number.isNaN(date.getTime()));
  } catch {
    return [];
  }
}

function getLegacyPostPath(filePath: string) {
  if (!filePath.startsWith(CURRENT_POSTS_PREFIX)) {
    return null;
  }

  return LEGACY_POSTS_PREFIX + filePath.slice(CURRENT_POSTS_PREFIX.length);
}

/**
 * Read the creation and latest content-change dates of a post from Git.
 *
 * Posts moved from `src/content/blog` to `blog/posts` during the Astro 7
 * migration have two path histories. The first commit at the current path is
 * the migration itself, so it is excluded when a legacy history exists.
 */
export default function getFileCommitDates(filePath: string): FileCommitDates {
  const normalizedPath = normalizeGitPath(filePath);
  const legacyPath = getLegacyPostPath(normalizedPath);
  const legacyDates = legacyPath ? getCommitDates(legacyPath) : [];
  let currentDates = getCommitDates(normalizedPath);

  if (legacyDates.length > 0 && currentDates.length > 0) {
    currentDates = currentDates.slice(0, -1);
  }

  const dates = [...currentDates, ...legacyDates]
    .sort((left, right) => right.getTime() - left.getTime());

  if (dates.length === 0) {
    throw new Error(
      `Unable to read Git history for "${normalizedPath}". ` +
      'Use a full Git checkout or add date/updateDate to the post frontmatter.',
    );
  }

  return {
    createdAt: dates[dates.length - 1],
    updatedAt: dates[0],
  };
}

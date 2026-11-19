import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

interface GitHubRepo {
  html_url: string;
  pushed_at: string | null;
}

interface GitHubCommit {
  html_url: string;
  commit: {
    message: string;
    committer: { date: string } | null;
  };
}

interface GitHubRelease {
  tag_name: string;
  html_url: string;
}

interface RepoPulse {
  fullName: string;
  url: string;
  updatedAt: string;
  dateLabel: string;
  summary: string;
}

const REPOS: readonly string[] = [
  'nelomr/trace-kit',
  'nelomr/criptofolio',
  'nelomr/components-kit',
  'criptonlabs/agent-apis-sdk',
  'nelomr/claude-mods',
];

const API_ROOT = 'https://api.github.com/repos';
const README_PATH = fileURLToPath(new URL('../README.md', import.meta.url));
const ACTIVITY_BLOCK = /<!-- ACTIVITY:START -->[\s\S]*?<!-- ACTIVITY:END -->/;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_MESSAGE_LENGTH = 68;
const HTML_ESCAPES: Readonly<Record<string, string>> = { '<': '&lt;', '>': '&gt;' };

const TOKEN = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'nelomr-profile-updater',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function getJson<T>(url: string, allowNotFound: boolean): Promise<T | null> {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (allowNotFound && response.status === 404) return null;
  if (!response.ok) throw new Error(`GET ${url} failed with HTTP ${response.status}`);
  return (await response.json()) as T;
}

function firstLine(text: string): string {
  return (text.split(/\r?\n/, 1)[0] ?? '').trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_[\]|<>]/g, (char) => HTML_ESCAPES[char] ?? `\\${char}`);
}

function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—';
  return new Date(isoDate).toISOString().slice(0, 10);
}

async function getRepoPulse(fullName: string): Promise<RepoPulse> {
  const [repo, commits, latestRelease] = await Promise.all([
    getJson<GitHubRepo>(`${API_ROOT}/${fullName}`, false),
    getJson<GitHubCommit[]>(`${API_ROOT}/${fullName}/commits?per_page=1`, false),
    getJson<GitHubRelease>(`${API_ROOT}/${fullName}/releases/latest`, true),
  ]);
  if (!repo) throw new Error(`Repository ${fullName} returned no data`);

  const latestCommit = commits?.[0] ?? null;
  const commitDate = latestCommit?.commit.committer?.date ?? repo.pushed_at;
  const commitMessage = latestCommit
    ? escapeMarkdown(truncate(firstLine(latestCommit.commit.message), MAX_MESSAGE_LENGTH))
    : 'Repository updated';
  const releaseBadge = latestRelease
    ? `[\`${latestRelease.tag_name}\`](${latestRelease.html_url}) · `
    : '';

  return {
    fullName,
    url: repo.html_url,
    updatedAt: commitDate ?? '',
    dateLabel: formatDate(commitDate),
    summary: `${releaseBadge}[${commitMessage}](${latestCommit?.html_url ?? repo.html_url})`,
  };
}

function renderTable(pulses: readonly RepoPulse[]): string {
  const rows = [...pulses]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((item) => `| [\`${item.fullName}\`](${item.url}) | \`${item.dateLabel}\` | ${item.summary} |`);
  return ['| Repository | Latest Update | Latest Commit / Release |', '| :--- | :--- | :--- |', ...rows].join('\n');
}

function renderBlock(table: string, changedOn: string): string {
  return [
    '<!-- ACTIVITY:START -->',
    table,
    '',
    `*Auto-synced daily via GitHub Actions · Last change: \`${changedOn}\` UTC.*`,
    '<!-- ACTIVITY:END -->',
  ].join('\n');
}

async function main(): Promise<void> {
  const table = renderTable(await Promise.all(REPOS.map(getRepoPulse)));
  const readme = readFileSync(README_PATH, 'utf8');
  const currentBlock = readme.match(ACTIVITY_BLOCK)?.[0];
  if (currentBlock === undefined) throw new Error('Missing ACTIVITY markers in README.md');

  if (currentBlock.includes(table)) {
    console.log('Repository pulse unchanged; README.md left as is.');
    return;
  }

  const block = renderBlock(table, formatDate(new Date().toISOString()));
  writeFileSync(README_PATH, readme.replace(ACTIVITY_BLOCK, () => block), 'utf8');
  console.log('README.md updated with the latest repository pulse.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

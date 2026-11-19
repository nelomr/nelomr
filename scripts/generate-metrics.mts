import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createGraphQLClient, fetchContributionCalendar, fetchProfile } from './metrics/github-client.mts';
import { summarizeCalendar, summarizeStats, topLanguages } from './metrics/stats.mts';
import { renderMetrics } from './metrics/svg.mts';
import { THEMES } from './metrics/themes.mts';
import type { MetricsView } from './metrics/types.mts';

const LOGIN = 'nelomr';
const CALENDAR_WEEKS = 26;
const LANGUAGE_OPTIONS = { limit: 6, ignored: ['HTML', 'CSS'] };
const OUTPUT_DIR = fileURLToPath(new URL('../assets/', import.meta.url));

interface Tokens {
  stats: string;
  calendar: string;
}

/**
 * METRICS_TOKEN (read-only, fine-grained) adds private repositories to stats and languages.
 * GITHUB_TOKEN, the workflow's own token, reads the calendar as the public profile shows it,
 * private contribution counts included, and stands in for METRICS_TOKEN when that is unset.
 */
function resolveTokens(): Tokens {
  const metricsToken = process.env.METRICS_TOKEN || undefined;
  const workflowToken = process.env.GITHUB_TOKEN || undefined;
  const stats = metricsToken ?? workflowToken;
  const calendar = workflowToken ?? metricsToken;
  if (!stats || !calendar) throw new Error('Set METRICS_TOKEN or GITHUB_TOKEN');
  const statsSource = metricsToken ? 'METRICS_TOKEN' : 'GITHUB_TOKEN';
  const calendarSource = workflowToken ? 'GITHUB_TOKEN' : 'METRICS_TOKEN';
  console.log(`Stats and languages: ${statsSource}. Contribution calendar: ${calendarSource}.`);
  return { stats, calendar };
}

async function main(): Promise<void> {
  const tokens = resolveTokens();
  const [profile, calendarWeeks] = await Promise.all([
    fetchProfile(createGraphQLClient(tokens.stats), LOGIN),
    fetchContributionCalendar(createGraphQLClient(tokens.calendar), LOGIN),
  ]);
  const view: MetricsView = {
    stats: summarizeStats(profile),
    languages: topLanguages(profile.repos, LANGUAGE_OPTIONS),
    calendar: summarizeCalendar(calendarWeeks, CALENDAR_WEEKS),
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const theme of THEMES) {
    const path = `${OUTPUT_DIR}metrics-${theme.name}.svg`;
    writeFileSync(path, renderMetrics(view, theme), 'utf8');
    console.log(`Wrote ${path}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

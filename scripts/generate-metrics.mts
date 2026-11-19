import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createGraphQLClient, fetchProfile } from './metrics/github-client.mts';
import { summarizeCalendar, summarizeStats, topLanguages } from './metrics/stats.mts';
import { renderMetrics } from './metrics/svg.mts';
import { THEMES } from './metrics/themes.mts';
import type { MetricsView } from './metrics/types.mts';

const LOGIN = 'nelomr';
const CALENDAR_WEEKS = 26;
const LANGUAGE_OPTIONS = { limit: 6, ignored: ['HTML', 'CSS'] };
const OUTPUT_DIR = fileURLToPath(new URL('../assets/', import.meta.url));

/** METRICS_TOKEN (read-only, fine-grained) adds private repositories; GITHUB_TOKEN sees public data only. */
function resolveToken(): string {
  const metricsToken = process.env.METRICS_TOKEN;
  if (metricsToken) {
    console.log('Using METRICS_TOKEN: public and private repositories it can read.');
    return metricsToken;
  }
  const workflowToken = process.env.GITHUB_TOKEN;
  if (!workflowToken) throw new Error('Set METRICS_TOKEN or GITHUB_TOKEN');
  console.log('METRICS_TOKEN is not set: public data only.');
  return workflowToken;
}

async function main(): Promise<void> {
  const profile = await fetchProfile(createGraphQLClient(resolveToken()), LOGIN);
  const view: MetricsView = {
    stats: summarizeStats(profile),
    languages: topLanguages(profile.repos, LANGUAGE_OPTIONS),
    calendar: summarizeCalendar(profile.calendarWeeks, CALENDAR_WEEKS),
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

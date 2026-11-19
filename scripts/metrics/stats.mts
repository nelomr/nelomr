import type {
  CalendarSummary,
  CalendarWeeks,
  LanguageShare,
  OwnedRepo,
  ProfileData,
  ProfileStats,
} from './types.mts';

export interface LanguageOptions {
  limit: number;
  ignored: readonly string[];
}

interface LanguageTotal {
  name: string;
  color: string | null;
  size: number;
}

export function summarizeStats(profile: ProfileData): ProfileStats {
  return {
    stars: profile.repos.reduce((sum, repo) => sum + repo.stars, 0),
    commits: profile.commitsLastYear,
    pullRequests: profile.pullRequests,
    issues: profile.issues,
    contributedTo: profile.contributedTo,
  };
}

function totalLanguageSizes(repos: readonly OwnedRepo[], ignored: ReadonlySet<string>): LanguageTotal[] {
  const totals = new Map<string, LanguageTotal>();
  for (const repo of repos.filter((candidate) => !candidate.isFork)) {
    for (const language of repo.languages) {
      if (ignored.has(language.name.toLowerCase())) continue;
      const size = (totals.get(language.name)?.size ?? 0) + language.size;
      totals.set(language.name, { name: language.name, color: language.color, size });
    }
  }
  return [...totals.values()];
}

/** Shares are relative to the languages shown, as github-readme-stats does. */
export function topLanguages(repos: readonly OwnedRepo[], options: LanguageOptions): LanguageShare[] {
  const ignored = new Set(options.ignored.map((name) => name.toLowerCase()));
  const top = totalLanguageSizes(repos, ignored)
    .sort((a, b) => b.size - a.size || a.name.localeCompare(b.name))
    .slice(0, options.limit);
  const shownSize = top.reduce((sum, language) => sum + language.size, 0);
  return top.map((language) => ({
    name: language.name,
    color: language.color,
    percent: shownSize === 0 ? 0 : (language.size / shownSize) * 100,
  }));
}

function bestStreak(counts: readonly number[]): number {
  let best = 0;
  let run = 0;
  for (const count of counts) {
    run = count > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

/** Today may still be in progress, so a quiet today does not break the streak yet. */
function currentStreak(counts: readonly number[]): number {
  const end = counts.at(-1) === 0 ? counts.length - 1 : counts.length;
  let streak = 0;
  for (let index = end - 1; index >= 0 && (counts[index] ?? 0) > 0; index -= 1) {
    streak += 1;
  }
  return streak;
}

export function summarizeCalendar(weeks: CalendarWeeks, weekCount: number): CalendarSummary {
  const recentWeeks = weeks.slice(-weekCount);
  const counts = recentWeeks.flat().map((day) => day.contributionCount);
  const total = counts.reduce((sum, count) => sum + count, 0);
  return {
    weeks: recentWeeks,
    total,
    maxCount: Math.max(0, ...counts),
    currentStreak: currentStreak(counts),
    bestStreak: bestStreak(counts),
    averagePerDay: counts.length === 0 ? 0 : total / counts.length,
  };
}

export type ContributionLevel =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE';

export interface ContributionDay {
  date: string;
  weekday: number;
  contributionCount: number;
  contributionLevel: ContributionLevel;
}

export type CalendarWeeks = readonly (readonly ContributionDay[])[];

export interface RepoLanguage {
  name: string;
  color: string | null;
  size: number;
}

export interface OwnedRepo {
  isFork: boolean;
  stars: number;
  languages: readonly RepoLanguage[];
}

export interface ProfileData {
  commitsLastYear: number;
  pullRequests: number;
  issues: number;
  contributedTo: number;
  calendarWeeks: CalendarWeeks;
  repos: readonly OwnedRepo[];
}

export interface ProfileStats {
  stars: number;
  commits: number;
  pullRequests: number;
  issues: number;
  contributedTo: number;
}

export interface LanguageShare {
  name: string;
  color: string | null;
  percent: number;
}

export interface CalendarSummary {
  weeks: CalendarWeeks;
  total: number;
  maxCount: number;
  currentStreak: number;
  bestStreak: number;
  averagePerDay: number;
}

export interface MetricsView {
  stats: ProfileStats;
  languages: readonly LanguageShare[];
  calendar: CalendarSummary;
}

export interface Theme {
  name: 'light' | 'dark';
  panel: string;
  border: string;
  title: string;
  text: string;
  muted: string;
  levels: readonly [string, string, string, string, string];
  languageFallback: string;
}

import type {
  CalendarSummary,
  ContributionDay,
  ContributionLevel,
  LanguageShare,
  MetricsView,
  ProfileStats,
  Theme,
} from './types.mts';

const WIDTH = 840;
const GAP = 20;
const HALF_WIDTH = (WIDTH - GAP) / 2;
const TOP_HEIGHT = 195;
const CALENDAR_Y = TOP_HEIGHT + GAP;
const CALENDAR_HEIGHT = 315;
const HEIGHT = CALENDAR_Y + CALENDAR_HEIGHT;
const PADDING = 25;
const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";

const TILE = 12;
const ISO_X = TILE * Math.cos(Math.PI / 6);
const ISO_Y = TILE * Math.sin(Math.PI / 6);
const MIN_BAR = 3;
const MAX_BAR = 40;
const TILE_INSET = 0.08;

const LEVEL_INDEX: Readonly<Record<ContributionLevel, number>> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const XML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

interface IsoContext {
  originX: number;
  originY: number;
  maxCount: number;
  theme: Theme;
}

const round = (value: number): number => Math.round(value * 10) / 10;

export function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

/** Darkens a #rrggbb color; factor 1 keeps it, 0 turns it black. */
export function shade(hex: string, factor: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [16, 8, 0].map((shift) => Math.round(((value >> shift) & 0xff) * factor));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function languageColor(language: LanguageShare, theme: Theme): string {
  return language.color !== null && HEX_COLOR.test(language.color) ? language.color : theme.languageFallback;
}

function panel(x: number, y: number, width: number, height: number, theme: Theme): string {
  return `<rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="6" fill="${theme.panel}" stroke="${theme.border}"/>`;
}

function styles(theme: Theme): string {
  return [
    '<style>',
    `text{font-family:${FONT_STACK};fill:${theme.text}}`,
    `.title{font-size:18px;font-weight:600;fill:${theme.title}}`,
    '.label{font-size:14px}',
    '.value{font-size:14px;font-weight:600}',
    `.muted{font-size:13px;fill:${theme.muted}}`,
    '.big{font-size:26px;font-weight:600}',
    '</style>',
  ].join('');
}

function statRows(stats: ProfileStats): readonly (readonly [string, number])[] {
  return [
    ['Total stars earned', stats.stars],
    ['Commits (last year)', stats.commits],
    ['Pull requests', stats.pullRequests],
    ['Issues', stats.issues],
    ['Contributed to (last year)', stats.contributedTo],
  ];
}

function renderStats(stats: ProfileStats, theme: Theme): string {
  const valueX = HALF_WIDTH - PADDING;
  const rows = statRows(stats).map(([label, value], index) => {
    const y = 72 + index * 25;
    return `<text class="label" x="${PADDING}" y="${y}">${label}</text><text class="value" x="${valueX}" y="${y}" text-anchor="end">${compact.format(value)}</text>`;
  });
  return [
    panel(0, 0, HALF_WIDTH, TOP_HEIGHT, theme),
    `<text class="title" x="${PADDING}" y="35">GitHub stats</text>`,
    ...rows,
  ].join('');
}

function barSegments(languages: readonly LanguageShare[], x: number, width: number, theme: Theme): string[] {
  const segments: string[] = [];
  let offset = 0;
  for (const language of languages) {
    const segmentWidth = (language.percent / 100) * width;
    segments.push(
      `<rect x="${round(x + offset)}" y="58" width="${round(segmentWidth)}" height="8" fill="${languageColor(language, theme)}"/>`,
    );
    offset += segmentWidth;
  }
  return segments;
}

function languageItem(language: LanguageShare, index: number, x: number, theme: Theme): string {
  const itemX = x + (index % 2) * 190;
  const y = 100 + Math.floor(index / 2) * 30;
  return [
    `<circle cx="${itemX + 5}" cy="${y - 5}" r="5" fill="${languageColor(language, theme)}"/>`,
    `<text class="label" x="${itemX + 16}" y="${y}">${escapeXml(language.name)} <tspan class="muted">${language.percent.toFixed(1)}%</tspan></text>`,
  ].join('');
}

function renderLanguages(languages: readonly LanguageShare[], theme: Theme): string {
  const panelX = HALF_WIDTH + GAP;
  const x = panelX + PADDING;
  const width = HALF_WIDTH - 2 * PADDING;
  const body =
    languages.length === 0
      ? [`<text class="muted" x="${x}" y="100">No language data yet</text>`]
      : [
          `<clipPath id="language-bar"><rect x="${x}" y="58" width="${width}" height="8" rx="4"/></clipPath>`,
          `<g clip-path="url(#language-bar)">${barSegments(languages, x, width, theme).join('')}</g>`,
          ...languages.map((language, index) => languageItem(language, index, x, theme)),
        ];
  return [
    panel(panelX, 0, HALF_WIDTH, TOP_HEIGHT, theme),
    `<text class="title" x="${x}" y="35">Most used languages</text>`,
    ...body,
  ].join('');
}

function barHeight(count: number, maxCount: number): number {
  if (count === 0 || maxCount === 0) return 0;
  return MIN_BAR + (count / maxCount) * (MAX_BAR - MIN_BAR);
}

function renderColumn(day: ContributionDay, week: number, context: IsoContext): string {
  const { theme } = context;
  const color = theme.levels[LEVEL_INDEX[day.contributionLevel]] ?? theme.levels[0];
  const height = barHeight(day.contributionCount, context.maxCount);
  const point = (w: number, d: number, lift: number): string =>
    `${round(context.originX + (w - d) * ISO_X)},${round(context.originY + (w + d) * ISO_Y - lift)}`;
  const [w0, w1] = [week + TILE_INSET, week + 1 - TILE_INSET];
  const [d0, d1] = [day.weekday + TILE_INSET, day.weekday + 1 - TILE_INSET];
  const top = `<polygon points="${point(w0, d0, height)} ${point(w1, d0, height)} ${point(w1, d1, height)} ${point(w0, d1, height)}" fill="${color}"/>`;
  if (height === 0) return top;
  const left = `<polygon points="${point(w0, d1, height)} ${point(w1, d1, height)} ${point(w1, d1, 0)} ${point(w0, d1, 0)}" fill="${shade(color, 0.82)}"/>`;
  const right = `<polygon points="${point(w1, d0, height)} ${point(w1, d1, height)} ${point(w1, d1, 0)} ${point(w1, d0, 0)}" fill="${shade(color, 0.66)}"/>`;
  return left + right + top;
}

/** Draws back to front (by week + weekday) so nearer columns cover farther ones. */
function renderIsometric(calendar: CalendarSummary, theme: Theme): string {
  const context: IsoContext = {
    originX: PADDING + 7 * ISO_X,
    originY: CALENDAR_Y + 60 + MAX_BAR,
    maxCount: calendar.maxCount,
    theme,
  };
  return calendar.weeks
    .flatMap((days, week) => days.map((day) => ({ day, week })))
    .sort((a, b) => a.week + a.day.weekday - (b.week + b.day.weekday))
    .map(({ day, week }) => renderColumn(day, week, context))
    .join('');
}

function calendarFigures(calendar: CalendarSummary): readonly (readonly [string, string])[] {
  const days = (count: number): string => `${count} ${count === 1 ? 'day' : 'days'}`;
  return [
    [compact.format(calendar.total), 'Contributions'],
    [days(calendar.currentStreak), 'Current streak'],
    [days(calendar.bestStreak), 'Best streak'],
    [calendar.averagePerDay.toFixed(2), 'Average per day'],
  ];
}

function renderCalendarFigures(calendar: CalendarSummary): string {
  return calendarFigures(calendar)
    .map(([value, label], index) => {
      const x = 450 + (index % 2) * 190;
      const y = CALENDAR_Y + 115 + Math.floor(index / 2) * 80;
      return `<text class="big" x="${x}" y="${y}">${value}</text><text class="muted" x="${x}" y="${y + 22}">${label}</text>`;
    })
    .join('');
}

function renderLegend(theme: Theme): string {
  const y = CALENDAR_Y + 280;
  const squares = theme.levels.map(
    (color, index) => `<rect x="${492 + index * 16}" y="${y - 10}" width="12" height="12" rx="2" fill="${color}"/>`,
  );
  return [
    `<text class="muted" x="450" y="${y}">Less</text>`,
    ...squares,
    `<text class="muted" x="${492 + 5 * 16 + 4}" y="${y}">More</text>`,
  ].join('');
}

function renderCalendar(calendar: CalendarSummary, theme: Theme): string {
  return [
    panel(0, CALENDAR_Y, WIDTH, CALENDAR_HEIGHT, theme),
    `<text class="title" x="${PADDING}" y="${CALENDAR_Y + 35}">Contributions in the last ${calendar.weeks.length} weeks</text>`,
    renderIsometric(calendar, theme),
    renderCalendarFigures(calendar),
    renderLegend(theme),
  ].join('');
}

export function renderMetrics(view: MetricsView, theme: Theme): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="metrics-title">`,
    `<title id="metrics-title">GitHub stats, most used languages and contributions of the last ${view.calendar.weeks.length} weeks</title>`,
    styles(theme),
    renderStats(view.stats, theme),
    renderLanguages(view.languages, theme),
    renderCalendar(view.calendar, theme),
    '</svg>',
    '',
  ].join('\n');
}

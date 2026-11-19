import type { Theme } from './types.mts';

/** Colors follow GitHub's own light and dark palettes so each image blends with its page. */
export const LIGHT_THEME: Theme = {
  name: 'light',
  panel: '#ffffff',
  border: '#d1d9e0',
  title: '#0969da',
  text: '#1f2328',
  muted: '#59636e',
  levels: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  languageFallback: '#8c959f',
};

export const DARK_THEME: Theme = {
  name: 'dark',
  panel: '#0d1117',
  border: '#3d444d',
  title: '#4493f8',
  text: '#f0f6fc',
  muted: '#9198a1',
  levels: ['#151b23', '#033a16', '#196c2e', '#2ea043', '#56d364'],
  languageFallback: '#6e7681',
};

export const THEMES: readonly Theme[] = [LIGHT_THEME, DARK_THEME];

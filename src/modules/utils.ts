export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export function getSeasonFromDate(date: Date = new Date()): Season {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function toNumber(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function xpToLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function formatDailyGreeting(name?: string): string {
  const hour = new Date().getHours();
  const partOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  return name ? `Good ${partOfDay}, ${name}.` : `Good ${partOfDay}.`;
}

import type { Season } from './utils';

export interface SeasonTheme {
  label: string;
  title: string;
  description: string;
  heroImage: string;
  ambientHint: string;
}

export const seasonThemes: Record<Season, SeasonTheme> = {
  spring: {
    label: 'Spring',
    title: 'New Growth',
    description: 'Fresh leaves, brighter mornings, and slow, steady routines.',
    heroImage: '/backgrounds/all-back.jpg',
    ambientHint: 'Gentle rain shower, soft breeze & soothing chords'
  },
  summer: {
    label: 'Summer',
    title: 'Flowing Energy',
    description: 'Long days, river air, and focused movement.',
    heroImage: '/backgrounds/nature-back-1.png',
    ambientHint: 'Babbling brook, warm breeze & ambient music'
  },
  autumn: {
    label: 'Autumn',
    title: 'Grounded Rhythm',
    description: 'Golden forests, reflection, and intentional habits.',
    heroImage: '/backgrounds/autumn-back.jpg',
    ambientHint: 'Raking leaves, light rain shower & soothing chords'
  },
  winter: {
    label: 'Winter',
    title: 'Quiet Recovery',
    description: 'Cool air, still landscapes, and restorative routines.',
    heroImage: '/backgrounds/winter-back.jpg',
    ambientHint: 'Rain on the roof, fireplace crackle & warm ambient music'
  }
};

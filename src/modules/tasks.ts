import type { Task } from '../context/AppContext';

const templates = [
  { text: 'Take a mindful 15-minute nature walk', category: 'wellness' },
  { text: 'Prepare one seasonal whole-food meal', category: 'nutrition' },
  { text: 'Hydrate with 8 glasses spaced through the day', category: 'hydration' },
  { text: 'Stretch for 10 minutes near natural light', category: 'fitness' },
  { text: 'Write three gratitude notes about today', category: 'mindset' },
  { text: 'Log tonight\'s sleep target before 9 PM', category: 'recovery' }
];

export function generateNatureTasks(): Task[] {
  const seed = Date.now();
  return templates.map((t, idx) => ({
    id: seed + idx,
    text: t.text,
    category: t.category,
    done: false
  }));
}

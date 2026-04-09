import type { AppState } from '../context/AppContext';

export function completionRate(state: AppState): number {
  if (state.taskList.length === 0) return 0;
  const doneCount = state.taskList.filter((task) => task.done).length;
  return Math.round((doneCount / state.taskList.length) * 100);
}

export function dailySummary(state: AppState): string {
  return `Calories ${state.calories}/${state.targetCalories}, hydration ${state.hydrationMl} mL, steps ${state.stepCount.toLocaleString()}, tasks done ${state.tasksCompleted}.`;
}

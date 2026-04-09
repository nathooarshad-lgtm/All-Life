import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';

const Coach: React.FC = () => {
  const { state } = useApp();

  const hydrationGoalMl = state.profile?.waterGoal || 2000;
  const hydrationPercent = Math.min(100, Math.round((state.hydrationMl / hydrationGoalMl) * 100));
  const latestSleepHours = state.sleepHistory[0]?.hours;
  const hasSleepData = typeof latestSleepHours === 'number';
  const openTasks = state.taskList.filter(t => !t.done).length;
  const highPriorityOpen = state.taskList.filter(t => !t.done && t.priority === 'high').length;
  const latestMood = state.moodHistory[0];

  const moodSignal = useMemo(() => {
    if (!latestMood) return 'unknown';
    if ((latestMood.stress ?? 0) >= 4) return 'stressed';
    if ((latestMood.energy ?? 3) <= 2) return 'low-energy';
    if ((latestMood.focus ?? 3) >= 4 && (latestMood.energy ?? 3) >= 3) return 'ready';
    return 'steady';
  }, [latestMood]);

  const recommendations = useMemo(() => {
    let primary = 'No sleep log yet: set your baseline tonight and keep today moderate.';

    if (hasSleepData && (latestSleepHours as number) < 6) {
      primary = `You slept ${(latestSleepHours as number).toFixed(1)}h -> avoid intense workouts today and prioritize recovery actions.`;
    } else if (hydrationPercent < 50) {
      primary = `Hydration is ${hydrationPercent}% -> drink 400-600 mL in the next 30 minutes before deep work.`;
    } else {
      primary = highPriorityOpen > 0
        ? `You have ${highPriorityOpen} high-priority task(s) open -> finish one before starting low-impact items.`
        : `Hydration and sleep are stable -> run a focused productivity block on your next key task.`;
    }

    const secondaryOne = openTasks > 0
      ? `Task flow: ${openTasks} open task(s). Pick one clear next action and complete it within a 25-45 minute sprint.`
      : 'Task flow: no open tasks. Add one meaningful task for today to keep momentum.';

    let secondaryTwo = `Hydration check: ${state.hydrationMl}/${hydrationGoalMl} mL (${hydrationPercent}%).`;
    if (moodSignal === 'stressed') {
      secondaryTwo = `${secondaryTwo} Mood is high-stress, so use lighter cognitive load and short resets between blocks.`;
    } else if (moodSignal === 'low-energy') {
      secondaryTwo = `${secondaryTwo} Mood shows low energy, so pair hydration with a short walk before your next task.`;
    } else if (moodSignal === 'ready') {
      secondaryTwo = `${secondaryTwo} Mood is performance-ready, so tackle the hardest task first.`;
    } else {
      secondaryTwo = `${secondaryTwo} Mood is steady; maintain consistent pacing across the day.`;
    }

    return {
      primary,
      secondary: [secondaryOne, secondaryTwo],
    };
  }, [
    hasSleepData,
    latestSleepHours,
    hydrationPercent,
    highPriorityOpen,
    openTasks,
    moodSignal,
    state.hydrationMl,
    hydrationGoalMl,
  ]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Nature Coach</h2>

      <div className="nature-card rounded-lg border p-6 mb-4">
        <p className="text-sm season-description mb-2">Primary Recommendation</p>
        <p className="text-lg font-semibold">{recommendations.primary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="nature-card rounded-lg border p-5">
          <p className="text-sm season-description mb-2">Secondary Suggestion 1</p>
          <p>{recommendations.secondary[0]}</p>
        </div>
        <div className="nature-card rounded-lg border p-5">
          <p className="text-sm season-description mb-2">Secondary Suggestion 2</p>
          <p>{recommendations.secondary[1]}</p>
        </div>
      </div>

      <p className="season-description mt-3 text-sm">
        Advice is generated from your latest sleep, hydration, tasks, and mood logs and updates automatically as data changes.
      </p>
    </div>
  );
};

export default Coach;
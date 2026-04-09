import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatDailyGreeting, xpToLevel } from '../modules/utils';
import { seasonAudio } from '../utils/seasonAudio';

const STREAK_LAST_KEY = 'all_life_dashboard_primary_last_complete';
const STREAK_COUNT_KEY = 'all_life_dashboard_primary_streak';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const [primaryComplete, setPrimaryComplete] = React.useState(false);
  const [completionCount, setCompletionCount] = React.useState(0);
  const [xpGain, setXpGain] = React.useState(0);
  const [statPulse, setStatPulse] = React.useState(false);
  const [dailyStreak, setDailyStreak] = React.useState(() => {
    const stored = Number(localStorage.getItem(STREAK_COUNT_KEY) || 0);
    return Number.isFinite(stored) ? Math.max(0, stored) : 0;
  });
  const shellStyleRef = React.useRef<{ filter: string; transform: string; transition: string } | null>(null);
  const completionLockRef = React.useRef(false);

  const morningMessage = useMemo(() => {
    if (!state.profile?.name) return 'Welcome. Set up your profile to unlock a personalized daily ecosystem.';
    const messages = [
      `${formatDailyGreeting(state.profile.name)} Aim for ${state.targetCalories} kcal and steady hydration.`,
      `${state.profile.name}, build a calm rhythm today. You have logged ${state.hydrationMl} mL so far.`,
      `${state.profile.name}, support your ${state.profile.goal} goal with movement, nourishing food, and intentional rest.`
    ];
    return messages[new Date().getHours() % messages.length];
  }, [state.profile, state.targetCalories, state.hydrationMl]);

  const hydrationMl = state.hydrationMl;
  const hydrationGoalMl = state.profile?.waterGoal || 2000;
  const calPercent = Math.min(100, Math.round((state.calories / state.targetCalories) * 100));
  const waterPercent = Math.min(100, Math.round((hydrationMl / hydrationGoalMl) * 100));
  const latestSleepHours = state.sleepHistory[0]?.hours ?? 0;
  const hasSleepData = state.sleepHistory.length > 0;
  const openTasks = state.taskList.filter((task) => !task.done).length;
  const totalTasks = state.taskList.length;
  const taskPercent = totalTasks > 0
    ? Math.min(100, Math.round((state.tasksCompleted / totalTasks) * 100))
    : 0;
  const latestWorkout = state.workouts?.[0];
  const levelValue = xpToLevel(state.xp ?? 0);
  const trainingParameters = [
    {
      label: 'Exercise Intensity',
      value: Number(latestWorkout?.rpe ?? 0),
      description: 'Affects workout difficulty and effort calibration.',
    },
    {
      label: 'Sleep Factor',
      value: Number(hasSleepData ? latestSleepHours : 0),
      description: 'Influences recovery recommendations and readiness.',
    },
    {
      label: 'Hydration Weight',
      value: Number(waterPercent ?? 0),
      description: 'Affects hydration guidance and pacing suggestions.',
    },
    {
      label: 'XP Multiplier',
      value: Number(Math.max(1, Number((levelValue / 10).toFixed(2)))),
      description: 'Affects progression points relative to current level.',
    },
    {
      label: 'Sets Logged',
      value: Number(latestWorkout?.sets ?? 0),
      description: 'System parameter - do not edit.',
    },
    {
      label: 'Reps Logged',
      value: Number(latestWorkout?.reps ?? 0),
      description: 'Internal parameter affecting AI coach calculations.',
    },
  ];

  const primaryAction = useMemo(() => {
    if (hasSleepData && latestSleepHours < 6) {
      return {
        title: 'Recovery First',
        description: `Last sleep: ${latestSleepHours.toFixed(1)}h. Prioritize lighter effort, earlier wind-down, and a calm pace today.`,
        chip: 'Sleep Recovery'
      };
    }
    if (waterPercent < 50) {
      return {
        title: 'Hydration Priority',
        description: `You are at ${hydrationMl} / ${hydrationGoalMl} mL. Drink water now to stabilize energy and focus.`,
        chip: 'Hydration Focus'
      };
    }
    if (openTasks > 0) {
      return {
        title: 'Task Completion Focus',
        description: `You have ${openTasks} incomplete task${openTasks === 1 ? '' : 's'}. Complete one meaningful task before adding new work.`,
        chip: 'Task Priority'
      };
    }
    return {
      title: 'Maintain Progress',
      description: 'Sleep, hydration, and task flow are on track. Keep your rhythm steady and maintain consistency.',
      chip: 'Stable Mode'
    };
  }, [hasSleepData, latestSleepHours, waterPercent, hydrationMl, hydrationGoalMl, openTasks]);

  React.useEffect(() => {
    if (!primaryComplete) return;
    const timer = window.setTimeout(() => {
      setPrimaryComplete(false);
      setXpGain(0);
      setStatPulse(false);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [primaryComplete, completionCount]);

  React.useEffect(() => {
    if (!primaryComplete) return;

    const shell = document.querySelector<HTMLElement>('.nature-shell');
    if (shell) {
      shellStyleRef.current = {
        filter: shell.style.filter,
        transform: shell.style.transform,
        transition: shell.style.transition,
      };
      shell.style.transition = 'filter 220ms ease, transform 220ms ease';
      shell.style.filter = 'brightness(1.12) saturate(1.08)';
      shell.style.transform = 'scale(1.004)';
    }

    const effectTimer = window.setTimeout(() => {
      if (!shell || !shellStyleRef.current) return;
      shell.style.filter = shellStyleRef.current.filter;
      shell.style.transform = shellStyleRef.current.transform;
      shell.style.transition = shellStyleRef.current.transition;
    }, 720);

    return () => {
      window.clearTimeout(effectTimer);
      if (!shell || !shellStyleRef.current) return;
      shell.style.filter = shellStyleRef.current.filter;
      shell.style.transform = shellStyleRef.current.transform;
      shell.style.transition = shellStyleRef.current.transition;
    };
  }, [primaryComplete, completionCount]);

  const playCompletionCue = () => {
    try {
      // Use existing ambient system to reinforce completion without changing app-wide settings.
      void seasonAudio.play(state.season, true);
      if (!state.ambientSoundEnabled) {
        window.setTimeout(() => seasonAudio.stop(), 900);
      }

      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(990, now + 0.14);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);

      window.setTimeout(() => {
        void ctx.close();
      }, 320);
    } catch (_error) {
      // Audio cue is best-effort and should never block completion behavior.
    }
  };

  const handlePrimaryComplete = () => {
    if (completionLockRef.current) return;
    completionLockRef.current = true;
    window.setTimeout(() => {
      completionLockRef.current = false;
    }, 550);

    setCompletionCount((value) => value + 1);
    setPrimaryComplete(true);
    setStatPulse(true);
    playCompletionCue();

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem(STREAK_LAST_KEY) || '';
    if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const nextStreak = lastDate === yesterday ? dailyStreak + 1 : 1;
      setDailyStreak(nextStreak);
      localStorage.setItem(STREAK_COUNT_KEY, String(nextStreak));
      localStorage.setItem(STREAK_LAST_KEY, today);
    }

    if (primaryAction.chip === 'Hydration Focus') {
      setXpGain(1);
      dispatch({ type: 'ADD_WATER', payload: { amountMl: 250, label: 'Primary action complete' } });
      return;
    }

    if (primaryAction.chip === 'Task Priority') {
      const nextTask = state.taskList.find((task) => !task.done);
      if (typeof nextTask?.id === 'number') {
        setXpGain(20);
        dispatch({ type: 'TOGGLE_TASK', payload: nextTask.id });
        return;
      }
    }

    setXpGain(0);
    dispatch({ type: 'ADD_STEPS', payload: 250 });
  };

  return (
    <div>
      <h2 className="text-4xl font-bold mb-2">Today Focus</h2>
      <p className="text-white text-opacity-70 mb-8">One main priority, two supports, and only essential numbers.</p>

      {/* 1) Primary Action */}
      <section className={`nature-card p-8 rounded-2xl border mb-6 shadow-xl transition-all duration-300 bg-gradient-to-br from-white/10 via-white/5 to-transparent ${primaryComplete ? 'border-green-400 shadow-[0_0_0_1px_rgba(74,222,128,0.55),0_0_24px_rgba(74,222,128,0.35)] animate-pulse' : ''}`}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-3xl font-bold">{primaryAction.title}</h3>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="season-btn text-sm px-3 py-1">{primaryAction.chip}</span>
            <span className={`text-xs text-white/80 rounded-md border border-white/20 bg-white/10 px-2 py-1 transition-all duration-300 ${statPulse ? 'scale-105 border-green-300 text-green-100' : ''}`}>Streak: {dailyStreak || 0}</span>
          </div>
        </div>
        <p className="season-description text-base mb-4">{primaryAction.description}</p>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={handlePrimaryComplete}
            className="nature-button px-4 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            {primaryComplete ? 'Completed' : 'Mark Complete'}
          </button>
          {primaryComplete && <span className="text-green-200 text-sm">Action Completed! {xpGain > 0 ? `+${xpGain} XP` : 'Progress updated.'}</span>}
        </div>
        <p className="text-sm text-white text-opacity-80">{morningMessage}</p>
      </section>

      <section className="nature-card p-5 rounded-2xl border mb-6">
        <details>
          <summary className="cursor-pointer font-semibold text-lg">Log Training Set</summary>
          <p className="season-description text-sm mt-2 mb-4">Current numeric signals used for training context and coaching behavior.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trainingParameters.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/15 bg-white/5 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wide text-white text-opacity-65">{item.label}</p>
                  {(item.label === 'Sleep Factor' && item.value < 6) || (item.label === 'Hydration Weight' && item.value < 50) ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-300/50 text-amber-200">Action Required</span>
                  ) : null}
                </div>
                <p className="text-xl font-semibold mt-1">{Number.isFinite(item.value) ? item.value : 0}</p>
                <p className="season-description text-xs mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </details>
      </section>

      {/* 2) Secondary Actions (max 2) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="nature-card p-5 rounded-2xl border">
          <p className="text-xs uppercase tracking-wide text-white text-opacity-60 mb-1">Secondary Action</p>
          <h4 className="text-xl font-semibold mb-2">Hydration Progress</h4>
          <p className="season-description text-sm mb-3">Keep water intake moving so focus and recovery stay stable.</p>
          <p className="text-sm text-white text-opacity-80">{hydrationMl} / {hydrationGoalMl} mL ({waterPercent}%)</p>
        </div>
        <div className="nature-card p-5 rounded-2xl border">
          <p className="text-xs uppercase tracking-wide text-white text-opacity-60 mb-1">Secondary Action</p>
          <h4 className="text-xl font-semibold mb-2">Task Progress</h4>
          <p className="season-description text-sm mb-3">Close one open task to keep momentum and reduce cognitive load.</p>
          <p className="text-sm text-white text-opacity-80">{state.tasksCompleted} done / {openTasks} open ({taskPercent}%)</p>
        </div>
      </section>

      {/* 3) Minimal Stats */}
      <section className="nature-card p-4 rounded-2xl border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="season-description text-xs">XP</p>
            <p className={`font-semibold transition-all duration-300 ${statPulse ? 'text-green-200 scale-105' : ''}`}>{state.xp}</p>
          </div>
          <div>
            <p className="season-description text-xs">Calories</p>
            <p className="font-semibold">{state.calories}/{state.targetCalories} ({calPercent}%)</p>
          </div>
          <div>
            <p className="season-description text-xs">Sleep</p>
            <p className="font-semibold">{hasSleepData ? `${latestSleepHours.toFixed(1)}h` : 'No log'}</p>
          </div>
          <div>
            <p className="season-description text-xs">Streak</p>
            <p className={`font-semibold transition-all duration-300 ${statPulse ? 'text-green-200 scale-105' : ''}`}>{dailyStreak || 0} day{(dailyStreak || 0) === 1 ? '' : 's'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
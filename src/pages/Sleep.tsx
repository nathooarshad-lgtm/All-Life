import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';

type SleepDraft = {
  hours: number;
  bedtime: string;
  wakeTime: string;
};

function timeToMinutes(value?: string): number | null {
  if (!value || !value.includes(':')) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

const Sleep: React.FC = () => {
  const { state, dispatch } = useApp();
  const latestSleep = state.sleepHistory[0];
  const defaultDraft: SleepDraft = {
    hours: latestSleep?.hours ?? 8,
    bedtime: latestSleep?.bedtime || '22:30',
    wakeTime: latestSleep?.wakeTime || '06:30',
  };
  const [draft, setDraft] = useState<SleepDraft | null>(null);
  const { hours, bedtime, wakeTime } = draft ?? defaultDraft;

  const updateDraft = (key: keyof SleepDraft, value: number | string) => {
    setDraft((prev) => ({ ...(prev ?? defaultDraft), [key]: value } as SleepDraft));
  };

  const goalHours = state.profile?.sleepGoal || 8;

  const handleLogSleep = () => {
    const quality = hours < goalHours - 1 ? 'Too little' :
                    hours > goalHours + 2 ? 'Oversleeping' : 'Optimal';
    dispatch({
      type: 'LOG_SLEEP',
      payload: {
        day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        hours,
        quality,
        bedtime,
        wakeTime,
      }
    });
    setDraft(null);
  };

  const recent = state.sleepHistory.slice(0, 7);
  const sevenDayHours = recent.reduce((sum, entry) => sum + entry.hours, 0);
  const sevenDayTarget = goalHours * 7;
  const sleepDebt = Math.max(0, Number((sevenDayTarget - sevenDayHours).toFixed(1)));
  const avgSleep = recent.length > 0 ? Number((sevenDayHours / recent.length).toFixed(2)) : 0;
  const readiness = Math.max(0, Math.min(100, Math.round((hours / goalHours) * 70 + (sleepDebt === 0 ? 30 : Math.max(0, 30 - sleepDebt * 4)))));
  const sleepWindowHours = useMemo(() => {
    const bedtimeMinutes = timeToMinutes(bedtime);
    const wakeMinutes = timeToMinutes(wakeTime);
    if (bedtimeMinutes === null || wakeMinutes === null) return 0;
    const adjustedWake = wakeMinutes >= bedtimeMinutes ? wakeMinutes : wakeMinutes + 24 * 60;
    return Number(((adjustedWake - bedtimeMinutes) / 60).toFixed(2));
  }, [bedtime, wakeTime]);
  const bedtimeConsistency = useMemo(() => {
    const values = recent
      .map((entry) => timeToMinutes(entry.bedtime))
      .filter((value): value is number => value !== null);
    if (values.length < 2) return 0;
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const drift = values.reduce((sum, value) => sum + Math.abs(value - average), 0) / values.length;
    return Math.round(drift);
  }, [recent]);
  const recoveryState = sleepDebt > 3
    ? 'Recovery debt is building. Pull intensity down slightly and protect bedtime tonight.'
    : avgSleep < goalHours
      ? 'You are close, but still under target pace. Tighten the sleep window and reduce late stimulation.'
      : 'Recovery is on pace. Maintain timing consistency and avoid chasing extra weekend oversleep.';

  const tip = state.profile
    ? hours < goalHours
      ? 'Try winding down 30 minutes earlier and reduce screens.'
      : hours > goalHours + 1.5
      ? 'Good rest, but keep routine consistent to avoid grogginess.'
      : 'Sleep is a cornerstone of recovery.'
    : 'Set up your profile for personalized sleep tips.';

  const handleActions = (event: React.MouseEvent<HTMLElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!trigger) return;
    if (trigger.dataset.action === 'log-sleep') handleLogSleep();
  };

  return (
    <div className="max-w-4xl mx-auto" onClick={handleActions}>
      <h2 className="text-2xl font-bold mb-2">Recovery & Sleep Lab</h2>
      <p className="season-description mb-6">Track sleep quality, debt, and readiness like a dedicated recovery app.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Tonight Goal</p>
          <p className="text-2xl font-bold">{goalHours} h</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">7d Average</p>
          <p className="text-2xl font-bold">{avgSleep} h</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Sleep Debt</p>
          <p className="text-2xl font-bold">{sleepDebt} h</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Readiness</p>
          <p className="text-2xl font-bold">{readiness}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Sleep Window</p>
          <p className="text-2xl font-bold mt-1">{sleepWindowHours} h</p>
          <p className="text-sm mt-2">Time between bedtime and wake time.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Bedtime Drift</p>
          <p className="text-2xl font-bold mt-1">{bedtimeConsistency} min</p>
          <p className="text-sm mt-2">Average deviation across recent bedtimes.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Recovery State</p>
          <p className="text-sm mt-1">{recoveryState}</p>
        </div>
      </div>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-1">😴 Log Last Night's Sleep</h3>
        <p className="season-description text-sm mb-4">Track your rest to monitor recovery and build consistency.</p>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3">How many hours did you sleep? {hours} h</label>
          <input
            type="range"
            min="0"
            max="12"
            step="0.25"
            value={hours}
            onChange={(e) => updateDraft('hours', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs season-description mt-2">💡 Target for tonight: {goalHours} hours. Below {goalHours - 1}h = sleep debt, above {goalHours + 2}h = oversleeping</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">🌙 What time did you go to bed?</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => updateDraft('bedtime', e.target.value)}
              className="w-full p-3 rounded-lg"
            />
            <p className="text-xs season-description mt-1">💡 Helps track your sleep routine consistency</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">☀️ What time did you wake up?</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => updateDraft('wakeTime', e.target.value)}
              className="w-full p-3 rounded-lg"
            />
            <p className="text-xs season-description mt-1">💡 Use consistent times to build a strong rhythm</p>
          </div>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg my-4">
          <p className="text-sm">Quality estimate: <span className="font-semibold">{hours < goalHours - 1 ? '⚠️ Too little sleep' : hours > goalHours + 2 ? '😴 Oversleeping' : '✓ Optimal range'}</span></p>
          <p className="text-xs season-description mt-2">Based on {goalHours}h target. Adjust bedtime/wake if needed before logging.</p>
        </div>

        <button
          data-action="log-sleep"
          className="w-full nature-button text-white font-semibold py-3 rounded-lg transition-colors hover:opacity-80"
        >
          ✓ Save Sleep Record
        </button>
      </div>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-4">7-Day History</h3>
        <div className="flex items-end space-x-2 h-32">
          {state.sleepHistory.slice(0, 7).map((entry, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  entry.quality === 'Optimal' ? 'bg-green-500' :
                  entry.quality === 'Too little' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ height: `${(entry.hours / 12) * 100}%` }}
              ></div>
              <span className="text-xs mt-1">{entry.hours.toFixed(1)}</span>
              <span className="text-xs text-slate-400">{entry.day}</span>
            </div>
          ))}
        </div>
        {state.sleepHistory.length === 0 && <p className="season-description mt-4">No sleep entries yet. Log tonight to build trend data.</p>}
      </div>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-3">Night Review</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recent.slice(0, 4).map((entry, index) => (
            <div key={`${entry.day}-${index}`} className="nature-card p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <strong>{entry.day}</strong>
                <span className="season-description text-xs">{entry.quality}</span>
              </div>
              <p>{entry.hours.toFixed(1)} h slept</p>
              <p className="text-sm mt-1">{entry.bedtime || '--:--'} to {entry.wakeTime || '--:--'}</p>
            </div>
          ))}
          {recent.length === 0 && <p className="season-description">Your most recent nights will appear here for quick recovery review.</p>}
        </div>
      </div>

      <div className="nature-card p-4 rounded-lg border">
        <p>{tip}</p>
      </div>
    </div>
  );
};

export default Sleep;
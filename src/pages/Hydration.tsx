import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';

const quickIntakeOptions = [
  { amount: 150, label: 'Espresso-side glass' },
  { amount: 250, label: 'Standard glass' },
  { amount: 330, label: 'Can / shaker fill' },
  { amount: 500, label: 'Bottle' },
  { amount: 750, label: 'Large bottle' },
];

const Hydration: React.FC = () => {
  const { state, dispatch } = useApp();
  const [quickMl, setQuickMl] = useState(250);

  const ml = state.hydrationMl;
  const goalMl = state.profile?.waterGoal || 2000;
  const percent = Math.min(100, Math.round((ml / goalMl) * 100));
  const remainingMl = Math.max(0, goalMl - ml);
  const remainingServings = Math.ceil(remainingMl / Math.max(1, quickMl));
  const bottle500Consumed = (ml / 500).toFixed(1);
  const litersConsumed = (ml / 1000).toFixed(2);
  const now = new Date();
  const hoursLeft = Math.max(1, 22 - now.getHours());
  const pacePerHourMl = Math.ceil(remainingMl / hoursLeft);
  const latestSessionMinutes = state.workouts[0]?.mins || 0;
  const trainingAdjustmentMl = Math.round(latestSessionMinutes * 7);
  const nextDoseMl = remainingMl === 0 ? 0 : Math.min(Math.max(200, quickMl), remainingMl);
  const quickOption = quickIntakeOptions.find((option) => option.amount === quickMl);

  const schedule = useMemo(() => {
    return [
      { label: 'Morning', target: Math.round(goalMl * 0.28), done: Math.min(ml, Math.round(goalMl * 0.28)) },
      { label: 'Midday', target: Math.round(goalMl * 0.30), done: Math.max(0, Math.min(ml - Math.round(goalMl * 0.28), Math.round(goalMl * 0.30))) },
      { label: 'Afternoon', target: Math.round(goalMl * 0.25), done: Math.max(0, Math.min(ml - Math.round(goalMl * 0.58), Math.round(goalMl * 0.25))) },
      { label: 'Evening', target: goalMl - Math.round(goalMl * 0.83), done: Math.max(0, ml - Math.round(goalMl * 0.83)) },
    ];
  }, [goalMl, ml]);

  const tip = state.profile
    ? `${state.profile.name}, target is ${goalMl} mL today. You have consumed ${ml} mL (${litersConsumed} L, ${bottle500Consumed} x 500mL bottles). Remaining: ${remainingMl} mL.`
    : 'Set up your profile to see personalized hydration tips.';

  const addIntake = (amountMl: number, label?: string) => {
    if (amountMl <= 0) return;
    dispatch({ type: 'ADD_WATER', payload: { amountMl, label } });
  };

  const handleActions = (event: React.MouseEvent<HTMLElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!trigger) return;
    if (trigger.dataset.action === 'add-quick-intake') {
      addIntake(quickMl, quickOption?.label);
    }
    if (trigger.dataset.action === 'add-150') addIntake(150, 'Small glass');
    if (trigger.dataset.action === 'add-250') addIntake(250, 'Standard glass');
    if (trigger.dataset.action === 'add-500') addIntake(500, 'Bottle');
    if (trigger.dataset.action === 'add-750') addIntake(750, 'Large bottle');
  };

  return (
    <div className="max-w-4xl mx-auto" onClick={handleActions}>
      <h2 className="text-2xl font-bold mb-2">Hydration Lab</h2>
      <p className="season-description mb-6">Precise fluid dosing, container tracking, and finish-line pacing like a dedicated hydration app.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Consumed</p>
          <p className="text-2xl font-bold">{ml} mL</p>
          <p className="text-sm mt-1">{litersConsumed} L</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Target</p>
          <p className="text-2xl font-bold">{goalMl} mL</p>
          <p className="text-sm mt-1">{(goalMl / 1000).toFixed(2)} L</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Remaining</p>
          <p className="text-2xl font-bold">{remainingMl} mL</p>
          <p className="text-sm mt-1">~{remainingServings} more servings</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Finish Pace</p>
          <p className="text-2xl font-bold">{pacePerHourMl} mL/h</p>
          <p className="text-sm mt-1">to finish by 22:00</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Next Dose</p>
          <p className="text-2xl font-bold mt-1">{nextDoseMl} mL</p>
          <p className="text-sm mt-2">Current container: {quickOption?.label || 'Custom size'}</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Latest Training Adjustment</p>
          <p className="text-2xl font-bold mt-1">{trainingAdjustmentMl} mL</p>
          <p className="text-sm mt-2">Suggested replacement from your latest {latestSessionMinutes || 0}-minute session.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Container Equivalents</p>
          <p className="text-2xl font-bold mt-1">{bottle500Consumed} bottles</p>
          <p className="text-sm mt-2">Based on 500 mL bottle units.</p>
        </div>
      </div>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-1">📊 Daily Progress</h3>
        <p className="season-description text-sm mb-4">{percent}% complete ({ml} / {goalMl} mL)</p>
        <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        <p className="text-sm font-semibold mb-3">Quick Log by Container:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <button data-action="add-150" className="nature-button py-2 rounded text-sm hover:opacity-80">150 mL</button>
          <button data-action="add-250" className="nature-button py-2 rounded text-sm hover:opacity-80">250 mL</button>
          <button data-action="add-500" className="nature-button py-2 rounded text-sm hover:opacity-80">500 mL</button>
          <button data-action="add-750" className="nature-button py-2 rounded text-sm hover:opacity-80">750 mL</button>
        </div>

        <div className="space-y-3 mt-4">
          <div>
            <label className="block text-sm font-semibold mb-2">🥤 Your Default Container</label>
            <p className="text-xs season-description mb-2">Pick the size you typically drink from. You can override per log if needed.</p>
            <select
              value={quickMl}
              onChange={(e) => setQuickMl(Number(e.target.value))}
              className="w-full p-3 rounded-lg"
            >
              {quickIntakeOptions.map((option) => (
                <option key={option.amount} value={option.amount}>{option.amount} mL • {option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button data-action="add-quick-intake" className="flex-1 nature-button py-3 rounded font-semibold hover:opacity-80">
              ✓ Log {quickMl} mL
            </button>
          </div>
          <p className="text-xs season-description text-center">📊 Today: {bottle500Consumed} x 500mL bottles equivalent</p>
        </div>
      </div>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-3">Daily Intake Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {schedule.map((block) => {
            const blockPercent = Math.min(100, Math.round((block.done / block.target) * 100));
            return (
              <div key={block.label} className="nature-card p-3 rounded-lg border">
                <div className="flex justify-between text-sm mb-2">
                  <span>{block.label}</span>
                  <span>{Math.min(block.done, block.target)} / {block.target} mL</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: `${blockPercent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-3">Dose Log</h3>
        <div className="space-y-3">
          {state.hydrationLog.slice(0, 6).map((entry) => (
            <div key={entry.id} className="nature-card p-3 rounded-lg border flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{entry.amountMl} mL</p>
                <p className="season-description text-sm">{entry.label || 'Manual intake'}</p>
              </div>
              <p className="season-description text-sm">{entry.time}</p>
            </div>
          ))}
          {state.hydrationLog.length === 0 && <p className="season-description text-sm">No hydration doses logged yet. Start with a precise container size above.</p>}
        </div>
      </div>

      <div className="nature-card p-4 rounded-lg border">
        <p>{tip}</p>
      </div>
    </div>
  );
};

export default Hydration;
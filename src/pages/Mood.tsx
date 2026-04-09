import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';

const Mood: React.FC = () => {
  const { state, dispatch } = useApp();
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [focus, setFocus] = useState(3);
  const [note, setNote] = useState('');

  const moods = [
    { name: 'Great', advice: 'keep the momentum by doing one mindfulness break.' },
    { name: 'Good', advice: 'build on it with a short walk.' },
    { name: 'Okay', advice: 'do a gentle stretch and drink water to reset.' },
    { name: 'Low', advice: 'reach out to a friend and set one small goal.' },
    { name: 'Stressed', advice: 'try a breathing exercise for 5 minutes.' }
  ];

  const handleMood = (mood: string) => {
    dispatch({
      type: 'LOG_MOOD',
      payload: {
        mood,
        time: new Date().toLocaleTimeString(),
        energy,
        stress,
        focus,
        note: note.trim() || undefined,
      }
    });
    setNote('');
  };

  const lastMood = state.moodHistory[0];
  const message = lastMood ? `You feel ${lastMood.mood} - ${moods.find(m => m.name === lastMood.mood)?.advice}` : 'Select mood to get a guided check-in.';
  const rolling = useMemo(() => {
    const recent = state.moodHistory.slice(0, 7);
    if (recent.length === 0) return { energy: 0, stress: 0, focus: 0 };
    const energyAvg = recent.reduce((sum, item) => sum + (item.energy || 0), 0) / recent.length;
    const stressAvg = recent.reduce((sum, item) => sum + (item.stress || 0), 0) / recent.length;
    const focusAvg = recent.reduce((sum, item) => sum + (item.focus || 0), 0) / recent.length;
    return {
      energy: Number(energyAvg.toFixed(1)),
      stress: Number(stressAvg.toFixed(1)),
      focus: Number(focusAvg.toFixed(1)),
    };
  }, [state.moodHistory]);
  const readinessScore = Math.max(0, Math.min(100, Math.round((rolling.energy * 12) + (rolling.focus * 12) - (rolling.stress * 8) + 24)));
  const strainLevel = rolling.stress >= 4 && rolling.energy <= 2.5
    ? 'High strain'
    : rolling.focus >= 4 && rolling.energy >= 3.5
      ? 'Locked in'
      : 'Manageable load';
  const nextBestAction = rolling.stress >= 4
    ? 'Downshift input load, reduce notifications, and take a 10-minute reset before the next hard task.'
    : rolling.energy <= 2.5
      ? 'Use movement, light, and hydration before demanding work.'
      : 'Protect the current state by batching deep work while focus is available.';

  const handleActions = (event: React.MouseEvent<HTMLElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!trigger) return;
    if (trigger.dataset.action === 'log-mood' && trigger.dataset.mood) {
      handleMood(trigger.dataset.mood);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" onClick={handleActions}>
      <h2 className="text-2xl font-bold mb-2">Mood & Mental Performance</h2>
      <p className="season-description mb-6">Capture nervous-system state with energy, stress, focus, and context like a dedicated mental performance app.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Energy (7d)</p>
          <p className="text-2xl font-bold">{rolling.energy}/5</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Stress (7d)</p>
          <p className="text-2xl font-bold">{rolling.stress}/5</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Focus (7d)</p>
          <p className="text-2xl font-bold">{rolling.focus}/5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Readiness</p>
          <p className="text-2xl font-bold mt-1">{readinessScore}%</p>
          <p className="text-sm mt-2">Composite from energy, focus, and stress trend.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">State Label</p>
          <p className="text-2xl font-bold mt-1">{strainLevel}</p>
          <p className="text-sm mt-2">A quick read on current mental load.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Next Best Action</p>
          <p className="text-sm mt-1">{nextBestAction}</p>
        </div>
      </div>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-1">📊 Check Your Signal Inputs</h3>
        <p className="season-description text-sm mb-4">Rate how you're feeling right now on energy, stress, and focus. This helps spot patterns in your mental state.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="block text-sm font-semibold mb-3">⚡ Energy: <span className="text-lg font-bold">{energy}/5</span></label>
            <input type="range" min="1" max="5" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full" />
            <p className="text-xs season-description mt-2">1=Exhausted • 5=Energized</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="block text-sm font-semibold mb-3">🔥 Stress: <span className="text-lg font-bold">{stress}/5</span></label>
            <input type="range" min="1" max="5" value={stress} onChange={(e) => setStress(Number(e.target.value))} className="w-full" />
            <p className="text-xs season-description mt-2">1=Calm • 5=Overwhelmed</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="block text-sm font-semibold mb-3">🎯 Focus: <span className="text-lg font-bold">{focus}/5</span></label>
            <input type="range" min="1" max="5" value={focus} onChange={(e) => setFocus(Number(e.target.value))} className="w-full" />
            <p className="text-xs season-description mt-2">1=Scattered • 5=Locked in</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">💭 What triggered this state? (optional)</label>
          <textarea
            placeholder="e.g. Morning coffee + good sleep + important work deadline"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded-lg text-sm"
          />
          <p className="text-xs season-description mt-1">💡 Adding context helps correlate triggers with performance over time</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {moods.map(mood => (
          <button
            key={mood.name}
            data-action="log-mood"
            data-mood={mood.name}
            className="nature-button text-white font-semibold py-3 px-6 rounded-lg border transition-colors"
          >
            {mood.name}
          </button>
        ))}
      </div>

      <div className="nature-card p-4 rounded-lg border mb-6">
        <p>{message}</p>
      </div>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-3">Current Check-In Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="nature-card p-4 rounded-lg border">
            <p className="season-description text-xs">Energy Input</p>
            <p className="text-2xl font-bold">{energy}/5</p>
          </div>
          <div className="nature-card p-4 rounded-lg border">
            <p className="season-description text-xs">Stress Load</p>
            <p className="text-2xl font-bold">{stress}/5</p>
          </div>
          <div className="nature-card p-4 rounded-lg border">
            <p className="season-description text-xs">Focus Control</p>
            <p className="text-2xl font-bold">{focus}/5</p>
          </div>
        </div>
      </div>

      <div className="nature-card rounded-lg border">
        <h3 className="p-4 text-lg font-semibold border-b border-slate-600">7-Day History</h3>
        <ul className="divide-y divide-slate-600">
          {state.moodHistory.map((entry, index) => (
            <li key={index} className="p-4">
              <p className="font-semibold">{entry.time} - {entry.mood}</p>
              <p className="season-description text-sm mt-1">Energy {entry.energy || '-'} / Stress {entry.stress || '-'} / Focus {entry.focus || '-'}</p>
              {entry.note && <p className="text-sm mt-1">{entry.note}</p>}
            </li>
          ))}
          {state.moodHistory.length === 0 && <li className="p-4 season-description">No check-ins yet. Log your first mood signal above.</li>}
        </ul>
      </div>
    </div>
  );
};

export default Mood;
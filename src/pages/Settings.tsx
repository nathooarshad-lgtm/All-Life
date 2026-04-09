import React from 'react';
import { useApp } from '../context/AppContext';
import { seasonThemes } from '../modules/ui';

const Settings: React.FC = () => {
  const { state, dispatch } = useApp();

  const resetProgress = () => {
    if (!window.confirm('Reset activity progress, logs, and tasks?')) return;
    dispatch({ type: 'RESET_PROGRESS' });
  };

  const resetAllData = () => {
    if (!window.confirm('Reset your whole profile and all tracker data?')) return;
    dispatch({ type: 'RESET_ALL_DATA' });
  };

  return (
    <div>
      <h2 className="text-4xl font-bold mb-2">Settings</h2>
      <p className="text-white mb-6">Control your interface, data, and daily flow.</p>

      <section className="nature-card p-6 rounded-2xl border mb-6">
        <h3 className="text-2xl mb-4">Season</h3>
        <p className="season-description mb-4">Set the current season to match the time of year. This changes backgrounds, accents, and ambient sound.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
            <button
              key={season}
              className={`season-btn ${state.season === season ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_SEASON', payload: season })}
            >
              {seasonThemes[season].label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            className={`season-btn ${state.ambientSoundEnabled ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_AMBIENT_SOUND' })}
          >
            {state.ambientSoundEnabled ? '🔊 Ambient Sound: On' : '🔇 Ambient Sound: Off'}
          </button>
          <button
            className={`season-btn ${state.autoSeasonCycle ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_AUTO_SEASON_CYCLE' })}
          >
            {state.autoSeasonCycle ? '🕒 Auto Season Cycle: On (5 min)' : '🕒 Auto Season Cycle: Off'}
          </button>
          <p className="season-description text-sm flex items-center">{seasonThemes[state.season].ambientHint}</p>
        </div>
      </section>

      <section className="nature-card p-6 rounded-2xl border mb-6">
        <h3 className="text-2xl mb-4">Theme Control</h3>
        <p className="season-description mb-4">Pick a visual mood for your nature HUD.</p>
        <h4 className="text-lg mb-3">Mode</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            className={`season-btn ${state.colorMode === 'dark' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_COLOR_MODE', payload: 'dark' })}
          >
            Light Mode
          </button>
          <button
            className={`season-btn ${state.colorMode === 'light' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_COLOR_MODE', payload: 'light' })}
          >
            Dark Mode
          </button>
        </div>

        <h4 className="text-lg mb-3">Theme Palette</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            className={`season-btn ${state.uiTheme === 'forest' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_UI_THEME', payload: 'forest' })}
          >
            Forest Default
          </button>
          <button
            className={`season-btn ${state.uiTheme === 'dawn' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_UI_THEME', payload: 'dawn' })}
          >
            Dawn Mist
          </button>
          <button
            className={`season-btn ${state.uiTheme === 'canyon' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_UI_THEME', payload: 'canyon' })}
          >
            Canyon Earth
          </button>
          <button
            className={`season-btn ${state.compactInputs ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_COMPACT_INPUTS' })}
          >
            {state.compactInputs ? 'Compact Inputs: On' : 'Compact Inputs: Off'}
          </button>
        </div>
      </section>

      <section className="nature-card p-6 rounded-2xl border mb-6">
        <h3 className="text-2xl mb-4">Data Controls</h3>
        <p className="season-description mb-4">Use reset actions when you want a fresh cycle.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="nature-button py-3 rounded-lg font-semibold" onClick={resetProgress}>
            Reset Progress
          </button>
          <button className="nature-button py-3 rounded-lg font-semibold" onClick={resetAllData}>
            Reset Everything
          </button>
        </div>
      </section>

      <section className="nature-card p-6 rounded-2xl border">
        <h3 className="text-2xl mb-4">Quick Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="season-description text-xs">XP</p>
            <p className="text-lg font-semibold">{state.xp}</p>
          </div>
          <div>
            <p className="season-description text-xs">Calories</p>
            <p className="text-lg font-semibold">{state.calories}/{state.targetCalories}</p>
          </div>
          <div>
            <p className="season-description text-xs">Water</p>
            <p className="text-lg font-semibold">{state.hydrationMl} mL</p>
          </div>
          <div>
            <p className="season-description text-xs">Tasks Done</p>
            <p className="text-lg font-semibold">{state.tasksCompleted}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;

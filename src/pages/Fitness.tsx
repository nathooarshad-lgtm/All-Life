import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { toNumber } from '../modules/utils';
import { generateWorkoutPlan } from '../modules/ai';
import type { AIProvider } from '../modules/ai';

const splitTemplates: Record<string, string[]> = {
  'push-pull-legs': ['Push', 'Pull', 'Legs', 'Rest', 'Push', 'Pull', 'Legs'],
  'upper-lower': ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Accessories', 'Rest'],
  bro: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Conditioning', 'Rest'],
  full: ['Full Body A', 'Rest', 'Full Body B', 'Rest', 'Full Body C', 'Zone 2', 'Rest'],
};

const exerciseOptionsByGroup: Record<string, string[]> = {
  chest: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Push-Up'],
  back: ['Pull-Up', 'Barbell Row', 'Lat Pulldown', 'Seated Cable Row'],
  legs: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Walking Lunges'],
  shoulders: ['Overhead Press', 'Lateral Raise', 'Rear Delt Fly', 'Arnold Press'],
  arms: ['Barbell Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skull Crushers'],
  core: ['Cable Crunch', 'Hanging Knee Raise', 'Plank', 'Ab Wheel Rollout'],
  cardio: ['Treadmill Intervals', 'Assault Bike', 'Row Erg', 'Zone 2 Walk'],
};

const Fitness: React.FC = () => {
  const { state, dispatch } = useApp();
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [programFocus, setProgramFocus] = useState<'hypertrophy' | 'strength' | 'recomposition' | 'fat-loss'>('hypertrophy');
  const [splitKey, setSplitKey] = useState<'push-pull-legs' | 'upper-lower' | 'bro' | 'full'>('push-pull-legs');
  const [muscleGroup, setMuscleGroup] = useState<keyof typeof exerciseOptionsByGroup>('chest');
  const [exerciseName, setExerciseName] = useState(exerciseOptionsByGroup.chest[0]);
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(10);
  const [rpe, setRpe] = useState(8);
  const [restSeconds, setRestSeconds] = useState(90);
  const [workoutMins, setWorkoutMins] = useState(55);
  const [aiPlan, setAiPlan] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const addSteps = (steps: number) => {
    dispatch({ type: 'ADD_STEPS', payload: steps });
  };

  const addWorkout = () => {
    if (workoutMins <= 0 || sets <= 0 || reps <= 0) return;
    const now = new Date();
    dispatch({
      type: 'ADD_WORKOUT',
      payload: {
        id: Date.now(),
        type: `${muscleGroup.toUpperCase()} • ${exerciseName}`,
        mins: workoutMins,
        time: now.toLocaleTimeString(),
        performedAt: now.toISOString(),
        split: splitKey,
        focus: programFocus,
        muscleGroup,
        exerciseName,
        sets,
        reps,
        rpe,
        restSeconds,
      }
    });
    setWorkoutMins(55);
  };

  const aiWorkoutPlan = async () => {
    setAiError('');
    setAiLoading(true);
    try {
      const prompt = `Program focus: ${programFocus}. Preferred split: ${splitKey}. Training target: ${state.profile?.physicalExerciseGoal || 'Build muscle with healthy progression'}. Include weekly progression and exercise substitutions.`;
      const plan = await generateWorkoutPlan({ state, provider, userRequest: prompt });
      setAiPlan(plan);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unable to generate plan right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleMuscleGroupChange = (group: keyof typeof exerciseOptionsByGroup) => {
    setMuscleGroup(group);
    setExerciseName(exerciseOptionsByGroup[group][0]);
  };

  const handleActions = (event: React.MouseEvent<HTMLElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === 'add-steps') addSteps(toNumber(trigger.dataset.amount));
    if (action === 'log-workout') addWorkout();
    if (action === 'workout-plan' && !aiLoading) {
      void aiWorkoutPlan();
    }
  };

  const distance = (state.stepCount * 0.0008).toFixed(2);
  const burn = Math.round(state.stepCount * 0.04);

  const workoutsWithDate = state.workouts.map((workout) => {
    const date = workout.performedAt ? new Date(workout.performedAt) : new Date(workout.id);
    return { ...workout, date };
  });
  const now = Date.now();
  const sessionsThisWeek = workoutsWithDate.filter((workout) => now - workout.date.getTime() <= 7 * 24 * 60 * 60 * 1000).length;
  const weeklyMinutes = workoutsWithDate
    .filter((workout) => now - workout.date.getTime() <= 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, workout) => sum + workout.mins, 0);
  const weeklyVolume = workoutsWithDate
    .filter((workout) => now - workout.date.getTime() <= 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, workout) => sum + ((workout.sets || 0) * (workout.reps || 0)), 0);

  const splitDays = splitTemplates[splitKey];

  return (
    <div className="max-w-4xl mx-auto" onClick={handleActions}>
      <h2 className="text-2xl font-bold mb-2">Performance Lab</h2>
      <p className="season-description mb-6">Bodybuilding-style programming with progressive overload, volume targets, and AI periodization.</p>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-4">Program DNA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Primary Focus</label>
            <select value={programFocus} onChange={(e) => setProgramFocus(e.target.value as typeof programFocus)} className="w-full p-3 rounded-lg">
              <option value="hypertrophy">Hypertrophy</option>
              <option value="strength">Strength</option>
              <option value="recomposition">Recomposition</option>
              <option value="fat-loss">Fat Loss + Muscle Retention</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Training Split</label>
            <select value={splitKey} onChange={(e) => setSplitKey(e.target.value as typeof splitKey)} className="w-full p-3 rounded-lg">
              <option value="push-pull-legs">Push / Pull / Legs</option>
              <option value="upper-lower">Upper / Lower</option>
              <option value="bro">Bro Split</option>
              <option value="full">Full Body</option>
            </select>
          </div>
        </div>

        <div className="nature-card p-4 rounded-lg border">
          <p className="text-sm font-semibold mb-3">Current Week Structure</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {splitDays.map((day, idx) => (
              <div key={`${day}-${idx}`} className="season-btn text-sm">Day {idx + 1}: {day}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="nature-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Conditioning & Steps</h3>
          <p className="mb-2">Steps today: <strong>{state.stepCount.toLocaleString()}</strong></p>
          <div className="flex gap-2 mb-4">
            <button data-action="add-steps" data-amount="1000" className="nature-button text-white px-4 py-2 rounded transition-colors">+1000</button>
            <button data-action="add-steps" data-amount="2500" className="nature-button text-white px-4 py-2 rounded transition-colors">+2500</button>
            <button data-action="add-steps" data-amount="5000" className="nature-button text-white px-4 py-2 rounded transition-colors">+5000</button>
          </div>
          <p>Distance: <strong>{distance} km</strong></p>
          <p>Burned: <strong>{burn} kcal</strong></p>
        </div>

        <div className="nature-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Log Training Set</h3>
          <select
            value={muscleGroup}
            onChange={(e) => handleMuscleGroupChange(e.target.value as keyof typeof exerciseOptionsByGroup)}
            className="w-full p-3 mb-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="chest">Chest</option>
            <option value="back">Back</option>
            <option value="legs">Legs</option>
            <option value="shoulders">Shoulders</option>
            <option value="arms">Arms</option>
            <option value="core">Core</option>
            <option value="cardio">Cardio</option>
          </select>

          <select
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="w-full p-3 mb-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {exerciseOptionsByGroup[muscleGroup].map((exercise) => (
              <option key={exercise} value={exercise}>{exercise}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="number"
              placeholder="Sets"
              value={sets}
              min={1}
              onChange={(e) => setSets(Number(e.target.value))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Reps"
              value={reps}
              min={1}
              onChange={(e) => setReps(Number(e.target.value))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="number"
              placeholder="RPE"
              value={rpe}
              min={5}
              max={10}
              step={0.5}
              onChange={(e) => setRpe(Number(e.target.value))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Rest (sec)"
              value={restSeconds}
              min={30}
              step={15}
              onChange={(e) => setRestSeconds(Number(e.target.value))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            type="number"
            placeholder="Session Duration (min)"
            value={workoutMins}
            onChange={(e) => setWorkoutMins(Number(e.target.value))}
            className="w-full p-3 mb-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            data-action="log-workout"
            className="w-full nature-button text-white font-semibold py-3 rounded-lg transition-colors mb-3"
          >
            Log Session
          </button>

          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AIProvider)}
            className="w-full p-3 mb-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="openai">ChatGPT</option>
            <option value="anthropic">Claude</option>
          </select>

          <button
            data-action="workout-plan"
            className="w-full nature-button text-white font-semibold py-3 rounded-lg transition-colors"
            disabled={aiLoading}
          >
            {aiLoading ? 'Generating Plan...' : 'Generate Bodybuilding Plan'}
          </button>
          {aiError && <p className="mt-3 text-sm text-yellow-300">{aiError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Sessions (7d)</p>
          <p className="text-2xl font-bold mt-1">{sessionsThisWeek}</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Minutes (7d)</p>
          <p className="text-2xl font-bold mt-1">{weeklyMinutes}</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Volume (sets x reps, 7d)</p>
          <p className="text-2xl font-bold mt-1">{weeklyVolume}</p>
        </div>
      </div>

      {aiPlan && (
        <div className="nature-card p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold mb-3">AI Performance Plan</h3>
          <pre className="text-sm whitespace-pre-wrap" style={{ fontFamily: 'inherit' }}>{aiPlan}</pre>
        </div>
      )}

      <div className="nature-card rounded-lg border">
        <h3 className="p-4 text-lg font-semibold border-b border-slate-600">Training Log</h3>
        <ul className="divide-y divide-slate-600">
          {state.workouts.map(workout => (
            <li key={workout.id} className="p-4">
              <p className="font-semibold">{workout.time}: {workout.type}</p>
              <p className="season-description text-sm mt-1">
                {workout.sets ? `${workout.sets} sets x ${workout.reps} reps` : 'Session logged'}
                {workout.rpe ? ` • RPE ${workout.rpe}` : ''}
                {workout.restSeconds ? ` • Rest ${workout.restSeconds}s` : ''}
                {` • ${workout.mins} min`}
              </p>
            </li>
          ))}
          {state.workouts.length === 0 && (
            <li className="p-4 season-description">No training sessions yet. Start with your first logged set above.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Fitness;
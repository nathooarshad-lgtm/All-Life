import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

type SetupFormState = {
  name: string;
  age: string;
  weight: string;
  height: string;
  sex: 'male' | 'female';
  activity: string;
  goal: 'maintain' | 'lose' | 'gain';
  physicalExerciseGoal: string;
  diet: string;
  waterGoal: string;
  sleepGoal: string;
  occupation: string;
};

type FieldKey = keyof SetupFormState;

type SetupField = {
  key: FieldKey;
  label: string;
  type: 'text' | 'number' | 'select';
  required?: boolean;
  placeholder?: string;
  min?: string;
  step?: string;
  options?: Array<{ value: string; label: string }>;
  description?: string;
  hint?: string;
};

const setupFields: SetupField[] = [
  { 
    key: 'name', 
    label: 'What\'s your name?', 
    type: 'text', 
    required: true, 
    placeholder: 'e.g. Alex',
    description: 'We\'ll use this to personalize your daily greetings and coaching messages.',
  },
  { 
    key: 'age', 
    label: 'Age', 
    type: 'number', 
    required: true, 
    min: '10',
    description: 'Used to calculate your daily calorie needs accurately.',
    hint: 'Typical range: 18–65 years',
  },
  { 
    key: 'weight', 
    label: 'Current Weight', 
    type: 'number', 
    required: true, 
    step: '0.1',
    description: 'Your current body weight. Used to track body composition progress over time.',
    hint: 'Enter in kilograms (kg). Example: 75.5',
  },
  { 
    key: 'height', 
    label: 'Height', 
    type: 'number', 
    required: true, 
    step: '0.1',
    description: 'Your height determines healthy weight ranges and helps calculate daily calorie needs.',
    hint: 'Enter in centimeters (cm). Example: 180',
  },
  {
    key: 'sex',
    label: 'Sex',
    type: 'select',
    required: true,
    description: 'Used to calculate hormonal differences in metabolism.',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  {
    key: 'activity',
    label: 'How active are you?',
    type: 'select',
    required: true,
    description: 'This multiplier adjusts your calorie needs based on exercise frequency and daily movement.',
    options: [
      { value: '1.2', label: '⏸️ Sedentary (little/no exercise, office job)' },
      { value: '1.375', label: '🚶 Light (1–3 days/week exercise)' },
      { value: '1.55', label: '🏃 Moderate (3–5 days/week exercise)' },
      { value: '1.725', label: '💪 Active (6–7 days/week exercise)' },
      { value: '1.9', label: '🔥 Very Active (intense daily workouts + manual job)' },
    ],
  },
  {
    key: 'goal',
    label: 'What\'s your primary goal?',
    type: 'select',
    required: true,
    description: 'This sets your daily calorie target. Losing weight = calorie deficit. Gaining = surplus. Maintaining = no change.',
    options: [
      { value: 'maintain', label: '⚖️ Maintain Weight (same target daily)' },
      { value: 'lose', label: '📉 Lose Weight (500 kcal deficit)' },
      { value: 'gain', label: '📈 Gain Weight (300 kcal surplus)' },
    ],
  },
  {
    key: 'physicalExerciseGoal',
    label: 'What\'s your exercise focus?',
    type: 'text',
    required: true,
    placeholder: 'e.g. Build muscle, run a 5K, get stronger, increase endurance',
    description: 'This guides your workout recommendations and helps the coach tailor advice.',
    hint: 'Be specific. Examples: "Abs in 30 days", "full-body strength", "marathon prep", "lean muscle gain"',
  },
  { 
    key: 'diet', 
    label: 'Any dietary restrictions?', 
    type: 'text', 
    placeholder: 'e.g. vegan, gluten-free, keto, dairy-free',
    description: 'Helps personalize meal suggestions and avoid foods you want to avoid.',
    hint: 'Optional. Leave blank if no restrictions.',
  },
  { 
    key: 'waterGoal', 
    label: 'Daily hydration target', 
    type: 'number', 
    required: true,
    description: 'Your daily water intake goal in milliliters. The app will track and remind you.',
    hint: 'Common values: 2000–3500 mL. Standard: 2–3.5 liters per day.',
  },
  { 
    key: 'sleepGoal', 
    label: 'Sleep target', 
    type: 'number', 
    required: true, 
    step: '0.5',
    description: 'How many hours of sleep you want each night. Recovery is critical for performance.',
    hint: 'Typical range: 7–9 hours. Health standard: 8 hours.',
  },
  { 
    key: 'occupation', 
    label: 'What do you do?', 
    type: 'text',
    placeholder: 'e.g. software engineer, nurse, artist',
    description: 'Helps contextualize energy levels, stress, and recovery needs.',
    hint: 'Optional. Helps the coach understand your day.',
  },
];

const Setup: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const isFirstTime = !state.profile;
  const [form, setForm] = useState<SetupFormState>({
    name: state.profile?.name || '',
    age: state.profile?.age ? String(state.profile.age) : '',
    weight: state.profile?.weight ? String(state.profile.weight) : '',
    height: state.profile?.height ? String(state.profile.height) : '',
    sex: state.profile?.sex || 'male',
    activity: state.profile?.activity ? String(state.profile.activity) : '1.2',
    goal: state.profile?.goal || 'maintain',
    physicalExerciseGoal: state.profile?.physicalExerciseGoal || '',
    diet: state.profile?.diet || '',
    waterGoal: state.profile?.waterGoal ? String(state.profile.waterGoal) : '2000',
    sleepGoal: state.profile?.sleepGoal ? String(state.profile.sleepGoal) : '8',
    occupation: state.profile?.occupation || '',
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);

  const currentField = setupFields[stepIndex];
  const isLastStep = stepIndex === setupFields.length - 1;

  const isCurrentStepValid = () => {
    const value = form[currentField.key];
    if (!currentField.required) return true;
    return String(value).trim().length > 0;
  };

  const goNext = () => {
    if (!isCurrentStepValid()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setStepIndex((prev) => Math.min(prev + 1, setupFields.length - 1));
  };

  const goBack = () => {
    setShowValidation(false);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value } as SetupFormState));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentStepValid()) {
      setShowValidation(true);
      return;
    }

    dispatch({
      type: 'SET_PROFILE',
      payload: {
        name: form.name.trim(),
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        sex: form.sex,
        activity: Number(form.activity),
        goal: form.goal,
        physicalExerciseGoal: form.physicalExerciseGoal.trim(),
        diet: form.diet.trim(),
        waterGoal: Number(form.waterGoal),
        sleepGoal: Number(form.sleepGoal),
        occupation: form.occupation.trim(),
      },
    });
    navigate('/dashboard');
  };

  const progressPercent = Math.round(((stepIndex + 1) / setupFields.length) * 100);

  return (
    <div>
      <h2 className="text-4xl font-bold mb-2">{isFirstTime ? 'Welcome to All Life' : 'Profile Setup & Personalization'}</h2>
      <p className="text-white text-opacity-70 mb-8">
        {isFirstTime
          ? 'Let us personalize your journey. This quick welcome setup unlocks your dashboard and goals.'
          : 'Update your personalized wellness profile.'}
      </p>
      <form onSubmit={handleSubmit} className="nature-card p-8 rounded-2xl border shadow-xl mb-6">
        <div className="mb-6">
          <p className="season-description text-sm">Step {stepIndex + 1} of {setupFields.length}</p>
          <div className="h-3 mt-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-3 bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">{currentField.label}</label>
          
          {currentField.description && (
            <p className="season-description text-sm mb-4">{currentField.description}</p>
          )}

          {currentField.type === 'select' ? (
            <select
              name={currentField.key}
              value={form[currentField.key]}
              onChange={handleChange}
              className="w-full p-4 rounded-lg"
              required={Boolean(currentField.required)}
            >
              {currentField.options?.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={currentField.type}
              name={currentField.key}
              value={form[currentField.key]}
              onChange={handleChange}
              min={currentField.min}
              step={currentField.step}
              placeholder={currentField.placeholder}
              className="w-full p-4 rounded-lg"
              required={Boolean(currentField.required)}
            />
          )}

          {currentField.hint && (
            <p className="text-xs text-slate-400 mt-3">💡 {currentField.hint}</p>
          )}

          {showValidation && !isCurrentStepValid() && (
            <p className="mt-3 text-sm text-yellow-300">Please fill this field before continuing.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={goBack}
            className="nature-button px-6"
            disabled={stepIndex === 0}
            style={{ opacity: stepIndex === 0 ? 0.55 : 1, cursor: stepIndex === 0 ? 'not-allowed' : 'pointer' }}
          >
            Back
          </button>

          {!isLastStep && (
            <button
              type="button"
              onClick={goNext}
              className="nature-button px-6"
            >
              Next
            </button>
          )}

          {isLastStep && (
            <button
              type="submit"
              className="nature-button px-6"
            >
              {isFirstTime ? 'Finish Welcome Setup' : 'Save Profile'}
            </button>
          )}
        </div>
      </form>
      {state.profile && (
        <div className="nature-card p-6 rounded-2xl border shadow-lg">
          <p className="text-lg"><strong>📊 TDEE:</strong> {state.profile.tdee} kcal/day</p>
          <p className="text-lg mt-2"><strong>🎯 Daily Target:</strong> {state.targetCalories} kcal</p>
        </div>
      )}
    </div>
  );
};

export default Setup;
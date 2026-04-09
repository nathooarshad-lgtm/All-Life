import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getSeasonFromDate } from '../modules/utils';

export interface Profile {
  name: string;
  age: number;
  weight: number;
  height: number;
  sex: 'male' | 'female';
  activity: number;
  goal: 'maintain' | 'lose' | 'gain';
  physicalExerciseGoal: string;
  diet: string;
  waterGoal: number;
  sleepGoal: number;
  occupation: string;
  tdee?: number;
}

export interface FoodItem {
  id: number;
  name: string;
  cals: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  proteinGrams?: number;
}

export interface Workout {
  id: number;
  type: string;
  mins: number;
  time: string;
  performedAt?: string;
  split?: string;
  focus?: string;
  muscleGroup?: string;
  exerciseName?: string;
  sets?: number;
  reps?: number;
  rpe?: number;
  restSeconds?: number;
}

export interface SleepEntry {
  day: string;
  hours: number;
  quality: string;
  bedtime?: string;
  wakeTime?: string;
}

export interface HydrationEntry {
  id: number;
  amountMl: number;
  label?: string;
  time: string;
  recordedAt: string;
}

export interface MoodEntry {
  mood: string;
  time: string;
  energy?: number;
  stress?: number;
  focus?: number;
  note?: string;
}

export interface Task {
  id: number;
  text: string;
  category: string;
  done: boolean;
  priority?: 'low' | 'medium' | 'high';
  lane?: 'today' | 'this-week' | 'later';
}

export interface AppState {
  profile: Profile | null;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  autoSeasonCycle: boolean;
  uiTheme: 'forest' | 'dawn' | 'canyon';
  colorMode: 'dark' | 'light';
  backgroundChoice: 'seasonal' | 'nature-back-1' | 'nature-back-2' | 'ai-meadow' | 'ai-misty' | 'ai-summit' | 'custom';
  customBackgroundUrl: string;
  ambientSoundEnabled: boolean;
  compactInputs: boolean;
  xp: number;
  calories: number;
  targetCalories: number;
  hydrationMl: number;
  stepCount: number;
  tasksCompleted: number;
  foodLog: FoodItem[];
  hydrationLog: HydrationEntry[];
  workouts: Workout[];
  sleepHistory: SleepEntry[];
  moodHistory: MoodEntry[];
  taskList: Task[];
}

type AppAction =
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'ADD_FOOD'; payload: FoodItem }
  | { type: 'DELETE_FOOD'; payload: number }
  | { type: 'ADD_WATER'; payload: { amountMl: number; label?: string } }
  | { type: 'ADD_STEPS'; payload: number }
  | { type: 'ADD_WORKOUT'; payload: Workout }
  | { type: 'LOG_SLEEP'; payload: SleepEntry }
  | { type: 'LOG_MOOD'; payload: MoodEntry }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'TOGGLE_TASK'; payload: number }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_SEASON'; payload: 'spring' | 'summer' | 'autumn' | 'winter' }
  | { type: 'TOGGLE_AUTO_SEASON_CYCLE' }
  | { type: 'SET_UI_THEME'; payload: 'forest' | 'dawn' | 'canyon' }
  | { type: 'SET_COLOR_MODE'; payload: 'dark' | 'light' }
  | { type: 'SET_BACKGROUND_CHOICE'; payload: 'seasonal' | 'nature-back-1' | 'nature-back-2' | 'ai-meadow' | 'ai-misty' | 'ai-summit' | 'custom' }
  | { type: 'SET_CUSTOM_BACKGROUND'; payload: string }
  | { type: 'TOGGLE_AMBIENT_SOUND' }
  | { type: 'TOGGLE_COMPACT_INPUTS' }
  | { type: 'RESET_PROGRESS' }
  | { type: 'RESET_ALL_DATA' }
  | { type: 'GENERATE_TASKS'; payload: Task[] }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  profile: null,
  season: getSeasonFromDate(),
  autoSeasonCycle: false,
  uiTheme: 'forest',
  colorMode: 'dark',
  backgroundChoice: 'seasonal',
  customBackgroundUrl: '',
  ambientSoundEnabled: false,
  compactInputs: false,
  xp: 0,
  calories: 0,
  targetCalories: 2000,
  hydrationMl: 0,
  stepCount: 0,
  tasksCompleted: 0,
  foodLog: [],
  hydrationLog: [],
  workouts: [],
  sleepHistory: [],
  moodHistory: [],
  taskList: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROFILE': {
      const tdee = getTDEE(action.payload);
      const target = goalCalories(action.payload);
      return { ...state, profile: { ...action.payload, tdee }, targetCalories: target };
    }
    case 'ADD_FOOD':
      return { ...state, calories: state.calories + action.payload.cals, foodLog: [...state.foodLog, action.payload], xp: state.xp + 2 };
    case 'DELETE_FOOD': {
      const item = state.foodLog.find(f => f.id === action.payload);
      return item ? { ...state, calories: state.calories - item.cals, foodLog: state.foodLog.filter(f => f.id !== action.payload) } : state;
    }
    case 'ADD_WATER':
      return {
        ...state,
        hydrationMl: Math.min(15000, state.hydrationMl + action.payload.amountMl),
        hydrationLog: [
          {
            id: Date.now(),
            amountMl: action.payload.amountMl,
            label: action.payload.label,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recordedAt: new Date().toISOString(),
          },
          ...state.hydrationLog,
        ].slice(0, 20),
        xp: Math.max(0, state.xp + Math.max(1, Math.round(action.payload.amountMl / 250)))
      };
    case 'ADD_STEPS':
      return { ...state, stepCount: state.stepCount + action.payload };
    case 'ADD_WORKOUT':
      return { ...state, workouts: [action.payload, ...state.workouts.slice(0, 49)], xp: state.xp + 10 };
    case 'LOG_SLEEP':
      return { ...state, sleepHistory: [action.payload, ...state.sleepHistory.slice(0, 6)], xp: state.xp + 8 };
    case 'LOG_MOOD':
      return { ...state, moodHistory: [action.payload, ...state.moodHistory.slice(0, 6)] };
    case 'ADD_TASK':
      return { ...state, taskList: [...state.taskList, action.payload] };
    case 'TOGGLE_TASK': {
      const currentTask = state.taskList.find(t => t.id === action.payload);
      const wasDone = Boolean(currentTask?.done);
      return {
        ...state,
        taskList: state.taskList.map(t => t.id === action.payload ? { ...t, done: !t.done } : t),
        tasksCompleted: wasDone ? state.tasksCompleted - 1 : state.tasksCompleted + 1,
        xp: Math.max(0, state.xp + (wasDone ? -20 : 20))
      };
    }
    case 'DELETE_TASK': {
      const task = state.taskList.find(t => t.id === action.payload);
      return {
        ...state,
        taskList: state.taskList.filter(t => t.id !== action.payload),
        tasksCompleted: task?.done ? state.tasksCompleted - 1 : state.tasksCompleted
      };
    }
    case 'SET_SEASON':
      return { ...state, season: action.payload };
    case 'TOGGLE_AUTO_SEASON_CYCLE':
      return { ...state, autoSeasonCycle: !state.autoSeasonCycle };
    case 'SET_UI_THEME':
      return { ...state, uiTheme: action.payload };
    case 'SET_COLOR_MODE':
      return { ...state, colorMode: action.payload };
    case 'SET_BACKGROUND_CHOICE':
      return { ...state, backgroundChoice: action.payload };
    case 'SET_CUSTOM_BACKGROUND':
      return { ...state, backgroundChoice: 'custom', customBackgroundUrl: action.payload };
    case 'TOGGLE_AMBIENT_SOUND':
      return { ...state, ambientSoundEnabled: !state.ambientSoundEnabled };
    case 'TOGGLE_COMPACT_INPUTS':
      return { ...state, compactInputs: !state.compactInputs };
    case 'RESET_PROGRESS':
      return {
        ...state,
        xp: 0,
        calories: 0,
        hydrationMl: 0,
        stepCount: 0,
        tasksCompleted: 0,
        foodLog: [],
        hydrationLog: [],
        workouts: [],
        sleepHistory: [],
        moodHistory: [],
        taskList: []
      };
    case 'RESET_ALL_DATA':
      return {
        ...initialState,
        season: state.season,
        uiTheme: state.uiTheme,
        colorMode: state.colorMode,
        backgroundChoice: state.backgroundChoice,
        customBackgroundUrl: state.customBackgroundUrl
      };
    case 'GENERATE_TASKS':
      return { ...state, taskList: [...state.taskList, ...action.payload] };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

function getTDEE(p: Profile): number {
  const s = p.sex === 'male' ? 5 : -161;
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + s;
  return Math.round(bmr * p.activity);
}

function goalCalories(p: Profile): number {
  const base = getTDEE(p);
  if (p.goal === 'lose') return Math.max(1200, Math.round(base - 500));
  if (p.goal === 'gain') return Math.round(base + 300);
  return Math.round(base);
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('all_life_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            ...initialState,
            ...parsed,
            profile: parsed.profile
              ? {
                  ...parsed.profile,
                  physicalExerciseGoal: parsed.profile.physicalExerciseGoal || 'General fitness'
                }
              : null,
            season: parsed.season || getSeasonFromDate(),
            autoSeasonCycle: Boolean(parsed.autoSeasonCycle),
            uiTheme: parsed.uiTheme || 'forest',
            colorMode: parsed.colorMode === 'light' ? 'light' : 'dark',
            backgroundChoice: parsed.backgroundChoice || 'seasonal',
            customBackgroundUrl: parsed.customBackgroundUrl || '',
            ambientSoundEnabled: Boolean(parsed.ambientSoundEnabled),
            compactInputs: Boolean(parsed.compactInputs),
            xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
            hydrationMl: typeof parsed.hydrationMl === 'number'
              ? parsed.hydrationMl
              : typeof parsed.water === 'number'
                ? Math.round(parsed.water * 250)
                : 0,
            hydrationLog: Array.isArray(parsed.hydrationLog) ? parsed.hydrationLog : []
          }
        });
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('all_life_state', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { toNumber } from '../modules/utils';

const mealSlots = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const Nutrition: React.FC = () => {
  const { state, dispatch } = useApp();
  const [foodName, setFoodName] = useState('');
  const [foodCals, setFoodCals] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [proteinGrams, setProteinGrams] = useState('');

  const handleAddFood = () => {
    if (!foodName.trim() || !foodCals || Number(foodCals) <= 0) return;
    dispatch({
      type: 'ADD_FOOD',
      payload: {
        id: Date.now(),
        name: foodName.trim(),
        cals: Number(foodCals),
        mealType,
        proteinGrams: proteinGrams ? Number(proteinGrams) : undefined,
      }
    });
    setFoodName('');
    setFoodCals('');
    setProteinGrams('');
  };

  const handleDeleteFood = (id: number) => {
    dispatch({ type: 'DELETE_FOOD', payload: id });
  };

  const burned = Math.round(state.stepCount * 0.04);
  const remaining = Math.max(0, state.targetCalories - state.calories + burned);
  const maintenanceDelta = state.calories - state.targetCalories;
  const avgMealCals = state.foodLog.length > 0 ? Math.round(state.calories / state.foodLog.length) : 0;
  const proteinLogged = state.foodLog.reduce((sum, item) => sum + (item.proteinGrams || 0), 0);
  const proteinTarget = state.profile ? Math.round(state.profile.weight * 1.6) : 120;
  const mealSlotTarget = Math.round(state.targetCalories / 4);
  const mealCount = state.foodLog.length;
  const proteinDensity = state.calories > 0 ? Number(((proteinLogged / state.calories) * 100).toFixed(2)) : 0;

  const slotStats = useMemo(() => {
    return mealSlots.map((slot) => {
      const entries = state.foodLog.filter((item) => (item.mealType || 'snack') === slot);
      const calories = entries.reduce((sum, item) => sum + item.cals, 0);
      const protein = entries.reduce((sum, item) => sum + (item.proteinGrams || 0), 0);
      const slotTarget = slot === 'snack' ? Math.round(state.targetCalories * 0.12) : mealSlotTarget;
      return {
        slot,
        entries,
        calories,
        protein,
        slotTarget,
        percent: Math.min(100, Math.round((calories / Math.max(1, slotTarget)) * 100)),
      };
    });
  }, [mealSlotTarget, state.foodLog, state.targetCalories]);

  const largestMeal = useMemo(() => {
    return state.foodLog.reduce((largest, item) => item.cals > (largest?.cals || 0) ? item : largest, state.foodLog[0]);
  }, [state.foodLog]);

  const fuelingCue = proteinLogged < proteinTarget * 0.6
    ? 'Protein is behind pace. Anchor the next meal around 30-40 g.'
    : maintenanceDelta < -250
      ? 'You are running light versus target. Add a performance meal or dense snack if training later.'
      : maintenanceDelta > 250
        ? 'You are above target pace. Keep the next meal lighter and protein-first.'
        : 'Fueling is well paced. Hold steady and keep meals evenly distributed.';

  const aiMealPlan = () => {
    const meals = state.profile?.goal === 'gain'
      ? [
          { name: 'Eggs, oats, banana', cals: 650, mealType: 'breakfast' as const, proteinGrams: 32 },
          { name: 'Chicken rice bowl', cals: 720, mealType: 'lunch' as const, proteinGrams: 45 },
          { name: 'Greek yogurt + granola', cals: 360, mealType: 'snack' as const, proteinGrams: 20 },
          { name: 'Salmon, potatoes, greens', cals: 760, mealType: 'dinner' as const, proteinGrams: 48 },
        ]
      : [
          { name: 'Protein oats with berries', cals: 410, mealType: 'breakfast' as const, proteinGrams: 28 },
          { name: 'Lean chicken salad wrap', cals: 460, mealType: 'lunch' as const, proteinGrams: 38 },
          { name: 'Skyr + apple', cals: 220, mealType: 'snack' as const, proteinGrams: 18 },
          { name: 'White fish + quinoa + veg', cals: 520, mealType: 'dinner' as const, proteinGrams: 40 },
        ];

    meals.forEach(meal => {
      dispatch({
        type: 'ADD_FOOD',
        payload: {
          id: Date.now() + Math.random(),
          name: meal.name,
          cals: meal.cals,
          mealType: meal.mealType,
          proteinGrams: meal.proteinGrams,
        }
      });
    });
  };

  const handleActions = (event: React.MouseEvent<HTMLElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === 'add-food') handleAddFood();
    if (action === 'meal-plan') aiMealPlan();
    if (action === 'delete-food') handleDeleteFood(toNumber(trigger.dataset.id));
  };

  return (
    <div className="max-w-4xl mx-auto" onClick={handleActions}>
      <h2 className="text-2xl font-bold mb-2">Nutrition Control Center</h2>
      <p className="season-description mb-6">Meal timing, protein pacing, and calorie distribution set up like a focused nutrition app.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Consumed</p>
          <p className="text-2xl font-bold">{state.calories} kcal</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Remaining</p>
          <p className="text-2xl font-bold">{remaining} kcal</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Protein</p>
          <p className="text-2xl font-bold">{proteinLogged} / {proteinTarget} g</p>
        </div>
        <div className="nature-card p-4 rounded-lg border">
          <p className="season-description text-xs">Avg Meal</p>
          <p className="text-2xl font-bold">{avgMealCals} kcal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Meal Count</p>
          <p className="text-2xl font-bold mt-1">{mealCount}</p>
          <p className="text-sm mt-2">Target cadence: 3 meals + 1 intentional snack.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Protein Density</p>
          <p className="text-2xl font-bold mt-1">{proteinDensity} g / 100 kcal</p>
          <p className="text-sm mt-2">Useful for keeping cuts and recomp phases productive.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Largest Meal</p>
          <p className="text-xl font-bold mt-1">{largestMeal ? largestMeal.name : 'No entries yet'}</p>
          <p className="text-sm mt-2">{largestMeal ? `${largestMeal.cals} kcal${largestMeal.proteinGrams ? ` • ${largestMeal.proteinGrams} g protein` : ''}` : 'Log a meal to build your nutrition pattern.'}</p>
        </div>
      </div>

      <div className="nature-card p-6 rounded-lg border mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold">Meal Slot Board</h3>
            <p className="season-description text-sm">Each slot has its own calorie lane so intake does not bunch up late in the day.</p>
          </div>
          <div className="season-btn text-sm">Target per main meal: {mealSlotTarget} kcal</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slotStats.map((slot) => (
            <div key={slot.slot} className="nature-card p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-semibold capitalize">{slot.slot}</h4>
                <span className="season-description text-xs">{slot.entries.length} entries</span>
              </div>
              <p className="text-lg font-bold">{slot.calories} / {slot.slotTarget} kcal</p>
              <p className="text-sm mt-1">Protein: {slot.protein} g</p>
              <div className="w-full bg-slate-700 rounded-full h-3 mt-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: `${slot.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="nature-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-1">📝 Log Meal Entry</h3>
          <p className="season-description text-sm mb-4">Track what you ate to build your daily nutrition pattern.</p>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">What did you eat?</label>
            <input
              type="text"
              placeholder="e.g. Grilled chicken, rice, and broccoli"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full p-3 mb-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs season-description">💡 Be specific for better tracking (not just "food" or "meal")</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Which meal slot?</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as typeof mealType)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="breakfast">🌅 Breakfast (morning)</option>
              <option value="lunch">☀️ Lunch (midday)</option>
              <option value="dinner">🌙 Dinner (evening)</option>
              <option value="snack">🥜 Snack (between meals)</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Calories estimate</label>
            <input
              type="number"
              placeholder="e.g. 450 kcal"
              value={foodCals}
              onChange={(e) => setFoodCals(e.target.value)}
              className="w-full p-3 mb-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs season-description">💡 Rough estimate works. Check food labels or use a nutrition app as reference.</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Protein (optional, but recommended)</label>
            <input
              type="number"
              placeholder="e.g. 35 grams"
              value={proteinGrams}
              onChange={(e) => setProteinGrams(e.target.value)}
              className="w-full p-3 mb-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs season-description">💡 Helps track protein density. ~30-40g per main meal is solid.</p>
          </div>
          <button
            data-action="add-food"
            className="w-full nature-button text-white font-semibold py-3 rounded-lg transition-colors hover:opacity-80"
          >
            ✓ Log Meal
          </button>
        </div>

        <div className="nature-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-1">🧠 Your Nutrition Plan</h3>
          <p className="season-description text-sm mb-4">Goal-aligned targets and real-time fueling guidance.</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-700 p-3 rounded-lg">
              <p className="text-xs season-description">Daily Target</p>
              <p className="text-xl font-bold">{state.targetCalories} kcal</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <p className="text-xs season-description">Activity Offset</p>
              <p className="text-xl font-bold">+{burned} kcal</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <p className="text-xs season-description">Per Main Meal</p>
              <p className="text-xl font-bold">{mealSlotTarget} kcal</p>
            </div>
            <div className={`p-3 rounded-lg ${maintenanceDelta >= 0 ? 'bg-red-900' : 'bg-green-900'}`}>
              <p className="text-xs season-description">vs. Target</p>
              <p className="text-xl font-bold">{maintenanceDelta >= 0 ? `+${maintenanceDelta}` : maintenanceDelta} kcal</p>
            </div>
          </div>
          <div className="bg-slate-600 border-l-4 border-blue-400 p-4 rounded-lg mb-4">
            <p className="text-sm font-semibold">💡 Next fueling cue:</p>
            <p className="text-sm mt-1">{fuelingCue}</p>
          </div>
          <button
            data-action="meal-plan"
            className="w-full nature-button text-white font-semibold py-3 rounded-lg transition-colors hover:opacity-80"
          >
            🤖 Generate Daily Meal Plan
          </button>
        </div>
      </div>

      <div className="nature-card rounded-lg border overflow-hidden">
        <div className="responsive-table-shell">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-4 text-left">Meal</th>
                <th className="p-4 text-left">Item</th>
                <th className="p-4 text-left">Calories</th>
                <th className="p-4 text-left">Protein</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {state.foodLog.map(item => (
                <tr key={item.id} className="border-t border-slate-600">
                  <td className="p-4">{item.mealType || 'meal'}</td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.cals}</td>
                  <td className="p-4">{item.proteinGrams ? `${item.proteinGrams} g` : '-'}</td>
                  <td className="p-4">
                    <button
                      data-action="delete-food"
                      data-id={String(item.id)}
                      className="nature-button text-white px-3 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {state.foodLog.length === 0 && (
                <tr className="border-t border-slate-600">
                  <td className="p-4 season-description" colSpan={5}>No meals logged yet. Start with breakfast or use Smart Daily Meal Plan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
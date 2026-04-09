import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

type BodyStatsDraft = {
  weight: number;
  height: number;
  waist: number;
  fat: number;
};

const BodyStats: React.FC = () => {
  const { state } = useApp();
  const profileDraft: BodyStatsDraft = {
    weight: state.profile?.weight || 0,
    height: state.profile?.height || 0,
    waist: 0,
    fat: 0,
  };
  const [draft, setDraft] = useState<BodyStatsDraft | null>(null);
  const { weight, height, waist, fat } = draft ?? profileDraft;

  const bmi = weight && height ? weight / ((height / 100) ** 2) : 0;
  const status = !bmi
    ? ''
    : bmi < 18.5
      ? 'Underweight'
      : bmi < 25
        ? 'Normal'
        : bmi < 30
          ? 'Overweight'
          : 'Obese';
  const whtR = waist > 0 && height > 0 ? waist / height : 0;
  const leanMass = fat > 0 && fat < 70 ? weight * (1 - fat / 100) : 0;
  const fatMass = leanMass > 0 ? Math.max(0, weight - leanMass) : 0;
  const healthyWeightLow = height > 0 ? Number((18.5 * ((height / 100) ** 2)).toFixed(1)) : 0;
  const healthyWeightHigh = height > 0 ? Number((24.9 * ((height / 100) ** 2)).toFixed(1)) : 0;
  const waistRiskLimit = height > 0 ? Math.round(height * 0.5) : 0;

  const updateDraft = (key: keyof BodyStatsDraft, value: number) => {
    setDraft((prev) => ({ ...(prev ?? profileDraft), [key]: value }));
  };

  const statusColors = {
    Underweight: 'text-blue-400',
    Normal: 'text-green-400',
    Overweight: 'text-yellow-400',
    Obese: 'text-red-400'
  };

  const whtRStatus = whtR > 0 ? (whtR < 0.5 ? 'Low-to-moderate risk' : 'Elevated central-fat risk') : 'Add waist to compute';
  const analysis = `BMI ${bmi.toFixed(1)} (${status}). WHtR ${whtR > 0 ? whtR.toFixed(2) : '-'} (${whtRStatus}). Keep resistance training and protein intake consistent for healthier body composition.`;
  const compositionCue = fat > 0
    ? fat <= 18
      ? 'Body-fat estimate is relatively lean. Prioritize performance and recovery so you do not out-diet your training.'
      : fat <= 25
        ? 'You are in a workable recomposition zone. Strength training consistency will matter more than scale noise.'
        : 'Cutting progress is likely to show better through waist and lean-mass protection than scale weight alone.'
    : 'Add body-fat percentage if you want a more specific composition read.';

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Body Composition Studio</h2>
      <p className="season-description mb-6">Track physique metrics, central-fat risk, and composition targets like a dedicated body analysis app.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="nature-card p-4 rounded-lg border"><p className="season-description text-xs">BMI</p><p className="text-2xl font-bold">{bmi.toFixed(1)}</p></div>
        <div className="nature-card p-4 rounded-lg border"><p className="season-description text-xs">Status</p><p className="text-2xl font-bold">{status || '-'}</p></div>
        <div className="nature-card p-4 rounded-lg border"><p className="season-description text-xs">WHtR</p><p className="text-2xl font-bold">{whtR > 0 ? whtR.toFixed(2) : '-'}</p></div>
        <div className="nature-card p-4 rounded-lg border"><p className="season-description text-xs">Lean Mass</p><p className="text-2xl font-bold">{leanMass > 0 ? `${leanMass.toFixed(1)} kg` : '-'}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Fat Mass</p>
          <p className="text-2xl font-bold mt-1">{fatMass > 0 ? `${fatMass.toFixed(1)} kg` : '-'}</p>
          <p className="text-sm mt-2">Estimated from your current body-fat input.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Healthy BMI Range</p>
          <p className="text-2xl font-bold mt-1">{healthyWeightLow > 0 ? `${healthyWeightLow}-${healthyWeightHigh} kg` : '-'}</p>
          <p className="text-sm mt-2">Reference range based on current height.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Waist Risk Limit</p>
          <p className="text-2xl font-bold mt-1">{waistRiskLimit > 0 ? `${waistRiskLimit} cm` : '-'}</p>
          <p className="text-sm mt-2">Below this usually keeps WHtR under 0.50.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="nature-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-1">📏 Update Composition Stats</h3>
          <p className="season-description text-sm mb-4">Your latest physique measurements for accurate composition analysis.</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">⚖️ Weight (kg)</label>
            <input
              type="number"
              placeholder="e.g. 75.5"
              value={weight}
              onChange={(e) => updateDraft('weight', Number(e.target.value))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs season-description mt-1">💡 Weigh yourself at the same time daily for consistency (usually morning)</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">📐 Height (cm)</label>
            <input
              type="number"
              placeholder="e.g. 180"
              value={height}
              onChange={(e) => updateDraft('height', Number(e.target.value))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs season-description mt-1">💡 Measure without shoes, stand against flat surface</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">📏 Waist Circumference (cm)</label>
            <input
              type="number"
              placeholder="e.g. 85"
              value={waist}
              onChange={(e) => updateDraft('waist', Number(e.target.value))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs season-description mt-1">💡 Measure at navel level, helps track central fat distribution</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">💪 Body Fat % (optional)</label>
            <input
              type="number"
              placeholder="e.g. 18"
              value={fat}
              onChange={(e) => updateDraft('fat', Number(e.target.value))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs season-description mt-1">💡 Optional but helpful. Get this from DEXA scan, bioimpedance, or caliper estimate</p>
          </div>
        </div>

        <div className="nature-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-1">📊 Body Risk Indicators</h3>
          <p className="season-description text-sm mb-4">Key metrics that reveal health patterns in your composition.</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-700 p-3 rounded-lg">
              <p className="text-xs season-description">BMI</p>
              <p className="text-2xl font-bold mt-1"><span className={statusColors[status as keyof typeof statusColors]}>{bmi.toFixed(1)}</span></p>
            </div>
            <div className={`p-3 rounded-lg ${status === 'Normal' ? 'bg-green-900' : status === 'Underweight' ? 'bg-blue-900' : status === 'Overweight' ? 'bg-yellow-900' : 'bg-red-900'}`}>
              <p className="text-xs season-description">Status</p>
              <p className="text-lg font-bold mt-1"><span className={statusColors[status as keyof typeof statusColors]}>{status}</span></p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <p className="text-xs season-description">Waist-to-Height Ratio</p>
              <p className="text-2xl font-bold mt-1">{whtR > 0 ? whtR.toFixed(2) : '-'}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <p className="text-xs season-description">Lean Mass</p>
              <p className="text-lg font-bold mt-1">{leanMass > 0 ? `${leanMass.toFixed(1)}kg` : '-'}</p>
            </div>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${
                status === 'Underweight' ? 'bg-blue-500' :
                status === 'Normal' ? 'bg-green-500' :
                status === 'Overweight' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }}
            ></div>
          </div>

          <div className="bg-slate-600 border-l-4 border-blue-400 p-3 rounded-lg mb-3">
            <p className="text-sm"><strong>📋 Analysis:</strong> {analysis}</p>
          </div>
          <div className="bg-slate-600 border-l-4 border-green-400 p-3 rounded-lg">
            <p className="text-sm"><strong>💡 Next action:</strong> {compositionCue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyStats;
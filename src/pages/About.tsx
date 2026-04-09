import React from 'react';
import { useApp } from '../context/AppContext';
import { xpToLevel } from '../modules/utils';

const About: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">About All Life Nature Edition</h2>

      <section className="nature-card p-6 rounded-lg border mb-6">
        <p>
          All Life Nature Edition is a personal wellness system designed to feel like an evolving seasonal landscape.
          Your daily actions in nutrition, hydration, movement, sleep, and mood tracking build momentum while keeping
          the interface calm and restorative.
        </p>
      </section>

      <section className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-3">XP, Tasks, and Seasonal Flow</h3>
        <p>
          Completing tasks and logging healthy habits increases your XP. XP reflects consistency over time and maps to a
          simple progression level.
        </p>
        <p className="mt-2">
          Current XP: <strong>{state.xp}</strong> | Current Level: <strong>{xpToLevel(state.xp)}</strong>
        </p>
        <p className="mt-2">
          Seasonal mode changes the visual atmosphere and ambient profile. Choose Spring, Summer, Autumn, or Winter to
          shift your environment based on how you want to feel and focus.
        </p>
      </section>

      <section className="nature-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-3">Sound and Visual Immersion</h3>
        <p>
          Optional ambient audio can be toggled on and off. When season changes, sound layers fade out and in smoothly
          to avoid abrupt transitions. Background imagery and color palettes update to keep the app grounded in natural
          tones and seasonal identity.
        </p>
      </section>

      <section className="nature-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">How to Interact</h3>
        <p>
          Use the sidebar to navigate pages and select a season. Add tasks, mark completions, log meals, hydration,
          workouts, sleep, and mood entries. Buttons and controls are wired through a modular data-action event system
          for consistent interaction behavior across the app.
        </p>
      </section>
    </div>
  );
};

export default About;

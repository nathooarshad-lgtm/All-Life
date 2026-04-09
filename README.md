# All Life Nature Edition

All Life Nature Edition is a personal wellness tracker with a seasonal nature atmosphere. It combines profile personalization, nutrition, hydration, movement, sleep, mood, task tracking, and progression XP in one modular React + TypeScript app.

## Core Features

- Seasonal visual modes: Spring, Summer, Autumn, Winter
- Optional ambient seasonal audio with smooth fade transitions
- XP progression tied to consistent healthy actions
- Task and quest logging with generated nature-based routines
- Nutrition, hydration, fitness, body stats, sleep, and mood tracking
- Nature Coach for contextual guidance based on logged data
- About page describing interactions, systems, and immersion model

## Event System

Buttons and seasonal controls use delegated `data-action` handlers within each page shell or layout shell instead of ad hoc per-button click wiring. This keeps interaction behavior modular and easier to maintain.

## Module Structure

- `src/modules/state.ts` - state-derived summaries and rates
- `src/modules/ui.ts` - seasonal themes and hero imagery
- `src/modules/tasks.ts` - generated nature task templates
- `src/modules/ai.ts` - coach response logic
- `src/modules/user.ts` - user profile helper copy
- `src/modules/utils.ts` - season detection and utility helpers
- `src/utils/seasonAudio.ts` - ambient WebAudio layers and fade logic

## Real AI Workout Generation

The Coach page supports real AI generation using either OpenAI (ChatGPT) or Anthropic (Claude).

Create a `.env` file in the project root with one of these options:

```bash
VITE_OPENAI_API_KEY=your_openai_key
VITE_OPENAI_MODEL=gpt-4.1-mini
```

or

```bash
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

Then restart dev server with `npm run dev`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

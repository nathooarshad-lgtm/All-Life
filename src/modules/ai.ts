import type { AppState } from '../context/AppContext';

export type AIProvider = 'openai' | 'anthropic';

type GenerateWorkoutPlanParams = {
  state: AppState;
  provider: AIProvider;
  userRequest?: string;
};

type GenerateCoachReplyParams = {
  input: string;
  state: AppState;
  provider: AIProvider;
};

type ProviderErrorPayload = {
  error?: {
    message?: string;
  };
};

type OpenAIResponseContent = {
  text?: string;
};

type OpenAIResponseOutput = {
  content?: OpenAIResponseContent[];
};

type OpenAIResponsePayload = ProviderErrorPayload & {
  output_text?: string;
  output?: OpenAIResponseOutput[];
};

type AnthropicResponseContent = {
  text?: string;
};

type AnthropicResponsePayload = ProviderErrorPayload & {
  content?: AnthropicResponseContent[];
};

function profileContext(state: AppState): string {
  const profile = state.profile;
  if (!profile) {
    return 'Profile not completed yet. Use safe beginner defaults.';
  }

  return [
    `Name: ${profile.name}`,
    `Age: ${profile.age}`,
    `Sex: ${profile.sex}`,
    `Weight: ${profile.weight} kg`,
    `Height: ${profile.height} cm`,
    `Activity multiplier: ${profile.activity}`,
    `Primary wellness goal: ${profile.goal}`,
    `Physical exercise goal: ${profile.physicalExerciseGoal}`,
    `Dietary constraints: ${profile.diet || 'none provided'}`,
    `Water goal: ${profile.waterGoal} mL`,
    `Sleep goal: ${profile.sleepGoal} hours`,
    `Occupation: ${profile.occupation || 'not provided'}`,
    `Recent workouts logged: ${state.workouts.length}`,
  ].join('\n');
}

function extractOpenAIText(payload: OpenAIResponsePayload): string {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const chunks = payload.output?.flatMap((entry) => entry.content || []) || [];
  const text = chunks
    .map((item) => item.text)
    .filter((v: unknown) => typeof v === 'string')
    .join('\n')
    .trim();
  return text;
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) || 'gpt-4.1-mini';

  if (!apiKey) {
    throw new Error('Missing OpenAI key. Set VITE_OPENAI_API_KEY in your environment.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userPrompt }],
        },
      ],
    }),
  });

  const payload: OpenAIResponsePayload = await response.json();
  if (!response.ok) {
    const msg = payload?.error?.message || 'OpenAI request failed.';
    throw new Error(msg);
  }

  const text = extractOpenAIText(payload);
  if (!text) throw new Error('OpenAI returned an empty response.');
  return text;
}

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  const model = (import.meta.env.VITE_ANTHROPIC_MODEL as string | undefined) || 'claude-3-5-sonnet-latest';

  if (!apiKey) {
    throw new Error('Missing Anthropic key. Set VITE_ANTHROPIC_API_KEY in your environment.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  const payload: AnthropicResponsePayload = await response.json();
  if (!response.ok) {
    const msg = payload?.error?.message || 'Anthropic request failed.';
    throw new Error(msg);
  }

  const text = (payload?.content || [])
    .map((item) => item.text)
    .filter((v: unknown) => typeof v === 'string')
    .join('\n')
    .trim();

  if (!text) throw new Error('Anthropic returned an empty response.');
  return text;
}

async function callProvider(provider: AIProvider, systemPrompt: string, userPrompt: string): Promise<string> {
  if (provider === 'anthropic') {
    return callAnthropic(systemPrompt, userPrompt);
  }
  return callOpenAI(systemPrompt, userPrompt);
}

export async function generateWorkoutPlan({ state, provider, userRequest }: GenerateWorkoutPlanParams): Promise<string> {
  const systemPrompt = `You are an evidence-informed strength and conditioning coach.
Create practical routines that are safe, progressive, and realistic for non-athletes.
Do not provide medical diagnosis. If risk signs exist, recommend clinician clearance.
Avoid unsafe advice, dehydration practices, and starvation guidance.`;

  const userPrompt = `Create a detailed 30-day workout routine similar to popular challenge apps, but healthier and sustainable.

Profile context:
${profileContext(state)}

Additional request:
${userRequest?.trim() || 'Focus this plan on the stated physical exercise goal.'}

Required output format:
1) A short readiness check (equipment, injuries, available days/time).
2) Weekly structure (Week 1-4 focus and progression).
3) Day-by-day plan for next 7 days (warm-up, main sets/reps/time, rest, cool-down).
4) Progression rules for days 8-30.
5) Form and recovery tips (sleep, hydration, deload signs).
6) Two variants: home/no-equipment and gym-access.
7) Keep language concrete and specific, not generic.`;

  return callProvider(provider, systemPrompt, userPrompt);
}

export async function generateCoachReply({ input, state, provider }: GenerateCoachReplyParams): Promise<string> {
  const systemPrompt = `You are a supportive wellness coach. Be practical, concise, and specific.
Use the user's profile and logs. Prefer actionable next steps over vague advice.
When exercise planning is requested, provide structured routines and progression.`;

  const userPrompt = `User profile and tracker context:\n${profileContext(state)}\n\nUser message: ${input}`;
  return callProvider(provider, systemPrompt, userPrompt);
}

export function coachReply(input: string, state: AppState): string {
  const query = input.toLowerCase();
  if (query.includes('water') || query.includes('hydrate')) {
    return `You have logged ${state.hydrationMl} mL so far. Pace your intake across the day to reach ${state.profile?.waterGoal || 2000} mL.`;
  }
  if (query.includes('calorie') || query.includes('food')) {
    return `You are at ${state.calories} kcal out of ${state.targetCalories}. Keep meals balanced with protein, fiber, and seasonal produce.`;
  }
  if (query.includes('sleep')) {
    const lastSleep = state.sleepHistory[0]?.hours;
    return `Your latest sleep log is ${lastSleep ?? 'not available'} hours. Keep a consistent bedtime to stabilize energy.`;
  }
  if (query.includes('task') || query.includes('xp')) {
    return `Focus on one high-value task first. Completed tasks increase your XP and help sustain momentum.`;
  }
  return 'Track one small win in nutrition, movement, and recovery today. Consistency compounds.';
}

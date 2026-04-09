import type { Profile } from '../context/AppContext';

export function profileHeadline(profile: Profile | null): string {
  if (!profile) return 'Create your profile to personalize your daily ecosystem.';
  return `${profile.name}, your focus is ${profile.goal} with an exercise target of ${profile.physicalExerciseGoal}. Daily water target: ${profile.waterGoal} mL. Sleep target: ${profile.sleepGoal} hours.`;
}

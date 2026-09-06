export interface DailyThought {
  quote: string;
  reflection: string;
}

export const DAILY_THOUGHTS: DailyThought[] = [
  {
    quote: "Small steps still move you forward.",
    reflection: "Take today at your own pace.",
  },
  {
    quote: "Give yourself permission to take things one moment at a time.",
    reflection: "Quiet progress is still progress.",
  },
  {
    quote: "You don't have to understand everything today.",
    reflection: "Clarity often arrives when the mind rests.",
  },
  {
    quote: "In the quiet of your thoughts, there is room to breathe.",
    reflection: "Listen gently to what you need.",
  },
  {
    quote: "Notice the softness in this day, even in busy hours.",
    reflection: "Peace is found in small, conscious pauses.",
  },
  {
    quote: "Every word written is a gentle kindness to your future self.",
    reflection: "Your inner journey is worth remembering.",
  },
  {
    quote: "You are allowed to begin again as many times as you need.",
    reflection: "There is no rush to become whole.",
  },
  {
    quote: "The quietest moments often hold the deepest truths.",
    reflection: "Trust the stillness within you.",
  },
  {
    quote: "Grant yourself the grace you so freely extend to others.",
    reflection: "Be gentle with your thoughts tonight.",
  },
  {
    quote: "Not every thought needs to be resolved before night falls.",
    reflection: "Some answers unfold gently in time.",
  },
  {
    quote: "Hold space for what felt heavy, and room for what brought light.",
    reflection: "Both belong to the path you are walking.",
  },
  {
    quote: "Rest is not a reward you earn; it is a space you honor.",
    reflection: "Allow your mind to unwind and be still.",
  },
  {
    quote: "A single mindful breath can return you to the present.",
    reflection: "Root yourself in this quiet moment.",
  },
  {
    quote: "Your feelings are messengers, not permanent residents.",
    reflection: "Witness them without judgment.",
  },
  {
    quote: "Gratitude turns what we already have into enough.",
    reflection: "Cherish one small blessing from today.",
  },
  {
    quote: "You carry a quiet resilience that has seen you through so much.",
    reflection: "Remember how far you have already walked.",
  },
  {
    quote: "Release the need to know the entire staircase.",
    reflection: "Trust the step directly in front of you.",
  },
  {
    quote: "Stillness is not the absence of life, but the presence of peace.",
    reflection: "Allow yourself to simply be.",
  },
  {
    quote: "Speak to yourself with the tenderness you would offer a dear friend.",
    reflection: "Your thoughts shape your sanctuary.",
  },
  {
    quote: "Even the darkest night eventually yields to dawn.",
    reflection: "Rest well, knowing tomorrow holds new light.",
  },
  {
    quote: "Honoring your boundaries is an act of deep self-respect.",
    reflection: "Protect the quiet spaces of your soul.",
  },
  {
    quote: "You do not have to carry everything all at once.",
    reflection: "Put down what does not serve this hour.",
  },
];

/**
 * Deterministically returns the thought of the day based on the current calendar date (YYYY-MM-DD).
 * The thought stays constant all day and updates on the next calendar day.
 */
export function getThoughtOfTheDay(date: Date = new Date()): DailyThought {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Simple day-of-year calculation
  const startOfYear = new Date(year, 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const index = Math.abs((year * 365 + dayOfYear + month * 31 + day)) % DAILY_THOUGHTS.length;
  return DAILY_THOUGHTS[index];
}

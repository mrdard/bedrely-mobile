/**
 * Motivational Messages for Workout Completion
 *
 * Randomly displayed when a workout is completed
 */

export const MOTIVATIONAL_MESSAGES = [
  // Classic praise
  "Amazing work! 💪",
  "You crushed it!",
  "Incredible effort!",
  "Outstanding performance!",
  "You're unstoppable!",

  // Strength & power
  "Beast mode activated! 🔥",
  "Absolutely crushing it!",
  "You're a machine!",
  "Pure strength!",
  "Warrior mentality! ⚔️",

  // Better than alternatives
  "Better here than the couch!",
  "Better sweating than regretting!",
  "Better sore than sorry!",
  "Better tired than wired!",
  "Better moving than sitting!",

  // Progress & growth
  "One step closer to greatness!",
  "Progress over perfection!",
  "Stronger than yesterday!",
  "You're evolving!",
  "Growth mindset! 🌱",

  // Inspirational
  "You are amazing!",
  "You're an inspiration!",
  "Legendary performance!",
  "You're writing your story!",
  "Creating your best self!",

  // Motivational
  "No pain, no gain! 💯",
  "Earned it!",
  "Sweat is success!",
  "You did the work!",
  "Results incoming!",

  // Empowering
  "Own your power!",
  "You're built different!",
  "Limits are illusions!",
  "Unstoppable energy!",
  "Champion mentality! 👑",

  // Celebration
  "Workout complete! 🎉",
  "Mission accomplished!",
  "Victory is yours!",
  "You earned this!",
  "Celebration mode!",

  // Determination
  "Dedication pays off!",
  "Consistency is key!",
  "You showed up!",
  "Commitment wins!",
  "Discipline equals freedom!",

  // Fun & energetic
  "Fitness ninja! 🥷",
  "You're on fire! 🔥",
  "Boom! Nailed it!",
  "Superhero status! 🦸",
  "Level up! ⬆️",
];

/**
 * Get a random motivational message
 */
export function getRandomMessage(): string {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
  return MOTIVATIONAL_MESSAGES[randomIndex];
}

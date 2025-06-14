
export const mentalHealthQuotes = [
  "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
  "It's okay to not be okay. It's not okay to stay that way.",
  "You are stronger than you think and more resilient than you know.",
  "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
  "Self-compassion is simply giving the same kindness to ourselves that we would give to others.",
  "Progress, not perfection. Every small step counts.",
  "Your current situation is not your final destination. The best is yet to come.",
  "Healing doesn't mean the damage never existed. It means the damage no longer controls your life.",
  "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.",
  "Take time to make your soul happy."
];

export const mentalHealthFacts = [
  "Taking just 5 minutes to practice deep breathing can reduce stress and anxiety levels.",
  "Regular exercise can be as effective as medication for treating mild to moderate depression.",
  "Spending time in nature for just 20 minutes can significantly lower stress hormone levels.",
  "Writing down three things you're grateful for each day can improve overall mental well-being.",
  "Getting 7-9 hours of quality sleep is crucial for maintaining good mental health.",
  "Social connections are vital - people with strong relationships are 50% more likely to live longer.",
  "Mindfulness meditation can physically change brain structure, improving focus and emotional regulation.",
  "Laughing releases endorphins, which are natural mood boosters and pain relievers.",
  "Acts of kindness, even small ones, can boost both your mood and the recipient's mood.",
  "Mental health disorders are treatable, and most people who get treatment experience significant improvement."
];

export const getRandomQuote = () => {
  return mentalHealthQuotes[Math.floor(Math.random() * mentalHealthQuotes.length)];
};

export const getRandomFact = () => {
  return mentalHealthFacts[Math.floor(Math.random() * mentalHealthFacts.length)];
};

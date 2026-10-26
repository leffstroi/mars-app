import { knowledgeBase } from './knowledge';

export async function generateAnswer(query: string): Promise<string> {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

  const lower = query.toLowerCase();
  const relevant = knowledgeBase.filter((k) =>
    k.topic.split(' ').some((w) => lower.includes(w)) || lower.includes(k.topic.slice(0, 8))
  );

  let base = relevant.length
    ? relevant.map((k) => `• ${k.content}`).join('\n\n')
    : 'Based on 2025–2026 data: AI is already compressing entry-level and routine cognitive work. Focus on skills that amplify AI (judgment, framing, relationships) rather than competing with it.';

  // Simulated web-informed additions
  const webBits = [
    'Surveys (Pew, Elon) show majority expect net job loss and reduced meaning in work.',
    'WEF: ~44% of core skills disrupted within 5 years; proactive reskillers see earnings growth.',
    'Practical pattern: ship small public proofs of judgment before mass-applying.',
  ];

  return `**Answer for: "${query}"**\n\n${base}\n\n**Context from current signals:**\n${webBits[Math.floor(Math.random() * webBits.length)]}\n\n**Next concrete step:** Pick one skill gap, run a 2-week experiment (build or write something public), then reassess. Premium unlocks a full personalized 90-day map.`;
}

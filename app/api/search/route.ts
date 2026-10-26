import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: 'Empty query' }, { status: 400 });

    // 1. Search
    let context = '';
    if (TAVILY_API_KEY) {
      const tavilyRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          search_depth: 'advanced',
          max_results: 8,
          include_answer: true,
        }),
      });
      const data = await tavilyRes.json();
      context = data.answer || '';
      if (data.results?.length) {
        context += '\n\n' + data.results
          .map((r: any) => `${r.title}: ${r.content?.slice(0, 400) || ''}`)
          .join('\n---\n');
      }
    }

    // 2. Past memory
    let memory = '';
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await supabase
        .from('queries')
        .select('query, answer')
        .order('created_at', { ascending: false })
        .limit(3);
      if (data?.length) {
        memory = data.map((d: any) => `Q: ${d.query}\nA: ${d.answer?.slice(0, 150)}`).join('\n');
      }
    }

    // 3. Force clean synthesis
    let finalAnswer = '';
    if (GROQ_API_KEY && context) {
      const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You answer career and skill questions clearly and directly.
Rules:
- Give ONE clear, concrete answer first.
- Then 2-4 short actionable points.
- No source dumps, no raw website text, no lists of titles.
- Be specific and practical.
- Respond in the same language as the user's question.`,
            },
            {
              role: 'user',
              content: `Question: ${query}\n\nSearch context:\n${context.slice(0, 4000)}\n\nPast answers (improve on them if relevant):\n${memory}\n\nWrite a clear final answer. No sources section.`,
            },
          ],
          temperature: 0.2,
          max_tokens: 600,
        }),
      });
      const llmData = await llmRes.json();
      finalAnswer = llmData.choices?.[0]?.message?.content || '';
    }

    if (!finalAnswer) finalAnswer = 'Could not generate a clear answer. Try again.';

    // 4. Save
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('queries').insert({ query, answer: finalAnswer });
    }

    return NextResponse.json({ answer: finalAnswer });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: 'Empty query' }, { status: 400 });

    // 1. Real web search via Tavily (hundreds of sources internally)
    let searchResults = '';
    if (TAVILY_API_KEY) {
      const tavilyRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          search_depth: 'advanced',
          max_results: 10,
          include_answer: true,
          include_raw_content: false,
        }),
      });
      const tavilyData = await tavilyRes.json();
      searchResults = tavilyData.answer || '';
      if (tavilyData.results) {
        searchResults += '\n\nSources:\n' + tavilyData.results
          .slice(0, 8)
          .map((r: any) => `- ${r.title}: ${r.content?.slice(0, 300)}...`)
          .join('\n');
      }
    }

    // 2. Retrieve past similar answers from Supabase (memory / learning)
    let pastContext = '';
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await supabase
        .from('queries')
        .select('query, answer')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data?.length) {
        pastContext = '\n\nPast relevant answers (learn from these):\n' +
          data.map((d: any) => `Q: ${d.query}\nA: ${d.answer?.slice(0, 200)}...`).join('\n---\n');
      }
    }

    // 3. Synthesize clear answer with LLM
    let finalAnswer = searchResults || 'No search results.';
    if (OPENAI_API_KEY && searchResults) {
      const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You give clear, precise, actionable answers about AI career pivots and skill resilience in 2025-2026. Use the search results. Be concrete. No fluff. If past answers exist, improve on them.',
            },
            {
              role: 'user',
              content: `Question: ${query}\n\nWeb search results:\n${searchResults}${pastContext}\n\nGive a clear, structured answer.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });
      const llmData = await llmRes.json();
      finalAnswer = llmData.choices?.[0]?.message?.content || searchResults;
    }

    // 4. Log to Supabase so it learns next time
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('queries').insert({ query, answer: finalAnswer });
    }

    return NextResponse.json({ answer: finalAnswer });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

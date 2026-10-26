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

    let context = '';
    if (TAVILY_API_KEY) {
      const tavilyRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          search_depth: 'advanced',
          max_results: 6,
          include_answer: true,
        }),
      });
      const data = await tavilyRes.json();
      context = (data.answer || '') + '\n' + (data.results || [])
        .map((r: any) => r.content?.slice(0, 300) || '')
        .join('\n');
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ answer: 'GROQ_API_KEY missing in Vercel env.' });
    }

    const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: 'Answer clearly and directly in the user\'s language. Give one concrete answer + 2-3 short points. No source lists.',
          },
          {
            role: 'user',
            content: `Question: ${query}\n\nContext:\n${context.slice(0, 3000)}\n\nClear answer:`,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    const llmData = await llmRes.json();

    if (!llmRes.ok) {
      return NextResponse.json({
        answer: `Groq error ${llmRes.status}: ${JSON.stringify(llmData).slice(0, 400)}`,
      });
    }

    const finalAnswer = llmData.choices?.[0]?.message?.content || 'Empty response from Groq';

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        await supabase.from('queries').insert({ query, answer: finalAnswer });
      } catch {}
    }

    return NextResponse.json({ answer: finalAnswer });
  } catch (e: any) {
    return NextResponse.json({ answer: `Server error: ${e.message}` });
  }
}

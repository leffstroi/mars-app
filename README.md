# MARS Pivot

AI career resilience site with **real web search** (Tavily) + memory (Supabase).

## Setup (phone-friendly)

### 1. Tavily (web search)
- Go to https://tavily.com → Sign up (no card)
- Copy API key

### 2. Groq (free LLM)
- Go to https://console.groq.com → API Keys → Create
- Copy key

### 3. Supabase (memory so it learns)
- https://supabase.com → New project
- SQL Editor → run:
```sql
create table queries (
  id uuid primary key default gen_random_uuid(),
  query text,
  answer text,
  created_at timestamptz default now()
);
```
- Settings → API → copy URL + service_role key

### 4. Vercel
- Import repo → Environment Variables:
  - TAVILY_API_KEY
  - GROQ_API_KEY (or OPENAI_API_KEY)
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
- Deploy

Every question is searched live, synthesized, and saved. Next similar questions use past answers as context.

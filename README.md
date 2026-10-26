# MARS Pivot

**AI-powered career resilience platform** for the acute 2025–2026 problem of AI-driven job displacement, skill disruption, and the search for meaningful, human-edge work.

People are actively searching for concrete answers: how to pivot, what skills still matter, how to use AI without being replaced by it, and how to rebuild purpose when roles evaporate.

MARS Pivot gives precise, actionable answers by combining a curated knowledge base of strategies + live-style web-informed reasoning (mockable to real search/LLM).

## Why this problem
- AI is already reducing entry-level and white-collar hiring; surveys show majority expect net job loss and loss of meaning in work (Pew, Elon University, WEF).
- Existing tools are either generic career coaches or enterprise reskilling platforms. Few deliver personalized, concrete transition paths + AI search for individuals in real time.
- Freemium model: free core help, premium for deep personalized roadmaps and saved plans.

## Features
- Creative orbital/cosmic UI with smooth animations
- AI Search: ask any question about career pivot, skills, AI impact → structured, practical answer
- Internal knowledge base of proven strategies (reskilling frameworks, human skills that amplify with AI, 90-day plans)
- Freemium hooks (premium for unlimited personalized plans, export, history)
- Responsive, production-ready structure (Next.js + Tailwind + Framer Motion)
- Ready for Vercel deploy + Supabase (auth, user plans, saved queries)

## Quick start
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Deploy
1. Push to GitHub (already done)
2. Import to Vercel → deploy
3. (Optional) Create Supabase project, add env vars for auth/db
4. For real AI: add OPENAI_API_KEY or similar and wire lib/ai.ts

## Structure
- `/app` — Next.js App Router
- `/components` — UI
- `/lib` — knowledge base + AI logic
- Monetization placeholders in UI

Built for real help, not templates.

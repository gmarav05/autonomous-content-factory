<p align="center">
  <img src="./public/favicon.ico" alt="Autonomous Content Factory" width="96" height="96" />
</p>

# Autonomous Content Factory

Autonomous Content Factory is a production-quality Next.js 15 application that turns raw product context into an auditable, interview-ready marketing campaign. A trio of AI agents—Research, Copywriter, and Editor-in-Chief—collaborate on a strict workflow powered by OpenRouter (DeepSeek Chat). The goal: demonstrate senior-level engineering discipline, prompt design, and UX polish in a compact portfolio project.

## Highlights
- **Fact-Check Research Agent** — parses pasted briefs, uploaded `.txt/.md` files, and optional reference URLs to create a strict fact sheet JSON/Markdown, flag ambiguous statements, and capture approved claims.
- **Creative Copywriter Agent** — consumes the fact sheet only, then produces a 500–550 word blog, 5-post social thread, and sub-120-word email teaser while keeping the core value proposition front and center.
- **Editor-in-Chief Agent** — audits length, tone, formatting, value proposition coverage, and hallucinations. Generates actionable correction notes and triggers regeneration until the campaign passes.
- **Live Dashboard Experience** — compact hero summary, three-card executive overview, tabbed blog/social/email outputs, streamlined agent timeline, regeneration recap, and export actions (copy campaign kit or download JSON).
- **Resilient Workflow Loop** — backend orchestrator handles retries, activity logging (thinking/processing/reviewing/approved), and structured API contracts with TypeScript safety.

## Tech Stack
- Next.js 15 App Router + React Server Components
- TypeScript with strict configuration & ESLint flat config
- Tailwind CSS + shadcn/ui primitives for dark, premium UI
- OpenRouter (DeepSeek Chat v3) via the OpenAI-compatible SDK
- React hooks + custom external store (no Redux/Zustand)
- Vercel-ready deployment

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```bash
   OPENAI_API_KEY=your_openrouter_key
   OPENAI_BASE_URL=https://openrouter.ai/api/v1
   MODEL=deepseek/deepseek-chat-v3
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) and launch the builder.

## Scripts
- `npm run dev` – start dev server
- `npm run lint` – run ESLint
- `npm run type-check` – run `tsc --noEmit`
- `npm run build` – production build
- `npm run start` – serve the production build

## Project Structure
```
app/                # Pages (landing, builder, results) + API routes
components/         # UI building blocks and dashboard views
agents/             # Research, Copywriter, Editor orchestrators
prompts/            # Prompt templates for each agent
lib/                # AI utilities, JSON parsing, activity helpers
hooks/              # use-campaign-store for cross-page snapshots
types/              # Shared TypeScript contracts
```

## Documentation
- [APPROACH_DOCUMENT.md](./APPROACH_DOCUMENT.md) – design rationale and trade-offs

## Deployment
- Target platform: Vercel. Set environment variables in the Vercel dashboard.
- Recommended: `npm run build` locally before shipping.

## Future Enhancements
- Stream activity updates for long-running agents via SSE.
- Persist campaign history locally and surface diffing between attempts.
- Add Playwright regression flows for the builder/results dashboard.
- Surface token usage and latency metrics per agent.

## License
MIT © 2026 Autonomous Content Factory

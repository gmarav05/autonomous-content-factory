# Autonomous Content Factory — Approach Document

## Goals & Constraints
- Build a minimal, production-quality AI web app for internship evaluation.
- No overengineering: single Next.js 15 project, no databases, no auth, no infrastructure extras.
- Provide clean architecture, polished UI, reliable AI workflow.
- Use Tailwind + shadcn, React hooks only, OpenRouter (DeepSeek Chat), and aim for Vercel deployment readiness.

## Approach Summary
1. **Scaffold & Tooling:**  
   - Initialize Next.js 15 App Router with Tailwind.  
   - Configure ESLint flat config and TypeScript strict mode.  
   - Add shadcn-style UI building blocks (buttons, inputs) and Tailwind utilities.

2. **Design Language:**  
   - Create dark, premium UI with purposeful typography (Plus Jakarta Sans, IBM Plex Mono).  
   - Use Tailwind theme tokens for consistent colors.  
   - Keep motion subtle (hover, spinner) per brief.

3. **Page Architecture:**  
   - **Landing:** Summarizes rubric requirements, showcases simulated agent activity with staged statuses, and funnels users to the builder.  
   - **Campaign Builder:** Handles notes/upload/URL inputs, tone/audience hints, live status feed (thinking → processing → reviewing → approved), and snapshot persistence.  
   - **Results Dashboard:** Compact hero summary (status, stats, approvals), three-card executive overview (source recap, fact sheet highlights, editor insights), tabbed blog/social/email outputs with copy/download actions, followed by agent workflow timeline, regeneration recap, and a collapsible developer details drawer.

4. **AI Workflow:**  
   - Implement three agent modules (research, copywriter, editor-in-chief) with strict prompts in `/prompts`.  
   - Research Agent outputs the canonical `FactSheet` schema + ambiguity flags.  
   - Copywriter Agent consumes fact sheet only, enforces blog/social/email formatting and word counts, and accepts editor correction notes.  
   - Editor Agent audits length/tone/value proposition/formatting and loops regeneration until status is `APPROVED`.  
   - Activity logging captures stage, status, message, timestamp, and attempt number for UI telemetry.

5. **Client Integration:**  
   - Campaign Builder validates all channels (notes/file/url), streams activity, and persists a `CampaignSnapshot`.  
   - Results dashboard rehydrates from snapshot, displays agent timeline, regeneration history, and copy/export actions with responsive layout.

6. **Quality Gates:**  
   - Run `npm run lint` and `npm run type-check` after major phases.  
   - Keep TypeScript errors at zero, ensure consistent coding style.

7. **Documentation:**  
   - Create README, PROJECT_DETAILS, APPROACH_DOCUMENT.  
   - Document architecture, workflow, trade-offs, future improvements.

## Key Decisions
- **Single Repo:** Simplicity > microservices; easier to explain during interviews.
- **OpenRouter SDK:** Satisfies requirement and allows future model swaps via env variables.
- **JSON-first prompts:** Reliable parsing and ensures outputs remain grounded in facts.
- **Lightweight store (`useSyncExternalStore`):** Pass campaign data between pages without external state libraries.
- **No DB/Auth:** Matches constraint; focused on AI workflow rather than persistence.
- **Tailwind + shadcn:** Rapid UI development with consistent theming.

## Alternative Considerations
- Could have used Zustand or Redux for state—but rejected per “React hooks only” constraint.
- Could stream activity updates; decided on simpler fetch response given scope.
- Could add tests; prioritized time toward workflow and documentation, noted for future work.

## Risk Mitigation
- JSON parsing helper gracefully reports failures to avoid silent corruption.
- Editor Agent validates claims to reduce hallucinations.  
- Activity feed clarifies progress and errors, aiding debugging during demos.
- Lint/type checks run after each phase to prevent technical debt.

## Future Enhancements (if scope allowed)
- Parallelize copy/editor agents once research completes to reduce latency.  
- Add localStorage for campaign history.  
- Provide industry-specific prompt presets.  
- Integrate analytics (token counts, run summaries).  
- Add Playwright tests for end-to-end verification.

## Conclusion
The project balances clarity, polish and reliability while staying minimal. Architecture decisions highlight understanding of modern Next.js, AI orchestration, and UX design.
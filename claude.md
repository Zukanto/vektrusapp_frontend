# CLAUDE.md

## Mission

You are working on the **Vektrus APP frontend** — not the marketing website or landing pages.

Your goal is to improve and maintain a **premium AI SaaS product interface** that feels:

- smart
- calm
- structured
- modern
- high-quality
- trustworthy
- data-driven
- product-mature
- clear

The Vektrus app must **not** feel:

- loud
- cyberpunk
- gamer-like
- neon-heavy
- like a generic AI tool
- playful-chaotic
- visually overloaded
- like a cheap dashboard template

This is a real product frontend with real product logic — not just presentation UI.

---

## Core Product Scope

The main focus is the **product frontend / app UI**, including:

- Dashboard / Analytics
- Vektrus Chat
- Vektrus Pulse (3 modes: Text Wizard, Visual, Auto)
- Content Planner
- Brand Studio
- Image Simple / Advanced
- Vision / Video
- Tool Hub / Media / additional modules
- Navigation / Sidebar
- States / AI states / UX flows
- Onboarding Wizard
- Profile / Settings
- productive UI tied to real application logic

Website pages are **secondary** to the app product experience.

---

## First Sources of Truth

Always read these before making any significant changes:

### Root
- `CLAUDE.md` ← you are here

### Brand docs
- `docs/brand/brand-summary.md`
- `docs/brand/visual-rules.md`
- `docs/brand/assets-reference.md`

### Product docs
Read relevant files in `docs/product/` depending on the module being worked on.

### Workstream docs (always check for active workstreams)
- `docs/workstreams/app-frontend-handoff.md` ← most important for continuity
- `docs/workstreams/app-frontend-audit.md`
- `docs/workstreams/app-frontend-rollout-plan.md`
- `docs/workstreams/app-frontend-final-qa.md`

---

## Required Working Style

For larger or medium-sized tasks, do **not** jump directly into implementation.

Default workflow:

1. Read `CLAUDE.md`
2. Read relevant files in `docs/brand/`
3. Read relevant files in `docs/product/`
4. Read `docs/workstreams/app-frontend-handoff.md` for current context
5. Inspect the relevant implementation files
6. Briefly state: which files you read, what is in scope, what is out of scope, where product logic risks exist
7. Make focused changes only where necessary
8. Summarize changes briefly
9. Critically review the result
10. Update `docs/workstreams/app-frontend-handoff.md`

Do **not** blindly redo everything.
Do **not** make broad refactors unless clearly necessary.
Only change relevant files.

---

## Skills

Use the installed skills intentionally — not by default for everything.

### Default skills (use for most UI/product tasks)
- `ui-ux-pro-max` — information architecture, UX quality, states, flows, hierarchy
- `frontend-design` — visual system, card/panel/toolbar design, layout quality, CI-conformant components

### Use when component work is involved
- `shadcn/ui` — dialogs, forms, tabs, cards, tables, popovers, comboboxes, buttons, toggles

### Use only when copy/communication is the task
- `product-marketing-context` — empty state copy, value framing, trust messaging in UI
- `copywriting` / `copy-editing` / `page-cro` — CTAs, onboarding text, microcopy, benefit communication

Do **not** force marketing skills into purely visual or component tasks.

### Use contextually
- `security guidance skill` — when touching auth flows, OAuth, social connect, sessions, roles, sensitive settings
- `code-review plugin` — for structured review steps, corrective passes, QA
- `playwright-skill` — for UI/flow tests, form tests, responsive checks, screenshots after larger changes

### Use sparingly (only for large new product flows)
- `superpowers` — brainstorming, multi-agent planning, TDD for entirely new large features
- `feature-dev` — only when a clear formal feature workflow is wanted and superpowers is not active

---

## Critical Product Rule

The Vektrus app has real product logic connected to:

- n8n webhooks
- Supabase (queries, auth, realtime, polling)
- async flows with status fields
- publishing logic and status workflows (draft → approved → scheduled → published)
- planner and pulse generation pipelines
- brand and AI profile logic
- content generation flows

Because of that:

- respect existing working logic
- do not break data flow assumptions
- do not make unnecessary architecture changes
- do not refactor unrelated areas
- do not replace working logic just to make code "look cleaner"
- change only what is needed for the task

When touching logic-heavy areas, prefer **surgical changes** over broad redesigns.

---

## n8n Webhook Pattern

All n8n calls go directly to the webhook endpoint — NOT via Edge Functions:

```typescript
const callN8n = async (endpoint: string, body: object) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Nicht eingeloggt');

  const response = await fetch(`https://n8n.vektrus.ai/webhook/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return response.json();
};
```

Check `src/lib/n8n.ts` — this helper likely already exists. Use it, don't recreate it.

---

## Design Direction

### Visual principles
- clean hierarchy
- generous whitespace
- balanced density
- calm layering
- high readability
- premium component feel
- clear user guidance
- controlled emphasis
- intentional motion and state transitions
- no visual noise

### Component feel
- soft modern cards
- subtle premium shadows
- clean surfaces
- refined buttons
- polished hover states
- strong alignment discipline
- consistent spacing rhythm
- no cheap dashboard look

### Typography
- **Manrope** for headlines and brand-defining UI moments
- **Inter** or `system-ui` for body and interface text
- clear hierarchy at all times
- **no gradient typography** — not even with Pulse Gradient
- no outline display fonts

---

## Color System

### Core Brand Colors
- `#49B7E3` — Vektrus Blue — primary brand / action color
- `#F4FCFE` — Mint White — calm backgrounds, page surfaces
- `#B6EBF7` — Light Blue — supporting backgrounds, icon backgrounds
- `#111111` — Anthrazit — primary text
- `#7A7A7A` — Soft Gray — secondary text, borders

### AI / Functional Colors
- `#7C6CF2` — AI Violet — **only for active AI states** (generation, processing, thinking)
  — never as a dominant brand color
  — max ~10% visual dominance per screen
- `linear-gradient(135deg, #49B7E3, #7C6CF2, #E8A0D6, #F4BE9D)` — Pulse Gradient
  — only for AI-specific UI moments (see Pulse Gradient rule below)

### Status Colors
- `#49D69E` — Success Green
- `#F4BE9D` — Pending / Waiting (Warm Peach)
- `#FA7E70` — Error / Alert Red

### Color Hierarchy
Core Brand > Pulse Gradient (AI moments) > AI Violet > Status colors

---

## Token System

All colors, shadows, radius, and spacing must use **CSS Custom Properties** from the token system — no hardcoded hex values in JSX or new CSS.

```
Colors:      var(--vektrus-blue), var(--vektrus-mint), var(--vektrus-anthrazit), var(--vektrus-gray)
Backgrounds: bg-white (cards), bg-[var(--vektrus-mint)] (pages)
Shadows:     shadow-subtle | shadow-card | shadow-elevated
Radius:      rounded-[var(--vektrus-radius-sm)] (12px) | rounded-[var(--vektrus-radius-md)] (16px) | rounded-[var(--vektrus-radius-lg)]
Fonts:       font-manrope (Headlines) | default Inter/system-ui (Body)
Borders:     border-[rgba(73,183,227,0.10)] or via Token
AI Glass:    glass-modal | glass-panel | glass-ai-layer (from ai-layer.css)
AI Border:   ai-border-gradient | border-gradient-ai (from ai-layer.css)
```

### Critical: index.css Import Order

`@import` statements for token files (including `ai-layer.css`) **must come before** `@tailwind` directives in `index.css`. If CSS tokens (radius, shadows, borders, glass effects) appear correct in code but don't work in the browser, always check this import order first.

---

## Z-Axis Design Model (AI Layer)

### Ebene 0 — Base (85–90% of UI)
Flat, light, calm. No glass, no gradients.
- Dashboard, Kalender, Tabellen, Navigation, Settings/Admin
- Standard cards, standard buttons

### Ebene 1 — AI Layer (10–15% of UI)
Glassmorphic layer with Pulse Gradient accents.
- Modals, floating panels, AI overlays
- `background: rgba(255,255,255,0.8)`, `backdrop-filter: blur(12px)`
- Pulse Gradient for AI icons, borders, glows (very subtle, 6–8s animation cycle)

### Schutzräume (never receive gradient or glass treatment)
- Left sidebar / navigation
- Content Planner calendar grid (the days themselves)
- Analytics charts and data visualizations
- Standard buttons (Speichern, Abbrechen, Bearbeiten)
- Footer
- Settings / Profile / Admin areas
- Dashboard KPI cards and tables
- Onboarding Wizard

---

## Pulse Gradient Rule

Wherever a CTA or button triggers Vektrus Pulse — content generation, Pulse start, or any action routing to `/pulse` — it **must** use the Pulse Gradient treatment from `src/styles/ai-layer.css`:

- Use class `chat-ai-action-btn` for Pulse action buttons (white bg, Pulse Gradient border on hover, subtle glow)
- Use `pulse-gradient-icon` for icon containers associated with Pulse
- Do **not** use a solid AI Violet button for Pulse CTAs

This applies everywhere: Dashboard, Chat, Planner, Sidebar, Pulse page, any module with a "start Pulse" action.

Standard (non-Pulse) AI actions may still use AI Violet as an accent.

---

## Module Color System

Each module has a dedicated accent color injected via `ModuleWrapper` using `module-colors.ts` CSS variable injection. When working on a module, respect its assigned accent color. Do not override module colors without a clear reason.

---

## UX Standards

Always think in:

- product logic
- user clarity
- task flow
- hierarchy
- confidence
- quality perception
- state communication
- realistic product usage

Optimize for:

- understandable flows
- clear next actions
- good empty states (Icon + Headline + Description + optional CTA)
- good loading / processing states
- sensible information grouping
- reduced friction
- strong perceived product quality

For module views and tool flows:
do not just make them prettier — make them **clearer, calmer, and more usable**.

---

## State Design Rules

AI and async states are a major product quality lever.

States to handle carefully:
`loading` | `generating` | `thinking` | `publishing` | `syncing` | `processing` | `queued` | `success` | `partial success` | `warning` | `error` | `empty` | `disabled` | `unavailable`

Guidelines:
- AI states should feel intelligent and calm — not flashy
- use AI Violet only where AI activity is actually happening
- success / error / warning must remain semantic
- states must be understandable at a glance
- avoid noisy animations
- prioritize confidence and clarity

---

## Copy and In-App Communication

When copy is part of the task:

- be clear, helpful, concise
- sound product-mature
- avoid generic AI hype language
- avoid noisy marketing phrasing in product UI
- prefer confident, calm, high-value wording

### German Spelling — Non-Negotiable

All user-facing German text must use proper German spelling with real umlauts and Eszett:

- Use `ä`, `ö`, `ü`, `Ä`, `Ö`, `Ü` — never `ae`, `oe`, `ue`
- Use `ß` where correct — never `ss` as a substitute
  (e.g. `schließen` not `schliessen`, `Größe` not `Groesse`, `Übernehmen` not `Uebernehmen`)

This applies to: button labels, modal titles, descriptions, helper texts, toasts, empty states, status texts, dropdown labels, placeholders — any text visible to users.

Do **not** change technical identifiers, object keys, API fields, route params, file names, CSS classes, enum values, or any machine-readable string. Those remain ASCII-only.

---

## File Change Discipline

- change only relevant files
- avoid unnecessary refactors
- avoid renaming things unless necessary
- avoid moving files unless truly required
- preserve working patterns where sensible
- prefer small, controlled improvements over broad rewrites
- avoid new abstractions unless they clearly improve the relevant area
- do not "clean up" unrelated code during focused feature work

If you notice unrelated issues, mention them briefly instead of silently fixing them.

---

## Existing Key Architecture

### Auth & Data
- Supabase Auth — session via `supabase.auth.getSession()`, userId = `session.user.id`
- Tables: `users`, `user_ai_profiles`, `late_accounts`, and others
- Social connect via `src/services/socialAccountService.ts` + OAuth popup pattern

### Routing
- React Router SPA
- App routes in `src/App.tsx` and `src/routes.tsx`
- AppLayout wraps all authenticated routes (sidebar, navigation)
- `/onboarding` runs outside AppLayout (no sidebar) — own protected route

### Onboarding
- Wizard at `/onboarding` — 4 steps: Unternehmen → Markenprofil → Social Accounts → Fertig
- Guard: if `onboarding_completed === false` → redirect to `/onboarding`
- Guard: if `onboarding_completed === true` → redirect to `/dashboard`
- After signup → redirect to `/onboarding` (not `/dashboard` or `/toolhub`)
- Onboarding is a **Schutzraum** — no AI Violet, no Pulse Gradient, no Glass effects

### Styles
- TailwindCSS + custom CSS tokens in `src/styles/`
- `src/styles/ai-layer.css` — Pulse Gradient, Glass, Glow, AI Border utilities
- `src/index.css` — imports must come before `@tailwind` directives (see Token System section)
- `src/styles/module-colors.ts` — per-module accent color system

---

## Expected Response Pattern

For larger tasks, respond in this structure:

### 1. What you reviewed
Mention the relevant files/docs you checked.

### 2. Affected files
List files you plan to change and why.

### 3. Approach
Explain the implementation approach briefly.

### 4. Implementation
Make focused changes.

### 5. Summary
Summarize what changed, in a table where helpful.

### 6. Critical review
Review for:
- brand consistency
- premium AI SaaS quality
- UX clarity
- state logic
- spacing / alignment / shadows / radius
- token usage (no hardcoded hex)
- German spelling in user-facing copy
- technical cleanliness
- unnecessary side effects

---

## What Not To Do

Do not:

- redesign unrelated areas
- introduce flashy AI visuals just because it is an AI product
- overuse violet, gradients, glow, or motion
- make the UI louder than the brand
- break working product logic
- make broad refactors without reason
- force marketing-site patterns onto product UI
- produce generic dashboard output
- add visual complexity without UX value
- use hardcoded hex values in new code
- use ASCII transliterations in user-facing German text (ae/oe/ue/ss)
- add glass or gradient effects to Schutzräume (sidebar, dashboard, settings, calendar, onboarding)

---

## Preferred Outcome

Every meaningful improvement should move the app toward:

- more consistent
- more brand-aligned
- more premium
- more calm
- more understandable
- more product-mature
- more trustworthy
- more intentional
- more useful
- technically safe

The target is a **high-quality premium AI SaaS frontend** — strong UX, strong product logic integrity, strong brand identity.
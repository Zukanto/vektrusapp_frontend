# CLAUDE.md

## Mission

You are working on the **Vektrus APP frontend**, not primarily on the marketing website or landing pages.

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

This is a real product frontend with real product logic, not just presentation UI.

---

## Core Product Scope

The main focus is the **product frontend / app UI**, including areas such as:

- Dashboard / Analytics
- Vektrus Chat
- Vektrus Pulse
- Content Planner
- Brand Studio
- Image Simple / Advanced
- Vision / Video
- Tool Hub / Media / additional modules
- Navigation / Sidebar
- States / AI states / UX flows
- productive UI tied to real application logic

This repo work is **not primarily about website pages**.
If website patterns are helpful, they are secondary to the app product experience.

---

## Required Working Style

For larger or medium-sized tasks, do **not** jump directly into implementation.

Default workflow:

1. Read `CLAUDE.md`
2. Read relevant files in `docs/brand/`
3. Read relevant files in `docs/product/`
4. Inspect the relevant implementation files
5. Identify affected files
6. Briefly explain the approach
7. Make focused changes only where necessary
8. Summarize changes briefly
9. Critically review the result

Do **not** blindly “redo everything”.
Do **not** make broad refactors unless they are clearly necessary for the task.

---

## First Sources of Truth

Always treat these as important context sources before larger changes:

### Root
- `CLAUDE.md`

### Brand docs
- `docs/brand/brand-summary.md`
- `docs/brand/messaging.md`
- `docs/brand/visual-rules.md`
- `docs/brand/assets-reference.md`

Also check source material in:
- `docs/brand/source/`

### Product docs
Read the relevant files in:
- `docs/product/`

Examples may include:
- `docs/product/vektrus-pulse-full-description.md`
- `docs/product/vektrus-pulse-website-summary.md`
- `docs/product/vektrus-content-planner-beschreibung.md`

Website docs in `docs/website/` are secondary for app tasks.

---

## Critical Product Rule

The Vektrus app has real product logic connected to things like:

- n8n webhooks
- Supabase
- async flows
- polling
- status fields
- publishing logic
- planner logic
- brand profile logic
- AI profile logic
- state transitions
- content generation flows

Because of that:

- respect existing working logic
- do not break data flow assumptions
- do not make unnecessary architecture changes
- do not refactor unrelated areas
- do not replace working logic just to make code “look cleaner”
- change only what is needed for the task

When touching logic-heavy areas, prefer **surgical changes** over broad redesigns.

---

## Design Direction

The product should feel like a **premium, modern, calm AI SaaS application**.

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
- **Manrope** for headlines / brand-defining UI moments
- **Inter** or `system-ui` for body and interface text
- clear hierarchy
- no gradient typography
- no outline display fonts

### Color logic
- **Vektrus Blue** = primary brand / action color
- **Light Blue / Mint White** = calm backgrounds, surfaces, subtle layers
- **AI Violet** = AI activity only (generation, thinking, processing, AI states)
- success / warning / error colors must remain semantic

Important:
**AI Violet must never dominate the brand.**
It is a functional accent for AI-related states, not the primary visual identity.

### Pulse Gradient rule

Wherever a CTA or button triggers Vektrus Pulse — content generation, Pulse start, "Pulse starten", or any action that routes to `/pulse` — it **must** use the Pulse Gradient treatment defined in `src/styles/ai-layer.css`.

- Use the CSS class `chat-ai-action-btn` for Pulse action buttons (white background, Pulse Gradient border on hover, subtle glow)
- Use `pulse-gradient-icon` for icon containers associated with Pulse
- The Pulse Gradient is: `linear-gradient(135deg, #49B7E3, #7C6CF2, #E8A0D6, #F4BE9D)` — defined as `--vektrus-pulse-gradient`
- This applies everywhere: Dashboard, Chat, Planner, Sidebar, Pulse page, any module that offers a "start Pulse" action
- Do **not** use a solid AI Violet button for Pulse CTAs — use the gradient treatment instead
- Standard (non-Pulse) AI actions may still use AI Violet as an accent color

This ensures Pulse is visually recognizable as a premium AI feature across the entire app.

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

Do not optimize only for “looks”.
Also optimize for:

- understandable flows
- clear next actions
- good empty states
- good loading / processing states
- sensible information grouping
- reduced friction
- strong perceived product quality

For module views, pages, and tool flows:
do not just make them prettier — make them **clearer, calmer, and more usable**.

---

## Skill Usage

Use the installed skills intentionally.

### Default skills for app frontend work
Use these by default for most UI/product tasks:

- `ui-ux-pro-max`
- `frontend-design`

### Use shadcn/ui knowledge when relevant
Use the shadcn/ui skill/resources when the task involves:

- component composition
- dialogs
- sheets
- forms
- tabs
- cards
- tables
- popovers
- comboboxes
- commands
- existing component system alignment
- clean extension of the current UI system

### Marketing-related skills
Use these only when relevant:

- `product-marketing-context`
- `copywriting`
- `copy-editing`
- `page-cro`

Only bring them in when the task includes things like:

- CTA structure
- product communication
- empty state copy
- trust messaging
- feature explanation
- onboarding text
- conversion-related wording
- pricing / upgrade communication
- benefit communication inside the app

Do **not** force marketing skills into purely visual/component tasks.

---

## File Change Discipline

Always follow these rules:

- change only relevant files
- avoid unnecessary refactors
- avoid renaming things unless necessary
- avoid moving files unless the task truly requires it
- preserve working patterns where sensible
- prefer small, controlled improvements over broad rewrites
- avoid introducing new abstractions unless they clearly improve the relevant area
- do not “clean up” unrelated code during focused feature work

If you notice unrelated issues, mention them briefly instead of silently refactoring everything.

---

## Expected Response Pattern

For larger tasks, respond in this structure:

### 1. What you reviewed
Mention the relevant files/docs you checked.

### 2. Affected files
List the files you plan to change.

### 3. Approach
Explain the implementation approach briefly and clearly.

### 4. Implementation
Make the changes in a focused way.

### 5. Summary
Summarize what changed.

### 6. Critical review
Review the result critically for:
- brand consistency
- premium AI SaaS quality
- UX clarity
- responsiveness
- state logic
- spacing / alignment / shadows / radius consistency
- technical cleanliness
- unnecessary side effects

Keep this concise and useful.

---

## Refactor Strategy for Larger Work

For bigger improvements, do not attempt a huge all-at-once redesign.

Preferred sequence:

1. Audit
2. Plan
3. Improve global foundations if needed
4. Work module by module
5. Review
6. Polish

Do not start with “rewrite the whole interface”.
Break big work into controlled phases.

---

## Review Standards

When reviewing existing UI or newly changed UI, check for:

- brand consistency
- premium product feel
- modern AI SaaS quality
- good hierarchy
- calm composition
- spacing consistency
- alignment quality
- hover / focus / active states
- empty states
- loading / processing / waiting states
- semantic use of color
- proper use of AI Violet
- responsive behavior
- component consistency
- visual clutter
- trust / clarity / confidence in the flow

---

## State Design Rules

AI and async states are a major product quality lever.

Treat these carefully:

- loading
- generating
- thinking
- publishing
- syncing
- processing
- queued
- success
- partial success
- warning
- error
- empty
- disabled
- unavailable

Guidelines:

- AI states should feel intelligent and calm, not flashy
- use AI Violet only where AI activity is actually relevant
- success/error/warning states must remain semantic
- states must be understandable at a glance
- avoid noisy animations
- prioritize confidence and clarity

---

## Navigation and Information Architecture

For navigation, sidebar, dashboards, and module pages:

- prioritize clarity over novelty
- make the product structure easier to understand
- reduce cognitive overload
- support fast recognition of where the user is
- make primary actions obvious
- keep secondary actions secondary
- avoid overcrowding

When improving structure, think in:
- priority
- grouping
- progression
- frequency of use
- product logic
- user confidence

---

## Copy and In-App Communication

When copy is part of the task:

- be clear
- be helpful
- be concise
- sound product-mature
- avoid generic AI hype language
- avoid noisy marketing phrasing in product UI
- avoid cheap “growth hack” tone
- prefer confident, calm, high-value wording

The Vektrus product voice inside the app should feel:
- intelligent
- calm
- modern
- trustworthy
- product-led
- useful

### German spelling in user-facing copy

All user-facing German text must use proper German spelling with real umlauts and Eszett:

- Use `ä`, `ö`, `ü`, `Ä`, `Ö`, `Ü` — never ASCII transliterations like `ae`, `oe`, `ue`
- Use `ß` where correct German spelling requires it — never `ss` as a substitute (e.g. `schließen` not `schliessen`, `Größe` not `Groesse`)
- This applies to: button labels, modal titles, descriptions, helper texts, toasts, empty states, status texts, dropdown labels, placeholders, and any other text visible to users

Do **not** change technical identifiers, object keys, API fields, route params, file names, CSS classes, enum values, or any machine-readable string. Those may remain ASCII-only.

If a technical constraint forces ASCII in a specific context, keep the ASCII value out of user-facing copy by using a separate display string.

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
- choose aesthetics over product clarity
- add visual complexity without UX value

---

## Preferred Outcome

Every meaningful improvement should move the app toward this:

- more consistent
- more brand-aligned
- more premium
- more calm
- more understandable
- more product-mature
- more trustworthy
- more intentional
- more useful
- still technically safe

The target is a **high-quality premium AI SaaS frontend** with strong UX and strong product logic integrity.

---

## Default Instruction for Most Tasks

Unless the task is tiny, follow this default mode:

- read `CLAUDE.md`
- read relevant files in `docs/brand/`
- read relevant files in `docs/product/`
- inspect the implementation
- identify affected files
- explain the approach briefly
- implement only what is necessary
- summarize changes briefly
- critically review the result

Always protect working logic.
Always avoid unnecessary refactors.
Always optimize for premium product quality, not just visual novelty.
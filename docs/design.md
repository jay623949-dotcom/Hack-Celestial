# RESORT 360 — Design System Specification

> **SINGLE SOURCE OF TRUTH (FRONTEND UI & UX)**  
> **Location**: `/docs/design.md`  
> This document specifies the exact visual identity, tokens, component conventions, interaction patterns, and design rules implemented in the **RESORT 360** landing page and command center.  
> Future AI coding assistants and developers **MUST** read this file before creating or modifying any frontend page or component.

---

## 1. Brand Identity & Philosophy

Resort 360 is an **AI-powered resort operations command center**.  
It bridges operational silos across Front Desk, Housekeeping, Maintenance, and Revenue Management.

### 1.1 The Aesthetic Equation
$$\text{Premium Hospitality} + \text{Enterprise Operations} + \text{Modern AI} + \text{Calm Intelligence}$$

- **Target Persona**: Hotel General Managers, Front Desk Supervisors, Executive Housekeepers, Chief Engineers.
- **Tone**: Calm, authoritative, restrained, intentional, and trustworthy.
- **Anti-Patterns**:
  - ❌ **NOT** an AI startup landing page with purple gradients or floating blobs.
  - ❌ **NOT** a high-frequency trading crypto terminal with flashing lights.
  - ❌ **NOT** a sci-fi cyberpunk HUD or toy-like cartoon interface.

---

## 2. Color System & Design Tokens

Resort 360 implements a dual-theme architecture driven by CSS custom properties in `frontend/app/globals.css` and mapped via `frontend/tailwind.config.js`.

### 2.1 The Primary Brand Accent: Teal
**Teal is the SOLE primary brand accent.**  
Green is strictly forbidden as a brand color and is reserved solely for semantic success states.

| Token | Light Mode Hex | Dark Mode Hex | Purpose |
| :--- | :--- | :--- | :--- |
| `primary` | `#0F766E` | `#14B8A6` | Primary action buttons, brand badges, active links |
| `primary-hover` | `#0D9488` | `#2DD4BF` | Hover state on primary elements |
| `primary-light` | `#F0FDFA` | `#062326` | Highlight banner fills, consensus card surfaces |
| `primary-border` | `#99F6E4` | `#115E59` | Subtle borders for highlighted consensus cards |

### 2.2 Backgrounds, Surfaces & Text
- **Light Theme**: Warm White Atmosphere
  - Background: `#FBFBFA`
  - Surfaces (Cards): `#FFFFFF`
  - Secondary Surface: `#F5F5F3`
  - Hover Surface: `#ECECE8`
  - Primary Text: `#1E293B` (Charcoal Slate)
  - Muted Text: `#64748B`
  - Borders: `#E2E8F0`
- **Dark Theme**: Deep Bluish Charcoal (Operations Deck)
  - Background: `#07111F` (Deep bluish, NEVER pure black)
  - Primary Surface: `#0B1626`
  - Secondary Surface: `#0F1C2E`
  - Hover Surface: `#16263D`
  - Primary Text: `#F1F5F9` (Soft crisp white)
  - Muted Text: `#94A3B8`
  - Borders: `#1E2E45`

### 2.3 Semantic Status System
Status indicators are distinct from the brand accent:

| Semantic State | Light Hex | Dark Hex | Role | Pair With |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#15803D` | `#22C55E` | Ready, Cleaned, Completed | Checkmark icon + explicit text |
| **Warning / Pending** | `#B45309` | `#F59E0B` | Analyzing, Delay, Pending Approval | Clock / pulse dot + explicit text |
| **Critical / Danger** | `#DC2626` | `#EF4444` | Breakdown, Emergency, Rejected | Alert icon + explicit text |

> **Accessibility Rule**: Never communicate status through color alone. Always combine **Color + Icon + Explicit Label**.

---

## 3. Theme Switching Rules

- Managed by `ThemeProvider.jsx` wrapping the Next.js App Router root layout.
- State persisted in `localStorage` under `resort360_theme`.
- Automatically respects `prefers-color-scheme: dark` on first visit.
- Uses `class="dark"` toggled on the `<html>` root with `suppressHydrationWarning` to eliminate FOUC (flash of unstyled content).
- **Rule**: Never build separate duplicate components for light and dark modes. Every component consumes token utility classes (`bg-surface`, `text-foreground`, `border-border`).

---

## 4. Typography System

Powered by modern sans-serif typography (`Inter`, system UI font fallback). Font weights are used strictly to define hierarchy, not as visual decoration.

| Style Role | Tailwind Hierarchy | Usage |
| :--- | :--- | :--- |
| **Display Hero** | `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]` | Landing hero headline |
| **Page Header (H1)** | `text-3xl sm:text-4xl font-extrabold tracking-tight` | Major page / command center titles |
| **Section Header (H2)**| `text-2xl sm:text-3xl font-bold tracking-tight` | Landing page section headings |
| **Card Header (H3)** | `text-lg sm:text-xl font-bold` | Feature titles, consensus action plan headers |
| **Subhead (H4)** | `text-base font-bold` | Agent names, scenario titles |
| **Body Text** | `text-sm sm:text-base text-muted-foreground leading-relaxed` | Descriptions, operational trade-off explanations |
| **Mono Metadata** | `text-xs font-mono font-bold uppercase tracking-wider` | Incident codes, telemetry timestamps, department tags |
| **Metric Value** | `text-2xl sm:text-3xl font-extrabold font-mono tracking-tight` | Quantifiable numbers (Occupancy, Signals) |

---

## 5. Spacing, Geometry & Radius

### 5.1 Spacing Scale
- Major Landing Sections: `py-20 md:py-28`
- Interior Card Padding: `p-5 sm:p-7`
- Control Gaps: `gap-2` (badges), `gap-3` (sub-cards), `gap-6` (major 4-column grids)

### 5.2 Border Radius Scale
- Small Badges & Filter Pills: `rounded-full`
- Buttons & Input Controls: `rounded-lg` (8px)
- Cards & Telemetry Blocks: `rounded-xl` (12px)
- Large Feature Blocks & Modals: `rounded-2xl` (16px)
- Hero Terminal & Outer Command Shell: `rounded-3xl` (24px)

---

## 6. Shadows & Depth

- **Light Mode**: Multi-layer ambient drop shadows:
  - `shadow-soft`: `0 2px 12px -2px rgba(7, 17, 31, 0.04), 0 1px 3px -1px rgba(7, 17, 31, 0.02)`
  - `shadow-elevated`: `0 16px 36px -8px rgba(7, 17, 31, 0.1), 0 4px 12px -2px rgba(7, 17, 31, 0.03)`
- **Dark Mode**: Elevated depth is achieved through **border definition (`border-border`)** and surface elevation steps (`bg-surface` vs `bg-surface-secondary`) rather than black drop shadows.

---

## 7. Component Conventions & Layouts

### 7.1 Sticky Navbar (`components/navbar/Navbar.jsx`)
- Height: 64px (`h-16`).
- Sticky at top: `sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border/70`.
- Left: Monogram `360` badge + `RESORT 360` title + descriptor `AI-Powered Resort Operations`.
- Center: Pill capsule navigation (`Overview`, `Operations`, `AI Agents`, `How It Works`).
- Right: Theme toggle + `Open Command Center` primary CTA.

### 7.2 Hero & Real Command Center (`components/hero/Hero.jsx`)
- Headline: *"Turn Resort Chaos Into Coordinated Action."*
- Subtitle: Clearly articulates cross-department context and multi-agent consensus.
- Mockup: Integrated command terminal (`shadow-elevated`) simulating the 10:40 AM VIP arrival + AC breakdown, 4 agent status indicators, and synthesized action plan review.

### 7.3 Departmental AI Agents (`components/agents/AgentSection.jsx`)
- 4 Specialized Modules:
  - `Front Desk`: Guest relations, VIP loyalty, wait-time mitigation.
  - `Housekeeping`: Hygiene, room readiness, staff routing, turn-around ETAs.
  - `Maintenance`: Asset failure severity, technician dispatch, part availability.
  - `Revenue`: Category ADR, upsell value, group booking locks.
- Rendered as operational modules with clear scope checklists and sample recommendations, **never as chatbot conversation bubbles**.

### 7.4 Multi-Agent Consensus (`components/consensus/MultiAgentConsensus.jsx`)
- Illustrates 4 distinct perspectives converging via an animated downward arrow into the **Resort 360 Consensus Engine**.
- Highlights the chosen action: `Move VIP → Room 505`.
- Features an explicit **Explainable Rationale** section detailing why the decision was chosen over alternatives.

### 7.5 Human Control (`components/operations/HumanControl.jsx`)
- Core Headline: *"AI recommends. Managers decide."*
- 4 Stages: AI Recommendation $\rightarrow$ Manager Review $\rightarrow$ Approve / Modify / Reject $\rightarrow$ Controlled Execution.
- Emphasizes zero autonomous execution of room changes or work orders without human authorization.

### 7.6 Live Execution Timeline (`components/execution/LiveExecution.jsx`)
- Visual sequence connecting decision approval to staff work order fulfillment:
  - `10:42 AM` Room 505 prep started
  - `10:43 AM` Housekeeping assigned
  - `10:44 AM` Tech assigned to 401
  - `10:45 AM` Front Desk updated
  - `10:46 AM` Guest notified
  - `10:48 AM` Room 505 ready

---

## 8. Animation & Motion Rules

- **Restraint First**: Animations must communicate status, not show off technical capability.
- **Pulse Indicators**: `animate-pulse` reserved exclusively for live telemetry channel dots.
- **Transitions**: `transition-all duration-150` on interactive buttons and navigation links.
- **Theme Transitions**: `transition-colors duration-200` on body and card surfaces.
- **Prohibited**: Floating 3D orbs, infinite spinning logos, aggressive parallax scroll, and decorative confetti.

---

## 9. Responsiveness Matrix

| Viewport | Breakpoint | Layout Strategy |
| :--- | :--- | :--- |
| **Desktop** | $\ge 1024\text{px}$ | Full 4-column agent grid, integrated terminal preview, side-by-side problem comparison. |
| **Tablet** | $768\text{px} - 1023\text{px}$ | 2-column agent layout, responsive navigation capsule, stacked consensus plan. |
| **Mobile** | $< 768\text{px}$ | Collapsible hamburger drawer, single-column stacked triage cards, prioritized incident & action buttons. |

---

## 10. Design Do's & Don'ts

### DO:
- ✅ Use **Teal** as the single primary brand accent.
- ✅ Use pure **JavaScript (`.js` / `.jsx`)**.
- ✅ Use the deep bluish dark palette (`#07111F`, `#0B1626`).
- ✅ Combine Color + Icon + Label for all status indicators.
- ✅ Keep copy realistic, operational, and hospitality-focused.

### DO NOT:
- ❌ Do not use green as a brand color.
- ❌ Do not introduce TypeScript (`.ts` / `.tsx`).
- ❌ Do not use pure `#000000` black for dark mode backgrounds.
- ❌ Do not display fake customer logos, fake reviews, or fake adoption statistics.
- ❌ Do not hardcode hex values inside individual React components.
- ❌ Do not present AI agents as casual conversational chatbots.

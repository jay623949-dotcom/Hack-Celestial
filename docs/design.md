# ATRIA INTELLIGENCE — Design System Specification

> **SINGLE SOURCE OF TRUTH (FRONTEND UI & UX)**  
> **Location**: `/docs/design.md`  
> This document specifies the exact visual identity, color tokens, typography, component conventions, interaction patterns, and layout guidelines implemented in the **Atria Intelligence** (formerly RESORT 360) platform, including the public landing page, authentication system, and locked-viewport enterprise command center.  
> Future AI coding assistants and developers **MUST** read and adhere strictly to this file before creating or modifying any frontend page or component.

---

## 1. Brand & Platform Identity

**Atria Intelligence** (operating on **Atria OS**) is an enterprise AI-powered resort operations platform & swarm intelligence command center. It unifies operational context across resort departments (**Front Desk**, **Housekeeping**, **Maintenance**, and **Revenue Management**), orchestrating specialized AI agents into a real-time collaborative swarm with human-in-the-loop decision governance.

### The Aesthetic Equation
$$\text{Odoo-Inspired Enterprise Clarity} + \text{Multi-Agent Swarm Intelligence} + \text{Human-in-the-Loop Governance}$$

- **Target Persona**: Hotel General Managers, Resort Operations Directors, Front Desk Supervisors, Executive Housekeepers, and Chief Engineers.
- **Tone**: Professional, crisp, approachable, calm, authoritative, and trustworthy enterprise operations software.
- **Anti-Patterns**:
  - ❌ **NOT** a generic AI startup page with glowing cyan/purple gradients or sci-fi floating glass orbs.
  - ❌ **NOT** a high-frequency trading crypto terminal with flashing neon lights.
  - ❌ **NOT** a toy-like cartoon interface or cluttered legacy hospitality software.
  - ❌ **NOT** a chaotic layout without visual hierarchy or structured design tokens.

---

## 2. Active Theme Specification (Odoo Clean Enterprise Theme)

> **ACTIVE DIRECTIVE**: Atria Intelligence operates under the **Odoo Clean Enterprise Design System**.
> - **Theme Mode**: Enforced Light Theme with clean eggshell neutrals, crisp whites, rich eggplant purple, and subtle teal accents.
> - **Primary Principle**: Atria OS delivers **Enterprise Hotel Operations Software** with integrated AI swarm decision intelligence.
> - **Prohibited Aesthetics**: No dark mode glows, no sci-fi holographic elements, no unstyled dark backgrounds, no TypeScript.

### Core Design Tokens

| Token Name | Hex Value | Tailwind Class / CSS Var | Role & Usage |
| :--- | :--- | :--- | :--- |
| **Root Background** | `#F9FAFB` | `bg-background` / `--background` | Page canvas & background fill |
| **Main Surface / Card** | `#FFFFFF` | `bg-surface` / `--surface` | Cards, modals, containers, sidebar fill |
| **Secondary Surface** | `#F3F4F6` | `bg-surface-secondary` / `--surface-secondary` | Table headers, inactive tabs, input fill |
| **Surface Hover** | `#E5E7EB` | `bg-surface-hover` | Interactive card & list hover state |
| **Text Foreground** | `#111827` | `text-foreground` / `--foreground` | Primary text, titles, headings |
| **Muted Text** | `#6B7280` | `text-muted-foreground` / `--muted-foreground` | Subtitles, body copy, descriptions |
| **Structural Border** | `#E5E7EB` | `border-border` / `--border` | Subtle 1px borders for cards & tables |
| **Odoo Purple (Primary)** | `#714B67` | `bg-odoo-purple`, `text-odoo-purple` | Primary brand color, hero accent, headers |
| **Purple Hover** | `#5D3D55` | `bg-odoo-purple-hover` | Primary button hover state |
| **Odoo Teal (Secondary)**| `#017E84` | `bg-odoo-teal`, `text-odoo-teal` | Secondary CTAs, active badges, SVG scribbles |
| **Teal Hover** | `#016469` | `bg-odoo-teal-hover` | Secondary hover state |

---

## 3. Departmental & Status Color System

Atria OS uses a **Pastel Background + High-Contrast Text** status badge system for instant readability:

| Status / Department | Background | Text Color | Icon / Indicator | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Critical / Danger** | `#FEE2E2` | `#991B1B` | `AlertTriangle` / Red Dot | AC Breakdown, VIP Delay, Out of Order |
| **Success / Clean** | `#DCFCE7` | `#166534` | `CheckCircle2` / Green Dot | Inspection Passed, Task Complete |
| **Warning / Analysis** | `#FEF9C3` | `#854D0E` | `Clock` / Amber Dot | Cleaning In Progress, Evaluating Rate |
| **Info / Consensus** | `#E0F2FE` | `#075985` | `Sparkles` / Blue Dot | Swarm Consensus Reached, Proposal Draft |
| **Front Desk** | `#F3E8FF` | `#6B21A8` | `Users` | VIP Arrival, Check-in Escalation |
| **Housekeeping** | `#E0F2FE` | `#0369A1` | `Sparkles` | Room Turnaround, Turndown Service |
| **Maintenance** | `#FFEDD5` | `#C2410C` | `Wrench` | Equipment Maintenance, HVAC Dispatch |
| **Revenue AI** | `#DCFCE7` | `#15803D` | `TrendingUp` | Compensation Budget, Rate Strategy |

---

## 4. Typography System & Accent Handwritten Fonts

Atria OS pairs a clean, authoritative sans-serif body stack with warm, organic handwritten accents for annotations, typewriter elements, and marker underlines.

### Font Stacks
1. **Primary Sans Stack**: `Inter`, `Roboto`, system fallbacks (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`).
2. **Accent Handwritten Stack**: `Caveat`, `Kalam`, `Shadows Into Light`, `cursive` (`font-accent`, `font-caveat`, `font-handwritten`).

### Font Scale & Classes
- **Display Hero Title**: `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]`
- **Handwritten Accent Copy**: `font-caveat font-accent text-2xl sm:text-3xl font-bold text-odoo-purple`
- **Section Headers (H2)**: `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground`
- **Card / Module Headers (H3)**: `text-lg sm:text-xl font-bold text-foreground`
- **Subheads / Section Labels (H4)**: `text-sm sm:text-base font-bold`
- **Body Text**: `text-sm sm:text-base text-muted-foreground leading-relaxed`
- **Micro Badges / Monospace Tags**: `text-[11px] font-mono font-bold uppercase tracking-wider`

---

## 5. Layout, Spacing & Container Scale

- **Major Section Vertical Padding**: `pt-12 pb-10 md:pt-16 md:pb-14` or `py-16 md:py-24`
- **Container Max Width**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Hero & Headline Text Boundary**: `max-w-4xl mx-auto`
- **Card Internal Padding**: `p-5 sm:p-6` or `p-6 sm:p-8`
- **Border Radius**:
  - Small pills & status badges: `rounded-full`
  - Buttons & input fields: `rounded-xl` (12px)
  - Cards & content containers: `rounded-2xl` (16px)
  - Major feature panels & command shells: `rounded-3xl` (24px)
- **Shadow Tokens**:
  - `shadow-odoo`: `0 4px 20px rgba(0, 0, 0, 0.05)`
  - `shadow-odoo-hover`: `0 10px 40px rgba(0, 0, 0, 0.08)`

---

## 6. Interactive Components & Navigation

### 6.1 Sticky Navigation Bar (`/components/navbar/Navbar.jsx`)
- **Positioning**: `sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border`
- **Brand Logo**: Monogram `Atria` monogram logo + `Atria OS` brand text + subtitle badge.
- **Center Links**: Clean horizontal link pills (`Overview`, `App Modules`, `Swarm Intelligence`, `Incident Flow`, `Use Cases`).
- **Right Actions**: `Sign In` link (`/sign-in`), `Launch Command Center` CTA button (`/dashboard`).
- **Mobile Support**: Accessible responsive hamburger drawer with smooth slide-over transition.

### 6.2 Odoo Hero Section (`/components/hero/OdooHero.jsx`)
- **Micro Badge**: `AI-Powered Resort Operations Platform` pill with spinning sparkle icon.
- **Headline**: `"Turn Resort Complexity Into Coordinated Intelligence"` with custom SVG marker scribble underline on `"Coordinated Intelligence"`.
- **Animated Typewriter**: Real-time typing text cycling through resort operational departments (`Housekeeping & Turndown`, `Front Desk & VIP Arrivals`, `HVAC & Maintenance`, `Yield & Revenue AI`, `Live Incident Resolution`).
- **CTAs**:
  - Primary: `Launch Command Center →` (routes to `/dashboard`, styled with `bg-odoo-teal hover:bg-odoo-teal-hover`).
  - Secondary: `Sign In to Atria OS` (routes to `/sign-in`, styled with `border border-odoo-purple/30 text-odoo-purple`).

### 6.3 6-Column App Icon Module Grid (`/components/grid/ModuleGrid.jsx`)
- Inspired by Odoo's signature enterprise dashboard app grid.
- Features 6 core operational modules:
  1. **Front Desk VIP** (Purple theme icon)
  2. **Housekeeping Swarm** (Teal theme icon)
  3. **HVAC & Maintenance** (Amber theme icon)
  4. **Revenue & Yield AI** (Green theme icon)
  5. **Swarm Consensus** (Indigo theme icon)
  6. **Manager Command Center** (Slate theme icon)

---

## 7. Application Page Architecture & Routing

Atria OS consists of three primary user experiences:

### 7.1 Public Landing Page (`/app/page.js`)
Presents the enterprise product vision, problem statement, swarm architecture, core live incident walkthrough, and operational use cases.
- `OdooHero`: Hero banner with SVG scribble underline & typewriter effect.
- `ModuleGrid`: 6-column Odoo-style app icon ecosystem grid.
- `ProblemSection`: Highlighting operational silos in luxury resort management.
- `ProcessFlow`: 4-step multi-agent swarm resolution pipeline.
- `AgentsSection`: Detailed cards for Front Desk, Housekeeping, Maintenance, and Revenue agents.
- `CoreScenarioSection`: Walkthrough of the Room 401 AC Failure & VIP Arrival crisis.
- `HumanControlSection`: Interactive demonstration of manager approval & modification.
- `ExecutionTimeline`: Real-time task dispatch & state synchronization showcase.
- `UseCasesGrid`: 6 real-world resort operational scenarios.
- `WhySection`: Strategic differentiators.
- `CtaSection` & `Footer`.

### 7.2 Sign-In & Authentication Page (`/app/sign-in/page.js`)
- Clean, Odoo-inspired dual-column card design.
- Features **Quick Demo Persona Presets** for instant one-click login during hackathon demonstrations:
  - *General Manager* (Full Approval Authority)
  - *Front Desk Manager* (Guest Relations & VIP)
  - *Executive Housekeeper* (Turnaround & Duty Roster)
  - *Chief Engineer* (Maintenance & HVAC)

### 7.3 Locked-Viewport Command Center (`/app/dashboard/page.js`)
- **Layout Structure**: Fixed screen height (`h-screen overflow-hidden flex flex-col`) to prevent page scrolling double-navbars.
- **Top Navigation Bar**: System status badge, live clock, active scenario switcher, real-time WebSocket indicator.
- **3-Pane Operational Workbench**:
  1. **Left Pane (Incident Feed & Filters)**: Live incoming incident queue with severity indicators, guest VIP badges, and department tags.
  2. **Center Pane (Multi-Agent Swarm Workbench)**: Live telemetry stream showing Front Desk, Housekeeping, Maintenance, and Revenue agent reasoning in real time.
  3. **Right Pane (Consensus Engine & Task Dispatch)**: Actionable proposal summary, financial & guest impact scorecards, inline modification controls, and dispatch trigger.

---

## 8. Manager Decision Interface & Human-in-the-Loop Governance

Atria OS strictly enforces human oversight over AI decisions:

- **100% Manager Control**: AI agents synthesize proposals; resort managers review, modify, approve, or reject.
- **Structured Proposal Card**:
  - Concise summary of the recommended action plan.
  - Detailed task breakdown tagged by department and assigned staff member.
  - Operational rationale and trade-off narrative.
  - Financial, guest satisfaction, and operational risk metrics.
- **Inline Modification Controls**:
  - Allows managers to edit task details (e.g. change room assignment, adjust compensation value).
  - Preserves original AI recommendation in `original_plan` while capturing modified values and modification rationale.
- **Append-Only Audit Trail**:
  - Every decision, approval, modification diff, and rejection is permanently recorded in the database and displayed in the decision history tab.

---

## 9. Code & Implementation Conventions

1. **Pure JavaScript / JSX Only**:
   - All components are written in `.js` and `.jsx`.
   - Never introduce TypeScript (`.ts`, `.tsx`, type definitions, `tsconfig.json`).
2. **Next.js 14 App Router**:
   - App pages placed inside `/app/`.
   - Client components explicitly declared with `'use client';`.
3. **Tailwind CSS Utility First**:
   - All styling built using standard Tailwind CSS classes matching the design tokens (`bg-odoo-purple`, `bg-odoo-teal`, `text-foreground`, `shadow-odoo`, `rounded-2xl`).
4. **Icon System**:
   - Use `lucide-react` icons exclusively with default 2px stroke width.
5. **No Direct Database Calls in Frontend**:
   - All UI components communicate with the backend via API endpoints in `lib/api.js`.

---

## 10. Summary Checklist for Frontend Modifications

Before submitting any code or UI modifications, verify that:
- [x] Theme colors conform strictly to the Odoo Clean Enterprise palette (`#714B67` Purple, `#017E84` Teal, `#F9FAFB` Background, `#FFFFFF` Surface).
- [x] All typography uses standard `Inter`/`Roboto` sans-serif or `Caveat` handwritten accents.
- [x] Responsive layout works seamlessly across Desktop ($\ge 1024\text{px}$), Tablet ($768\text{px}-1023\text{px}$), and Mobile ($< 768\text{px}$).
- [x] All files use `.js` and `.jsx` extensions (No TypeScript).
- [x] Status indicators use the Pastel Background + High Contrast Text standard.

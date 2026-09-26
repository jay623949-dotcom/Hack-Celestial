# RESORT 360 — Design System Specification

> **SINGLE SOURCE OF TRUTH (FRONTEND UI & UX)**  
> **Location**: `/docs/design.md`  
> This document specifies the exact visual identity, tokens, component conventions, interaction patterns, and design rules implemented in the **RESORT 360** public landing page and future command center modules.  
> Future AI coding assistants and developers **MUST** read this file before creating or modifying any frontend page or component.

---

## 1. Brand Identity
Resort 360 is an **AI-powered resort operations platform**. It connects operational context across departments (Front Desk, Housekeeping, Maintenance, and Revenue Management), lets specialized AI agents reason together, and gives managers one clear action plan to approve and execute.

### The Aesthetic Equation
$$\text{Premium Hospitality} + \text{Enterprise Operations} + \text{Modern AI} + \text{Calm Intelligence}$$

- **Target Persona**: Hotel General Managers, Front Desk Supervisors, Executive Housekeepers, Chief Engineers, and Resort Directors.
- **Tone**: Calm, authoritative, restrained, intentional, and trustworthy.
- **Anti-Patterns**:
  - ❌ **NOT** an AI startup landing page with purple gradients or floating blobs.
  - ❌ **NOT** a high-frequency trading crypto terminal with flashing lights.
  - ❌ **NOT** a sci-fi cyberpunk HUD or toy-like cartoon interface.
  - ❌ **NOT** a dashboard dumped into the landing page too early.

---

---

## 2. UI Design Reset — Active Specification (Light Theme Only)

> **ACTIVE DIRECTIVE**: Resort 360 is operating under the **UI Design Reset**.
> - **Dark Mode**: Temporarily disabled. The light theme is enforced as the sole default, and the theme toggle is hidden.
> - **Primary Principle**: Resort 360 looks and behaves like **Enterprise Hotel Operations Software** with subtle, integrated AI decision intelligence.
> - **Prohibited Aesthetics**: No generic AI dashboards, no neon purple/cyan glows, no sparkles (`✨`), no holographic glassmorphism, no crypto terminal motifs.

### Color Palette (Light Theme Only)
- **Background**: `#FBFBFA` (Light warm neutral gray)
- **Main Surfaces & Cards**: `#FFFFFF` (Pure white)
- **Secondary Surfaces**: `#F8FAFC` / `#F1F5F9` (Subtle muted gray for table headers and inactive states)
- **Surface Hover**: `#F1F5F9`
- **Text (Foreground)**: `#0F172A` / `#1E293B` (Dark charcoal slate for high contrast and readability)
- **Muted Text**: `#64748B` (Clear, legible secondary gray)
- **Borders**: `#E2E8F0` / `#CBD5E1` (Subtle, crisp 1px neutral borders instead of drop shadows)
- **Primary Teal Accent**: `#0F766E` (Active navigation, primary buttons, critical status, links, AI highlights)
- **Primary Light Surface**: `#F0FDFA` (Subtle teal tint for operational consensus summaries)
- **Primary Border**: `#CCFBF1`

---

## 3. Dark Theme (Underlying Architecture Preserved)
Dark theme tokens remain defined in the underlying CSS variables for future re-enablement, but dark mode switching is currently neutralized in `ThemeProvider.jsx` and `ThemeToggle.jsx`.

---

## 6. Typography
- Modern sans-serif stack: `Inter`, system UI font fallback (`-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`).
- Weights are used strictly to define hierarchy:
  - Extra Bold (`font-extrabold` / 800) for hero and section titles.
  - Bold (`font-bold` / 700) for card titles, agent titles, and badges.
  - Medium (`font-medium` / 500) for navigation links and status copy.
  - Regular (`font-normal` / 400) for descriptions and trade-off narratives.
- Monospace font (`font-mono`) is reserved for timestamps, department tags, incident numbers (`#8092`), and operational telemetry badges.

---

## 7. Font Scale
- **Display Hero**: `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]`
- **Section Headers (H2)**: `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight`
- **Card / Feature Headers (H3)**: `text-lg sm:text-xl font-bold`
- **Subheads (H4)**: `text-sm sm:text-base font-bold`
- **Body Text**: `text-sm sm:text-base text-muted-foreground leading-relaxed`
- **Caption / Meta**: `text-xs text-muted-foreground`
- **Micro Badges**: `text-[10px]` or `text-[11px] font-mono font-bold uppercase tracking-wider`

---

## 8. Spacing
- Major section vertical padding: `py-20 md:py-28`
- Large CTA section padding: `py-24 md:py-32`
- Container max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Hero & CTA text width: `max-w-4xl` or `max-w-3xl mx-auto`
- Card internal padding: `p-5 sm:p-6` or `p-6 sm:p-8`
- Component gaps: `gap-2.5` to `gap-4` for badge grids, `gap-6` for card grids.

---

## 9. Border Radius
- Small pills, status dots, and badges: `rounded-full`
- Buttons & input controls: `rounded-xl` (12px)
- Cards & intermediate containers: `rounded-2xl` (16px)
- Major product visualization frames & command shells: `rounded-3xl` (24px)

---

## 10. Shadows
- **Light Mode**:
  - `shadow-soft`: `0 2px 12px -2px rgba(7, 17, 31, 0.04), 0 1px 3px -1px rgba(7, 17, 31, 0.02)`
  - `shadow-elevated`: `0 16px 36px -8px rgba(7, 17, 31, 0.1), 0 4px 12px -2px rgba(7, 17, 31, 0.03)`
- **Dark Mode**: Elevated depth is achieved primarily through **border definition (`border border-border`)** and surface elevation stepping (`bg-surface` vs `bg-surface-secondary`) rather than harsh drop shadows.

---

## 11. Buttons
- **Primary CTA**:
  `px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm shadow-soft transition-all duration-150`
- **Secondary Action**:
  `px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-foreground font-semibold text-xs sm:text-sm transition-colors`
- **Navbar Sign Up Button**:
  `px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-soft`
- **Navbar Sign In Link**:
  `px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors`

---

## 12. Navbar
- Sticky position: `sticky top-0 z-50 w-full backdrop-blur-md bg-surface/90 border-b border-border/70`
- Height: `h-16` (64px)
- Left: Monogram `360` badge + `RESORT 360` + subtitle `AI-Powered Resort Operations`
- Center: Capsule navigation links (`Overview`, `How It Works`, `AI Agents`, `Operations`)
- Right: Visible `Sign In` text link, `Sign Up →` primary button, divider line, and `ThemeToggle`
- Mobile: Accessible hamburger drawer with all navigation links and authentication buttons clearly laid out.

---

## 13. Hero
- Generous whitespace and restrained composition.
- Micro-copy label: `AI-POWERED RESORT OPERATIONS` in subtle pill.
- Dominant headline: `"Turn Resort Chaos Into Coordinated Action."`
- Supporting copy explains cross-department context, AI agent reasoning, and manager approval.
- Primary CTA: `Open Command Center →` (routes to `/sign-up` or `/dashboard`).
- Secondary CTA: `See How It Works` (smooth scroll to `#how-it-works`).
- Refined product visualization: An active incident box showing 10:40 AM Room 401 AC failure, 4 agent status indicators (`Front Desk ✓`, `Housekeeping •`, `Maintenance •`, `Revenue ✓`), and a subtle proposal preview. **Supports the hero instead of overpowering it.**

---

## 14. Cards
- Styling: `border border-border bg-surface rounded-2xl p-6 shadow-soft hover:border-primary/40 transition-colors`
- Internal hierarchy:
  - Top meta: mono badge, phase number, or status icon.
  - Title: Bold, clear heading.
  - Body: Concise, realistic hospitality explanation.
  - Bottom meta: Subtle footer line with timing or responsibility.

---

## 15. Product Visualizations
- Never use generic AI robots or glowing glass orbs.
- Use structured operational telemetry:
  - Incident number (`#8092`)
  - Timestamp (`10:40 AM`)
  - Guest loyalty tier (`Alexander Vance - Diamond VIP`)
  - Real room numbers (`Suite 401`, `Suite 505`)
  - Clear checkmarks (`✓ Guest experience protected`)

---

## 16. Section Spacing
- Every section is rhythmically separated with `py-20 md:py-28`.
- Alternating subtle background transitions: `bg-background` and `bg-surface-secondary/40 border-y border-border`.
- No adjacent sections share the exact same card layout pattern.

---

## 17. Icon Style
- Use `lucide-react` icons exclusively.
- Icon stroke: Default (2px).
- Sizing:
  - Button icons: `w-3.5 h-3.5` or `w-4 h-4`
  - Card header icons: `w-4 h-4` or `w-5 h-5` inside a `p-2` or `p-2.5` rounded container (`bg-primary/10 text-primary` or `bg-surface-secondary`).

---

## 18. Status Colors
- **Success**: `#22C55E` (Dark), `#15803D` (Light) — Ready, Inspected, Completed
- **Warning / Progress**: `#F59E0B` (Dark), `#B45309` (Light) — In Progress, Analyzing
- **Critical / Danger**: `#EF4444` (Dark), `#DC2626` (Light) — Out of Order, Breakdown
- **Accessibility Rule**: Always combine **Color + Icon + Explicit Text** (never color alone).

---

## 19. Animation Rules
- Animations must feel calm, intentional, and expensive.
- `animate-pulse` is strictly reserved for live status indicators and telemetry dots.
- `transition-all duration-150` for interactive button hover effects.
- `transition-colors duration-200` for light/dark theme shifts.
- No bouncing bouncy castles, no spinning 3D cubes, no confetti.

---

## 20. Responsive Rules
- **Desktop ($\ge 1024\text{px}$)**: Full horizontal 6-step flow, 4-column agent and differentiator grids, side-by-side hero composition.
- **Tablet ($768\text{px} - 1023\text{px}$)**: 2-column grids for agents and use cases; horizontal scroll or stacked stages.
- **Mobile ($< 768\text{px}$)**: Full-width stacked cards, sticky navbar with mobile drawer, accessible Sign Up and Sign In buttons.

---

## 21. Accessibility
- All text meets WCAG AA contrast ratio against surfaces.
- Interactive elements possess clear hover and active focus rings.
- Images and icons carry descriptive text or `aria-hidden` attributes.
- Theme switching is announced without screen reader disruption.

---

## 22. Component Conventions
- **JavaScript Only**: All components are written in pure `.js` and `.jsx`. Never create `.ts` or `.tsx`.
- Reusable UI primitives in `components/ui/` (`ThemeToggle.jsx`, `ThemeProvider.jsx`).
- Landing page sections in `components/sections/` and `components/hero/`, `components/navbar/`, `components/footer/`.
- All styling through Tailwind classes referencing custom CSS properties.

---

## 23. Theme Tokens Reference Table

| Tailwind Class | Light Hex | Dark Hex | Role |
| :--- | :--- | :--- | :--- |
| `bg-background` | `#FBFBFA` | `#07111F` | Root background |
| `bg-surface` | `#FFFFFF` | `#0B1626` | Card & container fill |
| `bg-surface-secondary`| `#F5F5F3` | `#0F1C2E` | Secondary container fill |
| `bg-surface-hover` | `#ECECE8` | `#16263D` | Interactive card hover |
| `text-foreground` | `#1E293B` | `#F8FAFC` | Primary text |
| `text-muted-foreground`| `#64748B` | `#94A3B8` | Subtitle & descriptive text |
| `border-border` | `#E2E8F0` | `#1E2E45` | Structural borders |
| `bg-primary` | `#0F766E` | `#14B8A6` | Primary action buttons |
| `bg-primary-hover` | `#0D9488` | `#2DD4BF` | Hover state |
| `bg-primary-light` | `#F0FDFA` | `#062326` | Highlight banner fill |
| `border-primary/40` | `#99F6E4` | `#115E59` | Highlight banner border |

---

## 24. Design DO's
- ✅ Keep the landing page strictly focused on introducing the product and convincing operators.
- ✅ Use the deep bluish dark palette (`#07111F`) and warm white light palette (`#FBFBFA`).
- ✅ Maintain visible `Sign In` and `Sign Up` buttons in the navbar on desktop.
- ✅ Use real hospitality situations (VIP arrivals, AC failures, housekeeping turnaround, wedding blocks).
- ✅ Let future pages (e.g. Operations, Command Center, Reports) import and use these exact design tokens.

---

## 25. Design DON'Ts
- ❌ Do NOT dump an entire live interactive dashboard into the landing page.
- ❌ Do NOT use fake customer logos, fake testimonials, or fake metrics.
- ❌ Do NOT make every section `[Heading] + [Paragraph] + [3 Cards]`.
- ❌ Do NOT use generic startup phrases like "The future of hospitality."
- ❌ Do NOT use TypeScript.
- ❌ Do NOT use green as a brand color.

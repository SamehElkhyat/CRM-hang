# NexusCRM — Design System Reference

> **Scope: visuals only.** This document describes colors, typography, spacing, layout, components, and animation *look* — nothing about data models, state management, routing logic, or business rules. Use it to make a second project **look** identical. Do not port any logic from it; only markup structure/classes and styling.

---

## 1. Tech Stack Required to Reproduce This Look

Install these (styling/UI layer only):

```bash
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge
npm install framer-motion lucide-react
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-avatar @radix-ui/react-select @radix-ui/react-checkbox \
  @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-separator \
  @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-progress \
  @radix-ui/react-switch @radix-ui/react-toast
```

Base setup: **Tailwind CSS 3.x** + **shadcn/ui** (`"style": "default"`, `"baseColor": "slate"`, `"cssVariables": true`) + **Inter** font.

`components.json` (shadcn):
```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 2. Core Concept

A **dark, glassy, "premium SaaS" dashboard**: near-black navy background, one vivid cyan-blue accent, soft glow shadows, translucent/blurred surfaces, rounded-xl corners everywhere, and subtle framer-motion entrance animations on nearly every element.

---

## 3. Color Tokens

All colors are defined as **HSL triplets** (no `hsl()` wrapper) in CSS variables, then consumed via Tailwind as `hsl(var(--token))`. This makes opacity modifiers (`bg-primary/20`, `text-primary/30`, etc.) work throughout the app.

### `src/index.css` — root tokens

```css
:root {
  --background: 222 47% 6%;
  --foreground: 210 40% 98%;

  --card: 222 47% 8%;
  --card-foreground: 210 40% 98%;

  --popover: 222 47% 8%;
  --popover-foreground: 210 40% 98%;

  --primary: 199 89% 48%;              /* cyan-blue accent */
  --primary-foreground: 222 47% 6%;

  --secondary: 222 47% 12%;
  --secondary-foreground: 210 40% 98%;

  --muted: 222 47% 14%;
  --muted-foreground: 215 20% 55%;

  --accent: 199 89% 48%;
  --accent-foreground: 222 47% 6%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;

  --success: 142 76% 36%;
  --success-foreground: 210 40% 98%;

  --warning: 38 92% 50%;
  --warning-foreground: 222 47% 6%;

  --info: 199 89% 48%;
  --info-foreground: 222 47% 6%;

  --border: 222 47% 16%;
  --input: 222 47% 16%;
  --ring: 199 89% 48%;

  --radius: 0.75rem;

  --sidebar-background: 222 47% 5%;
  --sidebar-foreground: 210 40% 90%;
  --sidebar-primary: 199 89% 48%;
  --sidebar-primary-foreground: 222 47% 6%;
  --sidebar-accent: 222 47% 10%;
  --sidebar-accent-foreground: 210 40% 98%;
  --sidebar-border: 222 47% 12%;
  --sidebar-ring: 199 89% 48%;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, hsl(199 89% 48%), hsl(199 89% 38%));
  --gradient-success: linear-gradient(135deg, hsl(142 76% 36%), hsl(142 76% 28%));
  --gradient-warning: linear-gradient(135deg, hsl(38 92% 50%), hsl(38 92% 40%));
  --gradient-destructive: linear-gradient(135deg, hsl(0 84% 60%), hsl(0 84% 50%));
  --gradient-purple: linear-gradient(135deg, hsl(262 83% 58%), hsl(262 83% 48%));
  --gradient-card: linear-gradient(135deg, hsl(222 47% 10%), hsl(222 47% 8%));
  --gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));

  /* Shadows */
  --shadow-glow: 0 0 40px -10px hsl(199 89% 48% / 0.3);
  --shadow-card: 0 4px 24px -4px hsl(222 47% 4% / 0.5);
  --shadow-elevated: 0 12px 40px -8px hsl(222 47% 4% / 0.6);

  /* Pipeline / kanban stage colors */
  --stage-lead: 199 89% 48%;         /* cyan */
  --stage-qualified: 262 83% 58%;    /* purple */
  --stage-proposal: 38 92% 50%;      /* amber */
  --stage-negotiation: 328 85% 58%;  /* pink */
  --stage-closed: 142 76% 36%;       /* green */
  --stage-lost: 0 84% 60%;           /* red */
}
```

This app is **dark-mode only** by design (the `.dark` class overrides `--background`/`--foreground` with the same values — light mode was never built out). If the second project needs a light mode too, treat this whole palette as the dark theme and design a light counterpart separately; don't assume one exists here.

### Color usage cheat-sheet

| Token | Role |
|---|---|
| `background` | Page canvas — near-black navy |
| `card` | Slightly lighter navy panel surface |
| `sidebar-background` | Slightly darker than page background |
| `primary` | Single accent color (cyan-blue) — buttons, active nav, links, focus rings, glow |
| `muted` / `muted-foreground` | Secondary text, subtle backgrounds, placeholders |
| `border` | Hairline dividers, card outlines |
| `success` / `warning` / `destructive` / `info` | Status semantics (green/amber/red/cyan) |
| `stage-*` | Kanban column / pipeline stage accent colors (cyan, purple, amber, pink, green, red) |

Ad-hoc accent colors also appear directly as Tailwind palette classes for stat-card icon tiles (not CSS vars): `emerald-500`, `blue-500`, `violet-500`, `amber-500` — each used as `from-{color}/20 to-{color}/5 border-{color}/20` gradient backgrounds with `text-{color}-400 bg-{color}-500/20` icon chips.

---

## 4. Typography

- **Font family:** Inter, loaded via Google Fonts, weights 300/400/500/600/700/800.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
```

```ts
// tailwind.config.ts
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
},
```

- **Scale used across the app** (Tailwind defaults, no custom scale):
  - Page title: `text-2xl font-bold`
  - Card/section title: `text-lg font-bold` or `text-2xl font-semibold tracking-tight` (shadcn `CardTitle`)
  - Stat value: `text-3xl font-bold tracking-tight`
  - Body: `text-sm`
  - Secondary/meta text: `text-xs text-muted-foreground`
  - Labels: `text-sm font-medium`

---

## 5. Spacing, Radius & Shadows

- **Border radius:** base `--radius: 0.75rem` (12px). Tailwind maps `rounded-lg` → `var(--radius)`, `rounded-md` → `radius - 2px`, `rounded-sm` → `radius - 4px`. Big surfaces (cards, panels, dialogs) generally use `rounded-xl`; pills/badges use `rounded-full`.
- **Page padding:** `p-6` for page content areas, `px-6` for header bar.
- **Grid gaps:** `gap-6` between dashboard cards, `gap-4` for form grids, `gap-3` for inline icon/text clusters.
- **Container:** centered, `padding: 2rem`, `2xl` breakpoint capped at `1400px`.
- **Shadows:**
  - `shadow-glow`: `0 0 40px -10px hsl(var(--primary)/0.3)` — used on primary buttons/logo mark on hover
  - `shadow-card`: `0 4px 24px -4px hsl(222 47% 4% / 0.5)`
  - `shadow-elevated`: `0 12px 40px -8px hsl(222 47% 4% / 0.6)` — used on hover-lift cards

```ts
// tailwind.config.ts
boxShadow: {
  glow: "0 0 40px -10px hsl(var(--primary) / 0.3)",
  card: "0 4px 24px -4px hsl(222 47% 4% / 0.5)",
  elevated: "0 12px 40px -8px hsl(222 47% 4% / 0.6)",
},
```

---

## 6. Custom Utility Classes (`@layer components` in `src/index.css`)

```css
.glass-card {
  @apply bg-card/80 backdrop-blur-xl border border-white/5;
  background: var(--gradient-glass);
}

.glow-primary {
  box-shadow: var(--shadow-glow);
}

.gradient-text {
  @apply bg-clip-text text-transparent;
  background-image: var(--gradient-primary);
}

.stat-card {
  @apply relative overflow-hidden rounded-xl p-6 transition-all duration-300;
  background: var(--gradient-card);
  border: 1px solid hsl(var(--border));
}
.stat-card:hover {
  @apply border-primary/30;
  box-shadow: var(--shadow-glow);
}

.pipeline-card {
  @apply bg-card/90 backdrop-blur-sm rounded-lg p-4 cursor-grab active:cursor-grabbing;
  border: 1px solid hsl(var(--border));
  transition: all 0.2s ease;
}
.pipeline-card:hover {
  @apply border-primary/40;
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}

.nav-item {
  @apply flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground transition-all duration-200;
}
.nav-item:hover {
  @apply bg-sidebar-accent text-foreground;
}
.nav-item.active {
  @apply bg-primary/10 text-primary;
}

.table-row-hover {
  @apply transition-colors duration-150;
}
.table-row-hover:hover {
  @apply bg-muted/30;
}

.input-search {
  @apply bg-muted/50 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20;
}

.badge-stage {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.avatar-ring {
  @apply ring-2 ring-primary/20 ring-offset-2 ring-offset-background;
}
```

Custom scrollbar (thin, muted, matches theme):

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: hsl(var(--background)); }
::-webkit-scrollbar-thumb { background: hsl(var(--muted)); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }
```

---

## 7. Animation Language (Framer Motion)

Nearly every mounted element fades/slides in. Keep this consistent site-wide:

- **Page title:** `initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}`
- **Subtitle:** `initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}`
- **Stat cards (staggered):** `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}`
- **Table rows (staggered):** `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: index * 0.03 }}` wrapped in `<AnimatePresence>`
- **Sidebar mount:** slides in from `x: -280` to `x: 0`
- **Active nav pill:** shared-layout indicator via `layoutId="activeNav"`, spring `{ type: 'spring', stiffness: 380, damping: 30 }`
- **Small popovers/selection bars:** `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}`

Tailwind keyframes/utilities (`tailwind.config.ts` + `index.css`) for CSS-only cases:

```ts
keyframes: {
  "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
  "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
  "slide-in-right": { from: { transform: "translateX(100%)", opacity: "0" }, to: { transform: "translateX(0)", opacity: "1" } },
  "slide-in-left": { from: { transform: "translateX(-100%)", opacity: "0" }, to: { transform: "translateX(0)", opacity: "1" } },
  "slide-in-up": { from: { transform: "translateY(20px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
  "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
  "scale-in": { from: { transform: "scale(0.95)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
  shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
  pulse: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
},
animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
  "slide-in-right": "slide-in-right 0.3s ease-out",
  "slide-in-left": "slide-in-left 0.3s ease-out",
  "slide-in-up": "slide-in-up 0.4s ease-out",
  "fade-in": "fade-in 0.4s ease-out",
  "scale-in": "scale-in 0.3s ease-out",
  shimmer: "shimmer 2s linear infinite",
  pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
},
```

Hover micro-interactions: buttons/cards use `transition-all duration-200` to `duration-300`; hover-lift cards use `transform: translateY(-2px)` plus a shadow swap; icon-tile decorations on stat cards scale up (`group-hover:scale-150`) on a blurred radial blob.

---

## 8. Global Layout Shell

**Structure:** fixed left sidebar (256px) + main content offset by the same amount, sticky blurred header inside main.

```tsx
// Layout — visual structure only
<div className="min-h-screen bg-background">
  <Sidebar /> {/* fixed left-0 top-0 h-screen w-64 */}
  <main className="ml-64 min-h-screen">
    {/* page content, each page renders its own <Header /> + content */}
  </main>
</div>
```

### Sidebar (`w-64`, fixed, `bg-sidebar`)

```tsx
<motion.aside
  initial={{ x: -280 }} animate={{ x: 0 }}
  className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col bg-sidebar border-r border-sidebar-border"
>
  {/* Logo block */}
  <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
    <div className="relative">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
        {/* icon */}
      </div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-sidebar" />
    </div>
    <div>
      <h1 className="text-lg font-bold text-foreground">Brand Name</h1>
      <p className="text-xs text-muted-foreground">Tagline</p>
    </div>
  </div>

  {/* Nav — see .nav-item / .active classes above, w-5 h-5 icons, optional trailing count Badge */}
  <nav className="flex-1 px-3 py-4 overflow-y-auto">
    <div className="space-y-1">{/* nav-item links */}</div>

    {/* Optional highlight panel */}
    <div className="mt-8 mx-1 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
      {/* progress bar: h-2 bg-muted rounded-full overflow-hidden, inner motion.div h-full bg-primary rounded-full */}
    </div>
  </nav>

  {/* User profile footer */}
  <div className="p-4 border-t border-sidebar-border">
    {/* avatar-ring avatar + name/role + chevron, wrapped in dropdown */}
  </div>
</motion.aside>
```

### Header (sticky, per-page, blurred)

```tsx
<header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
  <div className="flex items-center justify-between h-16 px-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    <div className="flex items-center gap-3">
      {/* search trigger button w-64 justify-start bg-muted/50 with ⌘K kbd hint */}
      {/* icon buttons: variant="ghost" size="icon" (notifications, help) */}
      {/* primary CTA: <Button className="gap-2 glow-primary"><Plus/>Add New</Button> */}
    </div>
  </div>
</header>
```

---

## 9. Component Patterns

### Buttons (`shadcn` cva variants)

```ts
variants: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
},
size: {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
},
```
Base: `rounded-md text-sm font-medium`, focus ring `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`, icons auto-sized `[&_svg]:size-4`. Primary CTA buttons in the header additionally get `glow-primary`.

### Cards (shadcn base)

```tsx
<div className="rounded-lg border bg-card text-card-foreground shadow-sm">
  <div className="flex flex-col space-y-1.5 p-6">        {/* CardHeader */}
    <h3 className="text-2xl font-semibold leading-none tracking-tight">Title</h3>
    <p className="text-sm text-muted-foreground">Description</p>
  </div>
  <div className="p-6 pt-0">Content</div>                {/* CardContent */}
  <div className="flex items-center p-6 pt-0">Footer</div> {/* CardFooter */}
</div>
```

### Stat Card (dashboard KPI tile — decorative gradient + icon chip)

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
  className="relative overflow-hidden rounded-xl p-6 border transition-all duration-300 hover:shadow-glow cursor-pointer group bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/20"
>
  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-xl group-hover:scale-150 transition-transform duration-500" />
  <div className="relative z-10">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-xl text-emerald-400 bg-emerald-500/20">{/* icon */}</div>
      <div className="flex items-center gap-1 text-sm font-medium text-success">{/* trend arrow + % */}</div>
    </div>
    <p className="text-sm text-muted-foreground mb-1">Label</p>
    <p className="text-3xl font-bold text-foreground tracking-tight">Value</p>
  </div>
</motion.div>
```
Four accent pairs rotate across stat tiles: emerald, blue, violet, amber — each as `from-{c}-500/20 to-{c}-500/5 border-{c}-500/20` + `text-{c}-400 bg-{c}-500/20` icon chip.

### Badges

```ts
default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
outline: "text-foreground",
```
Base: `rounded-full px-2.5 py-0.5 text-xs font-semibold border`. Status badges use `variant="outline"` plus a tinted class, e.g. `bg-success/20 text-success border-success/30` (active), `bg-primary/20 text-primary border-primary/30` (lead), `bg-muted text-muted-foreground border-muted` (inactive).

### Inputs

Default shadcn input; search fields additionally use `.input-search` (`bg-muted/50`, focus ring `ring-2 ring-primary/20`), typically with a leading `Search` icon absolutely positioned (`absolute left-3 top-1/2 -translate-y-1/2`).

### Tables

```tsx
<div className="rounded-xl border border-border overflow-hidden">
  <table className="w-full">
    <thead className="bg-muted/30">
      <tr><th className="text-left p-4 text-sm font-medium text-muted-foreground">Col</th></tr>
    </thead>
    <tbody>
      <tr className="table-row-hover border-t border-border">
        <td className="p-4">Cell</td>
      </tr>
    </tbody>
  </table>
</div>
```
Rows stagger in via `AnimatePresence`/`motion.tr` as described in §7.

### Dialogs / Modals

shadcn `Dialog` — centered overlay, `DialogContent` default width override per use-case (e.g. `sm:max-w-[500px]`), `DialogHeader` → `DialogTitle` + `DialogDescription`, form fields laid out `grid gap-4 py-4` with `grid-cols-2` for paired fields, `DialogFooter` right-aligns Cancel (outline) + primary action buttons.

### Dropdown Menus

Used for user profile, notifications, row actions (`MoreHorizontal` trigger, `variant="ghost" size="icon"`). Notification items use a stacked layout: `flex flex-col items-start gap-1 py-3` with title / muted description / `text-primary` timestamp lines.

### Avatars

`Avatar` + `AvatarImage` + `AvatarFallback` (initials). Profile/header avatars get `.avatar-ring` (`ring-2 ring-primary/20 ring-offset-2 ring-offset-background`).

### Kanban / Pipeline Cards

`.pipeline-card` (see §6) — draggable-looking card (`cursor-grab`), lifts 2px and gains an elevated shadow + `border-primary/40` on hover. Column headers use the `stage-*` color tokens as a small dot/accent per column.

---

## 10. Icons

**Library:** `lucide-react` exclusively. Sizing convention:
- Nav / section icons: `w-5 h-5`
- Inline/meta icons: `w-4 h-4`
- Tiny inline icons (badges, kbd hints): `w-3 h-3`

Icons inherit color via `text-*` classes; never hard-coded fills.

---

## 11. Charts

`recharts`, styled to match the dark theme: transparent backgrounds, `stroke`/`fill` driven by the same HSL CSS variables (primary, success, stage colors), gridlines at low-opacity `border` color, tooltips styled as small `bg-popover border border-border rounded-lg` cards.

---

## 12. What NOT to Copy

Per the user's request, this reference is **presentation only**. When applying it to the second project, do **not** bring over:
- Data models / TypeScript interfaces (`Contact`, `Deal`, etc.)
- State management (`CRMContext`, hooks, mock data)
- Routing logic, CRUD handlers, filtering/search logic
- Any business rules

Only reuse: CSS variables/tokens, Tailwind config, the custom utility classes in §6, component visual variants/classNames, layout structure/spacing, and the animation timings/easings. Wire all of it up to the second project's own data and logic.

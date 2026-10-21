# Design System — "Engineering Log"

A dark, console-inspired system tuned to read like a monitoring dashboard:
restrained, technical, and premium — not "gamer." One signature accent, strict
semantics for status, and a monospace "system voice" that recurs as labels.

Colors are defined once as CSS variables in [`app/globals.css`](app/globals.css)
and mapped to Tailwind utilities in [`tailwind.config.ts`](tailwind.config.ts),
so a token can be used as `text-accent` **or** `var(--accent)`.

---

## Design Tokens

### Color

| Token | Value | Tailwind | Role |
|-------|-------|----------|------|
| `--bg` | `#07090d` | `bg-bg` | Page background (deep ink) |
| `--surface` | `#0b0e14` | `bg-surface` | Inset fields, chips |
| `--panel` | `#0f131b` | `bg-panel` | Cards / panels |
| `--raised` | `#151a23` | `bg-raised` | Elevated panels (console) |
| `--line` | `#1c2430` | `border-line` | Hairline borders |
| `--line-strong` | `#2a3340` | `border-line-strong` | Emphasized borders |
| `--text` | `#e7ebf2` | `text-ink` | Primary text |
| `--text-dim` | `#9aa6b6` | `text-dim` | Body / secondary |
| `--text-faint` | `#78849a` | `text-faint` | Labels, meta (AA-safe) |
| `--accent` | `#5de9a0` | `text-accent` | **Signature** — brand, links, focus |
| `--accent-dim` | `#1f6f4d` | `accent-dim` | Accent borders / bullets |
| `--ok` | `#46d48a` | `text-ok` | Status: shipped / operational |
| `--warn` | `#f5b14c` | `text-warn` | Status: active / caution |
| `--crit` | `#ff6b6b` | `text-crit` | Status: critical |
| `--info` | `#56c7f0` | `text-info` | Status: live / data |

**Rule:** `--accent` is the only brand color. `ok / warn / crit / info` are
**semantic only** — they appear inside status chips and dots, never as decoration.
This keeps the palette disciplined and makes a green dot _mean_ "operational."

### Typography

| Token | Family | Use |
|-------|--------|-----|
| `--font-sans` | Inter | Headings, body, prose |
| `--font-mono` | JetBrains Mono | The "system voice": labels, kickers, console, chips, code |

Loaded via a stylesheet `<link>` in `app/layout.tsx` (build stays offline-safe).
Scale: Tailwind defaults; headings `tracking-tight`; mono labels use
`tracking-[0.18em–0.22em]` uppercase at 11px (the recurring "kicker").

### Spacing, radius, motion

- **Shell:** `max-w-shell` (1120px) with `px-5 sm:px-8`. Sections: `py-20 sm:py-28`.
- **Radius:** `sm 4` · `md 8` · `lg 12` · `xl 16`.
- **Motion:** reveal `600ms cubic-bezier(.22,1,.36,1)`; boot typing time-based
  (`11ms`/char). All motion collapses under `prefers-reduced-motion`.

---

## The log-level system (severity)

Severity is a first-class language used across the whole site. Levels are
defined once in `lib/data.ts` (`LEVELS`) as `{ label, emoji, color, desc }`:

| Level | Glyph | Color | Meaning |
|-------|-------|-------|---------|
| `DEBUG` | 🔵 | info (cyan) | trace / detail |
| `INFO` | 🟢 | ok (green) | healthy signal |
| `WARN` | 🟡 | warn (amber) | needs attention |
| `ERROR` | 🔴 | crit (red) | something broke |
| `CRIT` | 🚨 | crit-bright | top priority — always highlighted |

**Priority is made visible:** `.logrow.lvl-CRIT` gets a persistent red wash +
left border (and `.lvl-WARN` a faint amber wash), so the eye lands on the most
important line first — in the hero stream, that's the `CRIT hiring` recommendation.

## Components

### LogLine
The core repeated unit: `[gutter] [time] LEVEL [source] message`. Everything
but `level` + children is optional, so one component renders a streaming console
line, an `architecture.log` bullet, or an achievement. Hover highlights the row
like a real log viewer; the left border tints to the row's level.

### SeverityCore
The single severity element. A three.js core rendered once in a fixed layer:
it sits in the hero's `#core-slot`, then flies (scroll-linked transform) to a
bottom-right dock where it becomes the readout — colour, score, P-level, active
item, `⚠` on warn/crit — and opens the console on click. Pages without a slot
start docked. Under reduced motion it snaps instead of flying.

### SevBadge
`SEV-1 / SEV-2 / SEV-3` incident badge on case files (critical/major/minor →
crit-bright / warn / info). Pairs emoji + label + color, never color alone.

### StatusChip
Status pill with a colored dot + uppercase mono label.

| Variant | Color | Use |
|---------|-------|-----|
| `LIVE` | info (cyan) | Deployed & reachable |
| `SHIPPED` | ok (green) | Built & complete |
| `ACTIVE` | warn (amber) | In progress |
| `ARCHIVED` | faint | Retired |

### CaseFile
Expandable **incident report**. Collapsed: id, title, SevBadge, status, year,
a `symptom` log line, stack chips. Expanded: incident meta → Problem → Approach
→ `architecture.log` (LogLines) → 🔴 ROOT CAUSE + 🟢 RESOLUTION → links.

- **States:** default · hover (`border-line-strong`) · open (`border-accent-dim`,
  chevron rotates). Row is a `<button>` with `aria-expanded` / `aria-controls`.
- **Motion:** height via `grid-template-rows: 0fr → 1fr` (no fixed heights).

### SectionHeader
`SECTION 0X` rule + `$ command` line + title + optional blurb. Gives every
section the same "shell readout" rhythm.

### Reveal
IntersectionObserver wrapper — fades/lifts children in once, with optional
`delay`. Falls back to visible if IO is unavailable or motion is reduced.

### Chip / `.chip`
`border-line` + `bg-surface`, mono 11px. Used for tech tags and coursework.

---

## Do's & Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use `--accent` for anything interactive/brand | Use `ok/warn/crit` for decoration |
| Add new content in `lib/data.ts` | Hardcode copy inside components |
| Reference colors via tokens | Introduce raw hex in components |
| Keep mono for "system" text, sans for prose | Set body copy in monospace |
| Pair every status color with its dot + label | Rely on color alone to signal status |

---

## Audit snapshot

| Category | Status |
|----------|--------|
| Token coverage (color) | ✅ 100% via CSS vars — no hardcoded hex in components |
| Naming consistency | ✅ single scale, semantic status names |
| Contrast (WCAG AA) | ✅ body/labels pass on dark surfaces |
| Reduced motion | ✅ honored globally |
| Keyboard / focus | ✅ visible focus ring on all interactives |

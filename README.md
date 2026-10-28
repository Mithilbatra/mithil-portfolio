# MITHIL // ENGINEERING LOG

A portfolio built like an **incident console**. Instead of the usual
_Skills → Projects → Contact_, the site boots up like a system coming online and
presents each project as a **case file**: the problem, the approach, the
architecture, the hard part, and what it taught me.

The concept isn't just decoration — one of the projects (**Resolvr**) is a real
incident-management app, so the portfolio's form doubles as proof of the work.

**Signature interaction — reactive severity.** The whole page reacts to the
priority of whatever you're viewing or hovering. A three.js **severity core**
starts in the hero; as you scroll it flies to the bottom-right corner and docks,
becoming the page's severity readout (score, P-level, the item you're on, and a
`⚠` triangle when it matters). Together with a soft edge-glow it shifts **green /
NOMINAL** → **amber / ELEVATED** on a SEV-2 item → **red / CRITICAL (P0)** on a
SEV-1 item or the hiring-signal card. Click the docked core to page on-call.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · three.js (hero
core, lazy-loaded) · anime.js (count-ups). Deploys to Vercel with no
configuration.

---

## ⚡ Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # lint
```

Requires Node 18.17+ (Node 20+ recommended).

---

## 🚀 Deploy to Vercel

This is a standard Next.js app, so Vercel auto-detects everything.

**Option A — GitHub + Vercel dashboard (recommended)**

1. Push this folder to a new GitHub repo.
2. Go to <https://vercel.com/new>, import the repo.
3. Framework preset: **Next.js** (auto-detected). Leave build settings default.
4. Click **Deploy**. Done — you'll get a `*.vercel.app` URL.

**Option B — Vercel CLI**

```bash
npm i -g vercel
vercel          # first run links/creates the project (follow prompts)
vercel --prod   # deploy to production
```

No environment variables are required.

> **Custom domain:** In the Vercel project → **Settings → Domains**, add your
> domain (e.g. `mithilbatra.com`) and follow the DNS instructions.

---

## ✏️ Editing your content

**Everything lives in one file: [`lib/data.ts`](lib/data.ts).** Change the text
there and the whole site updates. No component edits needed for normal updates.

### Your links (already wired up)

All profile, repo, and demo links are set in `lib/data.ts`. To change them later:

| What | Where in `lib/data.ts` |
|------|------------------------|
| GitHub / LinkedIn / LeetCode | `PROFILE.github` / `.linkedin` / `.leetcode` |
| Pit Wall repo + live demo | `CASE_FILES[0].links` |
| Resolvr repo | `CASE_FILES[1].links` |
| AI Mock Interviewer repo | `CASE_FILES[2].links` |

Email and phone are set from your résumé. If a case file has no live demo, just
delete its `live:` line — the button disappears automatically.

### Replace the résumé PDF

The **résumé** button serves `public/resume.pdf`. Drop a new file at that path
(same name) to update it.

### Add a project screenshot ("evidence")

Drop an image in `public/evidence/` and add `evidence: { src: "/evidence/<file>", caption: "…" }`
to that case file in `lib/data.ts`. Pit Wall's is a live capture of the deployed app.

---

## 🕹 Interactive features

| Feature | How to try it | Lives in |
|---|---|---|
| Command console / on-call responder | `⌘K` or `~`, then `help`, `open resolvr`, `page are you hiring?` | `components/Console.tsx`, `lib/console.mjs` |
| Resolvr, no Expo Go needed | Resolvr case file → phone replica → **Trigger test alert** → acknowledge before it escalates | `components/IncidentReplay.tsx`, `lib/incident.mjs` |
| Real status page | `/#status`, which pings every live project (Pit Wall, AI Interviewer) every 30s | `components/StatusPage.tsx`, `app/api/status` |
| Pit Wall race widget | Pit Wall case file (next GP + model podium) | `components/RaceWidget.tsx`, `app/api/pitwall` |
| Shareable incident pages + preview cards | `/incidents/<slug>` | `app/incidents/[slug]`, `lib/og-card.tsx` |
| Easter eggs | `sudo hire mithil`, `chaos`, or ↑↑↓↓←→←→BA | `components/Console.tsx` |

Run the logic tests with `npm test` (Node's built-in runner, no extra deps).

---

## 🗂 Project structure

```
app/
  layout.tsx        # fonts, metadata, <head>
  page.tsx          # assembles the sections
  globals.css       # design tokens + base styles
  icon.svg          # favicon
components/
  StatusBar.tsx     # fixed top bar (nav, live clock, ⌘K)
  Hero.tsx          # headline + #core-slot + telemetry strip
  EngineeringLog.tsx / CaseFile.tsx   # projects as severity-tagged case files
  Deployments.tsx   # experience (HSBC)
  Systems.tsx       # skills + certifications
  Telemetry.tsx     # achievements + education + coursework
  Contact.tsx       # contact channels + CRIT hiring-signal card
  Footer.tsx
  severity/         # SeverityProvider, useSeverityZone, AmbientGlow, SeverityCore (3D core + docked HUD)
  ui/               # Icons, Reveal, SectionHeader, StatusChip, LogLine, LevelBadge, SevBadge, CountUp
lib/
  data.ts           # ← ALL content lives here (levels, severities, copy)
```

### Tuning the reactive severity

- **Which items flare, and how hard:** each case file's `severity` (1/2/3) in
  `lib/data.ts` maps to crit/warn/ok. The contact hiring-signal card is hard-set
  to `crit` in `components/Contact.tsx`.
- **Glow intensity:** the `:root[data-sev="…"]` blocks in `app/globals.css`
  (`--glow-a`, `--glow-size`, `--sev-rgb`).
- **Core look, dock size, HUD labels/scores:** `components/severity/SeverityCore.tsx`
  (`HUD` map, `BASE`, `dockSize`) — dock CSS is `.core-hud*` in `globals.css`.
- **CGPA popup:** clicking the hero **CGPA** stat opens an animated trend chart
  (`components/CgpaChartModal.tsx`). Edit your semester SGPAs in `ACADEMIC.sgpa`
  (`lib/data.ts`) — the cumulative CGPA line is computed from them.

## 🎨 Design system

Tokens (color, type, spacing, motion) and component conventions are documented
in [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md). Colors are defined once as CSS
variables in `app/globals.css` and surfaced to Tailwind in `tailwind.config.ts`.

## ♿ Accessibility & performance

- Fully keyboard navigable with visible focus rings.
- Respects `prefers-reduced-motion` (boot sequence and reveals resolve instantly).
- Text meets WCAG AA contrast on the dark theme.
- ~93 kB first-load JS, statically prerendered.

---

Built by Mithil Batra.

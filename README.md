# MITHIL // ENGINEERING LOG

A portfolio built like an **incident console**. Instead of the usual
_Skills → Projects → Contact_, the site boots up like a system coming online and
presents each project as a **case file**: the problem, the approach, the
architecture, the hard part, and what it taught me.

The concept isn't just decoration — one of the projects (**Resolvr**) is a real
incident-management app, so the portfolio's form doubles as proof of the work.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · zero heavy
dependencies. Deploys to Vercel with no configuration.

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

### ⚠️ Before you deploy — fill in these placeholder links

Open `lib/data.ts` and replace every value marked `// TODO`:

| What | Where in `lib/data.ts` |
|------|------------------------|
| GitHub profile URL | `PROFILE.github` |
| LinkedIn URL | `PROFILE.linkedin` |
| LeetCode URL | `PROFILE.leetcode` |
| Pit Wall repo + live demo | `CASE_FILES[0].links` |
| Resolvr repo | `CASE_FILES[1].links` |
| AI Mock Interviewer repo | `CASE_FILES[2].links` |

The email (`mithil.batra05@gmail.com`) and phone are already set from your
résumé. If a case file has no live demo, just delete the `live:` line — the
button disappears automatically.

### Replace the résumé PDF

The **résumé** button serves `public/resume.pdf`. Drop a new file at that path
(same name) to update it.

---

## 🗂 Project structure

```
app/
  layout.tsx        # fonts, metadata, <head>
  page.tsx          # assembles the sections
  globals.css       # design tokens + base styles
  icon.svg          # favicon
components/
  StatusBar.tsx     # fixed console top-bar (nav, live clock, status)
  Hero.tsx          # headline + boot console + telemetry strip
  BootConsole.tsx   # the typing boot-sequence
  EngineeringLog.tsx / CaseFile.tsx   # projects as case files
  Deployments.tsx   # experience (HSBC)
  Systems.tsx       # skills + certifications
  Telemetry.tsx     # achievements + education + coursework
  Contact.tsx       # contact channels + recommendation card
  Footer.tsx
  ui/               # Icons, Reveal, SectionHeader, StatusChip
lib/
  data.ts           # ← ALL content lives here
```

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

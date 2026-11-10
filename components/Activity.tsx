import { PROFILE } from "@/lib/data";
import { buildGrid, parseCodeforces, parseGitHub, parseLeetCode, shader } from "@/lib/activity.mjs";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";

type Counts = Record<string, number>;

const handle = (url: string) => url.replace(/\/+$/, "").split("/").pop() ?? "";
// cached with the page (app/page.tsx revalidates every 6h), so visitors never wait on these sites
const opts = () => ({ next: { revalidate: 21600 }, signal: AbortSignal.timeout(10_000) });

async function github(): Promise<Counts> {
  const r = await fetch(`https://github.com/users/${handle(PROFILE.github)}/contributions`, opts());
  if (!r.ok) throw new Error(`github ${r.status}`);
  return parseGitHub(await r.text());
}

async function leetcode(): Promise<Counts> {
  const r = await fetch("https://leetcode.com/graphql", {
    ...opts(),
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: PROFILE.leetcode },
    body: JSON.stringify({
      query: "query($u:String!){matchedUser(username:$u){userCalendar{submissionCalendar}}}",
      variables: { u: handle(PROFILE.leetcode) },
    }),
  });
  const d = await r.json();
  return parseLeetCode(d.data.matchedUser.userCalendar.submissionCalendar);
}

async function codeforces(): Promise<Counts> {
  const r = await fetch(`https://codeforces.com/api/user.status?handle=${handle(PROFILE.codeforces)}`, opts());
  const d = await r.json();
  if (d.status !== "OK") throw new Error(`codeforces ${d.comment ?? d.status}`);
  return parseCodeforces(d.result);
}

const SOURCES = [
  { key: "github", label: "GitHub", unit: "contributions", url: PROFILE.github, load: github },
  { key: "leetcode", label: "LeetCode", unit: "submissions", url: PROFILE.leetcode, load: leetcode },
  { key: "codeforces", label: "Codeforces", unit: "submissions", url: PROFILE.codeforces, load: codeforces },
];

const STEP = 14; // 11px cell + 3px gap
const LEFT = 30; // weekday labels
const TOP = 18; // month labels
const FILL = [
  "var(--line)",
  "color-mix(in srgb, var(--accent) 28%, var(--surface))",
  "color-mix(in srgb, var(--accent) 52%, var(--surface))",
  "color-mix(in srgb, var(--accent) 76%, var(--surface))",
  "var(--accent)",
];
const fmt = (date: string, o: Intl.DateTimeFormatOptions) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });

/** One heatmap for GitHub contributions, LeetCode and Codeforces submissions over the last 53 weeks. */
export default async function Activity() {
  const data = await Promise.all(SOURCES.map((s) => s.load().catch(() => null)));
  const weeks = buildGrid(Object.fromEntries(SOURCES.map((s, i) => [s.key, data[i]])));
  const shade = shader(weeks);
  const days = weeks.flat();
  const totals = SOURCES.map((s) => days.reduce((a, d) => a + d.by[s.key], 0));
  const total = totals.reduce((a, b) => a + b, 0);
  const width = LEFT + weeks.length * STEP;
  const height = TOP + 7 * STEP;

  return (
    <section id="activity" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          index="07"
          command="curl github leetcode codeforces | merge --by-day"
          title="Activity"
          blurb="Commits, LeetCode submissions and Codeforces submissions from the last 12 months, merged into one grid and refreshed every few hours."
        />
        <Reveal>
          <div className="panel px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-[12px] text-faint">
              <span>
                <span className="text-[15px] text-ink">{total.toLocaleString("en-GB")}</span> activities ·{" "}
                <span className="text-ink">{days.filter((d) => d.total).length}</span> active days · last 12 months
              </span>
              <span>updated {fmt(days[days.length - 1].date, { day: "numeric", month: "short" })} · UTC days</span>
            </div>

            {/* fills the panel on desktop; on phones it scrolls, and the rtl wrapper starts it at the latest weeks */}
            <div dir="rtl" className="mt-4 overflow-x-auto pb-2">
              <div dir="ltr" style={{ minWidth: width }}>
                <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Activity heatmap: ${total} activities in the last 12 months`} className="block h-auto w-full font-mono">
                  {weeks.map((w, i) =>
                    i > 0 && w[0].date.slice(5, 7) !== weeks[i - 1][0].date.slice(5, 7) && i < weeks.length - 2 ? (
                      <text key={`m${i}`} x={LEFT + i * STEP} y={11} fontSize="10" fill="var(--text-faint)">
                        {fmt(w[0].date, { month: "short" })}
                      </text>
                    ) : null
                  )}
                  {["Mon", "Wed", "Fri"].map((d, i) => (
                    <text key={d} x={0} y={TOP + (i * 2 + 1) * STEP + 9} fontSize="10" fill="var(--text-faint)">
                      {d}
                    </text>
                  ))}
                  {weeks.map((w, i) =>
                    w.map((d) => (
                      <rect
                        key={d.date}
                        x={LEFT + i * STEP}
                        y={TOP + new Date(`${d.date}T00:00:00Z`).getUTCDay() * STEP}
                        width={11}
                        height={11}
                        rx={2}
                        style={{ fill: FILL[shade(d.total)] }}
                      >
                        <title>
                          {`${fmt(d.date, { day: "numeric", month: "short", year: "numeric" })}: ${d.total} — ${SOURCES.map((s) => `${s.label} ${d.by[s.key]}`).join(" · ")}`}
                        </title>
                      </rect>
                    ))
                  )}
                </svg>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-mono text-[12px]">
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                {SOURCES.map((s, i) => (
                  <li key={s.key}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline text-dim">
                      {s.label}
                    </a>{" "}
                    {data[i] ? (
                      <span className="text-faint">
                        <span className="text-ink">{totals[i].toLocaleString("en-GB")}</span> {s.unit}
                      </span>
                    ) : (
                      <span className="text-warn">unavailable right now</span>
                    )}
                  </li>
                ))}
              </ul>
              <span className="flex items-center gap-1.5 text-faint" aria-hidden>
                less
                {FILL.map((f) => (
                  <span key={f} className="h-[11px] w-[11px] rounded-[2px]" style={{ background: f }} />
                ))}
                more
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

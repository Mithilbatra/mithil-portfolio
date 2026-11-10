// Unified activity heatmap: per-day counts from GitHub, LeetCode and Codeforces, keyed by UTC date.
// Pure parsers + merge so node --test covers them; the fetching lives in components/Activity.tsx.

/** @typedef {Record<string, number>} Counts */
/** @typedef {{ date: string, by: Counts, total: number }} Day */

const day = (sec) => new Date(sec * 1000).toISOString().slice(0, 10);
const add = (out, date, n) => (out[date] = (out[date] ?? 0) + n);

/** GitHub's public contributions page → { "YYYY-MM-DD": count }. Day cells carry the date, tooltips the count. */
export function parseGitHub(html) {
  const dates = {};
  for (const [td] of html.matchAll(/<td[^>]*ContributionCalendar-day[^>]*>/g)) {
    const date = td.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const id = td.match(/\bid="([^"]+)"/)?.[1];
    if (date && id) dates[id] = date;
  }
  /** @type {Counts} */
  const out = {};
  for (const [, id, n] of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([\d,]+) contributions? on/g)) {
    if (dates[id]) add(out, dates[id], Number(n.replace(/,/g, "")));
  }
  return out;
}

/** LeetCode's submissionCalendar: a JSON string of { unixSeconds: count }. */
export function parseLeetCode(calendar) {
  /** @type {Counts} */
  const out = {};
  for (const [sec, n] of Object.entries(JSON.parse(calendar || "{}"))) add(out, day(Number(sec)), Number(n));
  return out;
}

/** Codeforces user.status submissions → one count per submission. */
export function parseCodeforces(submissions) {
  /** @type {Counts} */
  const out = {};
  for (const s of submissions) add(out, day(s.creationTimeSeconds), 1);
  return out;
}

/** The last 53 weeks up to today as columns of days, Sunday first; each day has per-source counts and a total.
 *  @param {Record<string, Counts | null>} sources */
export function buildGrid(sources, today = new Date()) {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const d = new Date(end);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay() - 52 * 7);
  /** @type {Day[][]} */
  const weeks = [];
  for (; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const by = Object.fromEntries(Object.entries(sources).map(([k, m]) => [k, m?.[date] ?? 0]));
    if (d.getUTCDay() === 0) weeks.push([]);
    weeks[weeks.length - 1].push({ date, by, total: Object.values(by).reduce((a, b) => a + b, 0) });
  }
  return weeks;
}

/** 0–4 shade per day from the quartiles of active days, so one huge day doesn't wash out the rest.
 *  @param {{ total: number }[][]} weeks */
export function shader(weeks) {
  const active = weeks.flat().map((x) => x.total).filter(Boolean).sort((a, b) => a - b);
  const [q1, q2, q3] = [0.25, 0.5, 0.75].map((p) => active[Math.floor(p * (active.length - 1))] ?? 0);
  return (n) => (n === 0 ? 0 : n <= q1 ? 1 : n <= q2 ? 2 : n <= q3 ? 3 : 4);
}

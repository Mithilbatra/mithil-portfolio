import { CASE_FILES } from "@/lib/data";

export const dynamic = "force-dynamic";

const PIT_WALL = CASE_FILES.find((c) => c.slug === "pit-wall")?.links.live;
const TTL = 10 * 60 * 1000;

// shortcut: per-instance memory cache; plenty for portfolio traffic, move to a shared cache if it ever isn't.
let cached: { at: number; body: unknown } | null = null;

type Projection = { driver: string; team: string; prob: number };

/** Next Grand Prix + Pit Wall's predicted podium, trimmed to what the widget shows. */
export async function GET() {
  if (cached && Date.now() - cached.at < TTL) return Response.json(cached.body);
  try {
    const r = await fetch(`${PIT_WALL}/api/weekend`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(`pit-wall ${r.status}`);
    const d = await r.json();
    const nr = d.next_race;
    const body = {
      fetchedAt: new Date().toISOString(),
      race: nr ? { event: nr.event, location: nr.location, round: nr.round, utc: nr.race_utc } : null,
      podium: ((d.forecast?.projection ?? []) as Projection[]).slice(0, 3).map(({ driver, team, prob }) => ({ driver, team, prob })),
    };
    cached = { at: Date.now(), body };
    return Response.json(body);
  } catch {
    return Response.json({ error: "pit-wall unreachable" }, { status: 502 });
  }
}

import { CASE_FILES } from "@/lib/data";

export const dynamic = "force-dynamic";

const PIT_WALL = CASE_FILES.find((c) => c.slug === "pit-wall")?.links.live;

/** Live health check of Pit Wall (server-side: it's http, the site is https). */
export async function GET() {
  const t0 = Date.now();
  let pitwall: { ok: boolean; ms: number | null } = { ok: false, ms: null };
  if (PIT_WALL) {
    try {
      const r = await fetch(`${PIT_WALL}/healthz`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
      pitwall = { ok: r.ok, ms: Date.now() - t0 };
    } catch {
      // unreachable / timed out → reported as down
    }
  }
  return Response.json({ pitwall }, { headers: { "Cache-Control": "no-store" } });
}

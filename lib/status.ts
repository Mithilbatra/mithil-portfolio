import { CASE_FILES } from "@/lib/data";

export type Ping = { ok: boolean; ms: number | null };

const LIVE = CASE_FILES.flatMap((c) => (c.links.live ? [{ slug: c.slug, url: c.links.live }] : []));

/** Health check of every project with a live URL, in parallel. Server-side
 *  because Pit Wall is plain http and the site is https. */
export async function checkLive(): Promise<Record<string, Ping>> {
  const results = await Promise.all(
    LIVE.map(async ({ slug, url }) => {
      const t0 = Date.now();
      try {
        const r = await fetch(url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(5000) });
        return [slug, { ok: r.ok, ms: Date.now() - t0 }] as const;
      } catch {
        return [slug, { ok: false, ms: null }] as const; // unreachable / timed out
      }
    })
  );
  return Object.fromEntries(results);
}

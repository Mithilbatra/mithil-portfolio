import { checkLive } from "@/lib/status";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await checkLive(), { headers: { "Cache-Control": "no-store" } });
}

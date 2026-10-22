// Helpers for the "ask mithil" chat, shared by /api/chat. Pure, so node --test covers them.

export const MAX_TURNS = 12;
export const MAX_CHARS = 600;

/** Validate the client's history ([{ role: "user" | "model", text }]); returns a trimmed copy or null. */
export function cleanHistory(body) {
  const msgs = body?.messages;
  if (!Array.isArray(msgs) || !msgs.length) return null;
  const out = msgs.slice(-MAX_TURNS).map((m) => ({
    role: m?.role,
    text: typeof m?.text === "string" ? m.text.trim().slice(0, MAX_CHARS) : "",
  }));
  if (out.some((m) => (m.role !== "user" && m.role !== "model") || !m.text)) return null;
  while (out[0]?.role === "model") out.shift(); // Gemini wants the user to speak first
  return out.length && out[out.length - 1].role === "user" ? out : null;
}

/** Read Gemini's JSON reply ({ reply, links, go, followups }), falling back to plain text.
 *  Only allow-listed targets survive, and any [[tag]] the model writes anyway is dropped. */
export function readReply(raw, targets) {
  let d;
  try {
    d = JSON.parse(raw);
  } catch {}
  if (!d || typeof d !== "object") d = { reply: raw };
  const ok = (t) => typeof t === "string" && targets.includes(t);
  const go = ok(d.go) ? d.go : null;
  const links = [...new Set([go, ...(Array.isArray(d.links) ? d.links : [])].filter(ok))].slice(0, 2);
  const text = String(d.reply ?? "")
    .replace(/\[\[[^\]]*\]\]/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const followups = (Array.isArray(d.followups) ? d.followups : [])
    .filter((f) => typeof f === "string" && f.trim())
    .map((f) => f.trim().slice(0, 80))
    .slice(0, 2);
  return { text, targets: links, go, followups };
}

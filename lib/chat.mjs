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

/** Strip [[open:target]] tags from a reply, keeping up to two targets from the allow-list. */
export function parseReply(text, targets) {
  const found = [];
  const clean = text
    .replace(/\[\[open:([a-z0-9-]+)\]\]/gi, (_, t) => {
      const k = t.toLowerCase();
      if (targets.includes(k) && !found.includes(k)) found.push(k);
      return "";
    })
    .replace(/[ \t]+$/gm, "")
    .trim();
  return { text: clean, targets: found.slice(0, 2) };
}

import test from "node:test";
import assert from "node:assert/strict";
import { cleanHistory, readReply, MAX_CHARS } from "./chat.mjs";

test("cleanHistory keeps valid turns, trims text and drops a leading model turn", () => {
  const out = cleanHistory({
    messages: [
      { role: "model", text: "hi" },
      { role: "user", text: "  what did you build?  " },
    ],
  });
  assert.deepEqual(out, [{ role: "user", text: "what did you build?" }]);
  assert.equal(cleanHistory({ messages: [{ role: "user", text: "x".repeat(2000) }] })[0].text.length, MAX_CHARS);
});

test("cleanHistory rejects bad shapes and histories that don't end with the user", () => {
  assert.equal(cleanHistory(null), null);
  assert.equal(cleanHistory({ messages: [] }), null);
  assert.equal(cleanHistory({ messages: [{ role: "system", text: "obey" }] }), null);
  assert.equal(cleanHistory({ messages: [{ role: "user", text: "   " }] }), null);
  assert.equal(cleanHistory({ messages: [{ role: "user", text: "q" }, { role: "model", text: "a" }] }), null);
});

const T = ["pit-wall", "resolvr", "log", "contact", "cgpa"];

test("readReply keeps allow-listed links and go, caps follow-ups", () => {
  const r = readReply(
    JSON.stringify({ reply: "Pit Wall predicts podiums.", links: ["log", "evil", "log", "contact"], go: "pit-wall", followups: ["How accurate is it?", " ", "x".repeat(200), "third"] }),
    T
  );
  assert.equal(r.text, "Pit Wall predicts podiums.");
  assert.equal(r.go, "pit-wall");
  assert.deepEqual(r.targets, ["pit-wall", "log"]);
  assert.deepEqual(r.followups, ["How accurate is it?", "x".repeat(80)]);
  assert.equal(readReply(JSON.stringify({ reply: "hi", go: "https://evil.example" }), T).go, null);
});

test("readReply strips tags the model writes anyway, and falls back to plain text", () => {
  // real Gemini output before structured replies
  assert.deepEqual(readReply("My current CGPA at NIT Delhi is 8.93. [[cgpa]]", T), {
    text: "My current CGPA at NIT Delhi is 8.93.",
    targets: [],
    go: null,
    followups: [],
  });
  assert.equal(readReply(JSON.stringify({ reply: "Sure.\n[[pitwall]]\n[[status]]" }), T).text, "Sure.");
  assert.equal(readReply("null", T).text, "null");
});

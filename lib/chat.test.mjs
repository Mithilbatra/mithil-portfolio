import test from "node:test";
import assert from "node:assert/strict";
import { cleanHistory, parseReply, MAX_CHARS } from "./chat.mjs";

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

test("parseReply strips tags and keeps at most two allowed targets", () => {
  const r = parseReply("Pit Wall predicts podiums. [[open:pit-wall]] [[open:evil]] [[open:LOG]] [[open:contact]]", [
    "pit-wall",
    "log",
    "contact",
  ]);
  assert.equal(r.text, "Pit Wall predicts podiums.");
  assert.deepEqual(r.targets, ["pit-wall", "log"]);
  assert.deepEqual(parseReply("no tags here", ["log"]), { text: "no tags here", targets: [] });
});

test("parseReply accepts tags without 'open:' (seen from Gemini) and drops junk tags", () => {
  const r = parseReply("I've built a few projects.\n[[pit-wall]]\n[[resolvr]]\n[[ai-mock-interview]]", ["pit-wall", "resolvr", "ai-mock-interview"]);
  assert.equal(r.text, "I've built a few projects.");
  assert.deepEqual(r.targets, ["pit-wall", "resolvr"]);
  assert.equal(parseReply("Sure. [[open: deployments ]] [[open:not a target]]", ["deployments"]).text, "Sure.");
});

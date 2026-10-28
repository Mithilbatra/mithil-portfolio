import test from "node:test";
import assert from "node:assert/strict";
import { runCommand } from "./console.mjs";

const ctx = {
  profile: { name: "M", role: "SWE", location: "Delhi", blurb: "b", email: "m@x.dev", status: "Available" },
  cases: [{ id: "002", slug: "resolvr", title: "Resolvr", subtitle: "s", symptom: "sym", hardPart: "hp", learned: "l", severity: 1 }],
  sections: ["log", "contact"],
  links: { resume: "/resume.pdf", github: "https://github.com/x" },
  cgpa: "8.93",
  experience: "hsbc",
  skills: "java",
  education: "nit",
};

test("open resolves sections, incidents, links and the cgpa popup", () => {
  assert.deepEqual(runCommand("open log", ctx).action, { type: "nav", href: "/#log" });
  assert.equal(runCommand("open resolvr", ctx).action.href, "/incidents/resolvr");
  assert.equal(runCommand("resume", ctx).action.href, "/resume.pdf");
  assert.deepEqual(runCommand("cgpa", ctx).action, { type: "event", name: "cgpa:open" });
  assert.equal(runCommand("open nowhere", ctx).lines[0].level, "ERROR");
});

test("questions go to the responder; hiring questions escalate to CRIT", () => {
  const hire = runCommand("are you open to full-time roles?", ctx);
  assert.equal(hire.lines[0].level, "CRIT");
  assert.equal(hire.action.sev, "crit");
  assert.match(runCommand("page tell me about resolvr", ctx).lines[0].text, /^Resolvr: sym/);
  assert.equal(runCommand("what is your favourite colour?", ctx).lines[0].level, "WARN");
});

test("unknown single words error; easter eggs fire actions", () => {
  assert.equal(runCommand("rm", ctx).lines[0].level, "ERROR");
  assert.equal(runCommand("sudo hire mithil", ctx).action.type, "hire");
  assert.equal(runCommand("sudo rm -rf /", ctx).lines[0].level, "ERROR");
  assert.equal(runCommand("severity crit", ctx).action.sev, "crit");
  assert.equal(runCommand("severity loud", ctx).lines[0].level, "ERROR");
  assert.deepEqual(runCommand("   ", ctx), { lines: [] });
});

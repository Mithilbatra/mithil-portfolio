// Command runner for the site console (⌘K palette, `~` terminal, "page on-call").
// Pure: takes the typed line + a context of site data, returns lines to print
// and an optional action for the UI to perform.

export const COMMANDS = [
  ["help", "list commands"],
  ["ls", "list incidents and sections"],
  ["cat <incident>", "read an incident report"],
  ["open <target>", "jump to a section, incident, resume, github…"],
  ["whoami", "who is on call"],
  ["cgpa", "open the CGPA trend"],
  ["email", "mail the on-call engineer"],
  ["page <question>", "ask the on-call responder anything"],
  ["severity <ok|warn|crit>", "override the page severity"],
  ["sudo hire mithil", "you know what this does"],
  ["chaos", "don't"],
  ["clear", "clear the screen"],
  ["exit", "close the console"],
];

const info = (text) => ({ level: "INFO", text });
const err = (text) => ({ level: "ERROR", text });

function open(target, ctx) {
  const t = (target || "").toLowerCase();
  if (ctx.sections.includes(t)) return { lines: [info(`→ /#${t}`)], action: { type: "nav", href: `/#${t}` } };
  const kase = ctx.cases.find((c) => c.slug === t);
  if (kase) return { lines: [info(`→ incident ${kase.id} · ${kase.title}`)], action: { type: "nav", href: `/incidents/${kase.slug}` } };
  if (t === "cgpa") return { lines: [info("plotting cgpa --over-time")], action: { type: "event", name: "cgpa:open" } };
  if (ctx.links[t]) return { lines: [info(`→ ${t}`)], action: { type: "nav", href: ctx.links[t], external: true } };
  return { lines: [err(`open: no such target '${target ?? ""}' — try \`ls\``)] };
}

// shortcut: keyword responder over site data, no LLM; swap for an API route if you want free-form answers.
const RULES = [
  {
    re: /\b(hire|hiring|job|jobs|open to|available|availability|offer|recruit|new grad|full.?time)\b/,
    reply: (c) => ({
      lines: [{ level: "CRIT", text: `${c.profile.status}. Fastest path: ${c.profile.email}` }],
      action: { type: "severity", sev: "crit", label: "hiring signal", ms: 4000 },
    }),
  },
  { re: /\b(cgpa|gpa|sgpa|grades?|marks)\b/, reply: (c) => ({ lines: [info(`CGPA ${c.cgpa} at NIT Delhi — run \`cgpa\` for the trend`)] }) },
  { re: /\b(hsbc|experience|intern(ship)?|worked|company)\b/, reply: (c) => ({ lines: [info(c.experience)] }) },
  { re: /\b(stack|skills?|tech|languages?|java|python|backend|frameworks?)\b/, reply: (c) => ({ lines: [info(c.skills)] }) },
  { re: /\b(email|contact|reach|mail|call)\b/, reply: (c) => ({ lines: [info(`page me at ${c.profile.email}`)] }) },
  { re: /\b(college|nit|education|degree|study|studying)\b/, reply: (c) => ({ lines: [info(c.education)] }) },
  { re: /\b(leetcode|dsa|problems?|competitive)\b/, reply: () => ({ lines: [info("800+ problems solved across platforms · JEE Main 99.467%ile")] }) },
];

export function answer(question, ctx) {
  const q = question.toLowerCase();
  const kase = ctx.cases.find((c) => q.includes(c.slug.split("-")[0]) || q.includes(c.title.toLowerCase()));
  if (kase) {
    return { lines: [info(`${kase.title}: ${kase.symptom}`), { level: "WARN", text: `root cause → ${kase.hardPart}` }, info(`resolution → ${kase.learned}`)] };
  }
  if (/\b(projects?|built|build|made)\b/.test(q)) {
    return { lines: ctx.cases.map((c) => info(`${c.id} ${c.title} — ${c.subtitle}`)) };
  }
  const rule = RULES.find((r) => r.re.test(q));
  if (rule) return rule.reply(ctx);
  return { lines: [{ level: "WARN", text: `no runbook entry for that — escalating to a human: ${ctx.profile.email}` }] };
}

export function runCommand(raw, ctx) {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const [cmd, ...rest] = input.split(/\s+/);
  const arg = rest.join(" ");

  switch (cmd.toLowerCase()) {
    case "help":
    case "?":
      return { lines: COMMANDS.map(([c, d]) => info(`${c.padEnd(24)} ${d}`)) };
    case "ls":
      return {
        lines: [
          ...ctx.cases.map((c) => info(`incident ${c.id}  ${c.slug.padEnd(20)} SEV-${c.severity}`)),
          info(`sections   ${ctx.sections.join("  ")}`),
        ],
      };
    case "cat": {
      const kase = ctx.cases.find((c) => c.slug === arg.toLowerCase());
      if (!kase) return { lines: [err(`cat: ${arg || "<incident>"}: no such incident — try \`ls\``)] };
      return answer(kase.slug, ctx);
    }
    case "open":
      return open(arg, ctx);
    case "resume":
    case "github":
    case "linkedin":
    case "leetcode":
    case "cgpa":
      return open(cmd, ctx);
    case "email":
      return { lines: [info(`opening mail → ${ctx.profile.email}`)], action: { type: "nav", href: `mailto:${ctx.profile.email}`, external: true } };
    case "whoami":
      return { lines: [info(`${ctx.profile.name} — ${ctx.profile.role} · ${ctx.profile.location}`), info(ctx.profile.blurb)] };
    case "severity": {
      const sev = arg.toLowerCase();
      if (!["ok", "warn", "crit"].includes(sev)) return { lines: [err("usage: severity <ok|warn|crit>")] };
      return { lines: [info(`severity override → ${sev} (4s)`)], action: { type: "severity", sev, label: "manual override", ms: 4000 } };
    }
    case "sudo":
      if (arg.toLowerCase() === "hire mithil") {
        return {
          lines: [
            { level: "CRIT", text: "INC-HIRE opened · priority P0 · paging recruiter…" },
            info(`resolution: email ${ctx.profile.email} and schedule the interview ✓`),
          ],
          action: { type: "hire" },
        };
      }
      return { lines: [err("permission denied — nice try")] };
    case "chaos":
      return { lines: [{ level: "CRIT", text: "chaos mode engaged — auto-resolving in 5s" }], action: { type: "chaos" } };
    case "page":
      return arg ? answer(arg, ctx) : { lines: [err("usage: page <question>")] };
    case "clear":
      return { lines: [], action: { type: "clear" } };
    case "exit":
    case "quit":
      return { lines: [], action: { type: "close" } };
    default:
      // Anything that reads like a sentence goes to the on-call responder.
      return rest.length || input.endsWith("?") ? answer(input, ctx) : { lines: [err(`command not found: ${cmd} — try \`help\``)] };
  }
}

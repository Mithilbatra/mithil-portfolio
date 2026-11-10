import test from "node:test";
import assert from "node:assert/strict";
import { parseGitHub, parseLeetCode, parseCodeforces, buildGrid, shader } from "./activity.mjs";

// trimmed from github.com/users/<name>/contributions
const GH = `
<td tabindex="0" data-ix="3" style="width: 10px" data-date="2025-11-30" id="contribution-day-component-0-3" data-level="2" class="ContributionCalendar-day"></td>
<td tabindex="0" data-ix="4" style="width: 10px" data-date="2025-12-07" id="contribution-day-component-0-4" data-level="0" class="ContributionCalendar-day"></td>
<td tabindex="0" data-ix="5" style="width: 10px" data-date="2025-12-14" id="contribution-day-component-0-5" data-level="4" class="ContributionCalendar-day"></td>
<tool-tip id="tooltip-a" for="contribution-day-component-0-3" popover="manual" class="sr-only">4 contributions on November 30th.</tool-tip>
<tool-tip id="tooltip-b" for="contribution-day-component-0-4" popover="manual" class="sr-only">No contributions on December 7th.</tool-tip>
<tool-tip id="tooltip-c" for="contribution-day-component-0-5" popover="manual" class="sr-only">1,204 contributions on December 14th.</tool-tip>`;

test("parsers turn each source into per-day counts", () => {
  assert.deepEqual(parseGitHub(GH), { "2025-11-30": 4, "2025-12-14": 1204 });
  // LeetCode keys are midnight-UTC unix seconds
  assert.deepEqual(parseLeetCode('{"1768262400": 3, "1768348800": 1}'), { "2026-01-13": 3, "2026-01-14": 1 });
  assert.deepEqual(parseLeetCode(""), {});
  const cf = [{ creationTimeSeconds: 1768262400 + 60 }, { creationTimeSeconds: 1768262400 + 7200 }, { creationTimeSeconds: 1768348800 }];
  assert.deepEqual(parseCodeforces(cf), { "2026-01-13": 2, "2026-01-14": 1 });
});

test("buildGrid covers 53 weeks of Sunday-first columns ending today, summing the sources", () => {
  const today = new Date("2026-11-10T15:00:00Z"); // a Tuesday
  const weeks = buildGrid({ github: { "2026-11-10": 2 }, leetcode: { "2026-11-10": 3 }, codeforces: null }, today);
  assert.equal(weeks.length, 53);
  assert.ok(weeks.slice(0, -1).every((w) => w.length === 7));
  assert.equal(new Date(weeks[0][0].date).getUTCDay(), 0);
  const last = weeks.at(-1).at(-1);
  assert.deepEqual(last, { date: "2026-11-10", by: { github: 2, leetcode: 3, codeforces: 0 }, total: 5 });
});

test("shader buckets by quartile and keeps zero at 0", () => {
  const weeks = [[1, 2, 3, 4, 100, 0].map((total) => ({ total }))];
  const shade = shader(weeks);
  assert.deepEqual([0, 1, 2, 3, 4, 100].map(shade), [0, 1, 1, 2, 3, 4]); // quartile cut-offs 2, 3, 4
});

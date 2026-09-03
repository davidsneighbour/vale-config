import assert from "node:assert/strict";

const expectedRules = ["DNB.AgenticCommunal", "DNB.OpenlyThereIs"];

const watchedRules = [
  "DNB.AgenticCommunal",
  "DNB.AgenticCommunalAlternative",
  "DNB.Hedging",
  "DNB.OpenlyThereIs",
];

function collectRules(raw) {
  const parsed = raw.trim() === "" ? {} : JSON.parse(raw);
  const rules = new Set();

  for (const alerts of Object.values(parsed)) {
    for (const alert of alerts) {
      rules.add(alert.Check);
    }
  }

  return rules;
}

const positiveRules = collectRules(process.env.POSITIVE_JSON ?? "{}");
const negativeRules = collectRules(process.env.NEGATIVE_JSON ?? "{}");

for (const rule of expectedRules) {
  assert.equal(positiveRules.has(rule), true, `${rule} should trigger`);
}

assert.deepEqual(
  [...negativeRules].filter((rule) => watchedRules.includes(rule)),
  [],
  "negative fixture should not trigger watched DNB rules",
);

import assert from "node:assert/strict";

const expectedRules = [
  "DNBWriting.AgenticCommunal",
  "DNBWriting.OpenlyThereIs",
];

const expectedAIDetectionRules = [
  "DNBAIPatterns.AlreadyKnow",
  "DNBAIPatterns.AIVocabulary",
  "DNBAIPatterns.ChatbotLeftovers",
  "DNBAIPatterns.CrucialRole",
  "DNBAIPatterns.DespiteChallenges",
  "DNBAIPatterns.Entire",
  "DNBAIPatterns.IsReal",
  "DNBAIPatterns.Landscape",
  "DNBAIPatterns.NotJust",
  "DNBAIPatterns.NotNothing",
  "DNBAIPatterns.NoteThat",
  "DNBAIPatterns.ParticipleTail",
  "DNBAIPatterns.PromotionalBoilerplate",
  "DNBAIPatterns.Punchline",
  "DNBAIPatterns.SitWith",
  "DNBAIPatterns.Testament",
  "DNBAIPatterns.VagueExperts",
  "DNBAIPatterns.Whole",
  "DNBAIPatterns.WorthNaming",
];

const expectedAIDetectionScriptRules = [
  "DNBAIPatterns.DidNotChain",
  "DNBAIPatterns.DontVerbIt",
  "DNBAIPatterns.NoChain",
];

const expectedAIDetectionAggregateRules = [
  "DNBAIPatterns.RepeatedPhrase",
  "DNBAIPatterns.RepeatedSentenceOpener",
  "DNBAIPatterns.VocabularyDensityError",
];

const expectedMillennialismsRules = [
  "DNBMillennialisms.AnimalSlang",
  "DNBMillennialisms.EmotionalHyperbole",
  "DNBMillennialisms.InternetLifestyleSlang",
];

const watchedRules = [
  "DNBWriting.AgenticCommunal",
  "DNBWriting.AgenticCommunalAlternative",
  "DNBWriting.Hedging",
  "DNBWriting.OpenlyThereIs",
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
const aidetectionPositiveRules = collectRules(
  process.env.AIDETECTION_POSITIVE_JSON ?? "{}",
);
const aidetectionNegativeRules = collectRules(
  process.env.AIDETECTION_NEGATIVE_JSON ?? "{}",
);
const aidetectionScriptedPositiveRules = collectRules(
  process.env.AIDETECTION_SCRIPTED_POSITIVE_JSON ?? "{}",
);
const aidetectionScriptedNegativeRules = collectRules(
  process.env.AIDETECTION_SCRIPTED_NEGATIVE_JSON ?? "{}",
);
const aidetectionAggregatePositiveRules = collectRules(
  process.env.AIDETECTION_AGGREGATE_POSITIVE_JSON ?? "{}",
);
const aidetectionAggregateWarningPositiveRules = collectRules(
  process.env.AIDETECTION_AGGREGATE_WARNING_POSITIVE_JSON ?? "{}",
);
const aidetectionAggregateNegativeRules = collectRules(
  process.env.AIDETECTION_AGGREGATE_NEGATIVE_JSON ?? "{}",
);
const millennialismsPositiveRules = collectRules(
  process.env.MILLENNIALISMS_POSITIVE_JSON ?? "{}",
);
const millennialismsNegativeRules = collectRules(
  process.env.MILLENNIALISMS_NEGATIVE_JSON ?? "{}",
);

for (const rule of expectedRules) {
  assert.equal(positiveRules.has(rule), true, `${rule} should trigger`);
}

for (const rule of expectedAIDetectionRules) {
  assert.equal(
    aidetectionPositiveRules.has(rule),
    true,
    `${rule} should trigger`,
  );
}

for (const rule of expectedAIDetectionScriptRules) {
  assert.equal(
    aidetectionScriptedPositiveRules.has(rule),
    true,
    `${rule} should trigger`,
  );
}

for (const rule of expectedAIDetectionAggregateRules) {
  assert.equal(
    aidetectionAggregatePositiveRules.has(rule),
    true,
    `${rule} should trigger`,
  );
}

assert.equal(
  aidetectionAggregateWarningPositiveRules.has(
    "DNBAIPatterns.VocabularyDensityWarning",
  ),
  true,
  "DNBAIPatterns.VocabularyDensityWarning should trigger",
);

for (const rule of expectedMillennialismsRules) {
  assert.equal(
    millennialismsPositiveRules.has(rule),
    true,
    `${rule} should trigger`,
  );
}

assert.deepEqual(
  [...negativeRules].filter((rule) => watchedRules.includes(rule)),
  [],
  "negative fixture should not trigger watched DNBWriting rules",
);

assert.deepEqual(
  [...aidetectionNegativeRules].filter((rule) =>
    rule.startsWith("DNBAIPatterns."),
  ),
  [],
  "negative fixture should not trigger DNBAIPatterns rules",
);

assert.deepEqual(
  [...aidetectionScriptedNegativeRules].filter((rule) =>
    rule.startsWith("DNBAIPatterns."),
  ),
  [],
  "scripted negative fixture should not trigger DNBAIPatterns rules",
);

assert.deepEqual(
  [...aidetectionAggregateNegativeRules].filter((rule) =>
    [
      "DNBAIPatterns.RepeatedPhrase",
      "DNBAIPatterns.RepeatedSentenceOpener",
      "DNBAIPatterns.VocabularyDensityWarning",
      "DNBAIPatterns.VocabularyDensityError",
    ].includes(rule),
  ),
  [],
  "aggregate negative fixture should not trigger aggregate DNBAIPatterns rules",
);

assert.deepEqual(
  [...millennialismsNegativeRules].filter((rule) =>
    rule.startsWith("DNBMillennialisms."),
  ),
  [],
  "negative fixture should not trigger DNBMillennialisms rules",
);

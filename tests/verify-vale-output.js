import assert from "node:assert/strict";

const expectedRules = ["DNB.AgenticCommunal", "DNB.OpenlyThereIs"];

const expectedAIDetectionRules = [
  "AIDetection.AlreadyKnow",
  "AIDetection.AIVocabulary",
  "AIDetection.ChatbotLeftovers",
  "AIDetection.CrucialRole",
  "AIDetection.DespiteChallenges",
  "AIDetection.Entire",
  "AIDetection.IsReal",
  "AIDetection.Landscape",
  "AIDetection.NotJust",
  "AIDetection.NotNothing",
  "AIDetection.NoteThat",
  "AIDetection.ParticipleTail",
  "AIDetection.PromotionalBoilerplate",
  "AIDetection.Punchline",
  "AIDetection.SitWith",
  "AIDetection.Testament",
  "AIDetection.VagueExperts",
  "AIDetection.Whole",
  "AIDetection.WorthNaming",
];

const expectedAIDetectionScriptRules = [
  "AIDetection.DidNotChain",
  "AIDetection.DontVerbIt",
  "AIDetection.NoChain",
];

const expectedAIDetectionAggregateRules = [
  "AIDetection.RepeatedPhrase",
  "AIDetection.RepeatedSentenceOpener",
  "AIDetection.VocabularyDensityError",
];

const expectedMillennialismsRules = [
  "Millennialisms.AnimalSlang",
  "Millennialisms.EmotionalHyperbole",
  "Millennialisms.InternetLifestyleSlang",
];

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
    "AIDetection.VocabularyDensityWarning",
  ),
  true,
  "AIDetection.VocabularyDensityWarning should trigger",
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
  "negative fixture should not trigger watched DNB rules",
);

assert.deepEqual(
  [...aidetectionNegativeRules].filter((rule) =>
    rule.startsWith("AIDetection."),
  ),
  [],
  "negative fixture should not trigger AIDetection rules",
);

assert.deepEqual(
  [...aidetectionScriptedNegativeRules].filter((rule) =>
    rule.startsWith("AIDetection."),
  ),
  [],
  "scripted negative fixture should not trigger AIDetection rules",
);

assert.deepEqual(
  [...aidetectionAggregateNegativeRules].filter((rule) =>
    [
      "AIDetection.RepeatedPhrase",
      "AIDetection.RepeatedSentenceOpener",
      "AIDetection.VocabularyDensityWarning",
      "AIDetection.VocabularyDensityError",
    ].includes(rule),
  ),
  [],
  "aggregate negative fixture should not trigger aggregate AIDetection rules",
);

assert.deepEqual(
  [...millennialismsNegativeRules].filter((rule) =>
    rule.startsWith("Millennialisms."),
  ),
  [],
  "negative fixture should not trigger Millennialisms rules",
);

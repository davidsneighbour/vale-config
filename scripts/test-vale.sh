#!/bin/bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${project_root}"

vale --version
vale tests/fixtures/smoke.md

positive_json="$(vale --output=JSON tests/fixtures/positive.md || true)"
negative_json="$(vale --output=JSON tests/fixtures/negative.md || true)"
aidetection_positive_json="$(vale --output=JSON tests/fixtures/aidetection/declarative-positive.md || true)"
aidetection_negative_json="$(vale --output=JSON tests/fixtures/aidetection/declarative-negative.md || true)"
aidetection_scripted_positive_json="$(vale --output=JSON tests/fixtures/aidetection/scripted-positive.md || true)"
aidetection_scripted_negative_json="$(vale --output=JSON tests/fixtures/aidetection/scripted-negative.md || true)"
aidetection_aggregate_positive_json="$(vale --output=JSON tests/fixtures/aidetection/aggregate-positive.md || true)"
aidetection_aggregate_warning_positive_json="$(vale --output=JSON tests/fixtures/aidetection/aggregate-warning-positive.md || true)"
aidetection_aggregate_negative_json="$(vale --output=JSON tests/fixtures/aidetection/aggregate-negative.md || true)"
millennialisms_positive_json="$(vale --output=JSON tests/fixtures/millennialisms/positive.md || true)"
millennialisms_negative_json="$(vale --output=JSON tests/fixtures/millennialisms/negative.md || true)"

POSITIVE_JSON="${positive_json}" NEGATIVE_JSON="${negative_json}" AIDETECTION_POSITIVE_JSON="${aidetection_positive_json}" AIDETECTION_NEGATIVE_JSON="${aidetection_negative_json}" AIDETECTION_SCRIPTED_POSITIVE_JSON="${aidetection_scripted_positive_json}" AIDETECTION_SCRIPTED_NEGATIVE_JSON="${aidetection_scripted_negative_json}" AIDETECTION_AGGREGATE_POSITIVE_JSON="${aidetection_aggregate_positive_json}" AIDETECTION_AGGREGATE_WARNING_POSITIVE_JSON="${aidetection_aggregate_warning_positive_json}" AIDETECTION_AGGREGATE_NEGATIVE_JSON="${aidetection_aggregate_negative_json}" MILLENNIALISMS_POSITIVE_JSON="${millennialisms_positive_json}" MILLENNIALISMS_NEGATIVE_JSON="${millennialisms_negative_json}" node tests/verify-vale-output.js

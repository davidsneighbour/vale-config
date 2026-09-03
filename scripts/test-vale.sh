#!/bin/bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${project_root}"

vale --version
vale tests/fixtures/smoke.md

positive_json="$(vale --output=JSON tests/fixtures/positive.md || true)"
negative_json="$(vale --output=JSON tests/fixtures/negative.md || true)"

POSITIVE_JSON="${positive_json}" NEGATIVE_JSON="${negative_json}" node tests/verify-vale-output.js

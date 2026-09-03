#!/bin/bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
vale_config="${project_root}/src/DNB/.vale.ini"

cd "${project_root}"

vale --version
vale --config="${vale_config}" tests/fixtures/smoke.md

positive_json="$(vale --config="${vale_config}" --output=JSON tests/fixtures/positive.md || true)"
negative_json="$(vale --config="${vale_config}" --output=JSON tests/fixtures/negative.md || true)"

POSITIVE_JSON="${positive_json}" NEGATIVE_JSON="${negative_json}" node tests/verify-vale-output.js

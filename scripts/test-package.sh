#!/bin/bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_zip="${project_root}/dist/config.zip"
temp_dir=""

cleanup() {
  if [[ -n "${temp_dir}" && -d "${temp_dir}" ]]; then
    rm -rf "${temp_dir}"
  fi
}

main() {
  cd "${project_root}"

  ./scripts/build-release-zip.sh

  if [[ ! -f "${package_zip}" ]]; then
    echo "[error] Missing package ZIP: ${package_zip}" >&2
    exit 1
  fi

  temp_dir="$(mktemp -d)"
  trap cleanup EXIT

  cat > "${temp_dir}/.vale.ini" <<EOF
StylesPath = .vale

MinAlertLevel = suggestion

Packages = ${package_zip}

[*.md]
BasedOnStyles = DNB, AIDetection, Millennialisms
DNB.AgenticCommunal = warning
DNB.Spelling = error
EOF

  cat > "${temp_dir}/article.md" <<EOF
# Consumer Fixture

I just wanted to say I helped to fix this issue.

As an AI language model, I cannot browse the internet.

Henlo fren.

This sentense includes a typo.

The temperature is -5 degrees.

The U.S.A. is large.

An ablebodied person arrived.

Copyright (c) 2026.

A number of configuration options exist.
EOF

  (
    cd "${temp_dir}"
    export XDG_DATA_HOME="${temp_dir}/xdg-data"
    export XDG_DATA_DIRS="${temp_dir}/xdg-data"
    export XDG_CACHE_HOME="${temp_dir}/xdg-cache"

    vale sync
    output="$(vale --output=JSON article.md 2>&1 || true)"

    if [[ "${output}" != *"DNB.AgenticCommunal"* ]]; then
      echo "[error] Synced package did not trigger DNB.AgenticCommunal" >&2
      echo "${output}" >&2
      exit 1
    fi

    if [[ "${output}" != *"AIDetection.ChatbotLeftovers"* ]]; then
      echo "[error] Synced package did not trigger AIDetection.ChatbotLeftovers" >&2
      echo "${output}" >&2
      exit 1
    fi

    if [[ "${output}" != *"Millennialisms.AnimalSlang"* ]]; then
      echo "[error] Synced package did not trigger Millennialisms.AnimalSlang" >&2
      echo "${output}" >&2
      exit 1
    fi

    if [[ "${output}" != *"DNB.Spelling"* ]]; then
      echo "[error] Synced package did not trigger DNB.Spelling" >&2
      echo "${output}" >&2
      exit 1
    fi

    for rule in DNB.Microsoft-Negative DNB.Google-Periods DNB.alex-Ablist \
      DNB.proselint-Copyright DNB.Readability-Polysyllables DNB.write-good-TooWordy; do
      if [[ "${output}" != *"${rule}"* ]]; then
        echo "[error] Synced package did not trigger ${rule}" >&2
        echo "${output}" >&2
        exit 1
      fi
    done

    for namespace in Microsoft Google alex proselint Readability write-good; do
      if [[ -d ".vale/${namespace}" ]]; then
        echo "[error] Synced package downloaded external namespace ${namespace}" >&2
        exit 1
      fi
      if [[ ! -f ".vale/DNB/licenses/${namespace}/LICENSE" && ! -f ".vale/DNB/licenses/${namespace}/README.md" ]]; then
        echo "[error] Synced package is missing the ${namespace} licence notice" >&2
        exit 1
      fi
    done

    echo "[info] Synced package triggered all namespaces, six vendored sources, and spelling without external style downloads."
  )
}

main "$@"

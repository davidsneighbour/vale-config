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

    echo "[info] Synced package triggered DNB, AIDetection, Millennialisms, and spelling rules as expected."
  )
}

main "$@"

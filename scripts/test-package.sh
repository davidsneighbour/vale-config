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

  if ! unzip -p "${package_zip}" config/meta.json | cmp -s meta.json -; then
    echo "[error] Package is missing its Vale compatibility metadata" >&2
    exit 1
  fi

  temp_dir="$(mktemp -d)"
  trap cleanup EXIT

  cat > "${temp_dir}/.vale.ini" <<EOF
StylesPath = .vale

MinAlertLevel = suggestion

Packages = ${package_zip}

[*.md]
BasedOnStyles = Vale, DNBWriting, DNBAIPatterns, DNBMillennialisms
DNBWriting.AgenticCommunal = warning
DNBWriting.Spelling = error
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

Careful edits improve readability. Careful edits improve readability. Careful edits improve readability.

Clear sources help readers find the answer. Clear sources help readers check the evidence. Clear sources help readers trust the result.

The vibrant release will delve into a meticulous and pivotal tapestry with intricate interplay and a seamless finish.
EOF

  (
    cd "${temp_dir}"
    export XDG_DATA_HOME="${temp_dir}/xdg-data"
    export XDG_DATA_DIRS="${temp_dir}/xdg-data"
    export XDG_CACHE_HOME="${temp_dir}/xdg-cache"

    vale sync
    output="$(vale --output=JSON article.md 2>&1 || true)"

    if [[ "${output}" != *"DNBWriting.AgenticCommunal"* ]]; then
      echo "[error] Synced package did not trigger DNBWriting.AgenticCommunal" >&2
      echo "${output}" >&2
      exit 1
    fi

    if [[ "${output}" != *"DNBAIPatterns.ChatbotLeftovers"* ]]; then
      echo "[error] Synced package did not trigger DNBAIPatterns.ChatbotLeftovers" >&2
      echo "${output}" >&2
      exit 1
    fi

    if [[ "${output}" != *"DNBMillennialisms.AnimalSlang"* ]]; then
      echo "[error] Synced package did not trigger DNBMillennialisms.AnimalSlang" >&2
      echo "${output}" >&2
      exit 1
    fi

    if [[ "${output}" != *"DNBWriting.Spelling"* ]]; then
      echo "[error] Synced package did not trigger DNBWriting.Spelling" >&2
      echo "${output}" >&2
      exit 1
    fi

    for rule in DNBWriting.Microsoft-Negative DNBWriting.Google-Periods DNBWriting.alex-Ablist \
      DNBWriting.proselint-Copyright DNBWriting.Readability-Polysyllables DNBWriting.write-good-TooWordy \
      DNBAIPatterns.RepeatedPhrase DNBAIPatterns.RepeatedSentenceOpener DNBAIPatterns.VocabularyDensityError; do
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
      if [[ ! -f ".vale/DNBWriting/licenses/${namespace}/LICENSE" && ! -f ".vale/DNBWriting/licenses/${namespace}/README.md" ]]; then
        echo "[error] Synced package is missing the ${namespace} licence notice" >&2
        exit 1
      fi
    done

    for namespace in DNB AIDetection Millennialisms; do
      if [[ -d ".vale/${namespace}" ]]; then
        echo "[error] Synced package contains legacy namespace ${namespace}" >&2
        exit 1
      fi
    done

    cat >> .vale.ini <<EOF
DNBAIPatterns = NO
DNBMillennialisms = NO
EOF
    output="$(vale --output=JSON article.md 2>&1 || true)"
    if [[ "${output}" != *"DNBWriting.AgenticCommunal"* || "${output}" == *"DNBAIPatterns."* || "${output}" == *"DNBMillennialisms."* ]]; then
      echo "[error] Optional namespaces could not be disabled independently" >&2
      echo "${output}" >&2
      exit 1
    fi

    echo "[info] Synced package triggered all namespaces, six vendored sources, and spelling without external style downloads."
  )
}

main "$@"

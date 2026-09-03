#!/bin/bash

set -euo pipefail

print_help() {
  cat <<EOF
Usage: $(basename "$0") [--help]

Build the distributable Vale package zip for releases.

Creates:
  dist/DNB.zip

Archive layout:
  DNB/
    .vale.ini
    styles/
    README.md
    LICENSE.md
EOF
}

cleanup() {
  if [[ -n "${TEMP_DIR:-}" && -d "${TEMP_DIR}" ]]; then
    rm -rf "${TEMP_DIR}"
  fi
}

require_file() {
  local file="$1"

  if [[ ! -f "${file}" ]]; then
    echo "[error] Missing required file: ${file}" >&2
    exit 1
  fi
}

require_dir() {
  local dir="$1"

  if [[ ! -d "${dir}" ]]; then
    echo "[error] Missing required directory: ${dir}" >&2
    exit 1
  fi
}

main() {
  if [[ "${1:-}" == "--help" ]]; then
    print_help
    exit 0
  fi

  local project_root
  local package_root
  local output_file

  project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  package_root="DNB"
  output_file="dist/DNB.zip"

  cd "${project_root}"

  require_file "src/DNB/.vale.ini"
  require_file "README.md"
  require_file "LICENSE.md"
  require_dir "src/DNB/styles"

  mkdir -p dist

  TEMP_DIR="$(mktemp -d)"
  trap cleanup EXIT

  mkdir -p "${TEMP_DIR}/${package_root}"

  cp "src/DNB/.vale.ini" "${TEMP_DIR}/${package_root}/.vale.ini"
  cp "README.md" "${TEMP_DIR}/${package_root}/README.md"
  cp "LICENSE.md" "${TEMP_DIR}/${package_root}/LICENSE.md"
  cp -R "src/DNB/styles" "${TEMP_DIR}/${package_root}/styles"

  rm -f "${output_file}"

  (
    cd "${TEMP_DIR}"
    zip -rq "${project_root}/${output_file}" "${package_root}"
  )

  if [[ ! -f "${output_file}" ]]; then
    echo "[error] Failed to create ${output_file}" >&2
    exit 1
  fi

  echo "[info] Built ${output_file}"
}

main "$@"

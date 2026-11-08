#!/usr/bin/env bash
set -euo pipefail

# Run from any location inside the repository. Conflicting paths are resolved
# in favor of main; files unique to the backend phase branch are retained.
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

MAIN_REF="${MAIN_REF:-main}"
PHASE_BRANCH_REF="${PHASE_BRANCH_REF:-copilot/backend-phase2-security}"
OUTPUT_DIR="$REPO_ROOT/zip"
OUTPUT_FILE="$OUTPUT_DIR/escape-adventure-combined.zip"

for ref in "$MAIN_REF" "$PHASE_BRANCH_REF"; do
  git rev-parse --verify "$ref^{commit}" >/dev/null || {
    echo "Required Git ref not found: $ref" >&2
    exit 1
  }
done

command -v zip >/dev/null || {
  echo "The 'zip' command is required. Install a ZIP utility and retry." >&2
  exit 1
}

mkdir -p "$OUTPUT_DIR"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

# Extract branch first, then main so main's version wins for overlapping paths.
git archive "$PHASE_BRANCH_REF" | tar -x -C "$TEMP_DIR"
git archive "$MAIN_REF" | tar -x -C "$TEMP_DIR"

rm -f "$OUTPUT_FILE"
(
  cd "$TEMP_DIR"
  zip -qr "$OUTPUT_FILE" .
)

echo "Created: $OUTPUT_FILE"

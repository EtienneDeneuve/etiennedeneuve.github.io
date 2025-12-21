#!/usr/bin/env bash
# List all dependencies (blocked by relationships)

set -uo pipefail

REPO_NAME="${REPO_NAME:-cash-factory-backlog}"
OWNER="${OWNER:-EtienneDeneuve}"
ISSUES_FILE="${ISSUES_FILE:-issues.json}"

command -v jq >/dev/null 2>&1 || { echo "jq not found"; exit 1; }

echo "=== ALL DEPENDENCIES (Blocked By) ==="
echo ""
echo "Format: Issue #X is blocked by Issue #Y"
echo ""

# Get all issues with their depends_on, grouped by type
echo "📦 EPICs:"
jq -r '.issues[] | 
  select(.type == "epic") | 
  select(.depends_on != null and (.depends_on | length) > 0) |
  "\(.id)|\(.depends_on | join(","))"' "$ISSUES_FILE" | while IFS='|' read -r issue_id depends_str; do
  [[ -z "$issue_id" || -z "$depends_str" ]] && continue
  
  issue_title="$(jq -r ".issues[] | select(.id == \"$issue_id\") | .title" "$ISSUES_FILE")"
  
  echo "  $issue_id: $issue_title"
  echo "    Blocked by:"
  
  IFS=',' read -ra dep_array <<< "$depends_str"
  for dep_id in "${dep_array[@]}"; do
    dep_id="$(echo "$dep_id" | xargs)"
    [[ -z "$dep_id" ]] && continue
    dep_title="$(jq -r ".issues[] | select(.id == \"$dep_id\") | .title" "$ISSUES_FILE")"
    dep_type="$(jq -r ".issues[] | select(.id == \"$dep_id\") | .type" "$ISSUES_FILE")"
    echo "    - [$dep_type] $dep_id: $dep_title"
  done
  echo ""
done

echo "🔹 Features:"
jq -r '.issues[] | 
  select(.type == "feature") | 
  select(.depends_on != null and (.depends_on | length) > 0) |
  "\(.id)|\(.depends_on | join(","))"' "$ISSUES_FILE" | while IFS='|' read -r issue_id depends_str; do
  [[ -z "$issue_id" || -z "$depends_str" ]] && continue
  
  issue_title="$(jq -r ".issues[] | select(.id == \"$issue_id\") | .title" "$ISSUES_FILE")"
  
  echo "  $issue_id: $issue_title"
  echo "    Blocked by:"
  
  IFS=',' read -ra dep_array <<< "$depends_str"
  for dep_id in "${dep_array[@]}"; do
    dep_id="$(echo "$dep_id" | xargs)"
    [[ -z "$dep_id" ]] && continue
    dep_title="$(jq -r ".issues[] | select(.id == \"$dep_id\") | .title" "$ISSUES_FILE")"
    dep_type="$(jq -r ".issues[] | select(.id == \"$dep_id\") | .type" "$ISSUES_FILE")"
    echo "    - [$dep_type] $dep_id: $dep_title"
  done
  echo ""
done

echo ""
echo "=== MANUAL SETUP INSTRUCTIONS ==="
echo ""
echo "For each EPIC listed above, set the 'blocked by' relationship:"
echo "1. Go to the EPIC issue in GitHub"
echo "2. Click 'Relationships' in the sidebar"
echo "3. Select 'Mark as blocked by'"
echo "4. Choose the dependency EPIC(s)"
echo ""


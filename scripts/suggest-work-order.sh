#!/usr/bin/env bash
# Suggest work order based on dependencies (topological sort)

set -uo pipefail

ISSUES_FILE="${ISSUES_FILE:-issues.json}"

command -v jq >/dev/null 2>&1 || { echo "jq not found"; exit 1; }

echo "=== SUGGESTED WORK ORDER ==="
echo ""
echo "Based on dependencies, here's the recommended order:"
echo ""

# Build dependency graph and topological sort
# We'll process by level: first issues with no dependencies, then those that depend on them, etc.

# Step 1: Identify all issues and their dependencies
TMP_DEPS="$(mktemp)"
jq -r '.issues[] | 
  "\(.id)|\(.type)|\(.repo)|\(.depends_on // [] | if type == "array" then join(",") else "" end)"' "$ISSUES_FILE" > "$TMP_DEPS"

# Step 2: Process by levels (topological levels)
LEVEL=1
PROCESSED=""
TMP_CURRENT="$(mktemp)"
TMP_NEXT="$(mktemp)"

# Start with issues that have no dependencies (empty or null depends_on)
> "$TMP_CURRENT"
while IFS='|' read -r id type repo deps; do
  [[ -z "$id" ]] && continue
  if [[ -z "$deps" || "$deps" == "" ]]; then
    echo "$id|$type|$repo|$deps" >> "$TMP_CURRENT"
  fi
done < "$TMP_DEPS"

while [[ -s "$TMP_CURRENT" ]]; do
  COUNT="$(wc -l < "$TMP_CURRENT" | xargs)"
  echo "📋 Level $LEVEL ($COUNT issues - can be done in parallel):"
  echo ""
  
  # Group by repo for better organization
  CURRENT_REPO=""
  while IFS='|' read -r id type repo deps; do
    [[ -z "$id" ]] && continue
    
    # Skip if already processed
    if echo "$PROCESSED" | grep -q "^$id$"; then
      continue
    fi
    
    # Show repo header if changed
    if [[ "$repo" != "$CURRENT_REPO" ]]; then
      if [[ -n "$CURRENT_REPO" ]]; then
        echo ""
      fi
      echo "  📁 $repo:"
      CURRENT_REPO="$repo"
    fi
    
    title="$(jq -r ".issues[] | select(.id == \"$id\") | .title" "$ISSUES_FILE")"
    
    # Show dependencies if any
    if [[ -n "$deps" && "$deps" != "" ]]; then
      echo "    [$type] $id: $title"
      echo "      ⚠️  blocked by: $deps"
    else
      echo "    [$type] $id: $title"
    fi
    
    # Mark as processed
    PROCESSED="${PROCESSED}${id}"$'\n'
  done < "$TMP_CURRENT"
  
  echo ""
  echo ""
  
  # Find next level: issues whose dependencies are all in PROCESSED
  > "$TMP_NEXT"
  while IFS='|' read -r id type repo deps; do
    [[ -z "$id" ]] && continue
    
    # Skip if already processed
    if echo "$PROCESSED" | grep -q "^$id$"; then
      continue
    fi
    
    # Check if all dependencies are processed
    if [[ -z "$deps" || "$deps" == "" ]]; then
      # No dependencies, can be done now
      echo "$id|$type|$repo|$deps" >> "$TMP_NEXT"
      continue
    fi
    
    # Check if all dependencies are in PROCESSED
    all_deps_processed=true
    IFS=',' read -ra dep_array <<< "$deps"
    for dep in "${dep_array[@]}"; do
      dep="$(echo "$dep" | xargs)"
      [[ -z "$dep" ]] && continue
      if ! echo "$PROCESSED" | grep -q "^${dep}$"; then
        all_deps_processed=false
        break
      fi
    done
    
    if [[ "$all_deps_processed" == "true" ]]; then
      echo "$id|$type|$repo|$deps" >> "$TMP_NEXT"
    fi
  done < "$TMP_DEPS"
  
  # Move next to current
  mv "$TMP_NEXT" "$TMP_CURRENT"
  LEVEL=$((LEVEL + 1))
  
  # Safety: prevent infinite loop
  if [[ $LEVEL -gt 20 ]]; then
    echo "⚠️  Stopped at level 20 to prevent infinite loop"
    break
  fi
done

# Show any remaining issues (circular dependencies?)
REMAINING=""
while IFS='|' read -r id type repo deps; do
  [[ -z "$id" ]] && continue
  if ! echo "$PROCESSED" | grep -q "^$id$"; then
    REMAINING="${REMAINING}${id} "
  fi
done < "$TMP_DEPS"

if [[ -n "$REMAINING" ]]; then
  echo "⚠️  Issues with unresolved dependencies (may have circular deps):"
  for id in $REMAINING; do
    title="$(jq -r ".issues[] | select(.id == \"$id\") | .title" "$ISSUES_FILE")"
    deps="$(jq -r ".issues[] | select(.id == \"$id\") | .depends_on // [] | join(\", \")" "$ISSUES_FILE")"
    echo "  - $id: $title (depends on: $deps)"
  done
fi

echo ""
echo "=== SUMMARY ==="
echo ""
echo "Work through levels sequentially. Within each level, issues can be done in parallel."
echo "Start with Level 1, then move to Level 2, etc."
echo ""

rm -f "$TMP_DEPS" "$TMP_CURRENT" "$TMP_NEXT"


#!/usr/bin/env bash
# Clean up existing issues: remove duplicates, fix formatting, clean up body

set -euo pipefail

REPO_NAME="${REPO_NAME:-cash-factory-backlog}"
OWNER="${OWNER:-EtienneDeneuve}"
ISSUES_FILE="${ISSUES_FILE:-issues.json}"

command -v gh >/dev/null 2>&1 || { echo "gh CLI not found"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq not found"; exit 1; }

# Ensure authenticated
gh auth status >/dev/null 2>&1 || { echo "Not authenticated. Run: gh auth login"; exit 1; }

# Determine owner
if [[ -z "$OWNER" ]]; then
  OWNER="$(gh api user -q .login)"
fi

FULL_REPO="$OWNER/$REPO_NAME"

echo "Cleaning up issues in $FULL_REPO..."
echo ""

# Build ID -> issue number mapping
ID_TO_NUM="$(mktemp)"
gh api "repos/$FULL_REPO/issues?state=all&per_page=100" --paginate 2>/dev/null | \
  jq -r '.[] | 
    select(.body != null) | 
    (.body | fromjson? // .) as $body_text |
    select($body_text | contains("**ID:**")) | 
    ($body_text | match("\\*\\*ID:\\*\\* ([A-Z]+-[A-Z]+-[0-9]+)") | .captures[0].string) as $id |
    select($id != null and $id != "") |
    {number: .number, id: $id, body: $body_text}' 2>/dev/null | \
  jq -s 'INDEX(.id)' > "$ID_TO_NUM" || echo '{}' > "$ID_TO_NUM"

count="$(jq 'length' "$ID_TO_NUM")"
echo "Found $count issues to check"
echo ""

# Process each issue
TMP_COUNTS="$(mktemp)"
echo "0|0" > "$TMP_COUNTS"  # cleaned|skipped

jq -r 'to_entries[] | "\(.key)|\(.value.number)|\(.value.body)"' "$ID_TO_NUM" | while IFS='|' read -r id num body; do
  [[ -z "$id" || -z "$num" ]] && continue
  
  # Get issue data from JSON
  issue_data="$(jq -r ".issues[] | select(.id == \"$id\")" "$ISSUES_FILE" 2>/dev/null || echo '{}')"
  if [[ "$issue_data" == "{}" ]]; then
    echo "  ⊘ Skipping #$num ($id) - not in issues.json"
    IFS='|' read -r cleaned skipped < "$TMP_COUNTS"
    echo "$cleaned|$((skipped + 1))" > "$TMP_COUNTS"
    continue
  fi
  
  type="$(jq -r '.type // ""' <<<"$issue_data")"
  target_repo="$(jq -r '.repo // ""' <<<"$issue_data")"
  parent="$(jq -r '.parent // empty' <<<"$issue_data")"
  depends_on="$(jq -r '.depends_on // []' <<<"$issue_data")"
  acceptance="$(jq -r '.acceptance // []' <<<"$issue_data")"
  
  # Build clean body (using printf to handle newlines properly)
  id_map_json="$(jq -r 'to_entries | map({key: .value.id, value: .value.number}) | from_entries' "$ID_TO_NUM")"
  
  # Build parent link
  parent_link="$parent"
  if [[ -n "$parent" && "$parent" != "" ]]; then
    parent_num="$(echo "$id_map_json" | jq -r ".[\"$parent\"] // empty")"
    if [[ -n "$parent_num" && "$parent_num" != "null" ]]; then
      parent_link="#$parent_num"
    fi
  fi
  
  # Build depends_on links
  depends_links=""
  if [[ "$(echo "$depends_on" | jq 'if type == "array" then length else 0 end')" -gt 0 ]]; then
    depends_links="$(echo "$depends_on" | jq -r --argjson id_map "$id_map_json" '
      map(
        ($id_map[.] // null) as $num |
        if $num then "#" + ($num | tostring) else . end
      ) | join(", ")
    ')"
  fi
  
  # Build acceptance criteria bullets
  acceptance_bullets=""
  if [[ "$(echo "$acceptance" | jq 'if type == "array" then length else 0 end')" -gt 0 ]]; then
    acceptance_bullets="$(echo "$acceptance" | jq -r 'map("- " + .) | join("\n")')"
  else
    acceptance_bullets="- (define)"
  fi
  
  # Build clean body
  clean_body="## Backlog

- **ID:** $id
- **Type:** $type
- **Target:** $target_repo"
  
  if [[ -n "$parent" && "$parent" != "" ]]; then
    clean_body="${clean_body}
- **Parent:** $parent_link"
  fi
  
  if [[ -n "$depends_links" ]]; then
    clean_body="${clean_body}
- **Depends on:** $depends_links"
  fi
  
  clean_body="${clean_body}

## Acceptance criteria

${acceptance_bullets}
"
  
  # Compare with current body (normalize whitespace)
  current_normalized="$(echo "$body" | sed 's/\r//g' | sed 's/[[:space:]]*$//' | sed '/^$/N;/^\n$/d')"
  clean_normalized="$(echo "$clean_body" | sed 's/\r//g' | sed 's/[[:space:]]*$//' | sed '/^$/N;/^\n$/d')"
  
  if [[ "$current_normalized" == "$clean_normalized" ]]; then
    echo "  ✓ #$num ($id) - already clean"
    IFS='|' read -r cleaned skipped < "$TMP_COUNTS"
    echo "$cleaned|$((skipped + 1))" > "$TMP_COUNTS"
    continue
  fi
  
  # Update issue
  payload="$(jq -n --arg body "$clean_body" '{body: $body}')"
  if gh api -X PATCH "repos/$FULL_REPO/issues/$num" --input - <<<"$payload" >/dev/null 2>&1; then
    echo "  🧹 Cleaned #$num ($id)"
    IFS='|' read -r cleaned skipped < "$TMP_COUNTS"
    echo "$((cleaned + 1))|$skipped" > "$TMP_COUNTS"
    sleep 0.5
  else
    echo "  ❌ Failed to update #$num ($id)"
  fi
done

IFS='|' read -r cleaned skipped < "$TMP_COUNTS"
echo ""
echo "Done! Cleaned $cleaned issues, skipped $skipped"
rm -f "$TMP_COUNTS"

# Cleanup
rm -f "$ID_TO_NUM"


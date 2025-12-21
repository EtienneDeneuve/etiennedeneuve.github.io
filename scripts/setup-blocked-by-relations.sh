#!/usr/bin/env bash
# Setup "blocked by" relationships between issues based on depends_on in issues.json

set -uo pipefail

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

echo "Setting up 'blocked by' relationships in $FULL_REPO..."
echo ""

# Build ID -> issue number mapping
echo "Fetching issues from GitHub..."
ID_TO_NUM="$(mktemp)"
gh api "repos/$FULL_REPO/issues?state=all&per_page=100" --paginate 2>/dev/null | \
  jq -r '.[] | 
    select(.body != null) | 
    (.body | fromjson? // .) as $body_text |
    select($body_text | contains("**ID:**")) | 
    ($body_text | match("\\*\\*ID:\\*\\* ([A-Z]+-[A-Z]+-[0-9]+)") | .captures[0].string) as $id |
    select($id != null and $id != "") |
    {number: .number, id: $id}' 2>/dev/null | \
  jq -s 'INDEX(.id) | with_entries(.value = .value.number)' > "$ID_TO_NUM" || echo '{}' > "$ID_TO_NUM"

count="$(jq 'length' "$ID_TO_NUM")"
echo "Found $count issues in GitHub"
echo ""

# Process issues with depends_on
echo "Setting up 'blocked by' relationships..."
TMP_COUNTS="$(mktemp)"
echo "0|0|0" > "$TMP_COUNTS"  # linked|skipped|failed

RELATIONS_FILE="blocked-by-relations.txt"
echo "# Blocked By Relationships" > "$RELATIONS_FILE"
echo "# Format: Issue #X is blocked by Issue #Y" >> "$RELATIONS_FILE"
echo "# Use this file as a reference to set relationships manually in GitHub UI" >> "$RELATIONS_FILE"
echo "" >> "$RELATIONS_FILE"

TMP_ISSUES="$(mktemp)"
jq -r '.issues[] | select(.depends_on != null and (.depends_on | length) > 0) | "\(.id)|\(.depends_on | join(","))"' "$ISSUES_FILE" > "$TMP_ISSUES"

while IFS='|' read -r issue_id depends_str; do
  [[ -z "$issue_id" || -z "$depends_str" ]] && continue
  
  # Get current issue number
  current_num="$(jq -r ".[\"$issue_id\"] // empty" "$ID_TO_NUM")"
  if [[ -z "$current_num" || "$current_num" == "null" ]]; then
    echo "  ⊘ Skipping $issue_id - not found in GitHub"
    IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
    echo "$linked|$((skipped + 1))|$failed" > "$TMP_COUNTS"
    continue
  fi
  
  echo "  Processing #$current_num ($issue_id) - depends on: $depends_str"
  
  # Process each dependency
  IFS=',' read -ra dep_array <<< "$depends_str"
  for dep_id in "${dep_array[@]}"; do
    dep_id="$(echo "$dep_id" | xargs)"  # trim
    [[ -z "$dep_id" ]] && continue
    
    # Get dependency issue number
    dep_num="$(jq -r ".[\"$dep_id\"] // empty" "$ID_TO_NUM")"
    if [[ -z "$dep_num" || "$dep_num" == "null" ]]; then
      echo "    ⊘ Dependency $dep_id not found"
      IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
      echo "$linked|$((skipped + 1))|$failed" > "$TMP_COUNTS"
      continue
    fi
    
    # Skip if same issue
    if [[ "$current_num" == "$dep_num" ]]; then
      echo "    ⊘ Skipping self-reference"
      continue
    fi
    
    echo "    Setting #$current_num blocked by #$dep_num..."
    
    # GitHub doesn't provide a public API for "blocked by" relationships
    # We'll create a mapping file and add comments for documentation
    echo "    #$current_num blocked by #$dep_num" >> "$RELATIONS_FILE"
    
    # Add a comment documenting the relationship
    comment_body="## Dependencies

This issue is **blocked by** #$dep_num

💡 To set this relationship in GitHub:
1. Click 'Relationships' in the sidebar
2. Select 'Mark as blocked by'
3. Choose issue #$dep_num"
    
    # Check if comment already exists
    existing_comments="$(gh api "repos/$FULL_REPO/issues/$current_num/comments" -q '.[] | select(.body | contains("blocked by")) | .id' 2>/dev/null | head -1)"
    
    if [[ -z "$existing_comments" ]]; then
      # Add comment with relationship
      if gh api -X POST "repos/$FULL_REPO/issues/$current_num/comments" \
        -f body="$comment_body" >/dev/null 2>&1; then
        echo "    ✓ Added documentation comment"
        IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
        echo "$((linked + 1))|$skipped|$failed" > "$TMP_COUNTS"
        sleep 0.5
      fi
    fi
  done
done < "$TMP_ISSUES"

IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
echo ""
echo "Done! Documentation comments added: $linked, Skipped: $skipped, Failed: $failed"
echo ""
echo "📋 Relationships mapping saved to: $RELATIONS_FILE"
echo ""
echo "⚠️  GitHub's native 'blocked by' relationships must be set manually:"
echo "   1. Open each issue listed in $RELATIONS_FILE"
echo "   2. Click 'Relationships' in the sidebar"
echo "   3. Select 'Mark as blocked by' and choose the dependency issue"
echo ""
echo "💡 Tip: You can batch process these using the GitHub web UI or"
echo "   use a browser automation tool to speed up the process."

rm -f "$ID_TO_NUM" "$TMP_COUNTS" "$TMP_ISSUES"


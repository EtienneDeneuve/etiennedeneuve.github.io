#!/usr/bin/env bash
# Add issues to GitHub Project and optionally set planning fields

set -uo pipefail

REPO_NAME="${REPO_NAME:-cash-factory-backlog}"
OWNER="${OWNER:-EtienneDeneuve}"
ISSUES_FILE="${ISSUES_FILE:-issues.json}"
PROJECT_NUMBER="${PROJECT_NUMBER:-}"

command -v gh >/dev/null 2>&1 || { echo "gh CLI not found"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq not found"; exit 1; }

# Ensure authenticated
gh auth status >/dev/null 2>&1 || { echo "Not authenticated. Run: gh auth login"; exit 1; }

# Determine owner
if [[ -z "$OWNER" ]]; then
  OWNER="$(gh api user -q .login)"
fi

FULL_REPO="$OWNER/$REPO_NAME"

if [[ -z "$PROJECT_NUMBER" ]]; then
  echo "Available projects:"
  gh project list --owner "$OWNER" 2>/dev/null | head -10
  echo ""
  read -p "Enter project number: " PROJECT_NUMBER
fi

if [[ -z "$PROJECT_NUMBER" ]]; then
  echo "❌ Project number required"
  exit 1
fi

echo "Adding issues to project #$PROJECT_NUMBER..."
echo ""

# Get project ID
PROJECT_ID="$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json 2>/dev/null | jq -r '.id // empty')"
if [[ -z "$PROJECT_ID" ]]; then
  echo "❌ Could not find project #$PROJECT_NUMBER"
  exit 1
fi

# Get field IDs
echo "Fetching field IDs..."
FIELDS_JSON="$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json 2>/dev/null)"
START_DATE_FIELD="$(echo "$FIELDS_JSON" | jq -r '.[] | select(.name == "Start Date") | .id' | head -1)"
DUE_DATE_FIELD="$(echo "$FIELDS_JSON" | jq -r '.[] | select(.name == "Due Date") | .id' | head -1)"
DURATION_FIELD="$(echo "$FIELDS_JSON" | jq -r '.[] | select(.name == "Duration") | .id' | head -1)"
PRIORITY_FIELD="$(echo "$FIELDS_JSON" | jq -r '.[] | select(.name == "Priority") | .id' | head -1)"
ORDER_FIELD="$(echo "$FIELDS_JSON" | jq -r '.[] | select(.name == "Order") | .id' | head -1)"

echo "Field IDs:"
echo "  Start Date: ${START_DATE_FIELD:-not found}"
echo "  Due Date: ${DUE_DATE_FIELD:-not found}"
echo "  Duration: ${DURATION_FIELD:-not found}"
echo "  Priority: ${PRIORITY_FIELD:-not found}"
echo "  Order: ${ORDER_FIELD:-not found}"
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
    {number: .number, id: $id, url: .url}' 2>/dev/null | \
  jq -s 'INDEX(.id)' > "$ID_TO_NUM" || echo '{}' > "$ID_TO_NUM"

count="$(jq 'length' "$ID_TO_NUM")"
echo "Found $count issues"
echo ""

# Add issues to project
TMP_COUNTS="$(mktemp)"
echo "0|0" > "$TMP_COUNTS"  # added|skipped

TMP_ISSUES="$(mktemp)"
jq -r 'to_entries[] | "\(.key)|\(.value.number)|\(.value.url)"' "$ID_TO_NUM" > "$TMP_ISSUES"

while IFS='|' read -r id num url; do
  [[ -z "$id" || -z "$num" || -z "$url" ]] && continue
  
  echo "  Adding issue #$num ($id)..."
  
  # Add issue to project
  if gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$url" >/dev/null 2>&1; then
    echo "    ✓ Added to project"
    IFS='|' read -r added skipped < "$TMP_COUNTS"
    echo "$((added + 1))|$skipped" > "$TMP_COUNTS"
  else
    # Check if already in project
    if gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json 2>/dev/null | jq -r ".[] | select(.content.url == \"$url\") | .id" | grep -q .; then
      echo "    ⊘ Already in project"
      IFS='|' read -r added skipped < "$TMP_COUNTS"
      echo "$added|$((skipped + 1))" > "$TMP_COUNTS"
    else
      echo "    ❌ Failed to add"
    fi
  fi
  
  sleep 0.3  # Rate limiting
done < "$TMP_ISSUES"

IFS='|' read -r added skipped < "$TMP_COUNTS"
echo ""
echo "Done! Added: $added, Skipped: $skipped"
rm -f "$TMP_COUNTS" "$TMP_ISSUES"
echo ""
echo "To set dates and plan:"
echo "1. View project: gh project view $PROJECT_NUMBER --owner $OWNER --web"
echo "2. Use GitHub UI to set Start Date, Due Date, and organize items"
echo "3. Or use: gh project item-edit --id <item-id> --project-id $PROJECT_ID --field-id <field-id> --date YYYY-MM-DD"

rm -f "$ID_TO_NUM"


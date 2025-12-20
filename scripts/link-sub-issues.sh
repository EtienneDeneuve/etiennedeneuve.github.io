#!/usr/bin/env bash
# Link issues as sub-issues using gh-sub-issue extension

set -uo pipefail  # Remove -e to allow error handling

REPO_NAME="${REPO_NAME:-cash-factory-backlog}"
OWNER="${OWNER:-EtienneDeneuve}"
ISSUES_FILE="${ISSUES_FILE:-issues.json}"

command -v gh >/dev/null 2>&1 || { echo "gh CLI not found"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq not found"; exit 1; }

# Check if extension is installed
if ! gh extension list | grep -q "gh-sub-issue"; then
  echo "Installing gh-sub-issue extension..."
  gh extension install yahsan2/gh-sub-issue
fi

# Ensure authenticated
gh auth status >/dev/null 2>&1 || { echo "Not authenticated. Run: gh auth login"; exit 1; }

# Determine owner
if [[ -z "$OWNER" ]]; then
  OWNER="$(gh api user -q .login)"
fi

FULL_REPO="$OWNER/$REPO_NAME"

echo "Linking sub-issues in $FULL_REPO..."
echo ""

# Build ID -> issue number mapping from GitHub
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

# Build parent -> children mapping from issues.json
PARENT_TO_CHILDREN="$(mktemp)"
jq -r '.issues[] | select(.parent != null and .parent != "") | "\(.parent)|\(.id)"' "$ISSUES_FILE" | \
  while IFS='|' read -r parent child; do
    [[ -z "$parent" || -z "$child" ]] && continue
    echo "{\"parent\":\"$parent\",\"child\":\"$child\"}"
  done | jq -s 'group_by(.parent) | map({parent: .[0].parent, children: map(.child)}) | INDEX(.parent)' > "$PARENT_TO_CHILDREN"

parent_count="$(jq 'length' "$PARENT_TO_CHILDREN")"
echo "Found $parent_count parents with children"

# Verify file exists and has content
if [[ ! -s "$PARENT_TO_CHILDREN" ]]; then
  echo "Error: PARENT_TO_CHILDREN file is empty!"
  exit 1
fi

# Link sub-issues for each parent
echo "Linking sub-issues..."
TMP_COUNTS="$(mktemp)"
echo "0|0|0" > "$TMP_COUNTS"  # linked|skipped|failed

# Create a temporary file with all parent-child relationships to avoid pipe issues
TMP_PARENTS="$(mktemp)"
jq -r 'to_entries[] | "\(.key)|\(.value.children | join(","))"' "$PARENT_TO_CHILDREN" > "$TMP_PARENTS"

# Process each parent
while IFS='|' read -r parent_id children_str; do
  [[ -z "$parent_id" ]] && continue
  
  echo "  Processing parent: $parent_id (children: $children_str)"
  
  # Get parent issue number
  parent_num="$(jq -r ".[\"$parent_id\"] // empty" "$ID_TO_NUM")"
  if [[ -z "$parent_num" || "$parent_num" == "null" ]]; then
    echo "  ⊘ Skipping $parent_id - not found in GitHub"
    IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
    echo "$linked|$((skipped + 1))|$failed" > "$TMP_COUNTS"
    continue
  fi
  
  echo "  Parent #$parent_num found"
  
  # Process each child (convert comma-separated to array)
  IFS=',' read -ra child_array <<< "$children_str"
  echo "  Processing ${#child_array[@]} children..."
  for child_id in "${child_array[@]}"; do
    child_id="$(echo "$child_id" | xargs)"  # trim whitespace
    [[ -z "$child_id" ]] && continue
    
    echo "    Processing child: $child_id"
    
    # Get child issue number (read file directly to avoid issues)
    if [[ ! -f "$ID_TO_NUM" ]]; then
      echo "      ERROR: ID_TO_NUM file not found!"
      continue
    fi
    
    child_num="$(jq -r ".[\"$child_id\"] // empty" "$ID_TO_NUM" 2>&1)"
    if [[ $? -ne 0 ]]; then
      echo "      ERROR: jq failed: $child_num"
      continue
    fi
    
    echo "      Child number: ${child_num:-NOT FOUND}"
    if [[ -z "$child_num" || "$child_num" == "null" ]]; then
      echo "  ⊘ Skipping $child_id - not found in GitHub"
      IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
      echo "$linked|$((skipped + 1))|$failed" > "$TMP_COUNTS"
      continue
    fi
    
    # Skip if trying to link issue to itself
    if [[ "$parent_num" == "$child_num" ]]; then
      echo "  ⊘ Skipping $child_id -> $parent_id (same issue)"
      IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
      echo "$linked|$((skipped + 1))|$failed" > "$TMP_COUNTS"
      continue
    fi
    
    # Check if already linked to this parent
    echo "      Checking if already linked..."
    existing_links="$(gh sub-issue list "$parent_num" --repo "$FULL_REPO" 2>&1)"
    if echo "$existing_links" | grep -q "#$child_num"; then
      echo "  ⊘ Already linked: #$child_num -> #$parent_num"
      IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
      echo "$linked|$((skipped + 1))|$failed" > "$TMP_COUNTS"
      continue
    fi
    echo "      Not linked yet, proceeding..."
    
    # Link sub-issue
    echo "      Linking #$child_num to #$parent_num..."
    
    # Capture both stdout and stderr (command may fail, that's OK)
    error_output="$(gh sub-issue add "$parent_num" "$child_num" --repo "$FULL_REPO" 2>&1)" || true
    exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
      echo "  ✓ Linked #$child_num ($child_id) -> #$parent_num ($parent_id)"
      IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
      echo "$((linked + 1))|$skipped|$failed" > "$TMP_COUNTS"
      sleep 0.5  # Rate limiting
    else
      # Check error message for specific cases
      if echo "$error_output" | grep -qiE "already|duplicate"; then
        echo "  ⊘ Already linked: #$child_num -> #$parent_num"
        IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
        echo "$linked|$((skipped + 1))|$failed" > "$TMP_COUNTS"
      elif echo "$error_output" | grep -qiE "only have one parent|Sub issue may only have one parent"; then
        echo "  ⚠️  #$child_num ($child_id) already has a different parent - skipping"
        echo "      (Issue can only have one parent. Remove existing parent link manually if needed)"
        IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
        echo "$linked|$((skipped + 1))|$failed" > "$TMP_COUNTS"
      else
        echo "  ❌ Failed to link #$child_num -> #$parent_num"
        echo "     Error: $(echo "$error_output" | grep -i "error\|failed" | head -1 | cut -c1-80)"
        IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
        echo "$linked|$skipped|$((failed + 1))" > "$TMP_COUNTS"
      fi
    fi
  done
done < "$TMP_PARENTS"

IFS='|' read -r linked skipped failed < "$TMP_COUNTS"
echo ""
echo "Done! Linked: $linked, Skipped: $skipped, Failed: $failed"
rm -f "$TMP_COUNTS" "$TMP_PARENTS"

# Cleanup
rm -f "$ID_TO_NUM" "$PARENT_TO_CHILDREN"


#!/usr/bin/env bash
set -euo pipefail

# ====== CONFIG (EDIT THESE) ======
REPO_NAME="${REPO_NAME:-cash-factory-backlog}"
# Put empty to use your default logged-in user as owner
OWNER="${OWNER:-EtienneDeneuve}"                 # e.g. "etiennedeneuve" or "" to auto-detect
WIFE_GH="${WIFE_GH:-axtious}" # e.g. "jane-doe"
DESCRIPTION="${DESCRIPTION:-Private backlog: MyDare + Omnivya + Personal + Tooling}"

ISSUES_FILE="${ISSUES_FILE:-issues.json}"
# ====== END CONFIG ======

command -v gh >/dev/null 2>&1 || { echo "gh CLI not found"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq not found"; exit 1; }

# Ensure authenticated
gh auth status >/dev/null 2>&1 || { echo "Not authenticated. Run: gh auth login"; exit 1; }

# Display auth info for debugging
echo "Authenticated as: $(gh api user -q .login)"
echo "Using token: $(gh auth token | cut -c1-10)..."

if [[ ! -f "$ISSUES_FILE" ]]; then
  echo "Missing $ISSUES_FILE in current directory."
  exit 1
fi

# Determine owner
if [[ -z "$OWNER" ]]; then
  OWNER="$(gh api user -q .login)"
fi

FULL_REPO="$OWNER/$REPO_NAME"

echo "Creating private repo: $FULL_REPO"
# Create repo (private) with issues enabled (default). Add README for convenience.
# If it already exists, skip creation.
if gh repo view "$FULL_REPO" >/dev/null 2>&1; then
  echo "Repo already exists: $FULL_REPO"
else
  gh repo create "$FULL_REPO" --private --confirm --description "$DESCRIPTION" --add-readme
fi

echo "Inviting wife collaborator (admin): $WIFE_GH"
# Add wife as collaborator with admin permission so she can manage issues too.
# If you prefer less power, change permission=maintain or push.
gh api -X PUT "repos/$FULL_REPO/collaborators/$WIFE_GH" -f permission=admin >/dev/null

# Safety: list collaborators (visibility check)
echo "Current collaborators:"
gh api "repos/$FULL_REPO/collaborators" -q '.[].login' | sed 's/^/ - /'

# Create labels used by backlog (idempotent)
# Colors are arbitrary; adjust if you care.
declare -A LABELS=(
  ["epic"]="7f1d1d"
  ["feature"]="1d4ed8"
  ["task"]="0f766e"
  ["platform"]="334155"
  ["automation"]="334155"
  ["ci"]="111827"
  ["seo"]="7c3aed"
  ["sales"]="b45309"
  ["conversion"]="be123c"
  ["recurring"]="15803d"
  ["nearshore"]="0ea5e9"
  ["trust"]="a21caf"
  ["content"]="4b5563"
  ["ops"]="1f2937"
  ["privacy"]="7c2d12"
  ["risk"]="7c2d12"
  ["perf"]="0f172a"
  ["monitoring"]="0f172a"
  ["release"]="0f172a"
  ["growth"]="be185d"
  ["analytics"]="0369a1"
  ["observability"]="0369a1"
  ["grafana-cloud"]="0369a1"
  ["rum"]="0369a1"
  ["dashboards"]="0369a1"
  ["alerts"]="0369a1"
  ["finops"]="0369a1"
  ["self-hosted"]="0369a1"
  ["b2b"]="15803d"
  ["local"]="15803d"
  ["reputation"]="15803d"
  ["authority"]="a21caf"
  ["dx"]="334155"
  ["quality-gate"]="111827"
  ["validator"]="111827"
  ["a11y"]="0f766e"
  ["ux"]="0f766e"
)

echo "Ensuring labels exist..."
for name in "${!LABELS[@]}"; do
  color="${LABELS[$name]}"
  gh label create "$name" --repo "$FULL_REPO" --color "$color" --force >/dev/null 2>&1 || true
done

# Create issues
echo "Creating issues from $ISSUES_FILE ..."
TMP_MAP="$(mktemp)"
echo -e "id\tissue_number\turl" > "$TMP_MAP"

count="$(jq '.issues | length' "$ISSUES_FILE")"
echo "Total issues to create: $count"
echo ""

# Build a cache of existing issues by ID (from body) to avoid duplicates
echo "Checking for existing issues..."
EXISTING_ISSUES_CACHE="$(mktemp)"
gh api "repos/$FULL_REPO/issues?state=all&per_page=100" --paginate 2>/dev/null | \
  jq -r '.[] | 
    select(.body != null) | 
    select(.body | contains("**ID:**")) | 
    (.body | capture("\\*\\*ID:\\*\\* (?<id>[^\\n]+)") | .id | gsub("^\\s+|\\s+$"; "")) as $id |
    select($id != null) |
    {number: .number, id: $id, url: .html_url}' 2>/dev/null | \
  jq -s 'INDEX(.id)' > "$EXISTING_ISSUES_CACHE" || echo '{}' > "$EXISTING_ISSUES_CACHE"
existing_count="$(jq 'length' "$EXISTING_ISSUES_CACHE")"
echo "Found $existing_count existing issues in repo"
echo ""

for i in $(seq 0 $((count - 1))); do
  issue="$(jq -c ".issues[$i]" "$ISSUES_FILE")"
  id="$(jq -r '.id' <<<"$issue")"
  type="$(jq -r '.type' <<<"$issue")"
  target_repo="$(jq -r '.repo' <<<"$issue")"
  title="$(jq -r '.title' <<<"$issue")"

  parent="$(jq -r '.parent // empty' <<<"$issue")"
  depends="$(jq -r '.depends_on // [] | join(", ")' <<<"$issue")"
  labels="$(jq -r '.labels // [] | join(",")' <<<"$issue")"
  
  # Check if issue already exists
  existing="$(jq -r ".[\"$id\"] // empty" "$EXISTING_ISSUES_CACHE")"
  if [[ -n "$existing" && "$existing" != "null" ]]; then
    num="$(jq -r '.number' <<<"$existing")"
    url="$(jq -r '.url' <<<"$existing")"
    echo -e "${id}\t${num}\t${url}" >> "$TMP_MAP"
    echo "  ⊘ [$((i + 1))/$count] Skipped $id -> #$num (already exists)"
    continue
  fi

  # Body with structure, links by IDs, acceptance criteria as bullets
  body="$(
    jq -r '
      def bullets(a): 
        if (a|length)==0 then "" 
        else (a | map("- " + .) | join("\n")) + "\n"
        end;
      "## Backlog\n\n"
      + "- **ID:** " + .id + "\n"
      + "- **Type:** " + .type + "\n"
      + "- **Target:** " + .repo + "\n"
      + (if (.parent // "" ) != "" then "- **Parent:** " + .parent + "\n" else "" end)
      + (if ((.depends_on // [])|length) > 0 then "- **Depends on:** " + ((.depends_on)|join(", ")) + "\n" else "" end)
      + "\n## Acceptance criteria\n\n"
      + (if ((.acceptance // [])|length) > 0 then bullets(.acceptance) else "- (define)\n" end)
    ' <<<"$issue"
  )"

  # Prefix title to keep triage sane
  full_title="[$target_repo] [${type^^}] $title"

  # Create issue via API (returns JSON by default)
  # Convert comma-separated labels to JSON array
  if [[ -n "$labels" ]]; then
    labels_json="$(jq -R -s -c 'split(",") | map(select(length > 0) | gsub("^\\s+|\\s+$"; ""))' <<<"$labels")"
  else
    labels_json="[]"
  fi
  
  # Build JSON payload and send via stdin
  payload="$(jq -n \
    --arg title "$full_title" \
    --arg body "$body" \
    --argjson labels "$labels_json" \
    '{title: $title, body: $body, labels: $labels}')"
  
  # Retry logic for rate limiting
  max_retries=3
  retry_delay=5
  attempt=0
  created=""
  
  while [[ $attempt -lt $max_retries ]]; do
    created="$(gh api -X POST "repos/$FULL_REPO/issues" --input - <<<"$payload" 2>&1)"
    
    # Check if it's valid JSON (success)
    if echo "$created" | jq -e . >/dev/null 2>&1; then
      # Verify it has the expected fields
      if echo "$created" | jq -e '.number' >/dev/null 2>&1; then
        break
      fi
    fi
    
    # Check if it's a rate limit error
    if echo "$created" | grep -qi "rate limit\|429\|403"; then
      attempt=$((attempt + 1))
      if [[ $attempt -lt $max_retries ]]; then
        wait_time=$((retry_delay * attempt))
        echo "  ⚠️  Rate limit hit. Waiting ${wait_time}s before retry ($attempt/$max_retries)..."
        sleep "$wait_time"
      else
        echo "  ❌ Failed after $max_retries attempts. Error: $created"
        exit 1
      fi
    else
      # Other error
      echo "  ❌ Error creating issue: $created"
      exit 1
    fi
  done
  
  num="$(jq -r '.number' <<<"$created")"
  url="$(jq -r '.html_url' <<<"$created")"

  echo -e "${id}\t${num}\t${url}" >> "$TMP_MAP"
  echo "  ✓ [$((i + 1))/$count] Created $id -> #$num"
  
  # Add delay between requests to avoid rate limiting (except for last item)
  if [[ $i -lt $((count - 1)) ]]; then
    sleep 1
  fi
done

echo ""
echo "Creating links and sub-issues between EPICs, Features, and Tasks..."

# Build ID -> issue number mapping from TMP_MAP
ID_TO_NUM="$(mktemp)"
tail -n +2 "$TMP_MAP" | while IFS=$'\t' read -r id num url; do
  [[ -n "$id" && -n "$num" ]] && echo "{\"id\":\"$id\",\"num\":$num}"
done | jq -s 'INDEX(.id) | with_entries(.value = .value.num)' > "$ID_TO_NUM"

# Build parent -> children mapping
PARENT_TO_CHILDREN="$(mktemp)"
jq -r '.issues[] | select(.parent != null and .parent != "") | "\(.parent)|\(.id)"' "$ISSUES_FILE" | \
  while IFS='|' read -r parent child; do
    echo "{\"parent\":\"$parent\",\"child\":\"$child\"}"
  done | jq -s 'group_by(.parent) | map({parent: .[0].parent, children: map(.child)}) | INDEX(.parent)' > "$PARENT_TO_CHILDREN"

# First pass: Update child issues with parent links
linked_count=0
for i in $(seq 0 $((count - 1))); do
  issue="$(jq -c ".issues[$i]" "$ISSUES_FILE")"
  id="$(jq -r '.id' <<<"$issue")"
  parent="$(jq -r '.parent // empty' <<<"$issue")"
  depends_on="$(jq -r '.depends_on // []' <<<"$issue")"
  
  # Get current issue number
  current_num="$(jq -r ".[\"$id\"] // empty" "$ID_TO_NUM")"
  if [[ -z "$current_num" || "$current_num" == "null" ]]; then
    continue
  fi
  
  # Get current body
  current_body="$(gh api "repos/$FULL_REPO/issues/$current_num" -q '.body // ""' 2>/dev/null)"
  if [[ -z "$current_body" ]]; then
    continue
  fi
  
  # Skip if already has GitHub links (already processed)
  if echo "$current_body" | grep -q "\\*\\*Parent:\\*\\* #"; then
    continue
  fi
  
  new_body="$current_body"
  updated=false
  
  # Replace parent ID with GitHub link (only if it's still an ID, not already a link)
  if [[ -n "$parent" && "$parent" != "" ]]; then
    parent_num="$(jq -r ".[\"$parent\"] // empty" "$ID_TO_NUM")"
    if [[ -n "$parent_num" && "$parent_num" != "null" ]]; then
      # Only replace if it's still an ID (not already a GitHub link)
      if echo "$new_body" | grep -q "\\*\\*Parent:\\*\\* $parent[^0-9]"; then
        new_body="$(echo "$new_body" | sed "s|\\*\\*Parent:\\*\\* $parent|**Parent:** #$parent_num|g")"
        updated=true
      fi
    fi
  fi
  
  # Replace depends_on IDs with GitHub links (only if still IDs, not already links)
  if [[ "$(echo "$depends_on" | jq 'if type == "array" then length else 0 end')" -gt 0 ]]; then
    for dep_id in $(echo "$depends_on" | jq -r 'if type == "array" then .[] else empty end'); do
      dep_num="$(jq -r ".[\"$dep_id\"] // empty" "$ID_TO_NUM")"
      if [[ -n "$dep_num" && "$dep_num" != "null" ]]; then
        # Only replace if it's still an ID (not already a GitHub link)
        if echo "$new_body" | grep -qE "\\*\\*Depends on:\\*\\*.*[^#]$dep_id([^0-9]|$)"; then
          new_body="$(echo "$new_body" | sed -E "s|([^#])$dep_id([^0-9]|$)|\\1#$dep_num\\2|g")"
          updated=true
        fi
      fi
    done
  fi
  
  # Update body if changed
  if [[ "$updated" == "true" && "$current_body" != "$new_body" ]]; then
    payload="$(jq -n --arg body "$new_body" '{body: $body}')"
    if gh api -X PATCH "repos/$FULL_REPO/issues/$current_num" --input - <<<"$payload" >/dev/null 2>&1; then
      linked_count=$((linked_count + 1))
      echo "  🔗 Updated #$current_num ($id)"
      sleep 0.5
    fi
  fi
done

# Second pass: Add sub-issues (task lists) to parent issues (EPICs and Features)
echo ""
echo "Adding sub-issues to EPICs and Features..."
subissues_count=0
for i in $(seq 0 $((count - 1))); do
  issue="$(jq -c ".issues[$i]" "$ISSUES_FILE")"
  id="$(jq -r '.id' <<<"$issue")"
  type="$(jq -r '.type' <<<"$issue")"
  
  # Only process EPICs and Features (they can have children)
  if [[ "$type" != "epic" && "$type" != "feature" ]]; then
    continue
  fi
  
  # Get current issue number
  current_num="$(jq -r ".[\"$id\"] // empty" "$ID_TO_NUM")"
  if [[ -z "$current_num" || "$current_num" == "null" ]]; then
    continue
  fi
  
  # Get children for this parent
  children="$(jq -r ".[\"$id\"] // null" "$PARENT_TO_CHILDREN")"
  if [[ -z "$children" || "$children" == "null" ]]; then
    continue
  fi
  
  # Get current body
  current_body="$(gh api "repos/$FULL_REPO/issues/$current_num" -q '.body // ""' 2>/dev/null)"
  if [[ -z "$current_body" ]]; then
    continue
  fi
  
  # Check if sub-issues section already exists
  if echo "$current_body" | grep -q "## Sub-issues\|## Tasks"; then
    continue
  fi
  
  # Build sub-issues task list
  subissues_list=""
  for child_id in $(echo "$children" | jq -r '.children[]?'); do
    child_num="$(jq -r ".[\"$child_id\"] // empty" "$ID_TO_NUM")"
    if [[ -n "$child_num" && "$child_num" != "null" ]]; then
      child_title="$(jq -r ".issues[] | select(.id == \"$child_id\") | .title" "$ISSUES_FILE")"
      subissues_list="${subissues_list}- [ ] #$child_num $child_title\n"
    fi
  done
  
  # Only add if we have sub-issues
  if [[ -z "$subissues_list" ]]; then
    continue
  fi
  
  # Append sub-issues section to body (with proper spacing)
  if [[ "$current_body" =~ $'\n\n'$ ]]; then
    new_body="${current_body}## Sub-issues\n\n${subissues_list}"
  else
    new_body="${current_body}\n\n## Sub-issues\n\n${subissues_list}"
  fi
  
  # Update body
  payload="$(jq -n --arg body "$new_body" '{body: $body}')"
  if gh api -X PATCH "repos/$FULL_REPO/issues/$current_num" --input - <<<"$payload" >/dev/null 2>&1; then
    subissues_count=$((subissues_count + 1))
    echo "  📋 Added sub-issues to #$current_num ($id)"
    sleep 0.5
  fi
done

# Cleanup
rm -f "$PARENT_TO_CHILDREN"

echo ""
echo "Done. Mapping saved to: $TMP_MAP"
echo "Linked $linked_count issues"

# Cleanup
rm -f "$EXISTING_ISSUES_CACHE" "$ID_TO_NUM"

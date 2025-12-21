#!/usr/bin/env bash
# Generate a tree view of issues for manual linking in GitHub

ISSUES_FILE="${ISSUES_FILE:-issues.json}"
REPO_NAME="${REPO_NAME:-cash-factory-backlog}"
OWNER="${OWNER:-EtienneDeneuve}"
MAPPING_FILE="${MAPPING_FILE:-}"

if [[ ! -f "$ISSUES_FILE" ]]; then
  echo "Missing $ISSUES_FILE"
  exit 1
fi

command -v jq >/dev/null 2>&1 || { echo "jq not found"; exit 1; }

# Build ID -> GitHub issue number mapping
ID_TO_NUM="$(mktemp)"

# Try to use mapping file if provided
if [[ -n "$MAPPING_FILE" && -f "$MAPPING_FILE" ]]; then
  echo "Using mapping file: $MAPPING_FILE"
  tail -n +2 "$MAPPING_FILE" | while IFS=$'\t' read -r id num url; do
    [[ -n "$id" && -n "$num" ]] && echo "{\"id\":\"$id\",\"num\":$num}"
  done | jq -s 'INDEX(.id) | with_entries(.value = .value.num)' > "$ID_TO_NUM"
elif command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "Fetching issue numbers from GitHub..."
  FULL_REPO="$OWNER/$REPO_NAME"
  
  # Check if repo exists
  if gh repo view "$FULL_REPO" >/dev/null 2>&1; then
    gh api "repos/$FULL_REPO/issues?state=all&per_page=100" --paginate 2>/dev/null | \
      jq -r '.[] | 
        select(.body != null) | 
        select(.body | contains("**ID:**")) | 
        (.body | capture("\\*\\*ID:\\*\\* (?<id>[^\\n]+)") | .id | gsub("^\\s+|\\s+$"; "")) as $id |
        select($id != null) |
        {number: .number, id: $id}' 2>/dev/null | \
      jq -s 'INDEX(.id) | with_entries(.value = .value.number)' > "$ID_TO_NUM" || echo '{}' > "$ID_TO_NUM"
    echo "Found $(jq 'length' "$ID_TO_NUM") issues in GitHub"
  else
    echo "Repo $FULL_REPO not found. Run issues-creator.sh first or set MAPPING_FILE"
    echo '{}' > "$ID_TO_NUM"
  fi
else
  echo "GitHub CLI not available. Set MAPPING_FILE to use a mapping file."
  echo '{}' > "$ID_TO_NUM"
fi

echo ""
echo "=== ISSUE HIERARCHY TREE ==="
echo ""
echo "Format: [ID] #GitHubNum Title"
echo "  └─ [ID] #GitHubNum Child Title"
echo ""

# Helper function to get GitHub issue number
get_github_num() {
  local id="$1"
  jq -r ".[\"$id\"] // \"?\"" "$ID_TO_NUM"
}

# Get all EPICs (no parent)
jq -r '.issues[] | select(.type == "epic") | .id' "$ISSUES_FILE" | while read -r epic_id; do
  epic="$(jq -r ".issues[] | select(.id == \"$epic_id\")" "$ISSUES_FILE")"
  epic_title="$(jq -r '.title' <<<"$epic")"
  epic_repo="$(jq -r '.repo' <<<"$epic")"
  epic_num="$(get_github_num "$epic_id")"
  
  if [[ "$epic_num" == "?" ]]; then
    echo "📦 [$epic_id] $epic_title ($epic_repo)"
  else
    echo "📦 [$epic_id] #$epic_num $epic_title ($epic_repo)"
  fi
  
  # Get Features under this EPIC
  features="$(jq -r ".issues[] | select(.parent == \"$epic_id\" and .type == \"feature\") | .id" "$ISSUES_FILE")"
  
  if [[ -z "$features" ]]; then
    echo "  (no features)"
  else
    echo "$features" | while read -r feat_id; do
      [[ -z "$feat_id" ]] && continue
      
      feat="$(jq -r ".issues[] | select(.id == \"$feat_id\")" "$ISSUES_FILE")"
      feat_title="$(jq -r '.title' <<<"$feat")"
      feat_num="$(get_github_num "$feat_id")"
      
      # Get Tasks under this Feature
      tasks="$(jq -r ".issues[] | select(.parent == \"$feat_id\" and .type == \"task\") | .id" "$ISSUES_FILE")"
      
      if [[ "$feat_num" == "?" ]]; then
        echo "  └─ 🔹 [$feat_id] $feat_title"
      else
        echo "  └─ 🔹 [$feat_id] #$feat_num $feat_title"
      fi
      
      if [[ -z "$tasks" ]]; then
        echo "      (no tasks)"
      else
        echo "$tasks" | while read -r task_id; do
          [[ -z "$task_id" ]] && continue
          task="$(jq -r ".issues[] | select(.id == \"$task_id\")" "$ISSUES_FILE")"
          task_title="$(jq -r '.title' <<<"$task")"
          task_num="$(get_github_num "$task_id")"
          
          if [[ "$task_num" == "?" ]]; then
            echo "      └─ ✓ [$task_id] $task_title"
          else
            echo "      └─ ✓ [$task_id] #$task_num $task_title"
          fi
        done
      fi
    done
  fi
  
  echo ""
done

# Cleanup
rm -f "$ID_TO_NUM"

echo ""
echo "=== MANUAL LINKING INSTRUCTIONS ==="
echo ""
echo "For each EPIC/Feature, add this to the body:"
echo ""
echo "## Sub-issues"
echo ""
echo "Then add task list items using the GitHub issue numbers shown above:"
echo "- [ ] #[issue_number] [Title]"
echo ""
echo "Example (using numbers from tree above):"
echo "## Sub-issues"
echo ""
echo "- [ ] #123 Feature: Build-time validators"
echo "- [ ] #124 Task: Validator: numeric metrics require source"
echo "- [ ] #125 Task: Validator: testimonials require identity"
echo ""
echo "Note: Issues marked with '?' are not yet created in GitHub."
echo "      Run issues-creator.sh first, or set MAPPING_FILE to a mapping file."
echo ""


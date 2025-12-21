#!/usr/bin/env bash
# Setup a GitHub Project with Gantt/timeline fields for planning

set -uo pipefail

REPO_NAME="${REPO_NAME:-cash-factory-backlog}"
OWNER="${OWNER:-EtienneDeneuve}"
PROJECT_NUMBER="${PROJECT_NUMBER:-}"

command -v gh >/dev/null 2>&1 || { echo "gh CLI not found"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq not found"; exit 1; }

# Ensure authenticated with project scope
gh auth status >/dev/null 2>&1 || { echo "Not authenticated. Run: gh auth login"; exit 1; }

# Check for project scope
if ! gh auth status 2>&1 | grep -q "project"; then
  echo "⚠️  Project scope needed. Run: gh auth refresh -s project"
  echo "Continuing anyway..."
fi

# Determine owner
if [[ -z "$OWNER" ]]; then
  OWNER="$(gh api user -q .login)"
fi

echo "Setting up GitHub Project for planning/Gantt..."
echo ""

# If project number not provided, list projects
if [[ -z "$PROJECT_NUMBER" ]]; then
  echo "Available projects:"
  gh project list --owner "$OWNER" 2>/dev/null | head -10
  echo ""
  read -p "Enter project number (or press Enter to create new): " PROJECT_NUMBER
  
  if [[ -z "$PROJECT_NUMBER" ]]; then
    echo "Creating new project..."
    PROJECT_OUTPUT="$(gh project create --owner "$OWNER" --title "Backlog Planning" --body "Project for backlog planning with timeline" 2>&1)"
    if [[ $? -eq 0 ]]; then
      PROJECT_NUMBER="$(echo "$PROJECT_OUTPUT" | grep -oP 'project \K[0-9]+' || echo "")"
      if [[ -z "$PROJECT_NUMBER" ]]; then
        # Try to get from JSON if available
        PROJECT_NUMBER="$(gh project list --owner "$OWNER" --format json 2>/dev/null | jq -r '.[0].number // empty')"
      fi
    fi
    
    if [[ -z "$PROJECT_NUMBER" ]]; then
      echo "❌ Failed to create or find project"
      exit 1
    fi
    echo "✓ Created/found project #$PROJECT_NUMBER"
  fi
fi

echo "Using project #$PROJECT_NUMBER"
echo ""

# Create planning fields
echo "Creating planning fields..."

# Start Date field
echo "  Creating 'Start Date' field..."
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
  --name "Start Date" \
  --data-type "DATE" 2>/dev/null && echo "    ✓ Created" || echo "    ⊘ Already exists or failed"

# Due Date field  
echo "  Creating 'Due Date' field..."
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
  --name "Due Date" \
  --data-type "DATE" 2>/dev/null && echo "    ✓ Created" || echo "    ⊘ Already exists or failed"

# Duration field (in days)
echo "  Creating 'Duration' field (days)..."
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
  --name "Duration" \
  --data-type "NUMBER" 2>/dev/null && echo "    ✓ Created" || echo "    ⊘ Already exists or failed"

# Priority field
echo "  Creating 'Priority' field..."
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
  --name "Priority" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "High,Medium,Low" 2>/dev/null && echo "    ✓ Created" || echo "    ⊘ Already exists or failed"

# Order field (for sequencing)
echo "  Creating 'Order' field..."
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
  --name "Order" \
  --data-type "NUMBER" 2>/dev/null && echo "    ✓ Created" || echo "    ⊘ Already exists or failed"

echo ""
echo "✓ Project setup complete!"
echo ""
echo "Next steps:"
echo "1. Add issues to the project: gh project item-add $PROJECT_NUMBER --owner $OWNER --url <issue-url>"
echo "2. Set dates on items: gh project item-edit --id <item-id> --project-id <project-id> --field-id <field-id> --date YYYY-MM-DD"
echo "3. View in GitHub: gh project view $PROJECT_NUMBER --owner $OWNER --web"
echo ""
echo "To see all fields: gh project field-list $PROJECT_NUMBER --owner $OWNER"


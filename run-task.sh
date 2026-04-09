#!/bin/bash

# HCM Brain + Brawn — Task Runner
# Launches Aider with the correct context files to execute the next pending task.
# Usage: bash run-task.sh

echo ""
echo "====================================="
echo "  HCM Brain + Brawn — Task Runner"
echo "====================================="
echo ""

# ── SAFETY CHECK 1: Aider installed ──────────────────────────────────────────
if ! command -v aider &> /dev/null; then
  echo "ERROR: Aider is not installed."
  echo "Install it with: pip install aider-chat"
  echo ""
  exit 1
fi

# ── SAFETY CHECK 2: Required files exist ─────────────────────────────────────
for file in master-tasks.md actions-log.md master-system.md; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Required file not found: $file"
    echo "Run from the repo root directory."
    echo ""
    exit 1
  fi
done

# ── SAFETY CHECK 3: A pending task exists ────────────────────────────────────
if ! grep -q "Status:\*\* pending\|**Status:** pending" master-tasks.md 2>/dev/null; then
  echo "No pending tasks found in master-tasks.md."
  echo "Add a task with status: pending before running."
  echo ""
  exit 0
fi

# ── SAFETY CHECK 4: No task is already running ───────────────────────────────
if grep -q "Status:\*\* running\|**Status:** running" master-tasks.md 2>/dev/null; then
  echo "ERROR: A task is already marked as running."
  echo "Check master-tasks.md — either complete or reset the running task first."
  echo ""
  exit 1
fi

# ── PRE-FLIGHT LOG ───────────────────────────────────────────────────────────
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
echo "| $TIMESTAMP | SYSTEM | run-task.sh started — handing off to Aider | Running |" >> actions-log.md

# ── CONFIRM BEFORE RUNNING ───────────────────────────────────────────────────
echo "Pending task found. About to launch Aider."
echo ""
echo "SAFETY RULES (enforced for this session):"
echo "  ✓ Execute ONE task only"
echo "  ✓ Log all changes to actions-log.md"
echo "  ✓ Do NOT rename or move file structures unless the task explicitly says to"
echo "  ✓ If anything is unclear — stop and output one question, do not guess"
echo "  ✓ actions-log.md is append-only — never overwrite it"
echo ""
read -r -p "Proceed? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo ""
  echo "Cancelled. No changes made."
  echo "| $TIMESTAMP | SYSTEM | run-task.sh cancelled by user before Aider launch | Cancelled |" >> actions-log.md
  exit 0
fi

echo ""
echo "Launching Aider..."
echo ""

# ── LAUNCH AIDER ─────────────────────────────────────────────────────────────
aider \
  master-tasks.md \
  actions-log.md \
  master-system.md \
  --message "
SAFETY RULES — follow these exactly:
1. Read master-tasks.md. Find the FIRST task with status: pending. Execute that task ONLY.
2. Do NOT touch any files not listed in the task's 'Files affected' field.
3. Do NOT rename or move directories or large file structures. If the task requires this, stop and output: BLOCKED: task requires file structure change — needs explicit user approval.
4. Before making any change, append a BEFORE entry to actions-log.md: | [date] | [task ID] | Starting: [what you are about to do] | Running |
5. After completing, append an AFTER entry to actions-log.md: | [date] | [task ID] | Completed: [what was done] | Done |
6. Set the task status in master-tasks.md from 'pending' to 'done'.
7. If anything in the task is ambiguous or unclear, do NOT guess. Stop and output: QUESTION: [your single question]. Do nothing else.
8. Execute ONE task. Then stop. Do not read ahead or start the next task.
"

# ── POST-RUN LOG ─────────────────────────────────────────────────────────────
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
echo "| $TIMESTAMP | SYSTEM | run-task.sh completed — review actions-log.md for details | Done |" >> actions-log.md

echo ""
echo "====================================="
echo "  Aider session ended."
echo "  Review actions-log.md before running the next task."
echo "====================================="
echo ""

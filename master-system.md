# HCM Master System — Brain + Brawn Workflow

## What This Is

A two-part AI development system that keeps the user out of the middle.

- **Brain (Manus AI)** — plans, researches, breaks down work into tasks
- **Brawn (Aider)** — reads those tasks and executes them inside this repo
- **Connector (Claude Code)** — sets up and maintains the system
- **User (Scott)** — connects APIs, approves actions, reviews results

---

## Roles

| Role | Tool | Responsibility |
|------|------|----------------|
| Brain | Manus AI | Planning, task creation, research |
| Brawn | Aider | File edits, code changes, script creation |
| System Builder | Claude Code | Automation setup, scaffolding |
| User | Scott | API keys, approvals, final review |

---

## Workflow (Step by Step)

1. Scott asks Manus for a plan
2. Manus returns a structured task breakdown
3. Scott pastes the task into `master-tasks.md`
4. Aider reads the task and executes it
5. Aider logs all changes to `actions-log.md`
6. Scott reviews the result

That is the entire loop. Scott does not write code or organise files.

---

## Rules

These are enforced by `run-task.sh` and passed directly to Aider on every run.

| # | Rule | What happens if broken |
|---|------|------------------------|
| 1 | Execute ONE task at a time | Script checks for `running` status and blocks |
| 2 | Log BEFORE and AFTER every action | Aider is instructed to write both entries |
| 3 | Never rename or move file structures without explicit task instruction | Aider outputs BLOCKED and stops |
| 4 | If unclear — stop and ask ONE question | Aider outputs QUESTION and does nothing else |
| 5 | `actions-log.md` is append-only, never overwrite | Stated in every Aider prompt |
| 6 | Only touch files listed in the task's `Files affected` field | Aider is instructed not to go outside this list |
| 7 | Confirm before launch | `run-task.sh` asks y/n before handing off to Aider |

---

## Files in This System

| File | Purpose |
|------|---------|
| `master-system.md` | This file — explains how the system works |
| `master-tasks.md` | Task queue — Manus puts plans here |
| `master-folders.json` | Google Drive folder IDs for automation |
| `actions-log.md` | Append-only log of all actions taken |

---

## Expansion Points (Future)

Placeholder files are in `automation/`. None are active yet.

| Hook | File | What it does when active |
|------|------|--------------------------|
| Google Drive | `automation/google-drive.md` | Files Aider output into the correct Drive folder after task completion |
| Supabase Logging | `automation/supabase-logging.md` | Inserts every log entry into a `task_log` table for querying |
| Make.com Triggers | `automation/make-triggers.md` | Fires a webhook on task completion to trigger downstream scenarios |

To activate any hook:
1. Open its file in `automation/`
2. Complete the checklist under "What Needs to Happen First"
3. Set `"enabled": true` in its config block
4. Say "activate [hook name]" and Claude Code will wire it up

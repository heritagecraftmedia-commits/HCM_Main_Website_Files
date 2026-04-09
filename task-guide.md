# HCM Task Guide — Manus → Aider → Done

How to run one task through the full Brain + Brawn loop.
Follow these steps every time. No shortcuts.

---

## Step 1 — Ask Manus for a Plan

Open Manus AI and paste this prompt (edit the [GOAL] part):

```
I need a step-by-step task for a developer AI called Aider to execute inside a React/Vite repo.

Goal: [DESCRIBE WHAT YOU WANT DONE IN ONE SENTENCE]

Return the task in this exact format:

Title: [short task name]
Description: [what this does and why — 1-2 sentences]
Files affected: [list the specific files Aider should touch]
Steps:
1. [first action]
2. [second action]
3. [continue as needed]
Notes: [anything Aider should be careful about]

Keep it simple. No extra commentary. Just the task.
```

---

## Step 2 — Format as a Task Block

Take Manus's response and paste it into `master-tasks.md` using this format.
Replace TASK-001 with the next number in sequence.

```
### TASK-[NUMBER]: [Title from Manus]

**Description:** [Description from Manus]

**Files affected:** [Files from Manus]

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Status:** pending

**Notes:** [Notes from Manus]
```

Paste it at the bottom of the Task Queue section, below any existing tasks.

---

## Step 3 — Run Aider

In the terminal, from the repo root:

```bash
bash run-task.sh
```

Aider will:
- Find the first `pending` task
- Execute it
- Log the result in `actions-log.md`
- Set the task status to `done`
- Stop

---

## Step 4 — Review the Result

Check the following:

1. Open `actions-log.md` — is the action logged correctly?
2. Open the file(s) Aider touched — does the change look right?
3. Open `master-tasks.md` — is the task marked as `done`?

If anything looks wrong, do NOT run the next task. Fix the issue first.

---

## Step 5 — Move On

Once reviewed and confirmed:

- The task is done
- Return to Step 1 for the next task

---

## What Good Tasks Look Like

| Good | Bad |
|------|-----|
| "Add X to file Y" | "Improve the codebase" |
| "Change the button colour in ComponentZ.tsx" | "Make it look better" |
| "Add a console.log to the auth function for debugging" | "Fix the auth flow" |
| Single file touched | Multiple unrelated files |
| 2-5 steps | 10+ steps |

If a Manus plan has more than 5 steps — split it into two tasks.

---

## Example: Full Loop

**You ask Manus:**
> "I need a step-by-step task for Aider to add an HTML comment to the top of README.md confirming the Brain+Brawn system is active."

**Manus returns:**
> Title: Add system marker to README  
> Description: Add a visible HTML comment to README.md confirming the Brain+Brawn system is live.  
> Files affected: README.md  
> Steps:  
> 1. Open README.md  
> 2. Add `<!-- Brain + Brawn system active -->` as the very first line  
> 3. Save the file  
> Notes: Do not change anything else in the file.

**You paste into master-tasks.md as TASK-001 (already there as the example).**

**You run:**
```bash
bash run-task.sh
```

**Aider edits README.md, logs to actions-log.md, marks TASK-001 as done.**

**You review. Done.**

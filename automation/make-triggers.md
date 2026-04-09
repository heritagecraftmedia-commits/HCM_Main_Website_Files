# Automation Hook — Make.com Triggers

**Status:** NOT CONNECTED — placeholder only

---

## What This Will Do

When active, completing a task in this system will fire a Make.com webhook. Make.com then handles downstream actions — Slack notifications, HubSpot updates, Drive filing, or anything else in your existing scenarios.

## Trigger Point

After `run-task.sh` completes and the task is marked `done`, a curl call fires a webhook to Make.com with the task details as JSON payload.

## Webhook Payload (Proposed)

```json
{
  "task_id": "TASK-001",
  "title": "Task title here",
  "status": "done",
  "completed_at": "2026-04-08T12:00:00Z",
  "files_affected": ["README.md"],
  "triggered_by": "aider"
}
```

## What Needs to Happen First

- [ ] Make.com scenario created to receive the webhook
- [ ] Webhook URL generated in Make.com and stored as env variable
- [ ] Decision: one webhook for all tasks, or per-task routing?
- [ ] `run-task.sh` updated to call the webhook after task completion

## Config Placeholder

```json
{
  "enabled": false,
  "trigger": "task_complete",
  "webhook_url": "",
  "notify_slack": false,
  "update_hubspot": false,
  "file_to_drive": false
}
```

## Existing Make.com Scenarios (Already Built)

These are in `hcm-drive-setup/make-scenarios/` and can be extended to receive task webhooks:

| Scenario | File | Relevant? |
|----------|------|-----------|
| Siding Reminder | `scenario-1-siding-reminder.json` | Possibly — task reminders |
| HeyGen Auto-file | `scenario-2-heygen-autofile.json` | No |
| Finance Prompt | `scenario-3-finance-prompt.json` | No |
| HubSpot Deal Closed | `scenario-4-hubspot-deal-closed.json` | Possibly — project completion |
| Stockyard Archive | `scenario-5-stockyard-archive.json` | Yes — archiving completed task output |

## Notes

- Webhook URL must NEVER be committed to the repo — use `MAKE_WEBHOOK_URL` env variable
- Start with one scenario receiving all task completions, then split by task type later

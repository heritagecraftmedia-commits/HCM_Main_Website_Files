# Automation Hook — Google Drive

**Status:** NOT CONNECTED — placeholder only

---

## What This Will Do

When active, this hook will automatically file Aider's output into the correct Google Drive folder after a task completes.

## Trigger Point

After `run-task.sh` finishes and the task is marked `done`, a script here will:
1. Read the completed task from `master-tasks.md`
2. Identify which Drive folder the output belongs in (using `master-folders.json`)
3. Upload or move the relevant file(s) to that folder

## What Needs to Happen First

- [ ] Google Drive folder IDs populated in `master-folders.json`
- [ ] Google Drive API credentials confirmed (stored securely, not in repo)
- [ ] `hcm-drive-setup/phase1-create-folders.js` confirmed as working
- [ ] Decision: push files directly via Drive API, or via Make.com scenario?

## Config Placeholder

```json
{
  "enabled": false,
  "trigger": "task_complete",
  "drive_root_id": "",
  "credentials_path": "",
  "default_folder": "05_operations"
}
```

## Notes

- Credentials must NEVER be committed to the repo
- Use environment variables or a secrets manager
- The existing Make.com scenario `scenario-5-stockyard-archive.json` may cover part of this

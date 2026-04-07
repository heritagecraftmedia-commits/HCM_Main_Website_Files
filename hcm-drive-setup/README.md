# HCM Google Drive Organisation — Setup Kit

Heritage Craft Media · Claude Code build · April 2026

---

## What's in this folder

| File | What it's for | Phase |
|------|--------------|-------|
| [phase1-create-folders.js](phase1-create-folders.js) | Node.js script — creates ALL Drive folders via API in one run | 1 |
| [phase1-folder-map.md](phase1-folder-map.md) | Full folder tree with naming rules and colour guide | 1 |
| [phase2-descriptions.md](phase2-descriptions.md) | Copy-paste descriptions for all 6 terminal folders | 2 |
| [phase3-tool-routing.md](phase3-tool-routing.md) | Every tool → every folder. The wiring diagram. | 3 |
| [make-scenarios/](make-scenarios/) | 5 Make.com scenario blueprints (JSON — import directly) | 4 |
| [phase5-signal-check.md](phase5-signal-check.md) | 10-minute daily routine + Fog Day Protocol | 5 |
| [cheat-sheet.md](cheat-sheet.md) | Print this. Stick it on the wall. | All |

---

## How to use the folder creator script

### Prerequisites

```bash
npm install googleapis @google-cloud/local-auth
```

### Google API credentials (one-time setup)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Google Drive API**
3. Create **OAuth 2.0 credentials** (type: Desktop App)
4. Download `credentials.json` → place it inside this `hcm-drive-setup/` folder

### Run

```bash
node phase1-create-folders.js
```

A browser window will open to authenticate your Google account. After that, all folders are created automatically.

### Output

- All terminals and sub-folders created in Google Drive
- `folder-id-map.json` saved in this folder — **keep this file**, you need the IDs for Make.com

---

## Make.com scenario setup order

Build and test each scenario **one at a time** in this order:

1. [scenario-1-siding-reminder.json](make-scenarios/scenario-1-siding-reminder.json) — easiest, no external triggers
2. [scenario-3-finance-prompt.json](make-scenarios/scenario-3-finance-prompt.json) — equally simple scheduled trigger
3. [scenario-2-heygen-autofile.json](make-scenarios/scenario-2-heygen-autofile.json) — Drive watch trigger
4. [scenario-4-hubspot-deal-closed.json](make-scenarios/scenario-4-hubspot-deal-closed.json) — HubSpot integration
5. [scenario-5-stockyard-archive.json](make-scenarios/scenario-5-stockyard-archive.json) — depends on Scenario 4 working first

### To import a scenario into Make.com

1. Open Make.com → Scenarios → Create a new scenario
2. Click the three-dot menu → **Import Blueprint**
3. Paste the JSON content from the relevant file
4. Replace all `PASTE_..._HERE` placeholders with real IDs
5. Test with a real file or deal before activating on a schedule

---

## Hard Stop order

```
Phase 1 — Create folders in Drive → STOP → confirm
Phase 2 — Add descriptions to 6 folders → STOP → confirm
Phase 3 — Confirm you understand the HeyGen-to-Bunny loop → STOP → confirm
Phase 4 — Build and test each Make.com scenario one at a time → STOP → confirm each
Phase 5 — Railway is live. Start with one active client + one active course.
```

---

## Running log

All actions are tracked in [/actions-log.md](../actions-log.md) at the project root.

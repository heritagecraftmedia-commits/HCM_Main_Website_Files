# Phase 3 — Wiring Diagram: Tool-to-Folder Routing

Heritage Craft Media · Every tool, every file type, one place to look.

---

## Master Routing Table

| Tool | What it provides | Where it goes in Drive |
|------|-----------------|------------------------|
| HubSpot | Closed contracts, signed agreements | `A.01 ACTIVE CLIENTS > [Client] > 01 Admin` |
| HubSpot | Lead magnets, pitch decks | `A.02 SALES & QUOTES` |
| Notion | SOP exports (monthly PDF backup) | `A.03 SERVICE ASSETS > Delivery SOPs` |
| Notion | App roadmap exports | `C.01.1 ROADMAP & SPECS` |
| HeyGen | Generated AI video clips (download immediately) | `B.02 [Course] > 02 HEYGEN ASSETS` |
| HeyGen | App help video source files | `C.01.4 USER GUIDES` |
| Bunny | Hosting destination — upload from B.03 EXPORTS only | `B.03 EXPORTS` (master copy stays here) |
| Xero | Invoice PDFs, expense exports | `D.02 ACCOUNTS PAYABLE > [Year]` |
| Xero | Sales reports | `D.03 ACCOUNTS RECEIVABLE > [Year]` |
| GitHub | Code is in GitHub — no Drive copy needed | `C.01.3 TECH & ASSETS` (spec docs only) |
| Supabase | Schema exports, migration notes | `C.01.3 TECH & ASSETS` |
| Vercel | Deployment logs — live in Vercel, no Drive copy | `C.01.5 FEEDBACK` (error screenshots only) |
| Make.com | Automation scenario exports (JSON) | `A.03 SERVICE ASSETS > Delivery SOPs` |

---

## The HeyGen-to-Bunny Production Loop

This is the most important flow in Terminal B. Follow it without shortcutting.

```
Step 1 → Generate clip in HeyGen
Step 2 → Download immediately to:  B.02 [Course] > 02 HEYGEN ASSETS
Step 3 → Edit using files from:    01 RAW FOOTAGE + 02 HEYGEN ASSETS
Step 4 → Export finished video to: B.03 EXPORTS
         Name it: CRS-[ID]-[Module]-[Lesson]-FINAL
Step 5 → Upload from B.03 to Bunny
Step 6 → Delete from computer Downloads — it is now safe in Drive
Step 7 → If reusing for social:
         Right-click the FINAL file → Add Shortcut → do NOT duplicate
```

**One-Way Traffic:**
```
RAW FOOTAGE → HEYGEN ASSETS → PROJECT FILES → B.03 EXPORTS → Bunny
```
Files never move backwards. If a clip needs a re-edit, the corrected FINAL replaces the old one in B.03 EXPORTS.

---

## Social Content Rule

Social clips are **NOT** stored in Terminal B.
- If a course clip is reused for social → create a **Google Drive Shortcut** in the relevant social/marketing folder
- Never duplicate the video file — the master lives in B.03 EXPORTS

---

## Finance Shortcut Rule

If an invoice relates to a specific course or app:
- Master copy stays in `D.02 ACCOUNTS PAYABLE > [Year]`
- Place a **Google Drive Shortcut** inside the relevant terminal (e.g., inside `B.02.001` or `C.01.3`)

---

## The 3-Click Rule

> If you have to click more than **3 folders deep** to find a file, it is buried too deep.

Fix it: pull the file up a level, or add a Shortcut from a higher folder.

---

## The Shortcut Signal

A shortcut in Google Drive has a **small arrow icon** on the bottom-left of the folder thumbnail.
When you see the arrow: the master lives elsewhere. You can remove the shortcut without deleting the original.

---

🛑 **HARD STOP** — Phase 3 complete.
Confirm you understand the HeyGen-to-Bunny loop. Any questions about file routing → ask now before Phase 4.

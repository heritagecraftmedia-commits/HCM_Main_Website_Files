# CLAUDE.md — HCM Repo Rules
# Read this before doing anything in this repo.

## This repo is: HCM_Main_Website_Files
## Live site: heritagecraftmedia.com

---

## RULES — NO EXCEPTIONS

### Rule 1 — One repo per Codespace
This Codespace is for HCM_Main_Website_Files ONLY.
Do NOT open, clone or work on any other repo in this workspace.
If you see Mad-Professor or The-Farmers-Table-Hub-CIC in the Explorer — stop immediately.

### Rule 2 — Check which repo you are in before every commit
Run: git remote -v
It must say HCM_Main_Website_Files. If it says anything else — stop.

### Rule 3 — Run the TFT scan before every push
grep -rl "Farmers Table\|farmerstable\|FarmersTable\|farmers-table\|food directory\|micro-producer\|thalia@\|Local Producer\|Morning Harvest\|food producer\|Farnham\|stroke survivor\|local food\|producer spotlight" src/ 2>/dev/null
If anything returns — do not push. Fix it first.

### Rule 4 — Stop after every step
Every prompt must include Stop and wait after each step.
Never proceed without Scott reviewing the output first.

### Rule 5 — Never add unrequested features
Do not add new routes, components, files or features unless explicitly asked.

---

## What belongs here
- Heritage Craft Media public website (heritagecraftmedia.com)
- HCM Academy pages
- HCM Founder Dashboard (/founder-dashboard)
- HCM member and auth pages

## IMPORTANT — The Farmers Table Hub CIC relationship
The Farmers Table Hub CIC (TFT) is a SEPARATE CUSTOMER of Heritage Craft Media.
HCM builds and manages the TFT website as a client project.
TFT has its own Vercel project: the-farmers-table-hub-cic — DO NOT touch it from this repo.
TFT content must NEVER appear inside the HCM website src/ files.
These are two completely separate websites for two separate organisations.

## What does NOT belong here
- Farmers Table Hub CIC content inside src/ (it is a customer, not part of HCM)
- Mad Professor Safety System files
- Junk2Tip files
- Any other client project files mixed into HCM src/

# Phase 1 — Railway Map: Complete Folder Structure

Heritage Craft Media · Google Drive Organisation

---

## Top-Level Terminals (6 folders)

```
00 THE SIDING          ⚪ White  | Code: FIX | Temporary drop zone
01 TERMINAL A: SERVICES 🔵 Blue   | Code: SRV | 1-to-1 client work
02 TERMINAL B: COURSES  🔴 Red    | Code: CRS | Video production, 50+ courses
03 TERMINAL C: APPS     🟡 Gold   | Code: APP | Tech builds, product specs
04 TERMINAL D: FINANCE  🟢 Green  | Code: FIN | Tax, invoices, Xero exports
05 THE STOCK YARD       ⚫ Grey   | Code: ARC | Archive — completed projects
```

---

## Terminal A — Services (Blue) · Full Tree

```
01 TERMINAL A: SERVICES/
├── A.01 ACTIVE CLIENTS/
│   └── [Client Name] - [Project Type]/    ← one per client, auto-created by Make.com
│       ├── 01 Admin/
│       ├── 02 Delivery/
│       └── 03 Comms/
├── A.02 SALES & QUOTES/
├── A.03 SERVICE ASSETS/
│   └── Delivery SOPs/
└── A.04 REPAIR SHED/
```

**File naming:** `SRV - [ClientName] - [Description] - v[N]`
Example: `SRV - Smith - Contract - v1`

---

## Terminal B — Courses (Red · Heavy Rail) · Full Tree

```
02 TERMINAL B: COURSES/
├── B.01 CURRICULUM/
│   └── [One folder per course]/
├── B.02 PRODUCTION/
│   ├── B.02.001 - [Course Name]/
│   │   ├── 01 RAW FOOTAGE/
│   │   ├── 02 HEYGEN ASSETS/
│   │   ├── 03 PROJECT FILES/
│   │   ├── 04 VOICEOVERS & AUDIO/
│   │   ├── 05 GRAPHICS & SLIDES/
│   │   └── 00 REPAIR SHED/
│   ├── B.02.002 - [Course Name]/
│   │   └── [same 6 sub-folders]/
│   └── ... B.02.003 through B.02.050+
├── B.03 EXPORTS/
└── B.OLD — Unsorted Rolling Stock/
```

**File naming (Heavy Rail):** `CRS-[ID]-[Module]-[Lesson]-[Status]`
Examples:
- `CRS-001-M02-L04-RAW`     — raw footage
- `CRS-001-M02-L04-HEYGEN`  — AI clip
- `CRS-001-M02-L04-FINAL`   — finished, goes to Bunny

**One-Way Traffic Rule:**
`RAW → HEYGEN ASSETS → PROJECT FILES → EXPORTS → Bunny`

---

## Terminal C — Apps (Gold) · Full Tree

```
03 TERMINAL C: APPS/
└── [App Name]/
    ├── C.01.1 ROADMAP & SPECS/
    ├── C.01.2 UI & UX DESIGN/
    ├── C.01.3 TECH & ASSETS/
    ├── C.01.4 USER GUIDES/
    ├── C.01.5 FEEDBACK/
    └── v[N] ARCHIVE/
```

**File naming:** `APP - [AppName] - [Type] - [Date]`
Example: `APP - HCMApp - BUG - 2025-04-07`

---

## Terminal D — Finance (Green) · Full Tree

```
04 TERMINAL D: FINANCE/
├── D.01 TAX & COMPLIANCE/
├── D.02 ACCOUNTS PAYABLE/
│   ├── 2024/
│   ├── 2025/
│   └── 2026/
├── D.03 ACCOUNTS RECEIVABLE/
│   ├── 2024/
│   ├── 2025/
│   └── 2026/
└── D.04 BANKING & STATEMENTS/
    ├── 2024/
    ├── 2025/
    └── 2026/
```

---

## The Stock Yard (Grey) · Full Tree

```
05 THE STOCK YARD/
├── ARC-2024/
├── ARC-2025/
└── ARC-2026/
```

---

## 00 The Siding (White)

```
00 THE SIDING/
```
No sub-folders. This is deliberately flat — everything dumped here gets sorted during the Monday Signal Check.

---

## Folder Colours (Google Drive)

Set colours by right-clicking each terminal folder → Change colour:

| Terminal | Colour to select in Drive |
|----------|--------------------------|
| 00 THE SIDING | Grey |
| 01 TERMINAL A | Blue |
| 02 TERMINAL B | Red |
| 03 TERMINAL C | Yellow / Banana |
| 04 TERMINAL D | Green (Sage or Teal) |
| 05 THE STOCK YARD | Dark Grey / Graphite |

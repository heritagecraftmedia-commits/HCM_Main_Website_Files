# Heritage Craft Media

Heritage Craft Media (HCM) is a digital media and education platform supporting artisan crafters across the UK. We help makers, craftspeople, and independent creatives build their online presence, grow their audience, and develop sustainable businesses through practical digital skills, media production support, and AI-powered tools built for non-technical users.

## What we do

- Digital skills education for artisan crafters (HCM Academy)
- Media production support — video, audio, and content creation
- AI tools and resources designed for makers with limited technical confidence
- Community and membership for independent craftspeople

## Tech stack

- React (Vite) — frontend SPA
- Vercel — hosting and deployment
- Supabase — authentication and database
- Node.js serverless functions (Vercel API routes)

## Repo structure

- `src/` — main React application (public site + dashboards)
- `api/` — Vercel serverless API routes (`assistant`, `generate-summary`)
- `api/_lib/` — shared server code; not routed as endpoints
- `scripts/` — integration tests
- `docs/ASSISTANT.md` — how the Ask Claude assistant is wired
- `vercel.json` — Vercel deployment config (must stay at repo root)

## Getting started

### Prerequisites

- Node.js 18+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your keys.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Brain + Brawn Workflow (AI Development System)

This repo uses a two-part AI system for structured development:

- **Brain (Manus AI)** — creates plans and task breakdowns
- **Brawn (Aider)** — reads those plans and executes them inside the repo

### How it works

1. Ask Manus for a plan
2. Paste the task into `master-tasks.md` using the template inside that file
3. Run the task runner:
   ```bash
   bash run-task.sh
   ```
4. Aider reads the first `pending` task, executes it, and logs the result
5. Review `actions-log.md` to confirm what changed

### Key files

| File | Purpose |
|------|---------|
| `master-tasks.md` | Task queue — paste Manus plans here |
| `master-system.md` | Full system documentation |
| `master-folders.json` | Google Drive folder ID placeholders |
| `actions-log.md` | Append-only log of all actions |
| `run-task.sh` | Launches Aider with the right context |

### Prerequisites for Aider

```bash
pip install aider-chat
```

Set your API key before running:

```bash
export ANTHROPIC_API_KEY=your_key_here
# or
export OPENAI_API_KEY=your_key_here
```

---

## Contact

heritagecraftmedia@gmail.com

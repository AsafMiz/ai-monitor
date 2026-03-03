# AI Monitor

AI agent control platform for creating, customizing, and deploying AI "workers" across WhatsApp, Slack, and email. Built for non-technical B2C/SMB users.

## Architecture

```
ai-monitor/
├── apps/
│   ├── web/            # Next.js 16 frontend (Vercel)
│   ├── api/            # FastAPI backend (Railway/Fly.io)
│   └── desktop/        # Electron client (Phase 4)
├── packages/
│   ├── shared/         # Shared TypeScript types
│   ├── ui/             # React component library
│   ├── agent-core/     # CrewAI orchestration engine
│   └── integrations/   # WhatsApp, Slack, Email connectors
└── supabase/
    └── migrations/     # PostgreSQL schema + RLS policies
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend API | FastAPI (Python) |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth |
| Billing | Stripe Subscriptions |
| Agent Framework | CrewAI |
| Default LLM | GPT-4o-mini |
| Monorepo | pnpm + Turborepo |

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9.x (`npm install -g pnpm`)
- **Python** >= 3.11
- A **Supabase** project ([supabase.com](https://supabase.com))
- A **Stripe** account ([stripe.com](https://stripe.com))

## Setup

### 1. Clone and install

```bash
git clone https://github.com/AsafMiz/ai-monitor.git
cd ai-monitor
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.template .env.local
```

Fill in your credentials in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret) |
| `SUPABASE_JWT_SECRET` | Supabase → Project Settings → API → JWT Secret |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_PRICE_ID` | Create a product in Stripe → copy the price ID |
| `OPENAI_API_KEY` | OpenAI platform → API keys |

### 3. Set up the database

Run the SQL migrations in order against your Supabase project:

```bash
# Option A: Via Supabase CLI
supabase db push

# Option B: Manually via Supabase SQL Editor
# Run each file in supabase/migrations/ in order (001 → 008)
```

The migrations create these tables:
- `workspaces` — user workspaces with Stripe billing state
- `workspace_members` — many-to-many user ↔ workspace membership
- `agents` — AI worker personas (name, role, backstory, goal, tools)
- `conversations` — multi-channel conversation threads
- `messages` — individual messages within conversations
- `document_embeddings` — RAG vector storage (pgvector)

All tables have Row Level Security (RLS) policies scoped to workspace membership.

### 4. Set up the Python backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate    # macOS/Linux
# .venv\Scripts\activate     # Windows
pip install -r requirements.txt
cd ../..
```

### 5. Create a Stripe product

1. Go to Stripe Dashboard → Products → Add Product
2. Name: "AI Monitor Pro" (or whatever you like)
3. Price: $100/month, recurring
4. Copy the `price_xxx` ID into your `STRIPE_PRICE_ID` env var

## Running the dev servers

### Start both servers

```bash
# Terminal 1 — Next.js frontend (port 3000)
pnpm --filter @ai-monitor/web dev

# Terminal 2 — FastAPI backend (port 8000)
cd apps/api && source .venv/bin/activate
uvicorn src.main:app --reload --port 8000
```

Or use Turborepo to start everything:

```bash
pnpm dev
```

### Stripe webhook listener (for local development)

```bash
# Terminal 3
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Verify it works

- **Frontend**: http://localhost:3000
- **API health check**: http://localhost:8000/health
- **API docs**: http://localhost:8000/docs (Swagger UI)

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers via Turborepo |
| `pnpm build` | Build all packages |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm lint` | Run linters |
| `pnpm test` | Run tests |
| `pnpm --filter @ai-monitor/web dev` | Start only the frontend |
| `pnpm --filter @ai-monitor/api test` | Run only API tests |

## Project Structure Details

### `apps/web/` — Next.js Frontend

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login with Supabase Auth |
| `/signup` | Create account |
| `/dashboard` | Overview with stats cards |
| `/dashboard/workers` | List/manage AI workers |
| `/dashboard/workers/new` | Create new worker persona form |
| `/dashboard/settings` | Billing (Stripe) and account |
| `/dashboard/activity` | Real-time activity feed |
| `/api/stripe/checkout` | Create Stripe Checkout session |
| `/api/stripe/webhook` | Handle Stripe webhook events |
| `/api/stripe/portal` | Redirect to Stripe Customer Portal |
| `/auth/callback` | Supabase OAuth callback |

### `apps/api/` — FastAPI Backend

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/workspaces/` | GET | List user's workspaces |
| `/workspaces/` | POST | Create a workspace |
| `/agents/` | GET | List agents in a workspace |
| `/agents/` | POST | Create an agent (checks subscription + limit) |
| `/agents/{id}` | GET | Get agent details |
| `/agents/{id}` | PATCH | Update agent config |
| `/agents/{id}` | DELETE | Delete an agent |
| `/conversations/` | GET | List conversations (stub) |

---

## TODO — What's Left to Build

### Phase 2: Agent Orchestration Engine (Weeks 5–8)

- [ ] **CrewAI integration** — Map UI persona inputs (name, role, backstory, goal) to CrewAI Agent objects in `packages/agent-core/`
- [ ] **Multi-agent crews** — Implement crew composition (team builder) where multiple agents collaborate on tasks
- [ ] **Tool provisioning** — Build secure tools for agents: web scraping, document parsing, HTTP requests, calculator
- [ ] **LLM pipeline** — Wire up OpenAI GPT-4o-mini as default engine with retry logic, timeout handling, and fallback mechanisms
- [ ] **Agent memory** — Implement RAG pipeline: document upload → embedding generation → pgvector storage → retrieval during conversations
- [ ] **Connect frontend → API** — Wire the "Create Worker" form to actually call the FastAPI agents endpoint and display real data on the workers list page
- [ ] **Dashboard stats** — Fetch real agent count, conversation count, and message volume for the dashboard cards

### Phase 3: Communication Channel Gateways (Weeks 9–12)

- [ ] **WhatsApp integration (Unipile)** — QR code generation endpoint, inbound webhook processing, multi-agent message routing
- [ ] **Slack integration** — OAuth 2.0 flow, Event API webhooks for @mentions and DMs, Block Kit formatted responses, approval buttons for HITL
- [ ] **Email integration (Resend)** — Outbound email via Resend API, inbound parse webhooks (MX records), React Email templates, agent-specific addresses
- [ ] **Router Agent** — Intelligent message routing that analyzes intent and dispatches to the correct specialized worker
- [ ] **Conversation context** — Maintain long-term conversation history per channel, per agent, with thread mapping

### Phase 4: Local Desktop Client & WebSocket Relay (Weeks 13–16)

- [ ] **Electron app** — Build cross-platform desktop client in `apps/desktop/`, reuse React dashboard components
- [ ] **Python bundling** — Bundle CrewAI environment inside Electron via PyInstaller (no manual Python install for users)
- [ ] **WebSocket relay server** — Implement persistent bidirectional WebSocket on FastAPI backend for cloud ↔ local communication
- [ ] **WebSocket client** — Implement connection logic in Electron app with token-based auth and auto-reconnect
- [ ] **BYOK (Bring Your Own Key)** — Settings UI for users to plug in their own OpenAI/Anthropic/DeepSeek API keys
- [ ] **Ollama integration** — Interface with local Ollama for fully offline LLM inference (Llama 3 8B, etc.)
- [ ] **Local agent execution** — Spawn Python child process from Electron, execute CrewAI reasoning loops locally

### Phase 5: UI/UX Polish & Beta Testing (Weeks 17–20)

- [ ] **Activity feed** — Real-time activity stream showing agent actions in plain language ("Worker A is searching the catalog...")
- [ ] **Human-in-the-loop UI** — Centralized intervention dashboard: review stalled workflows, take manual control, correct agent trajectory, return to auto mode
- [ ] **Team builder** — Drag-and-drop visual org chart for composing multi-agent teams with defined chains of command
- [ ] **Contextual transparency** — Surface agent reasoning steps in simplified format on the dashboard
- [ ] **Error handling UX** — Graceful error states with explanations and suggested actions (no raw error codes)
- [ ] **Feedback loops** — Human corrections fed back into agent memory for continuous improvement

### Infrastructure & DevOps

- [ ] **ESLint + Prettier** — Configure proper linting across the monorepo (currently stubs)
- [ ] **Ruff + mypy** — Configure Python linting and type checking for the API
- [ ] **E2E tests** — Playwright tests for critical flows (signup → create workspace → create worker → deploy)
- [ ] **API tests** — Expand pytest coverage for all FastAPI endpoints with mocked Supabase
- [ ] **Rate limiting** — Implement per-workspace rate limits and circuit breakers to prevent runaway agents
- [ ] **Observability** — Integrate LangSmith/Langfuse for agent execution telemetry
- [ ] **Docker** — Containerize the FastAPI backend for production deployment
- [ ] **Terraform/IaC** — Infrastructure as Code for cloud deployment
- [ ] **CI/CD enhancements** — Add deployment workflows (Vercel for web, Railway/Fly.io for API)

### Business & Monetization

- [ ] **Subscription enforcement** — Gate agent creation/execution behind active Stripe subscription
- [ ] **Usage tracking** — Track tokens consumed, messages sent, agent executions per workspace
- [ ] **Token budget limits** — Enforce daily/monthly LLM token caps per workspace with automatic agent pausing
- [ ] **Billing dashboard** — Show usage metrics, current plan, and upgrade prompts in Settings
- [ ] **Free trial flow** — 14-day trial with onboarding wizard and conversion prompts

# Chatbot

A full-stack AI chat application with multi-conversation support, file attachments, and optional guest access. Signed-in users get persistent chats backed by Supabase; guests can try the assistant locally with a small free quota before signing up.

**Live demo:** [https://chatbot-xi-ochre-65.vercel.app](https://chatbot-xi-ochre-65.vercel.app)

## Features

- **AI conversations** — Powered by [Google Gemini](https://ai.google.dev/) (`gemini-2.5-flash`) with text and file inputs
- **Multi-chat sidebar** — Create, switch, and delete conversations (authenticated users)
- **Guest mode** — Try the bot without an account (3 questions, stored in `localStorage`)
- **File uploads** — JPEG, PNG, WebP, PDF, and plain text (up to 5 files per message)
- **Realtime sync** — Chat list and messages update live across tabs via Supabase Realtime
- **Email auth** — Sign up, confirm email, and log in through Supabase Auth (proxied by the API)
- **Rate limiting** — AI endpoint throttled per user or IP to protect the Gemini key

## Tech stack

| Layer | Stack |
|--------|--------|
| Frontend | React 19, Vite, React Router, Tailwind CSS 4, Radix UI / shadcn-style components |
| Backend | Node.js, Express 5, Multer |
| Data & auth | [Supabase](https://supabase.com/) (Postgres, Auth, Storage, Realtime) |
| AI | `@google/genai` (Gemini API) |

## Architecture

The browser never talks to Gemini or uses the Supabase service role. All data mutations go through the Express API; the client only uses the Supabase **publishable** key for Realtime subscriptions.

**Authenticated flow:** login → JWT stored locally → API calls with `Authorization: Bearer` → messages/chats in Postgres → Realtime pushes changes to open tabs.

**Guest flow:** no account → messages and quota in `localStorage` → AI calls hit `POST /api/chats/guest` without auth → no persistence on the server.

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm**
- A **Supabase** project ([dashboard](https://supabase.com/dashboard))
- A **Google Gemini API key** ([AI Studio](https://aistudio.google.com/apikey))
- **Supabase CLI** (optional, for local DB): `npm install -g supabase`

## Quick start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd chatbot

npm install
cd server && npm install && cd ..
```

### 2. Configure environment

**Frontend** — copy the example and fill in your Supabase project URL and publishable (anon) key:

```bash
cp .env.example .env.local
```

**Backend** — copy the example and add Gemini + Supabase service credentials:

```bash
cp server/.env.example server/.env
```

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_SUPABASE_URL` | `.env.local` | Supabase project URL (Realtime) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env.local` | Anon/publishable key (Realtime only) |
| `VITE_API_URL` | `.env.local` | Optional; defaults to `http://localhost:3000` |
| `GEMINI_API_KEY` | `server/.env` | Google Gemini API key |
| `SUPABASE_URL` | `server/.env` | Same project URL as above |
| `SUPABASE_SERVICE_ROLE_KEY` | `server/.env` | Service role key — **server only, never expose to the client** |
| `AUTH_REDIRECT_URL` | `server/.env` | Optional; email confirmation redirect (default `http://localhost:8100/login`) |

Get keys from **Supabase → Project Settings → API**.

### 3. Apply the database schema

Run the migration against your Supabase project (remote or local):

```bash
# Linked remote project
supabase db push

# Or local Supabase (after supabase start)
supabase db reset
```

Migration file: `supabase/migrations/20260517120000_initial_schema.sql` — creates `chats`, `messages`, RLS policies, Realtime publication, and the `message-files` storage bucket.

### 4. Run the app

Use two terminals:

```bash
# Terminal 1 — API (port 3000)
cd server && npm run dev

# Terminal 2 — UI (port 8100, opens browser)
npm run dev
```

Open [http://localhost:8100](http://localhost:8100). Sign up or use **Continue as guest** on the login page.

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | root | Start Vite dev server (port **8100**) |
| `npm run build` | root | Production build to `dist/` |
| `npm run preview` | root | Preview production build |
| `npm run lint` | root | ESLint |
| `npm run dev` | `server/` | Start Express API (port **3000**) |

## Project structure

```
chatbot/
├── src/                    # React frontend
│   ├── components/         # UI (Chat, Sidebar, Auth, …)
│   ├── context/            # AuthProvider
│   ├── hooks/              # Chats, messages, guest mode, realtime
│   ├── lib/                # API client, guest session, Supabase client
│   └── pages/              # ChatPage, LoginPage
├── server/                 # Express API
│   ├── routes/             # auth, chats, messages, AI
│   ├── middleware/         # requireAuth, optionalAuth, rate limits
│   ├── ai/                 # Gemini client
│   └── lib/                # Supabase admin, storage, uploads
└── supabase/
    └── migrations/         # Postgres schema + RLS + Realtime
```

## API overview

Base URL: `http://localhost:3000` (or `VITE_API_URL`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/signup` | — | Register |
| `POST` | `/api/auth/login` | — | Log in |
| `GET` | `/api/auth/session` | Bearer | Validate session |
| `POST` | `/api/auth/logout` | Bearer | Log out |
| `GET` | `/api/chats` | Bearer | List chats |
| `POST` | `/api/chats` | Bearer | Create chat |
| `DELETE` | `/api/chats/:id` | Bearer | Delete chat + messages |
| `GET` | `/api/chats/:id/messages` | Bearer | List messages |
| `POST` | `/api/chats/:id/messages` | Bearer | Save a message (JSON or multipart) |
| `POST` | `/api/chats/:id` | Optional | Send to Gemini (`:id` = `guest` for guests) |

AI rate limits (15-minute window): **60** requests per authenticated user, **12** per IP for guests.

## Guest mode

- Enabled from the login screen; state lives in `localStorage` (`chatbot_guest_*` keys).
- **3 questions** per browser profile (`GUEST_QUESTION_LIMIT` in `src/constants/guest.js`).
- History is not saved on the server; signing in clears the guest session and unlocks full chat persistence.

## File uploads

Supported types: **JPEG, PNG, WebP, PDF, `.txt`**. Max **5** files per message. Rules are enforced on both client (`src/lib/allowedUploads.js`) and server (`server/lib/allowedUploads.js`). Authenticated uploads are stored in Supabase Storage (`message-files` bucket).

## Security notes

- Never commit `.env`, `.env.local`, or `server/.env` (they are gitignored).
- Use the **publishable** key in the frontend; keep the **service role** key on the server only.
- Row Level Security on `chats` and `messages` restricts Realtime reads to the signed-in user; the API uses the service role and enforces ownership in application code.
- Rotate keys if they are ever exposed.

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| UI loads but chats fail | API running on port 3000; `VITE_API_URL` if not local |
| Realtime not updating | `VITE_SUPABASE_*` set; migration applied; user logged in |
| Auth / signup errors | `SUPABASE_URL` and keys in `server/.env`; `AUTH_REDIRECT_URL` matches Supabase Auth URL config |
| AI errors | Valid `GEMINI_API_KEY`; rate limit headers if 429 |
| Guest limit | Expected after 3 questions; sign in to continue |

## Local Supabase (optional)

```bash
supabase start
supabase db reset
```

Point `.env.local` and `server/.env` at the local URLs and keys printed by `supabase status`. Local auth redirect URLs are preconfigured in `supabase/config.toml` for port **8100**.

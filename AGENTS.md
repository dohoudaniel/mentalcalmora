# Calmora — Agent Guide

> Calmora is a mental wellness web application. Users track moods, visualize emotional trends, and receive AI-driven tips. The codebase is a React 18 SPA backed by Supabase (PostgreSQL, Auth, Edge Functions, and Storage). The `/backend` directory in the repo root is currently empty; all server-side logic lives inside Supabase Edge Functions in `frontend/supabase/functions/`.

---

## Project Overview

| Item | Detail |
|------|--------|
| **Name** | Calmora (also referenced as MentalCalmora) |
| **Type** | Single-page application (SPA) |
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS 3 + shadcn/ui |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| **AI Provider** | Google Gemini 2.0 Flash API (called from Edge Functions) |
| **Deployment** | Vercel (`frontend/vercel.json` configured for SPA rewrites) |
| **Package Managers** | Both `package-lock.json` and `bun.lockb` are present; npm and bun both work |

### Key Features
- Mood tracking with free-form text entries and predefined mood categories
- Local keyword-based sentiment analysis (score 0–1, labels Positive/Neutral/Negative)
- AI-generated insights per mood entry via the `generate-insights` Edge Function
- Historical mood journal with trend charts (Recharts)
- AI wellness chatbot ("Calmobot") powered by Gemini
- User authentication (email/password) with profile management and avatar uploads
- Light/dark theme toggle with `localStorage` persistence
- Data export to PDF (jspdf)

---

## Directory Structure

```
mentalcalmora/
├── backend/                     # EMPTY — legacy placeholder, do not use
├── frontend/                    # All application code
│   ├── public/                  # Static assets (favicon, robots.txt, placeholder.svg)
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/              # shadcn/ui components (~50 primitives)
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MoodChart.tsx
│   │   │   ├── MoodForm.tsx
│   │   │   ├── MoodHistoryItem.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── RecommendationList.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   ├── PasswordStrengthIndicator.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── ImageUpload.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx   # Thin wrapper over useSupabaseAuth
│   │   │   └── MoodContext.tsx   # Mood entries, sentiment, trends, recommendations
│   │   ├── hooks/
│   │   │   ├── useSupabaseAuth.tsx
│   │   │   ├── useProfile.tsx
│   │   │   ├── use-toast.ts
│   │   │   └── use-mobile.tsx
│   │   ├── integrations/supabase/
│   │   │   ├── client.ts         # Typed Supabase client singleton (hardcoded URL + anon key)
│   │   │   └── types.ts          # Auto-generated DB types
│   │   ├── lib/
│   │   │   └── utils.ts          # `cn()` helper (clsx + tailwind-merge)
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── History.tsx
│   │   │   ├── Results.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Chatbot.tsx
│   │   │   ├── Explore.tsx
│   │   │   ├── Index.tsx         # Root redirect logic
│   │   │   └── NotFound.tsx
│   │   ├── services/
│   │   │   └── moodService.ts    # Supabase CRUD for mood_entries + Edge Function calls
│   │   ├── utils/
│   │   │   ├── dataExport.ts
│   │   │   ├── mentalHealthContent.ts
│   │   │   └── passwordValidation.ts
│   │   ├── App.tsx               # Router + global providers
│   │   ├── main.tsx              # React 18 entry point
│   │   ├── index.css             # Tailwind directives + CSS variables (light/dark themes)
│   │   └── vite-env.d.ts
│   ├── supabase/
│   │   ├── functions/
│   │   │   ├── calmobot-chat/index.ts
│   │   │   ├── check-user-exists/index.ts
│   │   │   └── generate-insights/index.ts
│   │   └── migrations/
│   │       ├── 20250614114846-b9190308-e54a-44c7-8639-034c9370b6eb.sql
│   │       ├── 20250614115801-56507649-cd2a-4f06-91cb-45ec1f4c3379.sql
│   │       └── 20250614141115-2472d29c-b016-4c0b-b1ef-8bce60b9e30a.sql
│   ├── components.json           # shadcn/ui configuration
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── bun.lockb
│   ├── index.html
│   ├── vercel.json
│   └── .gitignore
└── README.md                     # Outdated (describes a legacy Flask backend)
```

---

## Technology Stack Details

### Frontend
- **React 18** — UI library
- **TypeScript** — typed JavaScript (non-strict: `noImplicitAny: false`, `strictNullChecks: false`)
- **Vite** — build tool and dev server (port 8080)
- **Tailwind CSS 3** — utility-first CSS
- **shadcn/ui** — copy-paste component primitives built on Radix UI
- **React Router DOM v6** — client-side routing (`BrowserRouter`)
- **TanStack React Query** — set up at the app root (`QueryClientProvider`); most data fetching currently happens via direct async service calls inside `useEffect`
- **Recharts** — charting library for mood trends
- **React Hook Form + Zod** — form handling and validation
- **date-fns** — date formatting
- **jspdf** — PDF export
- **lucide-react** — icon library

### Backend (Supabase)
- **Database** — PostgreSQL
- **Auth** — Supabase Auth (email/password; email confirmations disabled in config)
- **Edge Functions** — Deno-based TypeScript functions
- **Storage** — `profile-images` public bucket for avatars
- **Realtime** — enabled in local config

### AI Integration
- **Google Gemini 2.0 Flash API** — used in two Edge Functions:
  - `generate-insights` — creates personalized wellness insights for individual mood entries
  - `calmobot-chat` — powers the conversational wellness assistant

---

## Build and Development Commands

All commands should be run from the `frontend/` directory.

```bash
# Install dependencies (npm or bun)
npm install
# or
bun install

# Start development server (port 8080)
npm run dev
# or
bun run dev

# Production build
npm run build
# or
bun run build

# Development build
npm run build:dev
# or
bun run build:dev

# Run ESLint
npm run lint
# or
bun run lint

# Preview production build locally
npm run preview
# or
bun run preview
```

### Supabase Local Development

The Supabase CLI can be used to manage local functions and migrations.

```bash
# Start Supabase stack locally
supabase start

# Serve Edge Functions locally
supabase functions serve

# Apply migrations
supabase db reset
```

Configuration is in `frontend/supabase/config.toml`. The project ID is `tlddvddmawlqtvqefwav`.

---

## Code Style Guidelines

### TypeScript
- The project uses a **relaxed TypeScript configuration** (`noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`, `noUnusedParameters: false`).
- ESLint is configured with `@typescript-eslint/no-unused-vars: off`.
- Path alias `@/` maps to `./src/`.

### Component Patterns
- **shadcn/ui components** live in `src/components/ui/` and follow the library's default conventions.
- **Custom components** live in `src/components/`.
- **Pages** live in `src/pages/`.
- **Contexts** are used for global state: `AuthContext` and `MoodContext`.
- **Hooks** for reusable logic live in `src/hooks/`.

### Styling
- Use Tailwind utility classes for all styling.
- Custom theme colors are defined in `tailwind.config.ts`:
  - `mint-mist` (#F6FFFD)
  - `slate-text` (#2E3A44)
  - `leaf-green` (#37D69C)
  - `lavender` (#C5B8F2)
  - `sky-blue` (#8FD5F8)
  - `peach-glow` (#F2D5B3)
- CSS variables in `index.css` drive light/dark themes. The `ThemeProvider` stores the preference under `localStorage` key `calmora-theme`.
- Dark mode uses extensive overrides in `index.css` to ensure text contrast.

### Naming Conventions
- Components use PascalCase filenames (e.g., `MoodForm.tsx`).
- Hooks use camelCase prefixed with `use` (e.g., `useProfile.tsx`).
- Services and utilities use camelCase (e.g., `moodService.ts`, `dataExport.ts`).

---

## Routing and Page Access

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public / Redirect | Authenticated users → `/dashboard`; guests → `<Landing />` |
| `/login` | Public | Email/password login |
| `/signup` | Public | Account creation with password strength validation |
| `/forgot-password` | Public | Password reset request |
| `/reset-password` | Public | Password reset confirmation |
| `/dashboard` | Protected | Main hub: mood form, trends chart, recent entries, recommendations |
| `/history` | Protected | Full mood entry history |
| `/results/:entryId` | Protected | Detail view for a single mood entry |
| `/profile` | Protected | Update name, avatar, password |
| `/chatbot` | Protected | AI wellness chat (Calmobot) |
| `/explore` | Protected | Explore mental health content |
| `*` | Public | 404 page |

Protected routes redirect unauthenticated users to `/login`.

---

## Database Schema

The Supabase schema is defined by migrations in `frontend/supabase/migrations/`.

### Tables

**`profiles`**
- `id` (UUID, PK, FK to `auth.users`)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `avatar_url` (TEXT, nullable)
- `created_at`, `updated_at`, `last_login` (TIMESTAMPTZ)

**`mood_entries`**
- `id` (UUID, PK)
- `user_id` (UUID, FK to `auth.users`)
- `mood` (TEXT)
- `description` / `text` (TEXT)
- `sentiment` (TEXT)
- `score` (NUMERIC)
- `insights` (TEXT, nullable) — AI-generated insight
- `timestamp` (TIMESTAMPTZ)

**`recommendations`**
- `id` (UUID, PK)
- `title`, `description` (TEXT)
- `type` (TEXT)
- `sentiment_target` (TEXT)

**`chat_messages`**
- `id` (UUID, PK)
- `user_id` (UUID, FK to `auth.users`)
- `role` (TEXT — `user` or `assistant`)
- `content` (TEXT)
- `timestamp` (TIMESTAMPTZ)

### Storage
- **Bucket:** `profile-images` (public)
- **RLS:** Users can upload/update/delete only within their own `user_id/` folder.

### Row Level Security (RLS)
All tables have RLS enabled. Policies ensure users can only access their own data (`user_id` matching `auth.uid()`).

---

## Supabase Edge Functions

| Function | File | Purpose |
|----------|------|---------|
| `check-user-exists` | `supabase/functions/check-user-exists/index.ts` | Checks if an email is already registered in Supabase Auth using the admin API. Used during signup to prevent duplicate accounts. |
| `generate-insights` | `supabase/functions/generate-insights/index.ts` | Calls Google Gemini 2.0 Flash to generate a wellness insight for a given mood entry, then writes it back to the `mood_entries` table. |
| `calmobot-chat` | `supabase/functions/calmobot-chat/index.ts` | Implements the Calmobot chatbot. Receives message history, user profile, and recent mood entries, builds a system prompt for Gemini 2.0 Flash (restricted to health/wellness topics), and returns the AI response. |

**Note:** Edge Functions require the Supabase service role key and the Gemini API key, which are accessed via Deno environment variables (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`). These are not present in the frontend code.

---

## Testing Instructions

**There are currently no automated tests in this project.** No test framework (Jest, Vitest, Playwright, etc.) is installed, and no test files exist.

If you add tests, the following conventions are suggested to match the existing stack:
- **Unit tests:** Vitest ( aligns with Vite )
- **Component tests:** React Testing Library
- **E2E tests:** Playwright

Manual testing workflow:
1. Run `npm run dev` from `frontend/`.
2. Ensure Supabase local stack is running (`supabase start`) or use the remote Supabase project.
3. Test auth flows (signup → login → logout → password reset).
4. Test mood entry creation and verify sentiment scoring.
5. Verify AI insights appear after entry creation (may take a few seconds; insights are generated asynchronously).
6. Test the chatbot on `/chatbot`.
7. Toggle light/dark mode and verify contrast across all pages.

---

## Deployment

### Vercel
The project is configured for Vercel deployment. `vercel.json` contains:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```
This ensures React Router handles all client-side routes.

**Deploy steps:**
1. Push the `frontend/` directory to a Git repository.
2. Import the project in Vercel.
3. Set the root directory to `frontend`.
4. Set the build command to `vite build` and output directory to `dist`.
5. Add environment variables if needed (the Supabase client URL and anon key are hardcoded in `src/integrations/supabase/client.ts`).

### Supabase
- Edge Functions must be deployed separately: `supabase functions deploy`.
- Database migrations should be applied via `supabase db push` or the Supabase dashboard.

---

## Security Considerations

1. **Hardcoded Supabase Anon Key** — The Supabase publishable (anon) key is hardcoded in `src/integrations/supabase/client.ts`. This is acceptable for a public client-side key, but rotate it if it is ever leaked.
2. **Service Role Key** — The Supabase service role key is used only in Edge Functions via environment variables. It must never be exposed to the frontend.
3. **Gemini API Key** — The Google Gemini API key is used only in Edge Functions via environment variables. Keep it server-side only.
4. **RLS** — All user-facing tables have Row Level Security enabled. Always verify new tables get appropriate RLS policies.
5. **Email Confirmation Disabled** — In `supabase/config.toml`, `enable_confirmations = false` means users can sign in immediately without verifying their email. This is convenient for development but should be reviewed for production.
6. **Password Policy** — Frontend enforces password strength checking via `src/utils/passwordValidation.ts` before signup submission.
7. **No HTTPS Enforcement** — The frontend code does not enforce HTTPS. Ensure Vercel or your deployment platform handles TLS termination.

---

## Common Pitfalls for Agents

- **The README is outdated.** It describes a Flask backend, MySQL database, and Jinja2 templating that no longer exist. Do not rely on the README for architectural decisions.
- **The `/backend` directory is empty.** There is no Python/Flask code in this repo. All backend logic is in Supabase Edge Functions under `frontend/supabase/functions/`.
- **TypeScript is non-strict.** Do not expect strict null checks or implicit-any enforcement.
- **Insights are async.** When a mood entry is saved, the `generate-insights` Edge Function is called in a fire-and-forget manner. The UI will not immediately show an insight; it appears on subsequent data refreshes.
- **Both npm and bun are present.** When running commands, prefer the tool whose lockfile is most recently updated, or use npm for consistency.
- **Vite dev server runs on port 8080**, not the default 5173.

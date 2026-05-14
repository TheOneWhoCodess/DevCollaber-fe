# DevCollab — Frontend

> **Next.js 15 + TypeScript + Tailwind CSS** client for the DevCollab developer matching platform.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages & Routes](#pages--routes)
- [Key Components](#key-components)
- [Auth Architecture](#auth-architecture)
- [State Management](#state-management)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Auth (Google OAuth) + JWT |
| State | React Context (AuthContext) |
| Realtime | Socket.io client |
| HTTP | Native `fetch` with `Authorization: Bearer` |
| Deploy | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — wraps AuthProvider
│   ├── page.tsx                # Landing page
│   ├── auth/
│   │   └── page.tsx            # Google sign-in page
│   ├── profile-setup/
│   │   └── page.tsx            # First-time profile completion
│   ├── discover/
│   │   └── page.tsx            # Swipeable discover feed
│   ├── matches/
│   │   └── page.tsx            # Match list
│   ├── chat/
│   │   └── [matchId]/
│   │       └── page.tsx        # Real-time chat
│   ├── profile-edit/
│   │   └── page.tsx            # Edit profile + GitHub preview
│   ├── projects/
│   │   ├── page.tsx            # Browse projects
│   │   ├── new/page.tsx        # Create project
│   │   ├── mine/page.tsx       # My projects
│   │   └── [id]/
│   │       ├── page.tsx        # Project detail
│   │       ├── applications/   # Review applications
│   │       └── room/           # Project room (tasks/links/members)
│   └── u/
│       └── [username]/
│           └── page.tsx        # Public profile
├── components/
│   ├── AuthGuard.tsx           # Protects pages — redirects if unauthenticated
│   ├── SwipeCard.tsx           # Draggable profile card
│   ├── MatchPopup.tsx          # Match celebration modal
│   ├── NotificationBell.tsx    # Live notification dropdown
│   ├── OnboardingTour.tsx      # First-time user walkthrough
│   ├── GitHubStats.tsx         # GitHub repos + language breakdown
│   └── room/
│       ├── TaskBoard.tsx       # Kanban board
│       ├── LinkVault.tsx       # Shared links
│       └── MemberList.tsx      # Room members
└── lib/
    ├── AuthContext.tsx         # Global auth state (single source of truth)
    ├── firebase.ts             # Firebase app + Google provider init
    └── useAuth.ts              # (deprecated — use AuthContext)

middleware.ts                   # Sets COOP header for Google auth popup
next.config.ts                  # Next.js config
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A running DevCollab backend (`http://localhost:5000`)
- Firebase project with Google Auth enabled

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/devcollab-client.git
cd devcollab-client

# Install dependencies
npm install

# Copy env template
cp .env.example .env.local
# Fill in your environment variables (see below)

# Start development server
npm run dev
```

Client runs on `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file in the root:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Pages & Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | ❌ | Landing page |
| `/auth` | ❌ | Google sign-in |
| `/profile-setup` | ✅ | First-time profile setup (new users only) |
| `/discover` | ✅ | Swipeable developer feed |
| `/matches` | ✅ | Your matches list |
| `/chat/:matchId` | ✅ | Real-time chat with a match |
| `/profile-edit` | ✅ | Edit your developer profile |
| `/projects` | ✅ | Browse all open projects |
| `/projects/new` | ✅ | Post a new project |
| `/projects/mine` | ✅ | Your posted projects |
| `/projects/:id` | ✅ | Project detail + apply |
| `/projects/:id/applications` | ✅ | Review applicants (owner only) |
| `/projects/:id/room` | ✅ | Project room (members only) |
| `/u/:username` | ✅ | Public developer profile |

---

## Key Components

### `AuthGuard`
Wraps all protected pages. Reads from `AuthContext` — if user is not authenticated after loading, redirects to `/auth`.

```tsx
// Usage
export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourPageContent />
    </AuthGuard>
  );
}
```

### `NotificationBell`
Polls `/api/notifications` every 30 seconds. Shows unread count badge. Dropdown with mark-all-read support.

### `SwipeCard`
Draggable profile card with gesture support. Triggers `like`, `pass`, or `superlike` callbacks on release.

### `GitHubStats`
Fetches live GitHub data via the backend proxy. Displays:
- Follower count + repo count + contribution total
- Language breakdown bar with percentages
- Top 4 repos with star/fork counts

### `TaskBoard`
Kanban board with 3 columns (Todo / In Progress / Done). Optimistic UI updates — status changes instantly, syncs to server in background.

---

## Auth Architecture

DevCollab uses a **single `AuthContext`** as the source of truth for auth state. This eliminates race conditions from multiple components reading `localStorage` independently.

```
App startup
    │
    ▼
AuthContext mounts (layout.tsx)
    │
    ├─ reads localStorage token
    ├─ calls GET /api/auth/me
    ├─ sets user in React state
    └─ setLoading(false)
         │
         ▼
All pages use useAuth() from AuthContext
    │
    ├─ loading=true  → show spinner
    ├─ user=null     → redirect to /auth (via AuthGuard)
    └─ user=object   → render page
```

### Login Flow
```
handleGoogleLogin()
    │
    ├─ signInWithPopup(auth, googleProvider)
    │       │
    │       ├─ success → get idToken → POST /api/auth/google
    │       │                │
    │       │                └─ save JWT to localStorage
    │       │                   setUser(data.user) in AuthContext
    │       │                   router.push('/discover')
    │       │
    │       └─ auth/popup-blocked → signInWithRedirect()
    │                                   │
    │                                   └─ handled by useEffect on return
    │
    └─ auth/popup-closed-by-user → show error message
```

### Making Authenticated Requests
Always use the JWT from `localStorage`:

```ts
const token = localStorage.getItem("token");

const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/some/route`, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
```

> ⚠️ Never use `credentials: "include"` — this app uses JWT, not cookies.

---

## State Management

| State | Location | Scope |
|-------|----------|-------|
| Authenticated user | `AuthContext` | Global — entire app |
| Discover profiles | `DiscoverPage` local state | Page only |
| Chat messages | `ChatPage` local state | Page only |
| Notifications | `NotificationBell` local state | Component only |
| Project room data | Room component local state | Component only |

No external state library (Redux, Zustand) is needed — `AuthContext` handles the only truly global state.

---

## Important Configuration Files

### `middleware.ts`
Sets `Cross-Origin-Opener-Policy: same-origin-allow-popups` on every response. Required for Google auth popup to work correctly.

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  return response;
}
```

### `next.config.ts`
```ts
const nextConfig: NextConfig = {
  reactStrictMode: false, // disabled to prevent double useEffect execution in dev
};
```

> `reactStrictMode` is disabled because double-invocation of effects causes auth state race conditions in development.

---

## Deployment (Vercel)

1. Connect GitHub repo to Vercel
2. Set **Framework Preset** to `Next.js`
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` → your Render backend URL
   - All `NEXT_PUBLIC_FIREBASE_*` variables
4. Enable **Auto-Deploy** on push to `main`

### After Deployment
Add your Vercel domain to Firebase Console:
- Go to **Authentication → Settings → Authorized Domains**
- Add `your-app.vercel.app`

---

## Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build + type check
npm start        # Start production server
npm run lint     # ESLint
```

---

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Redirected back to `/auth` after login | `AuthContext` not wrapping layout | Ensure `<AuthProvider>` is in `layout.tsx` |
| `401` on all API calls | Missing `Authorization` header | Use `localStorage.getItem("token")` in fetch headers |
| Google popup blocked | COOP header missing | Check `middleware.ts` is at project root |
| `Failed to fetch` | Backend not running or wrong `NEXT_PUBLIC_API_URL` | Verify `.env.local` and backend is started |
| Build fails with type errors | Mismatched imports from old `useAuth.ts` | Replace all imports with `@/src/lib/AuthContext` |

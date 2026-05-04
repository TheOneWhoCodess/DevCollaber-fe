# DevCollab — Frontend

A Next.js 15 frontend for the DevCollab developer matchmaking platform. Tinder-style swiping for developers to find co-founders and collaborators.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (swipe gestures)
- **Auth**: Firebase (Google OAuth popup)
- **Real-time**: Socket.io client
- **Icons**: Lucide React
- **Fonts**: Anton (headings), Condiment (accents), system monospace (body)

---

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── page.tsx          # Google login page
│   │   ├── profile-setup/
│   │   │   └── page.tsx          # First-time profile creation
│   │   ├── profile-edit/
│   │   │   └── page.tsx          # Edit profile + avatar upload + logout
│   │   ├── discover/
│   │   │   └── page.tsx          # Swipe card stack with filters
│   │   ├── matches/
│   │   │   └── page.tsx          # Matches list
│   │   ├── chat/
│   │   │   └── [matchId]/
│   │   │       └── page.tsx      # Real-time chat
│   │   ├── globals.css           # Tailwind + liquid glass CSS
│   │   ├── layout.tsx            # Root layout with fonts
│   │   └── page.tsx              # Landing page (4 sections)
│   ├── components/
│   │   ├── AuthGuard.tsx         # Redirects unauthenticated users
│   │   ├── SwipeCard.tsx         # Draggable profile card (Framer Motion)
│   │   └── MatchPopup.tsx        # Match celebration modal
│   └── lib/
│       ├── firebase.ts           # Firebase app init
│       └── useAuth.ts            # Auth hook (checks session, returns user)
├── .env.local                    # Environment variables
├── tailwind.config.ts            # Custom colors + fonts
├── next.config.ts
└── tsconfig.json
```

---

## Getting Started

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the `client/` directory:

```env
# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Firebase setup

1. Go to **Firebase Console → Authentication → Sign-in method**
2. Enable **Google** provider
3. Add `localhost` to authorized domains (it's there by default for dev)

### 4. Run the dev server

```bash
npm run dev
```

App runs on `http://localhost:3000`

---

## Pages

### `/` — Landing Page
4-section marketing page with video backgrounds served from CloudFront. Liquid glass UI effects throughout. "Get Started" button routes to `/auth`.

### `/auth` — Login
Single Google OAuth button. On success:
- **New user** → redirected to `/profile-setup`
- **Existing user** → redirected to `/discover`

Flow: Firebase popup → get ID token → POST to `/api/auth/google` → receive JWT cookie.

### `/profile-setup` — First-time Setup
Form to fill role, skills, bio, project idea, commitment level, GitHub, LinkedIn, location. Runs once after first login.

### `/discover` — Swipe Feed
- Fetches profiles from `/api/profile/discover`
- Card stack with drag gestures (Framer Motion) + like/pass/superlike buttons
- Swipe right = like, left = pass, up = superlike
- Match popup appears on mutual like (via socket `new_match` event)
- Role filter dropdown
- Auto-refetches when stack runs low

### `/matches` — Matches List
All mutual matches sorted by most recent. Shows name, role, top 3 skills, match score, time ago. Click any match to open chat.

### `/chat/[matchId]` — Real-time Chat
- Loads message history from `/api/messages/:matchId`
- Socket.io for real-time messaging
- Typing indicator (animated dots)
- Messages grouped by sender
- Enter to send

### `/profile-edit` — Edit Profile
Same fields as setup but pre-filled with existing data. Additional features:
- **Avatar upload** → sends to backend → Cloudinary
- **Availability toggle** → controls visibility in discover feed
- **Logout** button

---

## Design System

### Colors
```
background: #010828  (deep navy)
cream:      #EFF4FF  (off-white text)
neon:       #6FFF00  (bright green accents)
```

### Fonts
```
font-grotesk:   Anton       — headings, nav, labels
font-condiment: Condiment   — cursive accent overlays
font-mono:      system mono — body text, descriptions
```

### Liquid Glass Effect
Applied via `.liquid-glass` CSS class on cards, nav, buttons:
```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
}
```
With a `::before` gradient border using CSS mask compositing.

---

## Auth Flow

```
User clicks "Continue with Google"
    → Firebase signInWithPopup
    → Get Firebase ID token
    → POST /api/auth/google with idToken
    → Backend verifies via Firebase Admin SDK
    → Backend creates/finds user in MongoDB
    → Backend sets JWT httpOnly cookie
    → Frontend redirects based on isNewUser flag
```

All protected pages are wrapped in `<AuthGuard>` which calls `/api/auth/me` on mount and redirects to `/auth` if unauthenticated.

---

## Key Components

### `SwipeCard.tsx`
Uses Framer Motion `useMotionValue` and `useTransform` for drag tracking. Thresholds:
- `x > 100` → like (exit right)
- `x < -100` → pass (exit left)
- `y < -100` → superlike (exit up)
- Otherwise → snap back with spring animation

### `AuthGuard.tsx`
Wraps any page. Calls `useAuth()` hook — shows spinner while checking session, redirects to `/auth` if not logged in.

### `useAuth.ts`
Custom hook that fetches `/api/auth/me` on mount. Returns `{ user, loading }`. Used by AuthGuard and anywhere the logged-in user's data is needed.

---

## Tailwind Config

Custom extensions in `tailwind.config.ts`:

```ts
fontFamily: {
  grotesk:   ["Anton", "sans-serif"],
  condiment: ["Condiment", "cursive"],
  mono:      ["ui-monospace", ...system fonts],
},
colors: {
  background: "#010828",
  cream:      "#EFF4FF",
  neon:       "#6FFF00",
}
```

Content paths point to `src/`:
```ts
content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
]
```
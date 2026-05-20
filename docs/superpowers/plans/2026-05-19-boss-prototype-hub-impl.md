# BOSS Prototype Hub — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build BOSS Prototype Hub — an internal Next.js + Supabase web app for BAF IT team with ELIS feature demo (approve/reject flow, audit log, role-based access).

**Architecture:** Next.js 16 App Router with `src/` layout. Supabase SSR for auth. Route protection via middleware. Role-based data access via RLS policies. BOSS design system (navy/gold sidebar, slate page background) applied via global CSS + shared components.

**Tech Stack:** Next.js 16.2.6, Tailwind CSS v4, Supabase SSR (`@supabase/ssr`), TypeScript, shadcn/ui (base-sera style), Vercel deploy.

---

## File Structure (Full)

```
src/
├── app/
│   ├── layout.tsx                    # root layout (fonts, globals)
│   ├── page.tsx                      # redirect → /login
│   ├── login/
│   │   └── page.tsx                  # login form
│   └── (protected)/
│       ├── layout.tsx               # auth guard + PageShell wrapper
│       ├── dashboard/
│       │   └── page.tsx             # StatCards, nav to ELIS
│       └── elis/
│           ├── page.tsx            # ELIS table + filters
│           └── [id]/
│               └── page.tsx         # ELIS detail + action buttons
├── components/boss/
│   ├── PageShell.tsx                # sidebar + main content wrapper
│   ├── Sidebar.tsx                  # BOSS sidebar nav
│   ├── StatusBadge.tsx              # colored status pill
│   ├── Modal.tsx                    # confirmation modal
│   ├── FilterSection.tsx           # filter bar for list page
│   ├── Button.tsx                   # BOSS-styled button variants
│   └── Toast.tsx                   # success/error toast notification
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # createBrowserClient
│   │   ├── server.ts                # createServerClient
│   │   └── elis.ts                  # ELIS CRUD helpers
│   ├── constants.ts                 # ELIS_STATUSES, BOSS_ROLES, JENIS_PERKARA
│   └── utils.ts                     # cn(), formatDate(), formatWIB()
└── middleware.ts                     # session refresh + route protection
app/globals.css                      # BOSS design tokens
```

---

## Task 1: Global CSS + BOSS Design Tokens

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Overwrite globals.css with BOSS design tokens**

```css
@import "tailwindcss";

@theme inline {
  /* BOSS Colors */
  --color-sidebar-bg: #1a2e5a;
  --color-sidebar-accent: #f59e0b;
  --color-sidebar-active: #2563eb;
  --color-page-bg: #f1f5f9;
  --color-card-bg: #ffffff;
  --color-border: #e2e8f0;
  --color-primary: #1e3a5f;
  --color-primary-hover: #162d4d;
  --color-edit-btn: #2563eb;
  --color-danger: #ef4444;
  --color-success: #15803d;
  --color-warning: #d97706;
  --color-text: #374151;
  --color-muted: #9ca3af;
  --color-heading: #1e3a5f;

  /* Typography */
  --font-sans: 'Segoe UI', system-ui, sans-serif;

  /* Radius */
  --radius-button: 4px;
  --radius-card: 6px;
}
```

- [ ] **Step 2: Update `app/layout.tsx` to use Segoe UI, remove unused fonts, set page background**

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOSS Prototype Hub",
  description: "Business Operations Support Systems — PT Bussan Auto Finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="h-full bg-[--color-page-bg] antialiased" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update `app/page.tsx` to redirect to /login**

```typescript
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/0471250923/boss-prototype-hub
git add app/globals.css app/layout.tsx app/page.tsx
git commit -m "feat: apply BOSS design tokens and redirect root to /login"
```

---

## Task 2: Supabase Clients + Constants

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/constants.ts`
- Modify: `src/lib/utils.ts` (already exists, update `cn` if needed — it already works)

- [ ] **Step 1: Create `src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create `src/lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options?: Parameters<ReturnType<typeof cookies>['set']>[2]) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options?: Parameters<ReturnType<typeof cookies>['set']>[2]) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}
```

- [ ] **Step 3: Create `src/lib/constants.ts`**

```typescript
export const ELIS_STATUSES = [
  'Menunggu validasi',
  'Revisi',
  'Ditolak',
  'Menunggu persetujuan',
  'Disetujui',
  'Sedang diproses',
  'Selesai',
] as const

export type ElisStatus = typeof ELIS_STATUSES[number]

export const JENIS_PERKARA = ['Perdata', 'Fidusia', 'Eksekusi', 'Mediasi', 'PKPU', 'Lainnya'] as const

export const BOSS_ROLES = {
  admin: 'Admin',
  admin_lit: 'Admin Litigation',
  approver: 'Approver',
  requester: 'Requester',
  viewer: 'Viewer',
} as const

export type BossRole = keyof typeof BOSS_ROLES

// Valid status transitions: fromStatus -> allowed toStatus[]
export const ALLOWED_TRANSITIONS: Record<string, Record<ElisStatus, ElisStatus[]>> = {
  admin_lit: {
    'Menunggu validasi': ['Revisi', 'Ditolak', 'Menunggu persetujuan'],
    'Sedang diproses': ['Selesai'],
    'Revisi': [],
    'Ditolak': [],
    'Menunggu persetujuan': [],
    'Disetujui': ['Sedang diproses'],
    'Selesai': [],
  },
  approver: {
    'Menunggu persetujuan': ['Disetujui', 'Ditolak'],
    'Menunggu validasi': [],
    'Revisi': [],
    'Ditolak': [],
    'Disetujui': [],
    'Sedang diproses': [],
    'Selesai': [],
  },
}

export const ACTION_LABELS: Record<string, string> = {
  'Revisi': 'Revisi Diminta',
  'Ditolak': 'Ditolak',
  'Menunggu persetujuan': 'Diteruskan ke Approver',
  'Disetujui': 'Disetujui',
  'Sedang diproses': 'Mulai Diproses',
  'Selesai': 'Selesai',
  'Ajukan Ulang': 'Diajukan Ulang',
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/client.ts src/lib/supabase/server.ts src/lib/constants.ts
git commit -m "feat: add Supabase clients and BOSS constants"
```

---

## Task 3: Middleware (Auth Guard)

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create `src/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users to /login
  if (!session && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from /login
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 2: Test that `/` redirects to `/login` and `/dashboard` redirects to `/login` when unauthenticated**

```bash
# With dev server running, test unauthenticated redirect
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" http://localhost:3000/
# Expected: 307 -> /login

curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" http://localhost:3000/dashboard
# Expected: 307 -> /login
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Supabase auth middleware with route protection"
```

---

## Task 4: Supabase Schema DDL (Run in Supabase SQL Editor)

> **Run this SQL in your Supabase SQL Editor** before proceeding. This creates all required tables, RLS policies, and triggers.

- [ ] **Step 1: Run the following SQL in Supabase SQL Editor**

```sql
-- ============================================
-- BOSS Prototype Hub — ELIS Schema
-- Run in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Table: profiles
-- Stores user metadata alongside Supabase Auth
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null default '',
  email text not null default '',
  boss_role text not null default 'viewer'
    check (boss_role in ('admin', 'admin_lit', 'approver', 'requester', 'viewer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, boss_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'boss_role', 'viewer')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Table: elis_submissions
-- ============================================
create table if not exists public.elis_submissions (
  id uuid default uuid_generate_v4() primary key,
  nomor_pengajuan text not null unique,
  requester_id uuid references public.profiles(id) on delete set null,
  requester_name text not null default '',
  judul_perkara text not null default '',
  jenis_perkara text check (jenis_perkara in ('Perdata', 'Fidusia', 'Eksekusi', 'Mediasi', 'PKPU', 'Lainnya')),
  tgl_pengajuan date default current_date,
  status text not null default 'Menunggu validasi'
    check (status in ('Menunggu validasi', 'Revisi', 'Ditolak', 'Menunggu persetujuan', 'Disetujui', 'Sedang diproses', 'Selesai')),
  approver_id uuid references public.profiles(id) on delete set null,
  -- Detail fields
  no_perkara text,
  pihak_dftr text,
  pihak_thd text,
  no_spdp text,
  tgl_spdp date,
  no_p21 text,
  tgl_p21 date,
  deskripsi text,
  -- Attachments (file name references only — no actual upload)
  lampiran_1 text,
  lampiran_2 text,
  lampiran_3 text,
  catatan_revisi text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Table: elis_audit_log
-- ============================================
create table if not exists public.elis_audit_log (
  id uuid default uuid_generate_v4() primary key,
  elis_id uuid references public.elis_submissions(id) on delete cascade,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null default '',
  catatan text,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security
-- ============================================

alter table public.profiles enable row level security;
alter table public.elis_submissions enable row level security;
alter table public.elis_audit_log enable row level security;

-- profiles: users can read all, update own
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- elis_submissions: role-based access
create policy "Admin sees all" on public.elis_submissions for all
  using (auth.uid() in (select id from public.profiles where boss_role = 'admin'))
  with check (auth.uid() in (select id from public.profiles where boss_role = 'admin'));

create policy "Admin_lit sees all" on public.elis_submissions for all
  using (auth.uid() in (select id from public.profiles where boss_role = 'admin_lit'))
  with check (auth.uid() in (select id from public.profiles where boss_role = 'admin_lit'));

create policy "Requester sees own" on public.elis_submissions for select
  using (auth.uid() = requester_id);

create policy "Approver sees relevant" on public.elis_submissions for select
  using (
    auth.uid() = approver_id
    or status = 'Menunggu persetujuan'
    or auth.uid() in (select id from public.profiles where boss_role in ('admin', 'admin_lit'))
  );

create policy "Approver can update" on public.elis_submissions for update
  using (auth.uid() in (select id from public.profiles where boss_role = 'approver'))
  with check (auth.uid() in (select id from public.profiles where boss_role = 'approver'));

create policy "Admin_lit can insert" on public.elis_submissions for insert
  with check (auth.uid() in (select id from public.profiles where boss_role in ('admin_lit', 'admin')));

create policy "Admin_lit can update" on public.elis_submissions for update
  using (auth.uid() in (select id from public.profiles where boss_role in ('admin_lit', 'admin')))
  with check (auth.uid() in (select id from public.profiles where boss_role in ('admin_lit', 'admin')));

-- elis_audit_log: readable by all authenticated, writable by all authenticated
create policy "Audit log readable by all authenticated" on public.elis_audit_log for select using (true);
create policy "Audit log writable by all authenticated" on public.elis_audit_log for insert with check (true);

-- ============================================
-- Seed test data (optional — run manually in SQL Editor)
-- ============================================
-- INSERT INTO public.elis_submissions (nomor_pengajuan, requester_name, judul_perkara, jenis_perkara, status)
-- VALUES
--   ('ELIS-001', 'Ahmad Wijaya', 'Gugatan Piutang PT ABC', 'Perdata', 'Menunggu validasi'),
--   ('ELIS-002', 'Siti Nurhaliza', 'Fidusia kendaraan bermotor', 'Fidusia', 'Menunggu persetujuan'),
--   ('ELIS-003', 'Budi Santoso', 'Eksekusi tanah', 'Eksekusi', 'Selesai');
```

- [ ] **Step 2: Verify tables exist**

```bash
# In Supabase Dashboard > SQL Editor, run:
# SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
# Expected: profiles, elis_submissions, elis_audit_log
```

- [ ] **Step 3: Commit the SQL as a migration file (optional)**

```bash
git add docs/superpowers/plans/YYYY-MM-DD-boss-prototype-hub-impl.md  # plan doc only, SQL run manually
# No commit needed for SQL — user ran it manually in Supabase
```

---

## Task 5: Login Page

**Files:**
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Create `src/app/login/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-page-bg] p-4">
      <div className="w-full max-w-sm">
        {/* Header bar */}
        <div className="bg-[--color-primary] text-white text-center py-3 rounded-t-md">
          <div className="text-xs tracking-widest uppercase opacity-80 mb-0.5">PT Bussan Auto Finance</div>
          <div className="font-semibold text-base tracking-wide">BOSS PROTOTYPE HUB</div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-b-md border border-[--color-border] p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-[--color-heading] mb-1">Masuk</h1>
          <p className="text-sm text-[--color-muted] mb-6">Gunakan akun email Anda</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[--color-text] mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-[--color-border] rounded px-3 py-2 text-sm text-[--color-text] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
                placeholder="email@baf.id"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[--color-text] mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-[--color-border] rounded px-3 py-2 text-sm text-[--color-text] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-[--color-danger] bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[--color-primary] hover:bg-[--color-primary-hover] disabled:opacity-50 text-white font-medium py-2.5 rounded transition-colors text-sm"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              {loading ? "Memuat..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test login page renders**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login
# Expected: 200
```

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat: add BOSS-styled login page"
```

---

## Task 6: BOSS Components — Button, StatusBadge, Modal, Toast, FilterSection

**Files:**
- Create: `src/components/boss/Button.tsx`
- Create: `src/components/boss/StatusBadge.tsx`
- Create: `src/components/boss/Modal.tsx`
- Create: `src/components/boss/Toast.tsx`
- Create: `src/components/boss/FilterSection.tsx`

- [ ] **Step 1: Create `src/components/boss/Button.tsx`**

```typescript
import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "edit" | "danger" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[--color-primary] hover:bg-[--color-primary-hover] text-white",
  secondary: "bg-gray-100 hover:bg-gray-200 text-[--color-text]",
  edit: "border border-[--color-edit-btn] text-[--color-edit-btn] hover:bg-blue-50 bg-white",
  danger: "bg-[--color-danger] hover:bg-red-600 text-white",
  ghost: "bg-transparent hover:bg-gray-100 text-[--color-text]",
}

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-medium transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      style={{ borderRadius: 'var(--radius-button)' }}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Create `src/components/boss/StatusBadge.tsx`**

```typescript
import { cn } from "@/lib/utils"
import type { ElisStatus } from "@/lib/constants"

const statusColors: Record<ElisStatus, string> = {
  'Menunggu validasi': "bg-amber-100 text-amber-800 border-amber-200",
  'Revisi': "bg-orange-100 text-orange-800 border-orange-200",
  'Ditolak': "bg-red-100 text-red-800 border-red-200",
  'Menunggu persetujuan': "bg-blue-100 text-blue-800 border-blue-200",
  'Disetujui': "bg-emerald-100 text-emerald-800 border-emerald-200",
  'Sedang diproses': "bg-purple-100 text-purple-800 border-purple-200",
  'Selesai': "bg-green-100 text-green-800 border-green-200",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status as ElisStatus] ?? "bg-gray-100 text-gray-800 border-gray-200"
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
        className
      )}
    >
      {status}
    </span>
  )
}
```

- [ ] **Step 3: Create `src/components/boss/Modal.tsx`**

```typescript
"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "./Button"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-white rounded-md shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[--color-border]">
          <h3 className="font-semibold text-white text-sm" style={{ color: 'var(--color-primary)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[--color-muted] hover:text-[--color-text] p-1 rounded"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-4 text-sm text-[--color-text]">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-[--color-border] bg-gray-50 rounded-b-md">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/boss/Toast.tsx`**

```typescript
"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning"

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-[--color-success]" />,
  error: <XCircle size={18} className="text-[--color-danger]" />,
  warning: <AlertTriangle size={18} className="text-[--color-warning]" />,
}

const toastStyles: Record<ToastType, string> = {
  success: "border-[--color-success]/30 bg-green-50",
  error: "border-[--color-danger]/30 bg-red-50",
  warning: "border-[--color-warning]/30 bg-amber-50",
}

export function Toast({ message, type = "success", onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-md border shadow-lg text-sm",
        toastStyles[type],
        visible ? "opacity-100" : "opacity-0",
        "transition-opacity duration-300"
      )}
    >
      {toastIcons[type]}
      <span className="text-[--color-text]">{message}</span>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/boss/FilterSection.tsx`**

```typescript
"use client"

import { Button } from "./Button"
import { Search, X } from "lucide-react"

interface FilterField {
  key: string
  label: string
  type: "text" | "select"
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface FilterSectionProps {
  filters: FilterField[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onSearch: () => void
  onReset: () => void
}

export function FilterSection({ filters, values, onChange, onSearch, onReset }: FilterSectionProps) {
  const hasValues = Object.values(values).some(v => v !== "")

  return (
    <div className="flex flex-wrap gap-3 items-end p-4 bg-white border border-[--color-border] rounded-md mb-4">
      {filters.map(field => (
        <div key={field.key} className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-[--color-muted]">{field.label}</label>
          {field.type === "select" ? (
            <select
              value={values[field.key]}
              onChange={e => onChange(field.key, e.target.value)}
              className="border border-[--color-border] rounded px-3 py-2 text-sm text-[--color-text] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              <option value="">{field.placeholder ?? "Semua"}</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={values[field.key]}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={field.placeholder ?? ""}
              className="border border-[--color-border] rounded px-3 py-2 text-sm text-[--color-text] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
              style={{ borderRadius: 'var(--radius-button)' }}
            />
          )}
        </div>
      ))}

      <div className="flex gap-2 ml-auto">
        {hasValues && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X size={14} /> Reset
          </Button>
        )}
        <Button variant="primary" size="sm" onClick={onSearch}>
          <Search size={14} /> Cari
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/boss/Button.tsx src/components/boss/StatusBadge.tsx src/components/boss/Modal.tsx src/components/boss/Toast.tsx src/components/boss/FilterSection.tsx
git commit -m "feat: add BOSS UI components — Button, StatusBadge, Modal, Toast, FilterSection"
```

---

## Task 7: PageShell + Sidebar + Protected Layout

**Files:**
- Create: `src/components/boss/PageShell.tsx`
- Create: `src/components/boss/Sidebar.tsx`
- Create: `src/app/(protected)/layout.tsx`

- [ ] **Step 1: Create `src/components/boss/Sidebar.tsx`**

```typescript
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/elis", label: "ELIS", icon: FileText },
]

interface SidebarProps {
  userName?: string
  userRole?: string
}

export function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 min-h-screen flex flex-col flex-shrink-0"
      style={{ backgroundColor: 'var(--color-sidebar-bg)' }}
    >
      {/* App Title */}
      <div
        className="px-4 py-5 text-white border-l-4"
        style={{ borderLeftColor: 'var(--color-sidebar-accent)' }}
      >
        <div className="text-xs tracking-widest opacity-70 mb-0.5">PT BUSSAN AUTO FINANCE</div>
        <div className="font-semibold text-sm tracking-wide">BOSS PROTOTYPE HUB</div>
      </div>

      {/* Nav section label */}
      <div className="px-4 pt-6 pb-2">
        <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Menu</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors",
                isActive
                  ? "bg-[--color-sidebar-active] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-white/10">
        {userName && (
          <div className="mb-2">
            <div className="text-sm text-white font-medium truncate">{userName}</div>
            {userRole && (
              <div className="text-xs text-white/50 capitalize">{userRole.replace('_', ' ')}</div>
            )}
          </div>
        )}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create `src/components/boss/PageShell.tsx`**

```typescript
"use client"

import { Sidebar } from "./Sidebar"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface PageShellProps {
  children: React.ReactNode
}

export function PageShell({ children }: PageShellProps) {
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, boss_role")
        .eq("id", user.id)
        .single()

      if (profile) {
        setUserName(profile.full_name)
        setUserRole(profile.boss_role)
      }
    }
    loadUser()
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} userRole={userRole} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/(protected)/layout.tsx`**

```typescript
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageShell } from "@/components/boss/PageShell"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return <PageShell>{children}</PageShell>
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/boss/Sidebar.tsx src/components/boss/PageShell.tsx src/app/\(protected\)/layout.tsx
git commit -m "feat: add PageShell, Sidebar, and protected layout with auth guard"
```

---

## Task 8: Dashboard Page with StatCards

**Files:**
- Create: `src/app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Create `src/app/(protected)/dashboard/page.tsx`**

```typescript
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface StatCardData {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCardData[]>([
    { label: "Total ELIS", value: "-", icon: <FileText size={20} />, color: "text-[--color-primary]" },
    { label: "Menunggu Tindakan", value: "-", icon: <Clock size={20} />, color: "text-[--color-warning]" },
    { label: "Selesai Bulan Ini", value: "-", icon: <CheckCircle size={20} />, color: "text-[--color-success]" },
    { label: "Ditolak", value: "-", icon: <XCircle size={20} />, color: "text-[--color-danger]" },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()

      // Total
      const { count: total } = await supabase
        .from("elis_submissions")
        .select("*", { count: "exact", head: true })

      // Menunggu tindakan: Menunggu validasi + Menunggu persetujuan
      const { count: menunggu } = await supabase
        .from("elis_submissions")
        .select("*", { count: "exact", head: true })
        .in("status", ["Menunggu validasi", "Menunggu persetujuan"])

      // Selesai bulan ini
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const { count: selesaiBulanIni } = await supabase
        .from("elis_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "Selesai")
        .gte("updated_at", startOfMonth)

      // Ditolak
      const { count: ditolak } = await supabase
        .from("elis_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "Ditolak")

      setStats([
        { label: "Total ELIS", value: total ?? 0, icon: <FileText size={20} />, color: "text-[--color-primary]" },
        { label: "Menunggu Tindakan", value: menunggu ?? 0, icon: <Clock size={20} />, color: "text-[--color-warning]" },
        { label: "Selesai Bulan Ini", value: selesaiBulanIni ?? 0, icon: <CheckCircle size={20} />, color: "text-[--color-success]" },
        { label: "Ditolak", value: ditolak ?? 0, icon: <XCircle size={20} />, color: "text-[--color-danger]" },
      ])
      setLoading(false)
    }
    loadStats()
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-heading)' }}>Dashboard</h1>
        <p className="text-sm text-[--color-muted] mt-1">Ringkasan data ELIS</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-md border border-[--color-border] p-5 shadow-sm"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-[--color-muted] uppercase tracking-wide mb-1">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-heading)' }}>
                  {loading ? "—" : stat.value}
                </div>
              </div>
              <div className={stat.color}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/elis"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors bg-[--color-primary] hover:bg-[--color-primary-hover] rounded"
          style={{ borderRadius: 'var(--radius-button)' }}
        >
          Lihat Daftar ELIS →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test dashboard loads and StatCards show numbers**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard
# With auth cookie: 200. Without auth: 307 → /login
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(protected\)/dashboard/page.tsx
git commit -m "feat: add dashboard page with ELIS StatCards"
```

---

## Task 9: ELIS List Page

**Files:**
- Create: `src/app/(protected)/elis/page.tsx`
- Modify: `src/components/boss/FilterSection.tsx` (already created in Task 6)

- [ ] **Step 1: Create `src/app/(protected)/elis/page.tsx`**

```typescript
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { StatusBadge } from "@/components/boss/StatusBadge"
import { FilterSection } from "@/components/boss/FilterSection"
import { Button } from "@/components/boss/Button"
import { useRouter } from "next/navigation"
import { ELIS_STATUSES, JENIS_PERKARA } from "@/lib/constants"
import { ChevronRight } from "lucide-react"

interface ElisRow {
  id: string
  nomor_pengajuan: string
  requester_name: string
  judul_perkara: string
  jenis_perkara: string
  tgl_pengajuan: string
  status: string
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function ElisListPage() {
  const [rows, setRows] = useState<ElisRow[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const [filters, setFilters] = useState({
    nomor_pengajuan: "",
    status: "",
    jenis_perkara: "",
    tgl_dari: "",
    tgl_sampai: "",
  })

  async function fetchElis() {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("boss_role, id")
      .eq("id", user.id)
      .single()

    if (!profile) return

    let query = supabase
      .from("elis_submissions")
      .select("id, nomor_pengajuan, requester_name, judul_perkara, jenis_perkara, tgl_pengajuan, status")
      .order("created_at", { ascending: false })

    // Role-based filtering
    if (profile.boss_role === 'requester') {
      query = query.eq("requester_id", profile.id)
    } else if (profile.boss_role === 'approver') {
      // Show: own + menunggu persetujuan
      query = query.or(`approver_id.eq.${profile.id},status.eq.Menunggu persetujuan`)
    }

    // Text filter
    if (filters.nomor_pengajuan) {
      query = query.ilike("nomor_pengajuan", `%${filters.nomor_pengajuan}%`)
    }
    if (filters.status) {
      query = query.eq("status", filters.status)
    }
    if (filters.jenis_perkara) {
      query = query.eq("jenis_perkara", filters.jenis_perkara)
    }
    if (filters.tgl_dari) {
      query = query.gte("tgl_pengajuan", filters.tgl_dari)
    }
    if (filters.tgl_sampai) {
      query = query.lte("tgl_pengajuan", filters.tgl_sampai)
    }

    const { data } = await query
    setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchElis()
  }, [])

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const statusOptions = ELIS_STATUSES.map(s => ({ value: s, label: s }))
  const jenisOptions = JENIS_PERKARA.map(j => ({ value: j, label: j }))

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-heading)' }}>
          Daftar Pengajuan ELIS
        </h1>
        <p className="text-sm text-[--color-muted] mt-1">
          Kelola pengajuan Elektronik Informasi Litigasi
        </p>
      </div>

      <FilterSection
        filters={[
          { key: "nomor_pengajuan", label: "Nomor Pengajuan", type: "text", placeholder: "Cari nomor..." },
          { key: "status", label: "Status", type: "select", options: statusOptions },
          { key: "jenis_perkara", label: "Jenis Perkara", type: "select", options: jenisOptions },
          { key: "tgl_dari", label: "Tanggal Dari", type: "text" },
          { key: "tgl_sampai", label: "Tanggal Sampai", type: "text" },
        ]}
        values={filters}
        onChange={handleFilterChange}
        onSearch={fetchElis}
        onReset={() => {
          setFilters({ nomor_pengajuan: "", status: "", jenis_perkara: "", tgl_dari: "", tgl_sampai: "" })
          setTimeout(fetchElis, 50)
        }}
      />

      {/* Table */}
      <div className="bg-white border border-[--color-border] rounded-md overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-[--color-border]">
                {["Nomor Pengajuan", "Requester", "Judul Perkara", "Jenis Perkara", "Tanggal Pengajuan", "Status", "Aksi"].map(h => (
                  <th key={h} className="px-4 py-3 font-medium text-[--color-text]" style={{ whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[--color-muted]">Memuat...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[--color-muted]">Tidak ada data</td>
                </tr>
              ) : rows.map(row => (
                <tr key={row.id} className="border-b border-[--color-border] hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-[--color-primary]">
                    {row.nomor_pengajuan}
                  </td>
                  <td className="px-4 py-3 text-[--color-text]">{row.requester_name}</td>
                  <td className="px-4 py-3 text-[--color-text]">{row.judul_perkara}</td>
                  <td className="px-4 py-3 text-[--color-text]">{row.jenis_perkara ?? "—"}</td>
                  <td className="px-4 py-3 text-[--color-muted]">{formatDate(row.tgl_pengajuan)}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3">
                    <Button variant="edit" size="sm" onClick={() => router.push(`/elis/${row.id}`)}>
                      Lihat <ChevronRight size={12} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test ELIS list page**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/elis
# Expected: 200 (with auth), 307 → /login (without auth)
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(protected\)/elis/page.tsx
git commit -m "feat: add ELIS list page with filters and role-based access"
```

---

## Task 10: Supabase ELIS Helper Functions

**Files:**
- Create: `src/lib/supabase/elis.ts`

- [ ] **Step 1: Create `src/lib/supabase/elis.ts`**

```typescript
import { createClient } from "./client"
import { ALLOWED_TRANSITIONS, ACTION_LABELS } from "@/lib/constants"
import type { ElisStatus } from "@/lib/constants"

export interface ElisSubmission {
  id: string
  nomor_pengajuan: string
  requester_id?: string
  requester_name: string
  judul_perkara: string
  jenis_perkara?: string
  tgl_pengajuan?: string
  status: string
  approver_id?: string
  no_perkara?: string
  pihak_dftr?: string
  pihak_thd?: string
  no_spdp?: string
  tgl_spdp?: string
  no_p21?: string
  tgl_p21?: string
  deskripsi?: string
  lampiran_1?: string
  lampiran_2?: string
  lampiran_3?: string
  catatan_revisi?: string
  created_at: string
  updated_at: string
}

export interface ElisAuditLog {
  id: string
  elis_id: string
  action: string
  actor_id?: string
  actor_name: string
  catatan?: string
  created_at: string
}

export interface ElisDetail extends ElisSubmission {
  audit_log: ElisAuditLog[]
}

// Validate transition is allowed
function validateTransition(role: string, currentStatus: string, newStatus: string): void {
  const allowed = ALLOWED_TRANSITIONS[role]
  if (!allowed) throw new Error(`Unknown role: ${role}`)

  const allowedFrom = allowed[currentStatus as ElisStatus]
  if (!allowedFrom || !allowedFrom.includes(newStatus as ElisStatus)) {
    throw new Error(`Transition dari "${currentStatus}" ke "${newStatus}" tidak diizinkan untuk role ${role}`)
  }
}

// Get role for a user
export async function getUserRole(userId: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from("profiles")
    .select("boss_role")
    .eq("id", userId)
    .single()
  return data?.boss_role ?? "viewer"
}

// Get filtered submissions
export async function getElisSubmissions(userId: string): Promise<ElisSubmission[]> {
  const supabase = createClient()
  const role = await getUserRole(userId)

  let query = supabase
    .from("elis_submissions")
    .select("*")
    .order("created_at", { ascending: false })

  if (role === 'requester') {
    query = query.eq("requester_id", userId)
  } else if (role === 'approver') {
    query = query.or(`approver_id.eq.${userId},status.eq.Menunggu persetujuan`)
  }

  const { data } = await query
  return data ?? []
}

// Get single submission with audit log and attachments info
export async function getElisById(id: string): Promise<ElisDetail | null> {
  const supabase = createClient()

  const { data: submission } = await supabase
    .from("elis_submissions")
    .select("*")
    .eq("id", id)
    .single()

  if (!submission) return null

  const { data: audit } = await supabase
    .from("elis_audit_log")
    .select("*")
    .eq("elis_id", id)
    .order("created_at", { ascending: true })

  return { ...submission, audit_log: audit ?? [] }
}

// Update status with validation and audit log
export async function updateElisStatus(
  id: string,
  newStatus: string,
  actorId: string,
  actorName: string,
  catatan?: string
): Promise<void> {
  const supabase = createClient()

  // Get current submission + actor role
  const { data: submission } = await supabase
    .from("elis_submissions")
    .select("id, status")
    .eq("id", id)
    .single()

  if (!submission) throw new Error("Pengajuan tidak ditemukan")

  const role = await getUserRole(actorId)

  // Validate transition
  validateTransition(role, submission.status, newStatus)

  // Get action label
  const actionLabel = ACTION_LABELS[newStatus] ?? newStatus

  // Update status
  const { error: updateError } = await supabase
    .from("elis_submissions")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (updateError) throw new Error(`Gagal update status: ${updateError.message}`)

  // Insert audit log
  const { error: auditError } = await supabase
    .from("elis_audit_log")
    .insert({
      elis_id: id,
      action: actionLabel,
      actor_id: actorId,
      actor_name: actorName,
      catatan: catatan ?? null,
    })

  if (auditError) throw new Error(`Gagal catat audit: ${auditError.message}`)
}

// Get dashboard counts
export async function getElisCounts(): Promise<{
  total: number
  menunggu: number
  selesaiBulanIni: number
  ditolak: number
}> {
  const supabase = createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const [{ count: total }, { count: menunggu }, { count: selesaiBulanIni }, { count: ditolak }] = await Promise.all([
    supabase.from("elis_submissions").select("*", { count: "exact", head: true }),
    supabase.from("elis_submissions").select("*", { count: "exact", head: true })
      .in("status", ["Menunggu validasi", "Menunggu persetujuan"]),
    supabase.from("elis_submissions").select("*", { count: "exact", head: true })
      .eq("status", "Selesai").gte("updated_at", startOfMonth),
    supabase.from("elis_submissions").select("*", { count: "exact", head: true })
      .eq("status", "Ditolak"),
  ])

  return {
    total: total ?? 0,
    menunggu: menunggu ?? 0,
    selesaiBulanIni: selesaiBulanIni ?? 0,
    ditolak: ditolak ?? 0,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase/elis.ts
git commit -m "feat: add ELIS CRUD helper functions with transition validation"
```

---

## Task 11: ELIS Detail Page with Action Buttons

**Files:**
- Create: `src/app/(protected)/elis/[id]/page.tsx`

- [ ] **Step 1: Create `src/app/(protected)/elis/[id]/page.tsx`**

```typescript
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { StatusBadge } from "@/components/boss/StatusBadge"
import { Modal } from "@/components/boss/Modal"
import { Button } from "@/components/boss/Button"
import { Toast } from "@/components/boss/Toast"
import { FileText, Download, User, Calendar, ArrowRight, XCircle, CheckCircle, RotateCcw, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ElisDetail, ElisAuditLog } from "@/lib/supabase/elis"
import { ACTION_LABELS } from "@/lib/constants"

function formatDate(dateStr: string): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatWIB(dateStr: string): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())} ${["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`
}

interface ActionButton {
  label: string
  variant: "primary" | "secondary" | "edit" | "danger"
  action: string
  icon: React.ReactNode
}

export default function ElisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("")
  const [data, setData] = useState<ElisDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<string>("")
  const [modalTitle, setModalTitle] = useState<string>("")
  const [catatan, setCatatan] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, boss_role")
        .eq("id", user.id)
        .single()

      if (profile) {
        setUserRole(profile.boss_role)
        setUserName(profile.full_name)
        setUserId(user.id)
      }

      const { data: elisData } = await supabase
        .from("elis_submissions")
        .select("*")
        .eq("id", id)
        .single()

      if (!elisData) { router.push("/elis"); return }

      const { data: audit } = await supabase
        .from("elis_audit_log")
        .select("*")
        .eq("elis_id", id)
        .order("created_at", { ascending: true })

      setData({ ...elisData, audit_log: audit ?? [] })
      setLoading(false)
    }
    load()
  }, [id, router])

  function openActionModal(action: string, title: string) {
    setModalAction(action)
    setModalTitle(title)
    setCatatan("")
    setModalOpen(true)
  }

  async function handleConfirm() {
    if (!data) return
    setSubmitting(true)

    const supabase = createClient()
    const actionLabel = ACTION_LABELS[modalAction] ?? modalAction

    // Update status
    const { error: updateError } = await supabase
      .from("elis_submissions")
      .update({ status: modalAction, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (updateError) {
      setToast({ message: `Gagal: ${updateError.message}`, type: "error" })
      setSubmitting(false)
      return
    }

    // Insert audit
    await supabase.from("elis_audit_log").insert({
      elis_id: id,
      action: actionLabel,
      actor_id: userId,
      actor_name: userName,
      catatan: catatan || null,
    })

    setModalOpen(false)
    setToast({ message: `Status berhasil diperbarui menjadi "${modalAction}"`, type: "success" })
    setSubmitting(false)

    // Refresh data
    const { data: refreshed } = await supabase.from("elis_submissions").select("*").eq("id", id).single()
    const { data: audit } = await supabase.from("elis_audit_log").select("*").eq("elis_id", id).order("created_at", { ascending: true })
    if (refreshed) setData({ ...refreshed, audit_log: audit ?? [] })
  }

  if (loading) return <div className="p-6 text-[--color-muted]">Memuat...</div>
  if (!data) return null

  const status = data.status
  const actions: ActionButton[] = []

  if (userRole === "admin_lit") {
    if (status === "Menunggu validasi") {
      actions.push(
        { label: "Perlu Revisi", variant: "secondary", action: "Revisi", icon: <RotateCcw size={14} /> },
        { label: "Tolak", variant: "danger", action: "Ditolak", icon: <XCircle size={14} /> },
        { label: "Teruskan ke Approver", variant: "primary", action: "Menunggu persetujuan", icon: <ArrowRight size={14} /> },
      )
    } else if (status === "Disetujui") {
      actions.push({ label: "Mulai Proses", variant: "primary", action: "Sedang diproses", icon: <Play size={14} /> })
    } else if (status === "Sedang diproses") {
      actions.push({ label: "Tandai Selesai", variant: "primary", action: "Selesai", icon: <CheckCircle size={14} /> })
    }
  }

  if (userRole === "approver" && status === "Menunggu persetujuan") {
    actions.push(
      { label: "Setujui", variant: "primary", action: "Disetujui", icon: <CheckCircle size={14} /> },
      { label: "Tolak", variant: "danger", action: "Ditolak", icon: <XCircle size={14} /> },
    )
  }

  const rejectedNote = status === "Ditolak" && (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-800">
      Pengajuan ini telah ditolak dan tidak dapat diajukan ulang.
    </div>
  )

  return (
    <div className="p-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[--color-muted] mb-4">
        <button onClick={() => router.push("/elis")} className="hover:text-[--color-text]">ELIS</button>
        <span>/</span>
        <span>{data.nomor_pengajuan}</span>
      </div>

      {/* Page title */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-heading)' }}>{data.judul_perkara}</h1>
          <p className="text-sm text-[--color-muted] mt-1">
            {data.nomor_pengajuan} &bull; Diajukan oleh {data.requester_name}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Info Pengajuan */}
      <section className="bg-white border border-[--color-border] rounded-md p-5 mb-4" style={{ borderRadius: 'var(--radius-card)' }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-heading)' }}>Info Pengajuan</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[
            ["Nomor Pengajuan", data.nomor_pengajuan],
            ["Jenis Perkara", data.jenis_perkara ?? "—"],
            ["Tanggal Pengajuan", formatDate(data.tgl_pengajuan ?? "")],
            ["Nomor Perkara", data.no_perkara ?? "—"],
            ["Pihak Daftar", data.pihak_dftr ?? "—"],
            ["Pihak Terhadap", data.pihak_thd ?? "—"],
            ["Nomor SPDP", data.no_spdp ?? "—"],
            ["Tanggal SPDP", formatDate(data.tgl_spdp ?? "")],
            ["Nomor P21", data.no_p21 ?? "—"],
            ["Tanggal P21", formatDate(data.tgl_p21 ?? "")],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <span className="text-xs text-[--color-muted] mb-0.5">{label}</span>
              <span className="text-[--color-text] font-medium">{value}</span>
            </div>
          ))}
        </div>
        {data.deskripsi && (
          <div className="mt-4 pt-4 border-t border-[--color-border]">
            <span className="text-xs text-[--color-muted] mb-1 block">Deskripsi</span>
            <p className="text-sm text-[--color-text]">{data.deskripsi}</p>
          </div>
        )}
        {data.catatan_revisi && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
            <span className="text-xs font-medium text-amber-800">Catatan Revisi:</span>
            <p className="text-amber-900 mt-1">{data.catatan_revisi}</p>
          </div>
        )}
      </section>

      {/* Lampiran */}
      <section className="bg-white border border-[--color-border] rounded-md p-5 mb-4" style={{ borderRadius: 'var(--radius-card)' }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-heading)' }}>Lampiran</h2>
        {["lampiran_1", "lampiran_2", "lampiran_3"].map((key, i) => (
          data[key as keyof typeof data] && (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-[--color-border] last:border-0">
              <FileText size={14} className="text-[--color-muted]" />
              <span className="text-sm text-[--color-text]">{data[key as keyof typeof data] as string}</span>
            </div>
          )
        ))}
        {!data.lampiran_1 && !data.lampiran_2 && !data.lampiran_3 && (
          <p className="text-sm text-[--color-muted]">Tidak ada lampiran</p>
        )}
      </section>

      {/* Riwayat Audit */}
      <section className="bg-white border border-[--color-border] rounded-md p-5 mb-4" style={{ borderRadius: 'var(--radius-card)' }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-heading)' }}>Riwayat</h2>
        {data.audit_log.length === 0 ? (
          <p className="text-sm text-[--color-muted]">Belum ada riwayat</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border]">
                {["Aksi", "Aktor", "Tanggal", "Catatan"].map(h => (
                  <th key={h} className="text-left py-2 font-medium text-[--color-muted]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.audit_log.map((log: ElisAuditLog) => (
                <tr key={log.id} className="border-b border-[--color-border] last:border-0">
                  <td className="py-2.5 font-medium text-[--color-text]">{log.action}</td>
                  <td className="py-2.5 text-[--color-text]">{log.actor_name}</td>
                  <td className="py-2.5 text-[--color-muted]">{formatWIB(log.created_at)}</td>
                  <td className="py-2.5 text-[--color-muted]">{log.catatan ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Action Buttons */}
      {actions.length > 0 && (
        <section className="flex flex-wrap gap-3 mb-4">
          {actions.map(action => (
            <Button
              key={action.action}
              variant={action.variant}
              onClick={() => openActionModal(action.action, action.label)}
            >
              {action.icon} {action.label}
            </Button>
          ))}
        </section>
      )}

      {rejectedNote}

      {/* Confirmation Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Memproses..." : "Konfirmasi"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[--color-text]">
            Yakin ingin mengubah status menjadi <strong>"{modalAction}"</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-[--color-text] mb-1">
              Catatan (opsional)
            </label>
            <textarea
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              rows={3}
              className="w-full border border-[--color-border] rounded px-3 py-2 text-sm text-[--color-text] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
              placeholder="Tambahkan catatan jika perlu..."
              style={{ borderRadius: 'var(--radius-button)' }}
            />
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
```

- [ ] **Step 2: Test detail page routes correctly**

```bash
# Get an ID from the ELIS list, then test
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/elis/[valid-id]
# Expected: 200 (with auth)
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(protected\)/elis/\[id\]/page.tsx
git commit -m "feat: add ELIS detail page with role-based action buttons and audit log"
```

---

## Task 12: Cleanup + Final Verification

- [ ] **Step 1: Stop dev server and do a clean build**

```bash
# Kill existing dev server
pkill -f "next dev" || true

# Run build
cd /c/Users/0471250923/boss-prototype-hub && npm run build 2>&1 | tail -30
# Expected: no errors, successful build
```

- [ ] **Step 2: Final verification checklist**

```bash
# Test all routes
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/        # → 307 /login
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login   # → 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard  # → 307 /login (without auth)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/elis     # → 307 /login (without auth)
```

- [ ] **Step 3: Commit final state**

```bash
git add -A && git commit -m "feat: complete BOSS Prototype Hub ELIS feature" --allow-empty
```

---

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] `/login` renders BOSS-styled login form
- [ ] Login with test user → redirects to `/dashboard`
- [ ] Unauthenticated visit to `/elis` → redirects to `/login`
- [ ] Dashboard StatCards show numbers (even if 0)
- [ ] ELIS list shows table with filter
- [ ] ELIS detail shows action buttons based on role
- [ ] Approve/Reject updates status and shows in audit log
- [ ] `git push` → Vercel auto-deploys

---

## Notes for Engineer

- All Supabase queries use `.select()` with explicit columns (not `*`) for clarity
- Status transitions MUST go through `updateElisStatus` in `src/lib/supabase/elis.ts` — never direct UPDATE without audit log insert
- Role check: always read from `profiles.boss_role`, not from JWT claims directly
- `formatDate` shows DD MMM YYYY (e.g., "01 Jan 2026"). `formatWIB` shows "DD MMM YYYY HH:MM WIB"
- All UI copy is in Bahasa Indonesia as per BOSS design system rules
- BOSS uses `'Segoe UI', system-ui, sans-serif` — no custom font imports needed
- Button border-radius: 4px. Card border-radius: 6px. Sidebar background: #1a2e5a
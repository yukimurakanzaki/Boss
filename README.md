# BOSS Prototype Hub

Prototype library for the **BOSS** (Business Operations Support Systems) internal web app.
Built with Next.js 16 + Tailwind CSS + Supabase.

**Company:** PT Bussan Auto Finance — IT Division

---

## Modules

| Code | Module | Status | Screens |
|------|--------|--------|---------|
| BS-7490 | E-Litigation System (ELIS) | Ready | 5 |
| BS-6486 | BPKB Courier Additional Payment | Planned | — |
| RFC26010002 | Reservasi BPKB via BAFCare | Planned | — |

---

## Local Development

```bash
# 1. Clone and install
git clone https://github.com/yukimurakanzaki/Boss.git
cd boss-prototype-hub
npm install

# 2. Set up env vars
cp .env.example .env.local
# Edit .env.local with your Supabase project values

# 3. Run Supabase SQL (see below)

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

Run this SQL in your Supabase SQL Editor to create the ELIS tables:

```sql
create table elis_submissions (
  id uuid primary key default gen_random_uuid(),
  nomor_pengajuan text unique not null,
  requester_id uuid,
  requester_name text,
  judul_perkara text,
  jenis_perkara text,
  tgl_pengajuan date,
  status text default 'Menunggu validasi',
  approver_id uuid,
  no_perkara text,
  pihak_dftr text,
  pihak_thd text,
  no_spdp text,
  tgl_spdp date,
  no_p21 text,
  tgl_p21 date,
  deskripsi text,
  lampiran_1 text,
  lampiran_2 text,
  lampiran_3 text,
  catatan_revisi text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table elis_audit_log (
  id uuid primary key default gen_random_uuid(),
  elis_id uuid references elis_submissions(id),
  action text not null,
  actor_id uuid,
  actor_name text not null,
  catatan text,
  created_at timestamptz default now()
);

-- RLS: open for prototype
alter table elis_submissions enable row level security;
alter table elis_audit_log enable row level security;
create policy "allow all for prototype" on elis_submissions for all using (true);
create policy "allow all for prototype" on elis_audit_log for all using (true);
```

---

## Vercel Deployment

1. Connect the GitHub repo to Vercel (import project)
2. Add environment variables in Vercel project settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_APP_URL
   ```
3. Every push to `main` auto-deploys to production
4. Pull requests get preview URLs automatically

No `vercel.json` needed — Next.js routing is handled natively by Vercel.

---

## Adding a New Module

1. Create `src/app/(protected)/your-module/page.tsx`
2. Add a nav item in `src/components/boss/Sidebar.tsx` → `navItems`
3. Add the module card in `app/page.tsx` → `MODULE_REGISTRY`
4. Create Supabase tables for the module's data
5. Update the module's status from `planned` → `ready` when screens are done

---

## Role Switcher

The sidebar has a **Role Preview** dropdown. Switching role:
- Changes which action buttons appear on detail pages
- Changes which records are visible in list pages (approver only sees post-validation records)
- Persists in localStorage across page navigations

Roles: `Admin Litigasi` | `Approver` | `Requester` | `Viewer`

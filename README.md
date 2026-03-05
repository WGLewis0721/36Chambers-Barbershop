# 36 Chambers Barbershop

A barbershop website with a static public landing page and a React-based online booking app.

**Live site:** [https://wglewis0721.github.io/36Chambers-Barbershop/](https://wglewis0721.github.io/36Chambers-Barbershop/)

---

## Project Overview

This repository contains two parts:

| Part | Technology | Description |
|---|---|---|
| **Landing page** | HTML · CSS · JavaScript | Public-facing static site (served via GitHub Pages) |
| **Booking app** | React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · Supabase | Customer booking flow and admin dashboard |

The GitHub Pages deploy workflow publishes the **static landing page** (`index.html`, `css/`, `js/`) automatically on every push to `main`. The React booking app lives in `src/` and requires a Supabase backend to run.

---

## Landing Page

The landing page (`index.html`) is a fully self-contained static site. No build step is required.

### Features
- Hero section with call-to-action
- Services menu with prices
- Barber team profiles
- About / story section
- Business hours & location
- Booking CTA (call / email)
- Responsive, mobile-first design
- WCAG 2.1 AA accessible

### Run locally

Open `index.html` directly in a browser, or use any static file server:

```bash
npx serve .
```

---

## Booking App

The booking app (`src/`) is a React + TypeScript single-page application backed by Supabase.

**Stack:** React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · React Router v7 · Supabase (Postgres + Auth + Edge Functions)

### Features

#### Customer Flow
1. **Select Service** — name, duration, price
2. **Select Barber** — specific barber or "Any barber"
3. **Pick Date & Time** — available slots only, respects business hours, barber hours, time-off, and existing bookings
4. **Enter Details** — name + email required, phone optional
5. **Confirm** — booking created in Supabase
6. **Confirmation page** — shows booking details and provides a cancel link via `manage_token`

#### Admin Dashboard
- Login via Supabase Auth (email magic link)
- View bookings by date with barber columns
- CRUD for services and barbers
- Edit business hours (per day of week)
- Manage time-off blocks per barber or shop-wide

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for Edge Functions)

### 1. Clone & install

```bash
git clone https://github.com/WGLewis0721/36Chambers-Barbershop.git
cd 36Chambers-Barbershop
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project details:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database setup

Run the migration in the Supabase SQL editor (or via CLI):

```bash
# Via Supabase CLI
supabase db push --db-url postgresql://postgres:<password>@<host>:5432/postgres < supabase/migrations/001_initial_schema.sql
```

Or paste the contents of `supabase/migrations/001_initial_schema.sql` into the Supabase SQL Editor.

The schema includes the following key tables: `barbers`, `services`, `business_hours`, `barber_hours`, `time_off`, `bookings`

### 4. Deploy Edge Functions

```bash
supabase functions deploy availability
supabase functions deploy bookings
supabase functions deploy bookings-cancel
```

Or deploy all at once:

```bash
supabase functions deploy
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173/36Chambers-Barbershop/](http://localhost:5173/36Chambers-Barbershop/)

### 6. Preview on a phone (or any device on the same Wi-Fi)

The dev server listens on all network interfaces (`host: true`), so any device on the same network can connect.

1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Look for the **Network** URL printed in the terminal, e.g.:
   ```
   ➜  Local:   http://localhost:5173/36Chambers-Barbershop/
   ➜  Network: http://192.168.1.42:5173/36Chambers-Barbershop/
   ```
3. Open the **Network** URL on your phone.

> **Note:** Your phone and development machine must be on the same Wi-Fi network. The same applies to `npm run preview`.

### 7. Build for production

```bash
npm run build
```

The output is placed in `dist/`.

---

## GitHub Pages Deployment

The **landing page** is automatically deployed to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`. No build step is needed — the workflow copies `index.html`, `css/`, and `js/` directly to the deploy artifact.

**Live URL:**  
👉 [https://wglewis0721.github.io/36Chambers-Barbershop/](https://wglewis0721.github.io/36Chambers-Barbershop/)

### One-time setup (already done; listed here for reference)

1. In **Settings → Pages**, set source to **GitHub Actions**.
2. Push to `main` — the workflow handles everything else.

---

## Project Structure

```
├── index.html                  # Static landing page
├── css/
│   └── styles.css              # Landing page styles
├── js/
│   └── main.js                 # Landing page scripts
├── src/                        # React booking app
│   ├── lib/
│   │   ├── supabaseClient.ts   # Supabase client init
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── api.ts              # Edge Function callers
│   ├── components/
│   │   ├── ServicePicker.tsx
│   │   ├── BarberPicker.tsx
│   │   ├── SlotPicker.tsx
│   │   ├── BookingForm.tsx
│   │   └── admin/
│   │       ├── BookingsBoard.tsx
│   │       ├── ServicesCrud.tsx
│   │       ├── BarbersCrud.tsx
│   │       ├── HoursEditor.tsx
│   │       └── TimeOffEditor.tsx
│   ├── pages/
│   │   ├── Book.tsx            # 5-step booking wizard
│   │   ├── Confirm.tsx         # Post-booking confirmation
│   │   ├── ManageBooking.tsx   # Cancel/manage via token
│   │   └── admin/
│   │       ├── Login.tsx       # Magic link login
│   │       └── Dashboard.tsx   # Admin dashboard
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── functions/
│   │   ├── availability/       # GET /availability
│   │   ├── bookings/           # POST /bookings
│   │   └── bookings-cancel/    # POST /bookings/cancel
│   └── migrations/
│       └── 001_initial_schema.sql
└── .github/
    └── workflows/
        └── deploy.yml          # Deploys landing page to GitHub Pages
```

---

## Security

- RLS enabled on all Supabase tables
- Public read: barbers, services, hours, time_off (active records only)
- No direct public read of bookings (access controlled via `manage_token`)
- Booking creation/cancellation via Edge Functions using the service role key
- Admin routes require an authenticated Supabase user

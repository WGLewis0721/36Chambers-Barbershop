# 36Chambers Barbershop Booking App

A customer-facing booking flow + admin dashboard for a barbershop with 3 barbers.

**Stack:** Vite + React + TypeScript + Tailwind CSS + Supabase (Postgres + Edge Functions)  
**Deployed to:** GitHub Pages (static frontend) + Supabase (backend)

---

## Local Development

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

The dev server is configured to listen on all network interfaces (`host: true`), so any device on the same Wi-Fi network can open the site.

1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Look for the **Network** URL printed in the terminal, e.g.:
   ```
   ➜  Local:   http://localhost:5173/36Chambers-Barbershop/
   ➜  Network: http://192.168.1.42:5173/36Chambers-Barbershop/
   ```
3. On your phone, open a browser and navigate to the **Network** URL.

> **Note:** Your phone must be connected to the **same Wi-Fi network** as your development machine. The IP address will differ each time your machine gets a new DHCP lease; just check the terminal output for the current address.

The same applies to `npm run preview` (used to test the production build locally).

---

## GitHub Pages Deployment

### 1. Add repository secrets

In your GitHub repository → Settings → Secrets and variables → Actions, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 2. Enable GitHub Pages

In Settings → Pages, set source to **GitHub Actions**.

### 3. Push to `main`

The workflow at `.github/workflows/deploy.yml` will build and deploy automatically on every push to `main`.

---

## Project Structure

```
├── src/
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
        └── deploy.yml
```

---

## Features

### Customer Flow
1. **Select Service** — name, duration, price
2. **Select Barber** — specific barber or "Any barber"
3. **Pick Date & Time** — available slots only, respects business hours, barber hours, time-off, existing bookings + buffer
4. **Enter Details** — name + email required, phone optional
5. **Confirm** — booking created in Supabase
6. **Confirmation page** — shows details, provides cancel link via `manage_token`

### Admin Dashboard
- Login via Supabase Auth (email magic link)
- View bookings by date with barber columns
- CRUD for services and barbers
- Edit business hours (per day of week)
- Manage time-off blocks per barber or shop-wide

---

## Data Model

See `supabase/migrations/001_initial_schema.sql` for the full schema.

Key tables: `barbers`, `services`, `business_hours`, `barber_hours`, `time_off`, `bookings`

---

## Security

- RLS enabled on all tables
- Public read: barbers/services/hours/time_off (active only)
- No direct public read of bookings (except via `manage_token` cookie claim)
- Booking creation/cancellation via Edge Functions using service role key
- Admin routes require authenticated Supabase user

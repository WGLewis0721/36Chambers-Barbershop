# Copilot Instructions for 36Chambers-Barbershop

## Project Overview

36Chambers-Barbershop is a full-stack web application for a barbershop business. It lets customers browse services and barbers, book appointments, manage bookings, and provides an admin dashboard for staff. The public landing page (`index.html`) is a static HTML/CSS/JS site deployed via GitHub Pages; the booking app is built with React + TypeScript + Vite.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Routing | React Router v7 |
| Backend / DB | Supabase (PostgreSQL + Auth + Edge Functions) |
| Deployment | GitHub Pages (static site via `deploy.yml`) |

## Repository Structure

```
.github/
  workflows/deploy.yml      # GitHub Pages deploy workflow
  copilot-instructions.md   # This file
.vscode/
  extensions.json           # Recommended VS Code extensions
  mcp.json                  # MCP server configuration for Copilot
  settings.json             # Workspace settings
index.html                  # Static public landing page
css/styles.css              # Landing page styles
js/main.js                  # Landing page scripts
src/
  main.tsx                  # React app entry point
  App.tsx                   # Root component with routing
  components/               # Shared UI components (BarberPicker, BookingForm, …)
  components/admin/         # Admin-only components
  pages/                    # Route-level page components
  pages/admin/              # Admin pages (Dashboard, Login)
  lib/
    api.ts                  # Supabase API helpers
    supabaseClient.ts       # Supabase JS client initialisation
    types.ts                # Shared TypeScript types
supabase/
  functions/                # Deno-based Edge Functions
    availability/           # GET  – available time slots
    bookings/               # POST – create a booking
    bookings-cancel/        # POST – cancel a booking
  migrations/               # SQL migration files
```

## Coding Standards

- **TypeScript**: use strict typing; prefer `interface` for object shapes and `type` for unions/aliases
- **React**: functional components with hooks only; no class components
- **Tailwind**: use utility classes directly in JSX; avoid custom CSS unless absolutely necessary
- **Naming**: PascalCase for components/types, camelCase for variables/functions, UPPER_SNAKE_CASE for constants
- **Accessibility**: maintain WCAG 2.1 AA compliance; add ARIA labels to interactive elements
- **Responsive design**: mobile-first; test across mobile, tablet, and desktop viewports
- **Static HTML page**: use semantic HTML5 and CSS custom properties for the landing page

## Guidelines for Copilot

- Always match the existing patterns in `src/lib/api.ts` when adding new Supabase calls
- Do not introduce new npm dependencies without an explicit request; use existing libraries first
- Keep Supabase Edge Function logic in `supabase/functions/`; do not inline backend logic in the frontend
- Never hardcode Supabase URLs or API keys; use environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Follow the existing file structure: one component per file, co-located in `src/components/` or `src/pages/`
- Write clean, commented code where the logic is non-obvious
- Do not commit any API keys, secrets, or sensitive customer data
- When adding new pages, register the route in `src/App.tsx` and follow the existing `<Route>` pattern

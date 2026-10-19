# Webloom — Website Builder · Product Plan

> **Working name: Webloom** — “web” + “bloom”. Rebrand centrally in `src/lib/brand.ts`.

## Product goal

Build a professional, beginner-friendly no-code website builder that helps people with no web-development background design, save, and publish a real website. The product should explain unfamiliar steps in plain language rather than assuming users know hosting, deployment, themes, or code.

## Current scope and user decisions

- **Editor:** Next.js App Router, React, TypeScript, full block set, drag-and-drop canvas, reusable pages, responsive preview, undo/redo.
- **Templates:** 12 polished starter sites across business, portfolio, restaurant, SaaS, blog, personal, events, wellness, pets, architecture/interiors, retail, and education.
- **Saving:** Guest projects save in the current browser; staff-provisioned password accounts can save small projects to the owner's Supabase cloud workspace. Guests may explicitly copy local drafts into their account; local JSON backup remains available. Postgres hard-enforces 1 MiB per website, 5 MiB and 25 websites per account, and a 160 MiB shared Webloom project-data pool.
- **Admin:** Authorized Webloom staff can provision customers, issue temporary passwords with forced first-login changes, inspect profile metadata and aggregate project/storage stats, pause/restore cloud project access, reset customer passwords, and review audit history. Customer project JSON is not shown in the dashboard.
- **Beginner guidance:** Public step-by-step `/guide`, in-builder tour, and a publishing wizard.
- **Publishing:** Regular static website ZIP for general hosting, plus a separate Shopify Online Store 2.0 theme ZIP with Liquid/JSON templates and Shopify product, collection, cart, search, and checkout handoff flows.
- **External services:** Cloudflare Workers is the hosting/runtime target via vinext (beta); Cloudflare is not used for customer data services. Supabase supplies Auth/Postgres and the account Edge Function; public self-sign-ups stay disabled and staff grant access. SMTP is not used by the current password-based flow. A Shopify development store is needed only for a live theme-upload test; none are bundled or presumed live.

## Architecture

### One JSON-first project model

Each project contains pages, theme settings, SEO details, and a typed tree of content blocks. The visual editor, live preview, browser autosave, cloud persistence, JSON backup, static-site exporter, and Shopify theme exporter all operate on this project model.

### Editor and local persistence

- dnd-kit for accessible drag-and-drop; Zustand for editor state and undo/redo.
- IndexedDB with a localStorage fallback for guest/offline recovery.
- The ownership map stored in the browser is only a display hint. Supabase RLS is the authoritative tenant boundary.
- Signed-in project reads/writes use the authenticated user's Supabase client; a service-role/secret key is never sent to a browser.

### Supabase accounts and customer administration

- Password sign-in through Supabase Auth and `@supabase/ssr` cookie-based clients. Public sign-ups are disabled; staff use the authenticated `webloom-admin-users` Edge Function to provision/reset customer accounts and force first-login password changes.
- `src/proxy.ts` refreshes sessions for Next.js server-rendered routes and redirects temporary-password users to setup; account/admin authorization remains in route logic and Postgres RLS.
- The SQL migration in `supabase/migrations/` creates profiles, owner-scoped projects, quota triggers/counters, a private administrator allowlist, secure reporting/access functions, audit logging, grants, and RLS policies.
- `supabase/README.md` documents the no-self-signup posture, migration and Edge Function deployment, first-admin bootstrap, cloud limits, privacy, and access-isolation checks.

### Cloudflare hosting

The Next.js App Router runs on Cloudflare Workers through vinext and the Cloudflare Vite plugin. Static site assets are served by the Worker; Auth, profiles, website projects, quota accounting, and customer administration stay in Supabase. The generated config intentionally has no D1, R2, KV, Durable Objects, image-storage, or Cloudflare cache/data bindings. `npm run build:vinext` and `npm run start:vinext` validate the Worker build locally; deployment still requires Cloudflare authentication, public Supabase build variables, and an admin bootstrap.

### Shopify theme export

The Shopify exporter writes the native theme directory structure: `layout/theme.liquid`, JSON templates, section groups, Liquid sections/snippets, assets, config, locales, and a setup README. Shopify store/product/cart behavior is provided by Liquid forms and Shopify routes—not by pretending a static HTML site is a commerce backend. Export performs local preflight checks; users should run Shopify Theme Check and preview the theme in their own development store before publishing.

### Routes

| Route | Purpose |
|---|---|
| `/` | Product landing page and starter showcase |
| `/projects` | Project dashboard, local/cloud status, backups and explicit guest sync |
| `/templates` | Template gallery and instant starts |
| `/builder` | Drag-and-drop editor and exports |
| `/guide` | Beginner walkthrough for editing and publishing |
| `/sign-in` | Password sign-in for staff-provisioned accounts |
| `/account` | Profile, password changes, cloud usage and sync controls |
| `/account/first-login` | Required password setup for newly provisioned/reset accounts |
| `/admin` | Staff-only customer provisioning, storage metrics, access controls and audit log |
| `/auth/callback` | Supabase PKCE callback (available for future redirect-based flows) |

## Definition of done

- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run build:vinext` pass; Deno checks cover the account-management Edge Function.
- The starter gallery and main product routes return successfully in both the Node and local Worker previews; a live Cloudflare deployment remains pending account authentication and production environment setup.
- Shopify-generated themes from all starter templates pass official Theme Check; an actual Shopify store upload remains an external integration test.
- Supabase production account operations require the reviewed migration, public-signup disablement, deployed Edge Function, trusted first-admin bootstrap, and cross-account/first-login/quota isolation tests. No SMTP sender is needed for the current manual password flow.

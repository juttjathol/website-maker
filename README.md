# Webloom

Webloom is a beginner-friendly visual website builder. Pick a polished starter design, drag in editable sections, preview computer/tablet/phone layouts, then export a site for regular hosting or a native Shopify theme for an online store.

## What you can do

- Build by dragging and dropping page sections and content blocks; edit words, images, links, colors, spacing and layout.
- Start with 12 professional templates covering business, portfolio, food, startups, blogs, weddings/events, wellness, pets, interiors, skincare and learning.
- Add pages, manage layers, undo/redo, tune responsive visibility, and add page-level SEO details.
- Follow the in-product `/guide` walkthrough or open the guided help in the builder.
- Build as a guest with projects saved in the current browser, or use a staff-provisioned account to sync small projects to Supabase.
- Download a portable JSON backup of a project.
- Export a static website ZIP for hosting, or a Shopify Online Store 2.0 ZIP with Liquid layout, JSON templates, Shopify product and collection views, cart, search, and standard Shopify checkout handoff.
- Use `/admin` for authorized customer-account operations. The dashboard is allowlisted through a private Supabase table and RLS-backed admin functions.

Guest work remains in the browser where it was created. Public account registration is disabled; a Webloom administrator grants customer access. Signing in does not silently move guest projects: use **Sync guest drafts** to copy them to your account. Cloud sync has hard limits (1 MiB per project, 5 MiB and 25 projects per account, and a 160 MiB shared project-data pool); quota-limited work remains local. Export JSON backups for important projects.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ (Vite 8 requirement for Cloudflare Worker builds).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To verify a production build:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

## Optional Supabase accounts and cloud projects

Webloom works in guest mode without a cloud account. Supabase is used for Auth, Postgres, account metadata, and owner-isolated cloud project sync. Public self-registration remains disabled; staff provision customer accounts through `/admin`.

Follow [`supabase/README.md`](supabase/README.md) to review/apply the migration, configure deployment environment values, disable public sign-ups, deploy the authenticated `webloom-admin-users` Edge Function, and bootstrap the first trusted admin. No production Supabase credentials, email sender, or customer database are bundled with this repository.

The Supabase Free tier's 50,000 MAU allowance is not a promise that 50,000 customers can store complete websites or use the app simultaneously. Webloom's project-document pool is capped at 160 MiB across all accounts, with limits of 5 MiB and 25 projects per account and 1 MiB per project. These limits do not account for the Supabase project's full database overhead, egress, or concurrent load. Quota-rejected edits remain local; keep export backups and check current Supabase usage.

Only the Supabase publishable key belongs in browser-facing configuration. Never expose a service-role/secret key. RLS is the security boundary for profile, project and audit data; do not remove or weaken those policies.

## Deploy Webloom on Cloudflare Workers

Webloom is a dynamic Next.js App Router site, so deploy it as a **Cloudflare Worker**, not a static Pages export. The Cloudflare adapter uses [`vinext`](https://github.com/cloudflare/vinext), which is currently beta; test on a preview Worker before production. The generated configuration uses Cloudflare only to run/host the site. It intentionally disables Cloudflare CDN/data caching and image services; do not add D1, R2, KV, Durable Objects, or other Cloudflare data products.

1. Create your first Supabase administrator as described in [`supabase/README.md`](supabase/README.md), and set the local public Supabase values in an ignored `.env.local` file (copy `.env.example`). `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are public browser values; **never** use a service-role key here.
2. The Cloudflare/Vinext setup is already present in `vite.config.ts` and `cloudflare.config.ts` (there is no separate Wrangler config). Keep the built-in `ASSETS` binding for static site files, with no Cloudflare data-service or cache bindings. Avoid rerunning `vinext init` over this setup unless you intend to regenerate and review these files. Do not enable prerendering: `/admin`, `/account/first-login`, and Supabase-authenticated pages need server rendering.
3. Validate the generated build and preview locally:

   ```bash
   npm run typecheck
   npm run lint
   npx vinext check
   npm run build:vinext
   ```

   Run `npm run dev:vinext` in one terminal to test changes at `http://localhost:3001`. After the production build, use `npm run start:vinext` in a separate terminal to preview the built Worker locally. Both server commands keep running until stopped.

4. Authenticate the Cloudflare CLI and deploy:

   ```bash
   npx cf auth login
   npx cf auth whoami
   npm run deploy:vinext
   ```

   If you later configure a Git-backed Cloudflare build, add the two `NEXT_PUBLIC_*` values to its build environment. For local CLI deployment, set them in `.env.local` before building/deploying. These values are intentionally public; never add a Supabase secret/service-role key to Cloudflare.
5. Test the generated `workers.dev` URL, then optionally add a custom domain in **Workers & Pages → your Worker → Settings → Domains & Routes**. Update Supabase **Authentication → URL Configuration → Site URL** from `http://localhost:3000` to that deployed origin.
6. Sign in as the first admin, create a test customer, verify the forced first-password change, and test that two customer accounts cannot access each other's cloud projects. Confirm quota-limited edits remain local.

Cloudflare Free quotas still apply, and the beta Worker adapter can change; review current Cloudflare pricing/limits and keep a rollback path. Cloudflare hosting does not expand Supabase's 160 MiB shared Webloom project-data pool or guarantee 50,000 simultaneous customers.

## Export and publish a regular website

1. Open the project and choose **Download** for a standalone website ZIP, or open **Go live** for the beginner walkthrough.
2. Extract the ZIP on your computer.
3. Upload the extracted folder containing `index.html` to a static host such as Netlify Drop, Cloudflare Pages, GitHub Pages or Vercel.

The generated ZIP contains a `README.txt` with host-specific beginner steps. Contact and newsletter blocks use the email address set in Webloom and open the visitor's email app; they are not server-side submission endpoints. Uploaded data-URI images are included in the package. External image URLs remain external.

## Export a Shopify theme

1. Open a project and choose **Shopify** (or open **Go live** and choose **Download Shopify theme ZIP**).
2. Upload the ZIP—without extracting it first—in Shopify Admin → **Online Store → Themes → Add theme → Upload zip file**.
3. Preview the unpublished theme in Shopify's theme editor. Add products and collections, create Shopify pages for any extra Webloom pages, and assign the matching `page.webloom-*` template.
4. Configure payment providers, shipping, tax, policies, and checkout in Shopify Admin. The theme does not create a Shopify store or configure those services.

The theme includes OS 2.0 JSON templates and sections for home, product, collection, cart, search, blog, article, page, collection list, and 404 routes. Shopify checkout is handled by Shopify after the customer uses the theme's cart/checkout flow. Extra pages and setup notes are included in the theme ZIP's `README.txt`. Webloom's custom contact/newsletter forms remain email-app based, not Shopify customer records.

Shopify's own validator and a real store preview remain the final checks. The generated themes for all 12 starter templates passed Shopify's official Theme Check CLI with no offenses; the exporter also preflights required files, JSON, section references, and package size. This repository has not been uploaded to a live Shopify development store, so preview the theme in your own store before publishing. To lint an extracted ZIP yourself, install Shopify CLI and run `shopify theme check --path ./path-to-extracted-theme`.

## Admin dashboard and customer privacy

The `/admin` route requires an account inserted into `public.platform_admins`; it is not unlocked by a UI flag. Authorized staff can provision customer accounts, issue forced-change temporary passwords, pause/restore cloud access, and review aggregate project/storage stats and audit events. The dashboard does not show website content. Pausing a customer blocks cloud project access through database policies; it does not delete projects or disable that customer's Supabase login. Staff actions are written to the audit log.

## Tech stack

Next.js App Router, React, TypeScript, Zustand, dnd-kit, JSZip, Supabase Auth/SSR and Postgres Row Level Security, with Cloudflare Workers hosting via vinext. The site renderer is shared by the editor preview, static exporter and Shopify theme exporter.

### Pro 3D scenes (Phase 3, first release)

In **Builder → Add → Content → 3D scene · Pro**, Pro owners can add a scene
with cubes, diamond cubes (rotated cubes), and thin rectangular panels.
Select the scene to open its **Content** settings:

- Add, duplicate or delete up to 12 objects per scene.
- Drag an object on the canvas to position it; the matching object is selected
  in the inspector. Keyboard: focus an object, use arrow keys to nudge 1%, or
  Shift + arrow keys for 5% steps.
- Change color, size, X/Y/Z rotation, depth, stage height and camera perspective.
- Preview/export optionally animates the shapes. Reduced-motion preferences
  disable animation. One drag is one undo step.

These are CSS 3D solids made from six planes, not a full modelling engine.
There are no GLB/GLTF uploads, physics, textures, or paid external rendering
services. Scene data stays in the existing compact project JSON. Static and
Shopify exports use the same geometry and CSS without a remote 3D runtime.
Already-downloaded exports are standalone files; future subscription changes
cannot revoke those files.

Free owners see an upgrade link instead of active 3D tools. After a downgrade,
saved scenes are preserved but locked; remove them to export on Free, or
request Pro from **Account**. Export entry points recheck the current plan.
Migration `20261021120000_pro_3d_scenes.sql` also prevents Free accounts from
adding or changing 3D scenes through direct database writes, including nested
scenes. It permits removing saved scenes and editing other blocks.

Verification: `npm test`, `npm run typecheck`, `npm run lint`, and
`npm run build:vinext`. Browser smoke tests also exercised dragging, keyboard
movement, undo, preview, ZIP export, mobile width, reduced motion and downgrade
locks using mocked account responses (not a real customer session).

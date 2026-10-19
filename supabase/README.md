# Supabase accounts, cloud projects, and admin operations

Supabase is Webloom's only account/database backend. Guest projects are stored in the browser (IndexedDB with a localStorage fallback). Signed-in projects are mirrored locally and synchronized to owner-scoped Postgres rows. No Supabase Storage bucket or Cloudflare data service is used. Public registration is disabled in the connected project; Webloom staff create and reset customer accounts from `/admin`. The connected project has the database migration applied and the JWT-verified admin Edge Function deployed. No first Webloom admin has been bootstrapped yet.

> **Capacity note:** Supabase Free's published 50,000 monthly active users (MAU) is an authentication-plan allowance, not a guarantee that 50,000 registered customers can store full websites, nor a simultaneous-user/concurrency target. This app reserves at most 160 MiB of project-document payloads for all Webloom customers, with a hard 5 MiB per-account limit, 25 cloud websites per account, and 1 MiB per website. Some edits will remain local-only when a quota is reached. These app limits are not a promise that the overall Supabase project will always fit within Free-tier database, egress, or compute limits. Keep export backups; review current Supabase pricing and usage before inviting customers.

## 1. Review and apply the database migration

1. Inspect [`migrations/20261019120313_platform_accounts.sql`](migrations/20261019120313_platform_accounts.sql) and confirm the target Supabase project has no conflicting tables or policies. The migration creates profiles, customer projects, account/admin metadata, quota counters, RLS policies, quota triggers, and security-definer reporting/access functions.
2. For a new Supabase project, open Dashboard → **SQL Editor**, select that project, and apply the migration once. It is not automatically applied by the application. The connected project for this workspace already applied it as migration `20261019120313` (`webloom_platform_accounts`).
3. Confirm RLS is enabled on `profiles`, `projects`, `platform_admins`, `audit_logs`, `webloom_cloud_storage_quota`, and `webloom_user_storage_usage`.
4. Set only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project's API settings in the deployment environment. For local development, copy `.env.example` to `.env.local`. Rebuild/restart after changing public environment values.

The publishable key is safe for browser configuration because RLS protects data access. **Never** put a Supabase secret/service-role key in a `NEXT_PUBLIC_*` variable, source file, client bundle, or customer-facing log. Service-role credentials bypass RLS and must only be used by Supabase-managed server/Edge Function runtime.

## 2. Disable public registration and set the Site URL

1. In Supabase Dashboard → **Authentication → Settings / Sign In / Providers**, ensure **Allow new users to sign up** is off (the underlying `disable_signup` setting must be true). This is already set in the connected project; recheck it after restores or settings changes.
2. Set the Auth **Site URL** to the real Webloom deployment origin. The connected project still uses `http://localhost:3000` because production hosting/domain has not been configured. Add exact redirect URLs only if your deployment uses Auth redirects. The Webloom password sign-in and Edge Function do not use magic-link callbacks.
3. No SMTP sender is needed for the current manual password-provisioning flow. Supabase email/password authentication does not email credentials; administrators must share temporary passwords using a private channel. Do not send temporary passwords in support tickets, public chat, or analytics logs.

Do not enable public self-registration unless product policy changes and signup-abuse controls are designed and reviewed.

## 3. Deploy the trusted account-management function

The dashboard calls [`functions/webloom-admin-users/index.ts`](functions/webloom-admin-users/index.ts) to create verified customer accounts, issue one-time reset passwords, and complete a forced first-login password change. It uses the Edge Function runtime's built-in Supabase environment secrets and verifies the caller's live Auth user plus `platform_admins` membership. It does not send or log temporary passwords.

For another project, deploy with the Supabase CLI after authenticating and linking the intended project. The connected workspace project already has `webloom-admin-users` deployed with JWT verification enabled:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy webloom-admin-users
```

[`config.toml`](config.toml) enables JWT verification for this function. Never copy a service-role key into the web app or function source. Check the Edge Function logs for errors, but do not add password values to logs.

## 4. Bootstrap the first administrator

1. In Supabase Dashboard → **Authentication → Users**, add your own user with a unique email, strong password, and confirmed email. This is an owner/admin setup step, not public registration.
2. Edit the example email in [`bootstrap-admin.sql`](bootstrap-admin.sql) to exactly match your account, and run that SQL once in the same project's SQL Editor.
3. Sign in to Webloom at `/sign-in`, then visit `/admin`. The dashboard checks the private `platform_admins` table and does not display project JSON.
4. From **Grant customer access**, enter a customer name and email. Copy the one-time password shown in the dashboard, share it privately, and ask the customer to choose a new password at first sign-in. The dashboard can issue a new one-time password later. Treat temporary passwords like credentials; they are displayed only in the current page session and never emailed.

Only bootstrap trusted staff into `platform_admins`; never grant customers staff roles. Add/remove administrators through a trusted Supabase SQL session after confirming the intended user ID.

## Cloud-storage behavior

- Guest work stays in the current browser. Signing in does not silently convert guest projects; the user chooses **Sync guest drafts**.
- Account projects are owner-isolated by RLS. Dashboard staff see profile metadata, project counts, shared storage totals, and audit events—not project content.
- Postgres enforces a shared 160 MiB Webloom project-data pool, 5 MiB per account, 25 projects per account, and 1 MiB per project. Supabase's database has additional system overhead; the Webloom pool is not the total Supabase database quota.
- Images selected for upload are raster-only, limited to 10 MiB before compression, and compressed to WebP at 200 KiB or less. Remote image URLs remain external; SVG/animated GIF uploads are rejected. Project/quota limitations must not erase the local copy.
- Pausing a customer blocks cloud project reads/writes through RLS; it does not delete their local/cloud projects or disable their Supabase login. Restore access from `/admin` when appropriate.
- Keep export backups. Free-tier capacity and activity-pause rules can change; monitor current project usage and test restore procedures. MAU does not describe simultaneous load—test the expected concurrent workload separately.

## Security and verification checklist

- Test with two ordinary accounts: each can read/write only its own cloud projects and cannot query another profile or audit event.
- Confirm an ordinary account cannot call admin RPCs/Edge Function actions successfully, edit another profile, change project ownership, or access `/admin`.
- Confirm new customer accounts are blocked from project saves until they choose their own first password; then verify access and RLS.
- Confirm password-reset users are forced to set a password before opening the builder/account/admin tools. Verify admins cannot reset another admin or pause their own account.
- Confirm a paused account cannot read or mutate cloud projects and that another signed-in user cannot access them.
- Exercise project, account, and shared quotas. Verify a rejected cloud save still persists locally and that deleting a cloud project releases its quota.
- Monitor Auth, database size, egress, function logs, and simultaneous traffic before inviting a larger customer cohort. Back up customer data and restrict Dashboard/service-role access; trusted operators bypass RLS.

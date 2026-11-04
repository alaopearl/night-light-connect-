# Night Light Connect Backend

This folder contains the admin backend layer for the React site.

## Hosted services

Supabase provides:

- PostgreSQL property data and lead/inspection records
- Storage for property photos
- Auth for admin access
- Realtime subscriptions for updates across devices

The browser admin service is in `adminBackend.ts`. It handles signed-in admin photo uploads, property create/update/delete, photo cleanup, and Realtime property subscriptions. Supabase RLS and storage policies remain the security boundary.

## Live setup

1. Open the Supabase project SQL Editor.
2. Run `../supabase/schema.sql`.
3. Run `../supabase/storage-policy.sql`.
4. In Supabase Auth, assign the signed-in admin user:
   - `app_metadata.role = "admin"`, or
   - `app_metadata.role = "super_admin"`
5. Sign out and sign back in to refresh the JWT.

The storage bucket must be named exactly `night-light-img` and the `.env` value must match it:

```env
VITE_SUPABASE_BUCKET=night-light-img
```

## Realtime behavior

The app subscribes to the `properties`, `site_data`, `site_leads`, and `site_inspections` tables. Admin changes are written to Supabase and other open devices refresh automatically through the Supabase Realtime publication.

Realtime will only update the UI when:

- the relevant table is included in the `supabase_realtime` publication
- the browser has a valid public or authenticated session
- the live RLS policies permit the read operation

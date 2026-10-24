# Supabase setup for Najahna accounts

Najahna's account interface is intentionally disabled until a real Supabase project is configured. Do not paste secret keys into the repository, chat, browser code, or GitHub Pages settings.

## 1. Create the project

1. Create a Supabase project in the Supabase dashboard and keep its database password private.
2. In **Project Settings → API** (or the project's Connect panel), copy the project URL and the public publishable/anon key.
3. Edit `src/config/supabase.js` on `main` and set only `url` and `anonKey` to those public values. Never use a `service_role` key here.
4. Keep the URL in the expected `https://<project-ref>.supabase.co` format.

The public key is designed for browser use; database security must come from Row Level Security and policies, not from hiding that key.

## 2. Configure authentication

In **Authentication → URL Configuration**:

- Set the site URL to `https://hhkskkkdjwbf.github.io/Najahna-/`.
- Add that URL to the allowed redirect URLs.
- Keep email confirmation enabled and configure the SMTP/email provider before relying on production sign-up and password recovery.
- Test sign-up, confirmation, sign-in, sign-out, password recovery and password update using a separate test account.

If the repository is renamed or hosted under another domain, update the site URL, allowed redirects, canonical URL, sitemap and robots.txt together.

## 3. Create the learner data table

Run the SQL in `supabase/migrations/202610240001_secure_learner_accounts.sql` in the Supabase SQL Editor, or apply it with the Supabase CLI. Confirm that Row Level Security is enabled and test with two different user accounts that neither account can read or write the other's row.

The client currently limits a cloud backup to 5 MiB of serialized data and 20,000 entries. Cloud restores validate the complete payload before replacing local study data.

## 4. Configure account deletion

Deploy `supabase/functions/delete-account/index.ts` as the `delete-account` Edge Function. Set these values as **server-side Edge Function secrets** in Supabase:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key must remain exclusively in the Edge Function's server-side secrets. Never commit it, put it in `src/config/supabase.js`, or send it to the browser. Verify that the function checks the caller's authenticated identity before deleting the account.

## 5. Release checklist

- [ ] Configure the public project URL and public key.
- [ ] Apply the SQL migration and verify RLS using two test accounts.
- [ ] Configure email confirmation and recovery redirects.
- [ ] Deploy and test the account-deletion Edge Function.
- [ ] Test oversized/corrupt cloud backups and confirm existing local data remains unchanged.
- [ ] Test on the deployed GitHub Pages site in a clean browser profile.
- [ ] Publish a privacy policy and explain what account data is stored and how deletion works.

Until these steps have been completed and tested on the deployed site, do not advertise cloud accounts, cross-device sync, or account deletion as production-ready.

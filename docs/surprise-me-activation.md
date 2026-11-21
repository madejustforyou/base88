# Base88 Surprise Me — preview activation and release gate

**Status:** code committed on a draft PR. This is not the production launch and not a real autonomous business operator.

## What is already available without credentials
- Curated zero-upfront Surprise Me concepts
- Generated business strategy and validation-first launch brief
- Script-free single-file HTML starter website with an iframe sandboxed preview
- Editable digital product templates
- Downloads generated wholly inside the browser; no customer data transmitted
- Automated GitHub tests and a Vercel preview build

## Staging database activation (controlled operator task)
1. Identify the intended **staging** Supabase project and make a backed-up schema snapshot.
2. Apply `supabase/migrations/20261122_base88_business_drafts.sql`.
3. Apply `supabase/migrations/20261122_base88_business_inbox.sql`.
4. Verify RLS is enabled and FORCE RLS for both tables, and that `anon` has no direct table privileges.
5. Configure the expected `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the PREVIEW environment. **Do not expose the service-role key.**
6. Create two distinct test users in that staging project. Do not paste their tokens into a chat, README or PR.
7. Run the opt-in two-account RLS probe **only on disposable staging**:

   ```bash
   BASE88_TEST_DB_IS_EPHEMERAL=yes \
     TEST_SUPABASE_URL=<staging-url> \
     TEST_SUPABASE_ANON_KEY=<staging-anon-key> \
     TEST_USER_A_JWT=<test-user-A-token> \
     TEST_USER_B_JWT=<test-user-B-token> \
     node tests/rls-staging-only.mjs
   ```

   Use an authorized CI secrets mechanism, not shell history, for real JWTs.
8. Test save, reload and reopen of a draft in browser; confirm another user cannot access it.
9. Open an owner test inbox, create a simulated inquiry, edit an unsent reply and resolve the inquiry.
10. Verify no outgoing email, SMS, WhatsApp, payment, domain purchase or deployment occurs.

If any test fails, **do not enable production access**.

## Public site versus autonomous backend
The hosted Vercel site currently generates and saves launch **drafts**. The separate private Python Base88 v1.2 backend contains local worker, mission and inbox functionality but is not connected to this app. The independent rootless-Docker coding runner, real provider integrations and public deployment of the Python backend remain separate explicit work.

Do not put private backend secrets, model endpoints, container sockets, credentials or customer data in this public source repository. Do not merge the PR or run SQL migrations in production without an authorized reviewed deployment.

## Test coverage and unknowns
- CI: generator content/injection tests, built Next.js compilation and anonymous HTTP denial smoke tests.
- Staging-only: cross-tenant RLS tests require two real test-user JWTs and migration application.
- Pending: authenticated end-to-end UI test, signed customer-email ingress, real payment test mode, live coding sandbox, performance benchmark, and production readiness audit.

## Database and API threat boundaries
- Next API routes verify the user's bearer token with Supabase Auth and use the **anon key**, retaining PostgreSQL RLS enforcement.
- Unauthenticated visitors cannot query business drafts or inbox records.
- Each inbox record is tied to an owned business; the RLS insert/update policies require that business to belong to the same user.
- Owner test messages never trigger an external communication.
- All external publication, commerce and messaging actions require separately authorized workflows and provider verification.

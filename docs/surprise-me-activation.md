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


## Independent engine connection (v1.3 bridge)
- The new Next.js route `POST /api/business-drafts/:id/engine` verifies the Supabase user's JWT **and** re-reads the owner-owned business draft under RLS before forwarding it.
- Backend `POST /api/federation/v1/workspaces` verifies the JWT signature against the fixed Supabase project's asymmetric signing keys, checks issuer, authenticated audience/role and expiry, then creates an issuer+subject-bound internal identity.
- No email-based identity linking. Re-importing the same saved draft is idempotent; a second account can never receive another account's internal workspace.
- Deploy the independent **Base88 v1.3** backend to a separately managed HTTPS origin with a migrated PostgreSQL database. Set `BASE88_SUPABASE_JWT_ISSUER` to that precise Supabase project's issuer URL, e.g. `https://<project>.supabase.co/auth/v1`, only after verifying its asymmetric signing-key support.
- Set the Vercel **preview-only** server environment `BASE88_ENGINE_URL=https://<isolated-engine-host>/` after the isolated backend passes its authentication and health checks. Do not commit endpoints, private signing keys or backend credentials to the repository.
- The frontend route refuses to run when the engine origin is not configured and never sends a user token to an owner-specified URL. An HTTPS redirect is not followed.
- A successful import creates a **private planning workspace only**. It does not schedule jobs, publish websites, send customer messages, or trigger payments.
- Test with two different staging users, invalid/wrong-project/expired JWTs, and one draft imported twice. Verify provider/API request failures do not leak the token or infrastructure details.
- This is a **code-complete bridge**, not evidence of an active backend deployment. The missing Supabase staging connection and separate worker host must be configured before live verification.


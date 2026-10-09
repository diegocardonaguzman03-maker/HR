# Security and privacy (Phase 1)

Reviewed by RISK-01 (PRX-0010). This is not legal advice: data-protection items **require review by a lawyer in the applicable jurisdiction**.

## Controls in place
- **Founder authentication:** HMAC-SHA256-signed session (12 h), `httpOnly` cookie, `SameSite=Lax`, `Secure` in production. Credentials come from environment variables. Example and weak values are rejected (password ≥ 12 characters, secret ≥ 32).
- **No open mode by default:** without credentials the app does not serve data. No-login mode only applies with `PRAXIA_DEV_OPEN=1`, outside production, and `npm run dev` binds to 127.0.0.1.
- **Defense in depth:** middleware, plus `requireFounder()` in every server action and in `getContext()` for every page, including the print view.
- **Login:** global exponential backoff with no hard lockout (so a third party can't lock the founder out). The client's IP header is never trusted. Every failed attempt and every login and logout is audited.
- **Redirects:** only same-origin relative paths after login (`safeNext`).
- **Input:** zod validation in the service layer; parameterized queries; no `dangerouslySetInnerHTML`; the instructions-file reader only accepts `.claude/agents/praxia-*.md`.
- **Demo data:** the `is_demo` flag can only be set by the seed (server actions force `false`). The seed acts as `system:demo-seed` and its audit entries are flagged.
- **Outbound:** no code sends email or messages or calls external APIs. Outbound activities are manual records, blocked for contacts marked "do not contact".
- **Headers:** X-Frame-Options DENY, nosniff, Referrer-Policy, HSTS, Permissions-Policy.

## Before entering real prospect data (RISK-01 checklist)
1. Deploy only over HTTPS, with secrets in the provider's secret store (`openssl rand -base64 48`).
2. Encrypted database and backups; set a retention policy for `audit_log` (it holds personal-data snapshots).
3. Contacts: require a lawful basis before any outbound activity; suppression by email and domain with opt-out date and channel; data-subject (ARCO) workflow: export, rectification, erasure.
4. LFPDPPP privacy notice and record of the version presented to each contact.
5. Phase 2 outreach: minimum OAuth scopes, founder approval of every message, CAN-SPAM opt-out and postal address, legitimate-interest assessment for EU contacts, data processing agreements with processors, LinkedIn manual only.

## Open items (Phase 2)
- Server-side session revocation (logout currently invalidates the cookie only); optional TOTP.
- Rate-limit counter in the database (currently in memory per instance).
- Audit write in the same transaction as the change; tamper resistance.
- Strict Content-Security-Policy.

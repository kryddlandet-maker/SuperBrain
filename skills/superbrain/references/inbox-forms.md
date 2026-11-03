# A real form inbox on Node hosting

Use when the project needs to store enquiries on its own server, rather than an email/booking link or an explicitly labelled demonstration. The module stores real messages in a private directory and provides an owner login, status management and CSV export. It is an original Node implementation, not a PHP package: static hosting and PHP-only Hostinger plans cannot execute it. Choose Node hosting or an existing backend that fits the actual deployment.

## Initialize and run

Keep the data directory **outside the public website and deployment archive**, exclude it from source control and preserve it across site releases. Treat its `config.json` as a credential. Restrict filesystem access to the service account; Unix creation modes are requested, while Windows ACLs must be configured by the owner/host.

```text
node scripts/inbox.mjs init /private/my-business-inbox --name "My business"
node scripts/inbox.mjs serve /private/my-business-inbox --port 4331
```

Installed-project commands are `.superbrain/scripts/inbox.mjs`. Initialization prints a one-time setup code. Give the code privately to the authorized owner; they open `/inbox/admin` and choose their own 12–128 character password. Never ask for their password in chat. Re-running `init` preserves messages, secrets and owner configuration and does not reissue a code.

The service binds to localhost by default. For production, put it behind an HTTPS reverse proxy and forward the same public Host header. Supply `--origin https://actual-site.example` and proxy `/inbox/` to the Node process. `--host 0.0.0.0` or `--host ::` requires an explicit HTTPS origin; the service itself does not terminate TLS. Do not expose it as plaintext public HTTP. Use one process per data directory. After a crash, verify the old process has stopped before removing its `server.lock`; ordinary shutdown releases the lock. Back up the private directory with the host's protected backup service.

## Use the built-in form or integrate a branded one

`/inbox/form` is a functional native form, including without JavaScript. Link to it from the site when it is sufficient. To retain a branded form on the same origin:

1. Fetch `/inbox/token?form=enquiry` when the visitor opens the form. Keep the returned token in a hidden field called `token` and the form identity `enquiry` in `form`.
2. Submit `name`, `email`, `message`, `form`, `token` and an empty honeypot `company` to `/inbox/submit`. Up to 19 additional named text fields are accepted. Names must start with an ASCII letter and contain only letters, numbers, `_` or `-`.
3. Ordinary `application/x-www-form-urlencoded` forms receive an HTML confirmation. JSON clients receive `{ok, id, stored, notification}`. Only show success after `stored:true` or the server's successful native response. Render returned errors as text.
4. Keep a useful failure message and a native link to `/inbox/form` when JavaScript is unavailable. Do not claim an appointment is booked: this stores an enquiry and does not reserve availability, take payment or create a customer account.

Tokens are HMAC signed, form-specific, valid for one hour and require at least one second of fill time. Duplicate submissions of one token return the existing message and do not repeat notification attempts. The default limit is five submission attempts per socket IP per ten minutes. Behind a reverse proxy that does not preserve client addresses, visitors share the proxy's allowance; use direct deployment, an appropriate host-level rate limit or adapt trusted-proxy handling explicitly. Forwarded-IP headers are intentionally not trusted by this module. No marketing opt-in is inferred from an enquiry.

Messages are durably written before a notification is attempted. Owner sessions use HttpOnly/SameSite cookies, an eight-hour lifetime, password hashing with scrypt and CSRF-protected state changes. Login attempts are limited. CSV cells that could become spreadsheet formulas are neutralized. User content is escaped in the private UI, and no data/configuration directory is served. HTTPS sets Secure cookies. Restarting the process expires owner sessions, preserving messages and the password.

## Optional SMTP notification

Notifications are disabled by default. The owner can read and export enquiries without email. If SMTP is requested, install the current supported Nodemailer release into the consuming project (or set `SUPERBRAIN_NODEMAILER` to an existing package path). Use the actual provider's documented host and authenticated sending identity; do not assume an arbitrary recipient address supplies a sending mailbox.

Example private configuration, stored outside the public site:

```json
{
  "host": "smtp.actual-provider.example",
  "port": 465,
  "user": "website@actual-business.example",
  "passwordEnv": "INBOX_SMTP_PASSWORD",
  "from": "website@actual-business.example",
  "to": "owner@actual-business.example"
}
```

Set that environment variable through the hosting secret manager, then start `serve` with `--smtp /private/smtp.json`. Never commit the password or put it in the command line. Port 465 uses implicit TLS; port 587 requires STARTTLS. Certificate verification and TLS 1.2 or later are required. The sender and owner recipient are fixed configuration; user input becomes validated Reply-To and plain text, never an arbitrary notification destination. Nodemailer file/URL access is disabled.

Storage and notification delivery are separate outcomes. The UI records `disabled`, `pending`, `smtp-accepted`, `smtp-rejected` or `failed`. SMTP acceptance is not proof of recipient-inbox arrival. There is no automatic retry after an uncertain send, preventing hidden duplicate messages. Review a failed/pending notification separately; the original enquiry remains in the inbox. Verify provider SPF/DKIM/DMARC, the owner's chosen password, a clearly labelled authorized test saved in the private inbox and its actual arrival in the owner's mailbox before reporting email delivery complete. Do not submit test messages to unrelated people.

## Evidence and limits

`node --test tests/form-inbox.test.mjs` exercises a real local HTTP server: native/private routes, persistent storage and restart, concurrent idempotency, notification failure, setup/login/logout, status changes, CSRF/origin/Host rejection, spam/timing/rate limits, validation, escaping, CSV safety and private-file isolation. Separate Chrome observation covered the form → owner setup → inbox → status → CSV → logout journey at 1440/390/320 px and a form submission with JavaScript disabled. All fixtures use temporary private data and no real email.

These checks do not establish PHP compatibility, reverse-proxy deployment, multi-process clustering, production traffic capacity, screen-reader certification or email-inbox delivery. A production service additionally needs host supervision, HTTPS, protected backups, an appropriate retention/deletion policy and an actual provider configuration.

Sources: [Node crypto/scrypt](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback), [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [Nodemailer SMTP transport](https://nodemailer.com/smtp). The existing Resend [email-best-practices skill](https://github.com/resend/email-best-practices) informed notification and delivery-state handling; no external email was sent during implementation.

# CHECKPOINTS — pre-production checklist

Run through every box below **before** handing a client site off as live. Each
item is conditional on the one above it — do not skip ahead.

## 1. Real domain set in the project

- [ ] `astro.config.mjs` → `site:` is the real client domain (e.g.
      `https://elsitiodelabogado.com`), not the scaffold placeholder
      (`https://example.com`) or a Netlify preview URL
      (`https://<name>.netlify.app`).
- [ ] `src/config/seo.ts` → `COMPANY_INFO.url` matches the same real domain
      (no `https://tuagencia.com` placeholder, no `.netlify.app`).
- [ ] The two values above are **identical** — no drift between
      `astro.config.mjs` and `COMPANY_INFO.url`.

## 2. Domain configured on Netlify (only if step 1 is done)

- [ ] Custom domain added in Netlify site settings (not just the default
      `<name>.netlify.app`).
- [ ] DNS records for the domain point to Netlify (nameservers or the
      apex/CNAME records Netlify issued).
- [ ] DNS has propagated and Netlify shows the domain as verified.
- [ ] HTTPS/SSL certificate is issued and active for the custom domain.

## 3. Resend configured on the project

- [ ] Resend is actually integrated (dependency installed, API key present,
      contact form wired to send through it) — this scaffold ships with
      **no** email service by default, so confirm it was added, not assumed.
- [ ] The Resend API key is stored as an environment variable (Netlify env
      vars), never committed to the repo.

## 4. Resend domain verified with DNS (only if steps 1 and 3 are done)

- [ ] The real client domain (from step 1) is added as a sending domain in
      the Resend dashboard.
- [ ] Resend's DNS records (SPF, DKIM, and DMARC if provided) are added at
      the domain's DNS provider.
- [ ] Resend shows the domain status as **verified** (not "pending").
- [ ] A test email sends successfully from the contact form using the
      verified domain.

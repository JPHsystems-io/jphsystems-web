# Operations

Two things on this site depend on the Cloudflare account rather than on the repository.
Neither is wired up, because deploying them needs a login only the owner has. Everything
below is ready to run.

## 1. Enquiry delivery without a third party (optional)

The form is `mailto:`-only on purpose: no relay, no processor, nothing stored. The cost is
that a visitor whose browser or machine has no mail handler cannot send anything. If that
gap matters, the fix is an endpoint on this domain — a Worker in the same Cloudflare
account, so the data never leaves infrastructure you control and the CSP stays
`connect-src 'self'`.

The Worker module (keep it in `_internal/`, never in the published tree):

```js
// POST /api/enquiry -> email via MailChannels (Cloudflare's outbound mail for Workers)
export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const form = await request.formData();
    const get = (k) => (form.get(k) || "").toString().trim();
    if (get("bot-field")) return new Response("ok"); // honeypot: pretend success
    const name = get("name"), email = get("email"), message = get("message");
    if (!name || !email || !message) return new Response("Missing fields", { status: 422 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return new Response("Bad email", { status: 422 });
    const body = [
      `Name: ${name}`, `Email: ${email}`,
      get("company") && `Company: ${get("company")}`,
      get("topic") && `Topic: ${get("topic")}`,
      "", message,
    ].filter(Boolean).join("\n");
    const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: env.INBOX }] }],
        from: { email: `site@jphsystems.io`, name: "jphsystems.io" },
        reply_to: { email, name },
        subject: `Enquiry${get("topic") ? " — " + get("topic") : ""}${get("company") ? " — " + get("company") : ""}`,
        content: [{ type: "text/plain", value: body }],
      }),
    });
    return new Response(res.ok ? "ok" : "failed", { status: res.ok ? 200 : 502 });
  },
};
```

Steps:

1. `npm i -g wrangler && wrangler login`
2. `wrangler init enquiry-worker` (paste the module above), then
   `wrangler secret put INBOX` and enter the inbox address.
3. Add a route: `www.jphsystems.io/api/enquiry/*` → this Worker.
4. Point the form at it: `action="/api/enquiry"`, `data-endpoint="/api/enquiry"`, keep
   `data-mailto` as the fallback, and reinstate the fetch path in `main.js` (it was removed
   in the relay commit; `git log -p assets/js/main.js` has the working version).
5. CSP: `connect-src 'self'` already covers a same-origin endpoint; `form-action 'self'`
   covers the no-JS POST. No other change.
6. `privacy.html`: say the message is delivered by a function on this domain, nothing is
   stored, and your own inbox is the recipient. That keeps the "no third-party processor"
   sentence true.
7. Test: post an empty form (expect 422), a filled one (expect ok + mail), and one with
   the honeypot set (expect ok, no mail).

Until this exists, the `mailto:` draft is the delivery path and the page says so.

## 2. Measurement (a decision, not a task)

There is no analytics at all, so nothing on the site can be evaluated: no referrers, no
page counts, no idea whether the form is ever used.

The only option that fits the privacy position is Cloudflare Web Analytics: cookieless, no
fingerprinting, no consent banner needed under the usual reading. It does, however, inject
a script from `static.cloudflareinsights.com`, which makes the current sentence in
`privacy.html` ("No Google Fonts, no CDN… so visiting a page does not tell a third party
who you are") untrue. Enabling it means, in one commit:

- `privacy.html`: name Cloudflare Web Analytics, say what it records (path, referrer,
  country, no cookies, no cross-site identifier).
- CSP in every page and in `_headers`: add `https://static.cloudflareinsights.com` to
  `script-src` and `https://cloudflareinsights.com` to `connect-src`.
- Then run `python3 _internal/scripts/sync-csp.py` so the inline-script hashes survive the
  edit.

The alternative — stay unmeasured — is defensible for a practice whose pitch is "no
tracking", but then nobody can tell whether the site earns its keep. Pick one; do not
enable it quietly.

## 3. Routine checks

- `python3 _internal/scripts/stamp-assets.py` after touching `assets/css` or `assets/js`.
- `python3 _internal/scripts/sync-csp.py` after editing any inline `<script>`.
- `python3 _internal/scripts/sync-dates.py` before committing a page change.
- After a push: `gh api repos/JPHsystems-io/jphsystems-web/pages/builds/latest --jq '.status+" "+.commit[0:7]'`
  until it reports `built` for **that** commit, then fetch the page again — Cloudflare can
  serve the previous build for a minute after Pages says it is done.

## 4. Keeping /_internal/ off the domain

The housekeeping docs sit in `_internal/` so they are not part of the site, but GitHub
Pages serves underscore directories as ordinary files (`/_internal/CONTENT.md` returns
200; only `_headers` is special-cased). The repository is public anyway, so treat those
files as public: no credentials, no client names.

`robots.txt` disallows `/_internal/`, which keeps search engines away. To make a visitor
get a 404 as well, add one Cloudflare rule (Rules → Redirect Rules, or a WAF custom rule)
on `www.jphsystems.io`:

- **If** `http.request.uri.path` matches `^/_internal/`
- **Then** return 404 (Redirect Rule: "Block", or WAF: block with a 404 response)

Until that rule exists the path answers 200, so nothing sensitive belongs there.

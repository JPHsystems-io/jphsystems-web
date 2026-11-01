# JPHsystems — website

A static site for JPHsystems: cybersecurity, network security and
application/service engineering. Plain HTML, CSS and JavaScript — no build step, no
framework, no server. It is designed to be served directly from GitHub Pages.

The site ships with a **dark** theme and a **light** (white) theme. The active theme is
set on `<html data-theme="dark|light">`; without a stored choice the head script follows
the OS `prefers-color-scheme`. The header toggle (`data-theme-toggle`) switches themes and
persists the choice in `localStorage`.

**Live:** <https://www.jphsystems.io/> — the site is published at
**www.jphsystems.io**. The GitHub Pages project URL
<https://jphsystems-io.github.io/jphsystems-web/> serves the same files from `main`
(branch, repository root) and stays as the origin.

The apex `jphsystems.io` has no A/AAAA records, so it does not resolve; only the
`www` host serves the site. `jphsystems.io` is also the practice's mail domain
(`jphermans@jphsystems.io`). There is no `CNAME` file in the repository — the
custom host is fronted by Cloudflare and reaches the same GitHub Pages content.

## Pages

| Path | Purpose |
| --- | --- |
| `index.html` | Home: positioning, triage diagram, services, process, proof, shipped apps, CTA |
| `services.html` | Three service lines, assessment, comparison, FAQ |
| `about.html` | Story, principles, toolbox, what the practice is not |
| `token-ledger.html` | Token Ledger app page: what it does, specs, App Store badge, SoftwareApplication JSON-LD |
| `apps/index.html` | Apps hub: one card per app, so the nav item is a section and not a single product |
| `privacy.html` | Privacy notice: what is stored, what is not, where an enquiry goes |
| `contact.html` | Enquiry form: composes a `mailto:` draft in the visitor's own mail client — no relay, no backend |
| `notes/index.html` | Notes hub, with the RSS link |
| `notes/feed.xml` | RSS 2.0 feed for the notes |
| `notes/flat-network.html` | Network segmentation note |
| `notes/pentest-report.html` | Remediation note |
| `notes/ship-the-internal-tool.html` | Internal tools note |
| `_headers` | CSP, HSTS and other response headers for Cloudflare Pages (ignored by GitHub Pages) |
| `404.html` | Not-found page |

Supporting files: `assets/css/styles.css`, `assets/js/main.js`, `assets/img/*`,
`robots.txt`, `sitemap.xml`, `.nojekyll`, and three maintenance scripts in `scripts/`:

| Script | What it does | Run it when |
| --- | --- | --- |
| `scripts/stamp-assets.py` | Puts a content hash (`?v=…`) on `styles.css`, `fonts.css` and `main.js` | after editing anything under `assets/css/` or `assets/js/` |
| `scripts/sync-csp.py` | Recomputes the inline-script SHA-256 hashes in each page's CSP and in `_headers` | after editing any inline `<script>` |
| `scripts/sync-dates.py` | Derives `sitemap.xml` `lastmod` and the feed's `lastBuildDate` from git | before committing a page change |

All three are idempotent: a second run reports no changes.

## Preview locally

From the project root:

```sh
python3 -m http.server 8080
```

Open <http://localhost:8080>. Use a local server rather than opening the files
directly — the relative paths and the `?topic=` prefill behave the way they will on
GitHub Pages.

## Deploy to GitHub Pages

The site is published at **https://www.jphsystems.io/** and, unchanged, at
**https://jphsystems-io.github.io/jphsystems-web/** from the repository root of the
`jphsystems-web` project. Pages is enabled for this repository (Settings → Pages →
Deploy from a branch → `main` / root). Pushing to `main` rebuilds the site, and the
www host picks the new build up (currently served through Cloudflare).

There is no `CNAME` file in the repository: the www host is fronted by Cloudflare and
reaches the same build, so Pages keeps serving the project URL directly. Leave the
Pages custom-domain field as it is — clearing it can take www down with it.

To recreate the setup from scratch:

1. Create a public repository named `jphsystems-web` under the `JPHsystems-io` organization.
2. From this folder:

   ```sh
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/JPHsystems-io/jphsystems-web.git
   git push -u origin main
   ```

3. In the repository: **Settings → Pages → Build and deployment**.
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**
   - Custom domain: leave empty
   - Save.

The apex `jphsystems.io` does not resolve (no A/AAAA records) and is not used to
serve the site — `www` is. The domain is also the mail domain, so leave its MX records
alone. If you recreate the hosting from scratch, re-point the `www` host at the new
build afterwards; nothing in the repository needs to change.

`.nojekyll` is included so GitHub Pages serves the files as-is without running
Jekyll. All internal links are relative (`../assets/...`, `notes/...`), so the site
works under the `/jphsystems-web/` project subpath. `404.html` uses absolute paths
(`/jphsystems-web/assets/...`) because a 404 can be served from any depth.

### If you change the base URL

The base URL `https://jphsystems-io.github.io/jphsystems-web/` still appears in the
markup (the site is also served from `https://www.jphsystems.io/`, so these two
disagree):

- `<link rel="canonical">`, Open Graph and Twitter tags on every page
- the JSON-LD blocks on `index.html` and the three notes
- `robots.txt` and every `<loc>` in `sitemap.xml`
- the absolute asset/nav paths in `404.html`

Update all of them together. If you ever move to a custom domain, add a `CNAME` file
and set the same domain in **Settings → Pages**.

## Deploy to Cloudflare

The site also runs on Cloudflare, and that is how **www.jphsystems.io** is served today.
It is a static directory — no build step, no functions — so any static host works, but
Cloudflare adds the security headers and the redirects that GitHub Pages cannot.

### Cloudflare Pages (git-connected)

1. **Workers & Pages → Create → Pages → Connect to Git**, pick
   `JPHsystems-io/jphsystems-web`.
2. Framework preset **None**, build command **empty**, build output directory **`/`**,
   production branch **`main`**.
3. **Custom domains → Set up a domain**, enter `www.jphsystems.io`. Cloudflare creates
   the DNS record; make sure it is **proxied** (orange cloud).
4. Every push to `main` starts a new deployment. Preview deployments get their own URL.

The apex `jphsystems.io` is not attached to the project and has no A/AAAA records — add
a **Redirect Rule** (Rules → Redirect Rules) sending `jphsystems.io/*` to
`https://www.jphsystems.io/$1` with a 301 if you ever point it at Cloudflare. Leave the
MX records alone; the domain is also the mail domain.

### Headers

`_headers` in the repository root is read by Pages on every deployment and carries the
CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` and `Cross-Origin-Opener-Policy`. GitHub Pages ignores the file, so
each page also ships a `<meta http-equiv="Content-Security-Policy">` and
`<meta name="referrer">` as the fallback — keep the two in step when either changes.

If the www host is instead a plain proxy in front of GitHub Pages, `_headers` is not
read: copy the same headers into a **Transform Rule** (Rules → Transform Rules →
Modify response header) so they apply at the edge.

### Analytics

Cloudflare Web Analytics is a toggle per zone (Analytics → Web Analytics): no cookie, no
consent banner, no script in the repository. Turn it on for `jphsystems.io` and the
visits, referrers and top pages land in the dashboard without changing the site.

### What Cloudflare replaces from GitHub Pages

- HTTPS redirect and HSTS (Pages serves TLS for the custom domain automatically).
- Caching and compression at the edge (Brotli), instead of GitHub's fixed ten minutes.
- Response headers, which GitHub Pages cannot set at all.
- Fast rollback: every deployment keeps its own URL, so a bad push can be rolled back
  from the dashboard without touching Git.

## Editing

- **Design tokens** (colour, type, spacing, radii) live at the top of
  `assets/css/styles.css` under `:root`, plus a `:root[data-theme="light"]` override
  block with the light palette. Change the accent once and it propagates.
- **Navigation and footer** are duplicated in each HTML file. If you add a page,
  update the header, mobile menu and footer on every page, plus `sitemap.xml`.
- **Adding a note:** copy `notes/flat-network.html`, update the `<title>`,
  description, canonical, OG/Twitter tags, JSON-LD (including `datePublished`),
  breadcrumb, the `<time datetime>` in the meta line, body, related-notes links and the
  in-text “next note” link. Add a card to `notes/index.html` and a `<url>` to
  `sitemap.xml`, then run `scripts/sync-dates.py`. Covers are 1600×900; the current ones
  are in `assets/img/`.
- **Adding an app:** copy the card in `apps/index.html`, point it at the new page, add
  the page to the nav/footer where it belongs, and add a `<url>` to `sitemap.xml`.
- **URLs are extensionless.** Pages are linked and canonicalised without `.html`
  (`/about`, `/notes/pentest-report`); Cloudflare redirects `*.html` to those forms, so
  both keep working. Do not reintroduce `.html` in `href`, canonical, `og:url`, JSON-LD,
  the sitemap or the feed.
- **Contact form:** no backend and no relay. `assets/js/main.js` validates the fields and
  composes a `mailto:` draft from them; the visitor's mail client sends it. If nothing
  opens, the page keeps the draft link and the address on screen. The `action` is a
  `mailto:` too, so the form still does something without JavaScript. Change the address
  in the `action`, the `data-mailto` attribute and the footer links.
- **Availability line:** the hero note on `index.html` is driven by the `availability`
  object at the top of `main.js` (`state: "open" | "booked"`, plus `nextOpening` as
  `YYYY-MM-DD`). Booked out means editing one value, not rewriting a sentence.
- **Motion:** scroll reveals, the pinned scene, the flow animation and the count-ups
  all respect `prefers-reduced-motion`. The scene collapses to a static layout below
  760px.

## Before you publish

Read `CONTENT.md`. It lists the placeholder identity details, contact addresses,
links, claims and dates that should be replaced or verified. Nothing in the site
should be treated as a verified credential until you have checked it.

## Notes

- Fonts (Figtree, JetBrains Mono) load from Google Fonts. There are no analytics,
  trackers, cookies or third-party scripts.
- Content and design © JPHsystems. All rights reserved.

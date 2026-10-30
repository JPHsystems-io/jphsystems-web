# JPHsystems — website

A static, dark-mode site for JPHsystems: cybersecurity, network security and
application/service engineering. Plain HTML, CSS and JavaScript — no build step, no
framework, no server. It is designed to be served directly from GitHub Pages.

**Live:** <https://jphsystems.io/> — GitHub Pages, `main`
branch, repository root.

## Pages

| Path | Purpose |
| --- | --- |
| `index.html` | Home: positioning, triage diagram, services, process, proof, CTA |
| `services.html` | Three service lines, assessment, comparison, FAQ |
| `about.html` | Story, principles, toolbox, what the practice is not |
| `contact.html` | Enquiry form (composes a `mailto:`) and booking section |
| `notes/index.html` | Notes hub |
| `notes/flat-network.html` | Network segmentation note |
| `notes/pentest-report.html` | Remediation note |
| `notes/ship-the-internal-tool.html` | Internal tools note |
| `404.html` | Not-found page |

Supporting files: `assets/css/styles.css`, `assets/js/main.js`, `assets/img/*`,
`robots.txt`, `sitemap.xml`, `.nojekyll`.

## Preview locally

From the project root:

```sh
python3 -m http.server 8080
```

Open <http://localhost:8080>. Use a local server rather than opening the files
directly — the relative paths and the `?topic=` prefill behave the way they will on
GitHub Pages.

## Deploy to GitHub Pages

The site is served at **https://jphsystems.io/** from the repository root, using the
custom domain recorded in `CNAME`. Pages is enabled for this repository
(Settings → Pages → Deploy from a branch → `main` / root). Pushing to `main`
rebuilds it.

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
   - Custom domain: `jphsystems.io`
   - Save.
4. At the DNS provider (Cloudflare for this domain), point the apex at GitHub Pages:

   | Type | Name | Value | Proxy |
   | --- | --- | --- | --- |
   | A | `@` | `185.199.108.153` | DNS only |
   | A | `@` | `185.199.109.153` | DNS only |
   | A | `@` | `185.199.110.153` | DNS only |
   | A | `@` | `185.199.111.153` | DNS only |
   | AAAA | `@` | `2606:50c0:8000::153` | DNS only |
   | AAAA | `@` | `2606:50c0:8001::153` | DNS only |
   | AAAA | `@` | `2606:50c0:8002::153` | DNS only |
   | AAAA | `@` | `2606:50c0:8003::153` | DNS only |
   | CNAME | `www` | `jphsystems-io.github.io` | DNS only |

   Keep the existing MX records for mail. Leave the proxy off (grey cloud) until
   GitHub has issued the certificate, then enable **Enforce HTTPS** in Pages. If
   GitHub asks for domain verification, add the `_github-pages-challenge-JPHsystems-io`
   TXT record it shows in Settings → Pages.

`.nojekyll` is included so GitHub Pages serves the files as-is without running
Jekyll. All internal links are relative (`../assets/...`, `notes/...`), so the site
works at the domain root. `404.html` uses root-relative paths (`/assets/...`)
because a 404 can be served from any depth.

### If you change the domain

The base URL `https://jphsystems.io/` appears in:

- `<link rel="canonical">`, Open Graph and Twitter tags on every page
- the JSON-LD blocks on `index.html` and the three notes
- `robots.txt` and every `<loc>` in `sitemap.xml`
- the root-relative asset/nav paths in `404.html`

Update all of them together, along with the `CNAME` file.

## Editing

- **Design tokens** (colour, type, spacing, radii) live at the top of
  `assets/css/styles.css` under `:root`. Change the accent once and it propagates.
- **Navigation and footer** are duplicated in each HTML file. If you add a page,
  update the header, mobile menu and footer on every page, plus `sitemap.xml`.
- **Adding a note:** copy `notes/flat-network.html`, update the `<title>`,
  description, canonical, OG/Twitter tags, JSON-LD, breadcrumb, meta line, body and
  the “next note” link. Add a card to `notes/index.html` and a `<url>` to
  `sitemap.xml`. Covers are 1600×900; the current ones are in `assets/img/`.
- **Contact form:** there is no backend. `assets/js/main.js` validates the fields and
  opens a prefilled `mailto:`. The form's fallback `action` is also a `mailto:`, so it
  still works without JavaScript. Change the address in both the `action` and the
  `data-mailto` attribute, and in the footer links.
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

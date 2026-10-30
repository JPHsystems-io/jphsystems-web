# JPHsystems — website

A static, dark-mode site for JPHsystems: cybersecurity, network security and
application/service engineering. Plain HTML, CSS and JavaScript — no build step, no
framework, no server. It is designed to be served directly from GitHub Pages.

**Live:** <https://jphsystems-io.github.io/jphsystems-web/> — GitHub Pages, `main`
branch, repository root.

`jphsystems.io` is the practice's domain identity (and the contact address,
`jphermans@jphsystems.io`). It is not used to host this site and has no A/AAAA
records pointing at GitHub Pages. The site is served from the GitHub Pages project
URL above.

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

The site is served at **https://jphsystems-io.github.io/jphsystems-web/** from the
repository root of the `jphsystems-web` project. Pages is enabled for this repository
(Settings → Pages → Deploy from a branch → `main` / root), with **no custom domain**
set. Pushing to `main` rebuilds it.

There is deliberately no `CNAME` file. If Pages still has a custom domain configured,
clear it in **Settings → Pages → Custom domain** (or with
`gh api -X PUT repos/JPHsystems-io/jphsystems-web/pages -f cname=""`); otherwise
GitHub redirects the `github.io` URL to a domain that does not serve the site.

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

No DNS changes are needed. Do not point `jphsystems.io` at GitHub Pages unless you
decide to host the site on the apex domain later; the domain is currently used for
mail only, and its MX records must be left alone.

`.nojekyll` is included so GitHub Pages serves the files as-is without running
Jekyll. All internal links are relative (`../assets/...`, `notes/...`), so the site
works under the `/jphsystems-web/` project subpath. `404.html` uses absolute paths
(`/jphsystems-web/assets/...`) because a 404 can be served from any depth.

### If you change the base URL

The base URL `https://jphsystems-io.github.io/jphsystems-web/` appears in:

- `<link rel="canonical">`, Open Graph and Twitter tags on every page
- the JSON-LD blocks on `index.html` and the three notes
- `robots.txt` and every `<loc>` in `sitemap.xml`
- the absolute asset/nav paths in `404.html`

Update all of them together. If you ever move to a custom domain, add a `CNAME` file
and set the same domain in **Settings → Pages**.

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

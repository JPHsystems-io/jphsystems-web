# Content checklist

Everything below is a placeholder or an unverified claim. Replace or confirm each item
before the site is promoted. Nothing here should be treated as fact until you have
checked it.

## 1. Identity and contact

| Item | Current value | Where it appears |
| --- | --- | --- |
| Display name / initials | `JPH` | Avatar chips, byline, about portrait, article JSON-LD `author.name` |
| Practice description | “Founder & engineer, JPHsystems” | Bylines on every page, about page |
| Email | `jphermans@jphsystems.io` | Footer on every page, `contact.html` (form `action`, `data-mailto`, direct links, JSON-LD), `index.html` JSON-LD |
| LinkedIn | `https://www.linkedin.com/in/jphsystems/` | Footer on every page |
| GitHub | `https://github.com/JPHsystems-io` | Footer on every page |
| Location / time zones | “Remote-first, working with teams across European and US time zones” | `about.html` portrait caption |
| Contact route | One route only: the enquiry form at `contact.html#enquiry` | Nav CTA, mobile menu CTA, every CTA band, footer on every page |

There is no scheduler and no booking widget, by design. Every call to action lands on
the form. The form has no server: `assets/js/main.js` validates the fields and composes
the message to FormSubmit, which relays it to the inbox; if the relay is unreachable it
falls back to a `mailto:` draft in the visitor's mail client and says so, in case
the mail client does not open. If server-side delivery is ever wanted, point the form's
`action` at a form endpoint (Formspree, Web3Forms, a Cloudflare Worker) and drop the
`data-mailto` attribute. The relay is a third party (FormSubmit): name it in the consent
copy and in any privacy statement, or swap `data-endpoint` for an EU processor.

## 2. Base URL

The site is served from the GitHub Pages project URL:

```
https://jphsystems-io.github.io/jphsystems-web/
```

There is no `CNAME` file and no custom domain configured in Pages. `jphsystems.io` is
only the practice's domain identity and the mail domain for
`jphermans@jphsystems.io`; it does not host the site. If the base URL ever changes,
update it in:

- every `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` and JSON-LD
  `mainEntityOfPage` / `image` across all pages
- `robots.txt` (the `Sitemap:` line)
- `sitemap.xml` (every `<loc>`)
- `404.html` (asset and navigation paths are absolute under `/jphsystems-web/`)

## 3. Claims to verify or soften

These are written as commitments. Keep them only if they are true for you.

| Claim | File | Notes |
| --- | --- | --- |
| “72h — from kickoff to the first written findings, so you have something concrete to act on in week one” | `index.html` | Delivery commitment; make sure it holds for your process |
| “100% of findings leave with an owner, a proposed fix and a way to test” | `index.html` | Absolute claim; consider “every finding” instead of “100%” if you prefer |
| “1 day — typical reply time to a new enquiry” | `about.html` | Response-time commitment |
| “30 days of questions included after hand-off” | `about.html`, `services.html` | Commercial term; confirm it matches your contracts |
| “Remote-first… European and US time zones” | `about.html` | Confirm your actual working hours |
| “Independent practice. No reseller commissions.” | Footer, every page | Confirm no affiliate/reseller arrangements |
| Service scope and deliverables | `services.html` | Check the assessment contents and pricing language match what you actually offer |
| Response promise | “Usually within one business day” | Contact page, home CTA |

There are no client names, logos, testimonials, certifications or years-of-experience
claims in the site. If you add any, they must be real and attributable.

## 4. Notes

- The **Apps** section on the home page (`index.html#apps`, linked from the
  header nav as **Apps** and from every footer) points at the live App Store listing for Token Ledger
  (<https://apps.apple.com/app/id6809165525>, Apple ID 6809165525) and its
  support site. The icon (`assets/img/app-token-ledger.png`, 192px) is the
  app's App Store icon. The download CTA is Apple's official badge, used
  unmodified: `assets/img/app-store-badge-white.svg` on the dark theme and
  `assets/img/app-store-badge-black.svg` on the light theme, swapped in CSS.
  Both come from Apple's badge service
  (`https://tools.applemediaservices.com/api/badges/download-on-the-app-store/{black|white}/en-us`);
  swap `en-us` for another locale if the site is ever localised. Add the next
  shipped app as another card in that section.
- Article dates (`18 Sep 2026`, `2 Oct 2026`, `16 Oct 2026`), read times and
  “Filed under” lines are illustrative. Update them to the real publication dates, and
  keep the `<time>`-style text, JSON-LD `datePublished`/`dateModified` and
  `sitemap.xml` `<lastmod>` in sync.
- The three cover images (`cover-network`, `cover-report`, `cover-app`) are generated
  placeholders. Replace them with real visuals or keep them; they are 1600×900 PNGs
  with SVG sources alongside.
- The “next note” links currently form a loop:
  `flat-network → pentest-report → ship-the-internal-tool → flat-network`.

## 5. Legal and privacy

- The site sets no cookies and loads no analytics. Fonts come from Google Fonts,
  which receives the visitor's IP address. If that matters for your jurisdiction,
  self-host the two font families and remove the Google Fonts links.
- The contact form posts to a third-party relay (FormSubmit) and keeps no copy on the
  site. Decide whether a DPA with that processor is needed, or move to an EU provider.
  The consent checkbox says so. If you later add a form backend, update that copy and
  add a privacy notice covering what is stored and for how long.
- There is no imprint/Impressum, privacy policy or terms page. Add them if you are
  subject to a regime that requires them (for example, Germany's Impressum duty).

## 6. Technical placeholders

- `assets/js/main.js` builds the `mailto:` body. Review the subject and body template
  in `composeMail` if you want different fields or wording.
- `404.html` is the only page using absolute paths (`/jphsystems-web/assets/...`).
  Update them if the repository or hosting base path changes.
- The OG image (`assets/img/og-default.png`) uses the wordmark only. Replace it if you
  want a photo or a different composition.
- `favicon.ico`, `favicon.svg`, `favicon-32.png` and `apple-touch-icon.png` are
  generated from the same mark. Regenerate them together if the mark changes.

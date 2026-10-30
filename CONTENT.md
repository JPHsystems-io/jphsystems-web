# Content checklist

Everything below is a placeholder or an unverified claim. Replace or confirm each item
before the site is published. Nothing here should be treated as fact until you have
checked it.

## 1. Identity and contact

| Item | Current value | Where it appears |
| --- | --- | --- |
| Display name / initials | `JPH` | Avatar chips, byline, about portrait, article JSON-LD `author.name` |
| Practice description | “Founder & engineer, JPHsystems” | Bylines on every page, about page |
| Email | `hello@jphsystems.com` | Footer on every page, `contact.html` (form `action`, `data-mailto`, direct links, JSON-LD), `index.html` JSON-LD |
| LinkedIn | `https://www.linkedin.com/in/jphsystems/` | Footer on every page |
| GitHub | `https://github.com/JPHsystems` | Footer on every page |
| Location / time zones | “Remote-first, working with teams across European and US time zones” | `about.html` portrait caption |
| Booking | In-page `#book` section and a `mailto:` “Request a call” link | `contact.html`, every “Book a call” button |

If you prefer a real scheduler (Calendly, Cal.com, Google Appointment), replace the
`#book` buttons and the “Request a call” `mailto:` with the scheduler URL. If you add
an embed, note that it introduces a third-party script and cookies.

## 2. Base URL

The canonical/OG base is assumed to be:

```
https://jphsystems.github.io/jphsystems-web/
```

If the repository name changes, or you add a custom domain, update it in:

- every `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` and JSON-LD
  `mainEntityOfPage` / `image` across all pages
- `robots.txt` (the `Sitemap:` line)
- `sitemap.xml` (every `<loc>`)
- `404.html` (asset and navigation paths use `/jphsystems-web/...`)

## 3. Claims to verify or soften

These are written as commitments. Keep them only if they are true for you.

| Claim | File | Notes |
| --- | --- | --- |
| “72h — typical time from kickoff to the first written findings” | `index.html` | Delivery commitment; make sure it holds for your process |
| “100% of findings leave with an owner, a proposed fix and a way to test” | `index.html` | Absolute claim; consider “every finding” instead of “100%” if you prefer |
| “1 day — typical reply time to a new enquiry” | `about.html` | Response-time commitment |
| “30 days of questions included after hand-off” | `about.html`, `services.html` | Commercial term; confirm it matches your contracts |
| “Remote-first… European and US time zones” | `about.html` | Confirm your actual working hours |
| “Independent practice. No reseller commissions.” | Footer, every page | Confirm no affiliate/reseller arrangements |
| Service scope and deliverables | `services.html` | Check the assessment contents and pricing language match what you actually offer |
| 30-minute call length | Nav, contact, footer | Change if your intro call is a different length |

There are no client names, logos, testimonials, certifications or years-of-experience
claims in the site. If you add any, they must be real and attributable.

## 4. Notes

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
- The contact form does not submit to the site. It opens the visitor's mail client.
  The consent checkbox says so. If you later add a form backend, update that copy and
  add a privacy notice covering what is stored and for how long.
- There is no imprint/Impressum, privacy policy or terms page. Add them if you are
  subject to a regime that requires them (for example, Germany's Impressum duty).

## 6. Technical placeholders

- `assets/js/main.js` builds the `mailto:` body. Review the subject and body template
  in `composeMail` if you want different fields or wording.
- `404.html` is the only page using absolute `/jphsystems-web/...` paths. It must be
  updated if the repository is renamed.
- The OG image (`assets/img/og-default.png`) uses the wordmark only. Replace it if you
  want a photo or a different composition.
- `favicon.ico`, `favicon.svg`, `favicon-32.png` and `apple-touch-icon.png` are
  generated from the same mark. Regenerate them together if the mark changes.

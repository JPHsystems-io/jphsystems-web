# jphsystems.io

Static site for JPHsystems — cybersecurity, network security and product engineering.
Plain HTML, CSS and a small script, no build step, published from `main` to GitHub
Pages and served through Cloudflare at **https://www.jphsystems.io/**.

| Path | What it is |
| --- | --- |
| `index.html` | Home |
| `services.html` | Three service lines, assessment, comparison, FAQ |
| `about.html` | The practice, principles, toolbox |
| `apps/index.html` | Apps hub |
| `token-ledger.html` | Token Ledger, the iOS app |
| `notes/` | Field notes hub, three articles and the RSS feed |
| `contact.html` | Enquiry form — composes a `mailto:` draft, no backend |
| `privacy.html` | Privacy notice |
| `404.html` | Not-found page |

Housekeeping for whoever edits it next — the content checklist, the maintenance notes
and the three idempotent helper scripts (`stamp-assets`, `sync-csp`, `sync-dates`) —
is in `_internal/`, which GitHub Pages deliberately does not publish: the leading
underscore keeps it off the live domain.

URLs are extensionless (`/about`, `/notes/pentest-report`); Cloudflare redirects
`*.html` to those forms.

# Vizion

Bilingual static site (English by default, French in `fr/`), eight pages per language.
**Vizion is a fictional studio, created for a school project**: the games shown belong to their studios and the credits are fictional (stated on the site) — plain HTML, CSS and ES modules. No framework, no build step, no npm dependency.
The 3D library uses three.js r186, vendored in `vendor/three/` (MIT).

## Run

ES modules do not load from `file://`. Serve the folder with the bundled server (Node 18+):

```bash
node tools/serve.mjs      # or: npm start
node tools/test-estimate.mjs   # or: npm test
```

Then open http://localhost:5192. Add `?rec=1` to play the time-driven recorder mode.
Avoid `python -m http.server`: its 5-connection backlog resets requests when the library loads its modules.

## Deploy (GitHub Pages)

`.github/workflows/pages.yml` runs the quote tests, copies the site files into `_site/` and publishes them
on every push to `main`. One-time setup: repository **Settings → Pages → Source: GitHub Actions**.
All paths are relative, so the site works under `https://<user>.github.io/<repo>/`.

## Before going live

- **Prices**: every amount in `js/data/pricing.js` is an example. Replace them, then update the expected values in
  `tools/test-estimate.mjs` and run `node tools/test-estimate.mjs`.
- **Contact address**: set `CONTACT_EMAIL` in `js/data/pricing.js` (quote requests) and replace `[email address]` in
  `partials/en/footer.html` and `[adresse e-mail]` in `partials/fr/footer.html`, then run `node tools/sync-partials.mjs`.
- **Contact form**: inactive while `endpoint` is empty in `js/data/contact.js`. Paste the endpoint of a form service
  (e.g. Formspree) to activate it, then update the privacy policy (new recipient of the messages).
  Placeholders on the contact page: `[48 h]`, hours and time zone, email.
- **Legal pages**: every `[bracketed]` value (company form, address, SIREN, VAT, publication director, payment terms,
  retention periods, court) must be filled in, and the texts should be reviewed by a legal professional.

## Pages

| English (root) | French (`fr/`) | Content |
|---|---|---|
| `index.html` | `index.html` | Hero with the logo, manifesto, services panel, projects preview, links to the other pages |
| `projects.html` | `projets.html` | Featured project (Neon, inFAMOUS Second Son) and six project cards filterable by role |
| `library.html` | `bibliotheque.html` | 13 procedural 3D models: filters, one WebGL canvas, viewer with “Add to my quote” |
| `pricing.html` | `tarifs.html` | Plans, unit prices, quote cart (quantities, one-time options, company size, deadline), pre-filled email |
| `legal-notice.html` | `mentions-legales.html` | Publisher, host, intellectual property, credits |
| `terms.html` | `conditions-generales.html` | Terms of use of the site and terms of sale |
| `contact.html` | `contact.html` | Contact form (ready, inactive), contact details, FAQ |
| `privacy.html` | `confidentialite.html` | Privacy policy (GDPR), no cookies, local storage for the cart |

The language switch (EN / FR) sits at the end of the nav and in the footer; it links to the same page in the other
language. Pairs are declared in `PAGES` in `tools/sync-partials.mjs`, which also writes the `hreflang` links.

## Structure

```
*.html                English pages        fr/*.html  French pages
partials/en|fr/       nav.html, footer.html — the single source of the shared nav and footer, per language
css/
  fonts.css           @font-face (self-hosted, latin subset)
  tokens.css          unit u, palette (one red hue), fonts, easing — the only place for colours
  base.css            reset, focus, helpers, reduced motion
  layout.css          home sections (desktop artboard + phone flow)
  components.css      nav, buttons, glass, cards, statement, panel
  pages.css           shared by all pages: sub-page hero, signature line, segmented control, explore, CTA
  library.css         library grid, WebGL canvas, viewer
  pricing.css         plans, price table, configurator
  legal.css           legal pages: short hero, sticky table of contents, text column
  footer.css          site footer
  motion.css          initial states for the intro, reveals and staggers
js/
  main.js             shared entry: intro, scroll, staggers, recorder, reduced motion (every page)
  i18n.js             LANG from <html lang>, t({ en, fr })
  quote-store.js      the quote cart in localStorage (shared by the library and the pricing page)
  motion/             env, intro, counters, word-fill, nav-pill (sliding pill), reveal, stagger
  pages/library.js    library cards + filters; loads the 3D lazily
  pages/pricing.js    plans, table, quote cart UI
  pages/projects.js   project filters by role
  pages/contact.js    contact form (inactive until an endpoint is set)
  pages/legal.js      highlights the current section in the legal table of contents
  three/              build-models (procedural models), materials, library-scene (renderers, viewer)
  pricing/estimate.js quote maths (no DOM, tested by tools/test-estimate.mjs)
  data/models.js      library catalogue
  data/contact.js     contact form endpoint (empty = inactive)
  data/pricing.js     prices, quantity and one-time services, options (EXAMPLES) — texts are { en, fr }
vendor/three/         three.js r186 build + OrbitControls + RoomEnvironment
tools/serve.mjs       dev server        tools/test-estimate.mjs  quote tests
tools/sync-partials.mjs  copies partials/ into every page (--check in CI)
assets/fonts, assets/img
```

## Conventions

- Every layout size is `calc(N * var(--u))`, N measured on a 1440 artboard (`--u` = 100vw / 390 on phones).
- The nav and the footer live in `partials/<lang>/`. Pages hold `<!-- partial:alternates -->`, `<!-- partial:nav -->` and
  `<!-- partial:footer -->` markers; edit a partial, then run `node tools/sync-partials.mjs` (it fills `{{root}}` and
  `{{switch}}`, sets `aria-current` and the `hreflang` links). CI fails if a page is stale or has no translation.
- French pages in `fr/` reference shared files with `../`. A new page needs both languages and an entry in `PAGES`.
- Translatable data is `{ en, fr }`; scripts read the page language from `<html lang>` (`js/i18n.js`).
- Quote cart: a service of type `qty` is sold by quantity (stepper), a service of type `once` is a checkbox
  (flat `price` or `rate` of the total). Services with the same `group` share one card: 3D assets have one line per
  size (small, standard, large / detailed, hero). The cart is stored in `localStorage` (no personal data); quotes
  saved by older versions are migrated by `sanitizeQuote()` in `js/pricing/estimate.js`.
- Motion is attached with `data-*` attributes: `data-title-line`, `data-hero-photo`, `data-drift`, `data-nav`,
  `data-rise`, `data-draw`, `data-line` (SVG signature), `data-count` (+ `data-suffix`, `data-count-on="load|reveal"`),
  `data-fill`, `data-trust`, `data-avatar`, `data-awards`, `data-stagger` (with class `is-pre`).
- Page modules that render content (`pages/*.js`) are loaded before `main.js` so their elements exist when it animates them.
- 3D: one renderer for the whole grid (scissor per card), a second one only while the viewer is open.
  Add a model: write a builder in `js/three/build-models.js` and an entry in `js/data/models.js`.
- Counters keep their final value in the HTML so the page is right without JavaScript.
- `[data-fill]` holds only text and `<br>`.

## Licence

Source code under the MIT licence (`LICENSE`). Brand assets, images and third-party files are excluded:
see `NOTICE.md`.

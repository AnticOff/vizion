# Vizion

Static site in six pages — plain HTML, CSS and ES modules. No framework, no build step, no npm dependency.
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
- **Contact address**: set `CONTACT_EMAIL` in `js/data/pricing.js` (quote requests) and replace `[adresse e-mail]`
  in `partials/footer.html`, then run `node tools/sync-partials.mjs`.
- **Legal pages**: every `[bracketed]` value (company form, address, SIREN, VAT, publication director, payment terms,
  retention periods, court) must be filled in, and the texts should be reviewed by a legal professional.

## Pages

| Page | Content |
|---|---|
| `index.html` | Hero with the logo, manifesto, services panel, projects, links to the other pages |
| `bibliotheque.html` | 13 procedural 3D models: filters, grid rendered on one WebGL canvas, viewer dialog |
| `tarifs.html` | Plans, unit prices, custom quote configurator (large companies), pre-filled e-mail |
| `mentions-legales.html` | Legal notice: publisher, host, intellectual property, credits |
| `conditions-generales.html` | Terms of use of the site and terms of sale of the services |
| `confidentialite.html` | Privacy policy (GDPR), no cookies |

## Structure

```
index.html, bibliotheque.html, tarifs.html, mentions-legales.html, conditions-generales.html, confidentialite.html
partials/             nav.html, footer.html — the single source of the shared header nav and footer
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
  motion/             env, intro, counters, word-fill, nav-pill (sliding pill), reveal, stagger
  pages/library.js    library cards + filters; loads the 3D lazily
  pages/pricing.js    plans, table, configurator UI
  pages/legal.js      highlights the current section in the legal table of contents
  three/              build-models (procedural models), materials, library-scene (renderers, viewer)
  pricing/estimate.js quote maths (no DOM, tested by tools/test-estimate.mjs)
  data/models.js      library catalogue
  data/pricing.js     prices and options (EXAMPLES)
vendor/three/         three.js r186 build + OrbitControls + RoomEnvironment
tools/serve.mjs       dev server        tools/test-estimate.mjs  quote tests
tools/sync-partials.mjs  copies partials/ into every page (--check in CI)
assets/fonts, assets/img
```

## Conventions

- Every layout size is `calc(N * var(--u))`, N measured on a 1440 artboard (`--u` = 100vw / 390 on phones).
- The nav and the footer live in `partials/`. Pages hold `<!-- partial:nav -->` / `<!-- partial:footer -->` markers;
  edit the partial, then run `node tools/sync-partials.mjs` (it also sets `aria-current` on the nav). CI fails if a page is stale.
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

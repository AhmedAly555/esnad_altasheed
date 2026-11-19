# Esnad Al-Tasheed (إسناد التشييد) — Project Context

> Current state of the repository after Tasks 1 to 5. Source of truth for colors and tokens is `docs/Esnad-color-palette.md`; engineering and design rules are in `CLAUDE.md`; the task list is `docs/TASKS.md`.
> Last updated: 2026-11-19

## 1. What it is

Corporate website of **إسناد التشييد / Esnad Al-Tasheed** (Latin: ESNAD ALTASHEED), a new Saudi contracting, building and finishing company. Tagline: «نبني .. ونسائد المستقبل».

The repo started as a copy of an Egyptian project (Heaven Life). Its code was rebuilt from scratch; only the layout idea (data-driven projects) and the project photos survive. The old project lives in `legacy/` for reference and must be deleted before launch.

- Arabic is primary: `lang="ar" dir="rtl"`. English comes later as an `/en/` mirror (`dir="ltr"`, Task 8).
- The company has no real projects, clients or certificates yet, so all data is **realistic demo data** flagged `"demo": true` (images: `"imageDemo": true`). The owner replaces it later with real data, a data-only job.
- Branch: `esnad-redesign` (main branch: `main`). Nothing from Task 5 is committed yet.

## 2. Tech stack

Static site, no framework, **zero runtime dependencies**.

- Node >= 22 build scripts in `build/` (zero dependencies). Only dev dependency: Prettier.
- Vanilla JS as ES modules, no globals, no inline handlers.
- CSS bundled by the build from `css/`; design tokens in `css/tokens.css`.
- Icons: small inline SVG (no Font Awesome, AOS or TypeIt).
- Fonts (self-hosted `.woff2`, `font-display: swap`): Noto Kufi Arabic 700 (headings), IBM Plex Sans Arabic 400/500 (body), Inter 400/500 (Latin and digits). Applied only through `--font-heading` and `--font-body` in tokens. (Decision: option A; Cairo was removed.)
- Prettier config: 120 columns, double quotes, trailing commas, LF. `.editorconfig` present.

### Scripts

| Command | What it does |
|---|---|
| `npm run build` | Cleans `dist/`, renders every page, bundles CSS, copies `js/` and `assets/`, then validates the output |
| `npm run dev` | Build plus watch plus static server (`PORT`, default 3000) |
| `npm run check:demo` | Lists every record, image and config value still flagged demo; **exits 1 while any remain**. Must pass before any production deploy |
| `npm run format` / `format:check` | Prettier write / check |

## 3. Directory structure

```
haven-life/
├── CLAUDE.md                 # project rules (read first)
├── docs/                     # Esnad-color-palette.md, TASKS.md, project_context.md
├── content/                  # ALL copy and demo data (JSON)
├── src/
│   ├── templates/base.html   # document shell: head, skip link, header, main, footer, scripts
│   ├── partials/             # reusable markup (see section 6)
│   └── pages/                # one file per page, composed from partials
├── css/
│   ├── tokens.css            # every color, space, radius, shadow, type, motion token
│   ├── fonts.css             # @font-face
│   ├── base/                 # reset, typography, links, utilities
│   ├── layout/               # container, section
│   ├── components/           # one file per component (BEM)
│   └── pages/<page>/*.css    # page-only blocks; bundled to dist/css/pages/<page>.css
├── js/
│   ├── main.js               # loaded on every page
│   ├── lib/                  # dom, env, ease, observe, scroll, validation
│   ├── behaviors/            # one module per behavior, each exports init()
│   └── pages/                # page entry scripts: styleguide, project, contact
├── build/                    # build.mjs, dev.mjs, check-demo.mjs, lib/ (one module per step)
├── assets/                   # fonts/, logo/, favicon.svg, pic/ (legacy), id-1..id-13/ (legacy project photos)
├── legacy/                   # old Heaven Life project, reference only, delete before launch
└── dist/                     # build output (gitignored)
```

## 4. Build system (`build/`)

| Module | Role |
|---|---|
| `build.mjs` | Orchestrates: load content, render pages, bundle CSS, copy static dirs, validate |
| `lib/content.mjs` | Loads every `content/*.json` into a template key named after the file (`site.config.json` becomes `site`). Adds `featuredProjects` and derived values: `site.address.fullAr`, `contact.whatsappUrl` (wa.me with the prefilled Arabic message), `contact.mapUrl` |
| `lib/pages.mjs` | Renders `src/pages/**/*.html` through `base.html`. Supports **collection pages** (see below). Computes `root` (relative path prefix), canonical `path`, `nav` with `aria-current`, per-page CSS and script tags |
| `lib/template.mjs` | Tiny template engine (below) |
| `lib/css-bundle.mjs` | `dist/css/site.css` = tokens, base, layout, components (alphabetical); `dist/css/fonts.css`; one `dist/css/pages/<name>.css` per page folder |
| `lib/validate.mjs` | Fails the build on: duplicate ids, not exactly one `<h1>`, missing local files, **missing `#anchor` targets**, `<img>` without `alt`, missing CSS `url()` files |
| `check-demo.mjs` | Demo-flag report (see section 2) |
| `dev.mjs` | Dev server with rebuild on change |

### Template syntax

- `{{ key }}`: value from context, HTML-escaped; a missing key is a build error.
- `{{> partial a="text" b=some.ref}}`: include `src/partials/partial.html`; quoted args are text, bare args are context values (objects allowed).
- `{{#each list}}...{{/each}}`: body rendered per item with `{{ item }}` / `{{ item.field }}`. Bodies may include partials, which also see `item`. Do not nest `#each` in one template; put the inner loop in a partial.

### Page front matter

`title`, `description` (or `data: <file>` to use that content file's `meta`), `nav: <key>` (current nav item), `header: solid | overlay` (default solid), `css: pages/<name>`, `scripts: pages/<name>`, `robots`.

**Collection pages:** `collection: projects.items`, `as: project`, `param: slug` renders one page per list item at `<folder>/<slug>/index.html`. Title becomes `<item.title> | <company name>` and the description is `item.description`. Used by `src/pages/projects/detail.html` (13 project pages).

## 5. Content files (`content/`)

All demo records carry `"demo": true`. Nothing in this folder is hard-coded in HTML or JS.

| File | Shape and use |
|---|---|
| `site.config.json` | `company` (names, tagline, descriptions), `web` (url, themeColor, locale), `contact` (phone, whatsapp, email), `address`, `legal` (CR, VAT), `hours`, `social[]`, `stats[]` (home strip), `form.endpoint` (contact form action, fake Formspree URL, demo) |
| `ui.json` | Shared UI strings: skip link, header, footer, `contactLabels`, the shared `cta` band, `lightbox` labels |
| `nav.json` | Main navigation: key, label, href |
| `home.json` | `meta` plus hero, about, services, projects, process, stats sections |
| `about.json` | `meta`, hero, story, vision, mission, values, `approach` (same shape as home process, rendered by `process-section`), team (4 demo members) |
| `services.json` | `{ meta, hero, labels, items[] }`. Each item: `id`, `slug`, `title`, `summary`, `lead`, `scope[]`, `steps[]`. Five services |
| `projects.json` | `{ meta, hero, labels, items[] }`. 13 demo projects: `id`, `slug`, `title`, `sector`, `city`, `year`, `role`, `client`, `mainImage`, `imageWidth`, `imageHeight`, `imageAlt`, `gallery[{src,width,height,alt}]`, `description`, `featured`, `demo`, `imageDemo` |
| `contact.json` | `meta`, hero, details, WhatsApp message and CTA, map block, form (field labels, hints, per-field error messages, honeypot label, sending/success/failure texts) |
| `styleguide.json` | Arabic sample text for the temporary styleguide (not flagged demo; the page is removed before launch) |

Demo policy highlights: fake but realistic Saudi values (`+966 50 123 4567`, `info@esnad-demo.sa`, CR `1010000000`), fictional clients, no real certificates or official contractor classification. Legacy project photos stay as layout placeholders flagged `imageDemo`.

## 6. Pages

| URL | Source | Content |
|---|---|---|
| `/` | `pages/index.html` | Hero (overlay header), about teaser, services rows, stats strip, featured projects grid, process steps, CTA band |
| `/about/` | `pages/about/index.html` | Page head, story with vision and mission, values list, approach (process steps), team (text-only roster), CTA |
| `/services/` | `pages/services/index.html` | Page head, sticky jump bar, five anchored sections (`#<slug>`: scope, how we work, CTA to `contact/?type=<slug>`), CTA |
| `/projects/` | `pages/projects/index.html` | Page head, grid of all 13 projects, CTA |
| `/projects/<slug>/` | `pages/projects/detail.html` | 13 generated pages: head (sector, title, description), facts list, main image, gallery with lightbox, CTA |
| `/contact/` | `pages/contact/index.html` | Page head, form card, contact facts, WhatsApp button, map placeholder |
| `/styleguide/` | `pages/styleguide/index.html` | Temporary token and component review page, `noindex`, not linked from the nav. **Delete before launch** |

Home project cards link to `projects/<slug>/`; home service rows link to `services/#<slug>`.

### Partials (`src/partials/`)

`head`, `header`, `footer`, `brand`, `arrow`, `page-head` (args: eyebrow, title, lead), `cta-band` (reads `ui.cta`), `project-card`, `process-section` (arg `source`), `service-section`, `lightbox`, `contact-form`, plus styleguide helpers `sg-components`, `sg-row`, `sg-swatch`.

## 7. CSS architecture

- Order: tokens, base, layout, components, pages. BEM names, low specificity, no `!important`, no IDs for styling.
- **Logical properties only** (no left/right). No hex outside `tokens.css`.
- Dark scope: `.on-dark`, `.section--dark`, `.section--forest`, `.section--gradient` re-point semantic roles (`--heading`, `--link`, outline colors...), so components need no dark variants.
- Reduced motion lives only in `tokens.css` (motion tokens collapse); components never add their own overrides.
- Components: `brand`, `button` (`--gold`, `--outline`, `--sm`), `card`, `cta-band`, `eyebrow`, `facts`, `form`, `form-status`, `gold-line`, `lightbox`, `link-arrow`, `menu-toggle`, `page-head`, `photo`, `process`, `project-card`, `project-grid`, `reveal`, `section-head`, `site-footer`, `site-header`, `site-nav`, `skip-link`.
- Page folders: `home` (hero, about, services, stats), `about` (story, values, team), `services` (jump, detail), `project` (page, gallery), `contact` (page), `styleguide` (page).
- Header: fixed; transparent over the home hero, deep green with a thin gold line when scrolled or on pages without a hero. Header CTA is outline-gold.

## 8. JavaScript

`main.js` (every page) initialises: menu, header state, parallax, process line, then after fonts are ready: headline line split, count-up, reveal.

| Module | Role |
|---|---|
| `behaviors/menu.js` | Mobile menu: aria-expanded, focus trap, Escape, inert page behind |
| `behaviors/header-state.js` | Adds scrolled state via a sentinel |
| `behaviors/reveal.js`, `headline-lines.js`, `count-up.js`, `parallax.js`, `process-line.js` | Scroll-driven motion, all off under reduced motion |
| `behaviors/lightbox.js` | Gallery viewer on native `<dialog>`: arrow keys (direction-aware), Escape, focus return, scroll lock. Falls back to plain links |
| `behaviors/contact-form.js` | Inline validation with per-field messages (`aria-describedby`), posts to the form action with `fetch`, success and failure panels, `?type=` preselect |
| `lib/validation.js` | `fieldProblem()`, Saudi mobile rule, Arabic-Indic digit normalisation |
| `lib/dom.js`, `env.js`, `ease.js`, `observe.js`, `scroll.js` | Shared helpers |
| `pages/project.js`, `pages/contact.js`, `pages/styleguide.js` | Page entries loaded through front matter `scripts:` |

## 9. Assets

- `assets/logo/logo-badge.png` (square badge with dark green background): used in header and footer for now. **To swap in the reversed SVG later, change the `src` on line 2 of `src/partials/brand.html`.**
- `assets/logo/logo-on-light.png`: green logo for light backgrounds; not used yet.
- Both PNGs are about 1 MB; resize or convert in Task 7.
- `assets/id-1..id-13/` and `assets/pic/`: legacy Heaven Life photos kept as placeholders (flagged `imageDemo`); replace before launch.
- `assets/fonts/`: Noto Kufi Arabic (arabic and latin 700), IBM Plex Sans Arabic (400, 500), Inter (400, 500).

## 10. Task progress (`docs/TASKS.md`)

| Task | Status |
|---|---|
| 0 Safety setup | Done |
| 1 Audit and plan | Done |
| 2 Foundation: tokens, base, components, styleguide | Done |
| 3 Shared layout: header, footer, head, config | Done |
| 4 Home page | Done |
| 5 Inner pages: About, Services, Projects (plus detail), Contact | Built and verified, **awaiting approval and commit** |
| 6 Polish pass | Not started |
| 7 SEO, performance, accessibility | Not started (sitemap, robots.txt, JSON-LD, image optimisation, Lighthouse) |
| 8 English version | Not started |

## 11. Legacy issues from the old project: where they were fixed

| # | Legacy issue | Resolution |
|---|---|---|
| 1 | Missing files (`gallery.css`, `projects-filter.js`) | Build validates every local `href`, `src` and CSS `url()` |
| 2 | Filter script crashing on absent selects | Old script deleted; each behavior exits early if its elements are missing |
| 3 | Duplicate `id="main-image"` | Validator fails on duplicate ids |
| 4 | Malformed project HTML, duplicate title | Descriptions are plain text in JSON; titles unique |
| 5 | Header/footer copy-pasted, stray `>` | Single `header`/`footer` partials |
| 6 | Stray `</span>`, unused JS | Rebuilt pages; dead code removed |
| 7 | Invalid robots meta | `robots` defaults to `index, follow` (styleguide: `noindex, nofollow`) |
| 8 | `data-location` mismatch | Cards render from one data record |
| 9 | 51 KB data script on every page | Data is JSON rendered at build time; no client lookup |
| 10 | Missing detail-page icons | Inline SVG only |
| 11 | No contact form | Real form with validation, success state, configurable endpoint |

## 12. Open items and debt

- Replace every demo value and legacy image, then run `npm run check:demo` until it passes (currently reports about 45 items, including the team and `form.endpoint`).
- Set a real form endpoint in `site.config.json` (`form.endpoint`); the demo URL returns an error, which shows the failure panel.
- Map block on the contact page is a neutral placeholder with a working "open in maps" link.
- Projects page has no sector or city filter.
- Delete `src/pages/styleguide/`, its partials, CSS, JS and `styleguide.json` before launch, and delete `legacy/`.
- Add a sitemap, robots.txt, JSON-LD and Open Graph images (Task 7); `docs/` is not part of the build output.

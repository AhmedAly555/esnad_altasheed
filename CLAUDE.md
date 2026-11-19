# Esnad Al-Tasheed (إسناد التشييد) — Corporate Website

You are acting as a **senior front-end engineer with a strong design eye**, working inside a copy of an older project (Heaven Life). This repo is being converted into the website of a new Saudi contracting company. The old project is a reference for structure only. Its content, colors, copy and branding must all go.

## Source of truth
- Colors, tokens, component rules, contrast and RTL notes: `docs/Esnad-color-palette.md`. Read it before touching any CSS. Never invent colors outside it.
- Old project notes: `docs/project_context.md` (describes the legacy code and its known bugs).

## The company (facts you may use)
- Name: إسناد التشييد / Esnad Al-Tasheed (Latin: ESNAD ALTASHEED)
- Saudi contracting, building, construction and finishing company. Tagline: «نبني .. ونسائد المستقبل»
- It is a NEW company. It has no real projects, clients, certificates or statistics yet, so the site is built with **realistic demo data** that the owner will replace with the real client data later.

## Demo data policy (important)
1. Do NOT delete sections or leave them empty. Keep every section, card, grid and page populated so the site looks real and complete during development. Keep the same structure and quantity as the old project (e.g. ~13 project cards, 5 services, contact block, stats strip).
2. Replace the legacy Heaven Life data with realistic **Saudi demo data**: Saudi cities and districts (Riyadh, Jeddah, Dammam, Al Khobar, Makkah...), Saudi-style project names and sectors (villas, residential towers, commercial, schools, healthcare, finishing), plausible years, roles and descriptions in natural Arabic. Never reuse Heaven Life's phone numbers, emails, WhatsApp, social handles, address, or any text that identifies the old Egyptian company.
3. Demo phone/WhatsApp/email/address/CR/VAT must look realistic but be fake: e.g. `+966 50 123 4567`, `info@esnad-demo.sa`, CR `1010000000`. Demo clients must be fictional names, never real companies or government bodies. Demo stats and certificates are fine but must be plausible and modest.
4. **All demo data lives only in `content/*.json` and `content/site.config.json`**, never hard-coded in HTML/JS, and every demo record carries `"demo": true`. This makes replacing it a data-only job.
5. Legacy project images may stay temporarily as layout placeholders (they belong to another company, so they must be replaced before launch). Mark them with `"imageDemo": true`.
6. Add `npm run check:demo` (or equivalent): it lists every record, image and config value still flagged as demo and exits with an error if any remain. It must be run and pass before any production deploy.
7. Arabic is the primary language (`lang="ar" dir="rtl"`). Write natural, confident Saudi-business Arabic. No literal translation tone, no generic filler like "نحن نقدم أفضل الخدمات". Be specific and restrained. English comes later as a mirror (`dir="ltr"`).
8. Saudi context where relevant: Vision 2030, Saudi Building Code, regions and cities (Riyadh, Jeddah, Dammam...), +966 phone format. Do not claim a specific official contractor classification in demo copy; keep that as a flagged demo field.

## Engineering rules
- Layout of the repo: `content/*.json` (all data and UI strings), `src/` (pages, partials, templates), `css/` (`tokens.css`, `base/`, `layout/`, `components/`, `pages/<page>/`), `js/` (`main.js`, `lib/`, `behaviors/`, `pages/`), `build/` (static build, `lib/` holds one module per step), `assets/`, `legacy/` (old project, reference only, delete before launch). `npm run build` bundles CSS into `dist/css/site.css` plus one file per page; `npm run format` runs Prettier.
- Reduced motion lives in `css/tokens.css` only: the motion tokens collapse under `prefers-reduced-motion`, so components use tokens and never write their own overrides.
- Keep it a static site. No framework. A small zero-dependency Node build script is allowed (and preferred) to assemble pages from partials + JSON content, outputting plain static files.
- Single source for header, footer, head/meta: no copy-paste across pages (the old project's biggest flaw).
- All colors, spacing, radii, shadows, type sizes come from CSS variables in one tokens file. No hard-coded hex inside components.
- Use CSS logical properties everywhere (`margin-inline-start`, `padding-inline`, `inset-inline-end`...). No `left/right` for layout.
- Semantic HTML, one `h1` per page, correct landmarks, labels on every form field, visible focus states, `prefers-reduced-motion` respected, WCAG AA minimum.
- Vanilla JS only, small, no global variables, no inline handlers. Remove AOS, TypeIt and Font Awesome from the old project. Icons are a small custom inline-SVG set.
- Images: `.webp`, explicit width/height, `loading="lazy"` below the fold, meaningful Arabic `alt`.
- Fonts: Noto Kufi Arabic (headings), IBM Plex Sans Arabic (body), Inter (Latin). `font-display: swap`, load only the weights used.
- Fix every known bug listed in `docs/project_context.md` §9 when you touch the related code. Do not carry them over.

## Design rules (must NOT look AI-generated or templated)
- Restraint over decoration. Gold is jewelry: thin lines, numbers, one CTA per view.
- No emoji, no stock "icon in a circle + title + 2 lines" grid repeated down the page, no typewriter effects, no floating blobs, no neon glows, no gradient text, no glassmorphism outside dark sections.
- Do not center everything. Use asymmetric layouts, strong grid, large confident type, generous whitespace, real hierarchy.
- Vary section layouts and rhythm, following the section flow in the palette file.
- Motion: one calm, branded system. Reveals 700-900ms, one easing curve, small stagger, tokens in css/tokens.css. Nothing loops, nothing moves without scroll or user action, all off under prefers-reduced-motion.
- Photography directive: big, architectural, with the brand green tint overlay from the palette. Until real photos exist, use neutral solid-color placeholder blocks (never random stock hotlinks).

## Code quality standard (non-negotiable)
Write like a senior front-end engineer who will hand this repo to a team. Every change must meet this bar before you report it done.

**Architecture and patterns**
- One responsibility per file and per function. Small files. If a file grows past ~200 lines (CSS) or ~120 lines (JS), split it.
- Components are built once and reused: partials for markup, one component class per CSS block, one JS module per behavior. Pages only compose components.
- CSS: BEM-style naming (`.block`, `.block__element`, `.block--modifier`), low specificity, no `!important`, no IDs for styling, no deep nesting. Order: tokens, base, layout, components, pages. Page CSS never restyles a component, it uses a modifier.
- JS: ES modules, no globals, no inline handlers. Each behavior exports `init()` and exits early if its elements are not on the page. Shared helpers (observers, easing, DOM utils) live in one `js/lib/` folder and are imported, never copy-pasted.
- Data and copy live only in `content/*.json`. Magic numbers and strings become named tokens or constants.

**No duplication (DRY)**
- Before writing anything, search the repo for an existing token, component, helper or partial. Reuse or extend it.
- If the same pattern appears twice, extract it. If three values repeat, make a token.
- Delete dead code, unused CSS, unused JS and unused assets in the same task that makes them unused. Never leave commented-out code.

**Readability**
- Clear, intention-revealing names in English for code (classes, functions, variables), Arabic only in content.
- Consistent formatting across the repo (indentation, quotes, ordering of CSS properties by groups). Add Prettier/EditorConfig if missing.
- Comments explain "why", never "what". No narrating comments.

**Definition of done (check before reporting)**
1. `npm run build` passes with no warnings.
2. No duplicated blocks, no unused selectors or files introduced.
3. No hex or left/right outside tokens, no hard-coded copy in HTML/JS.
4. Works at 360 / 768 / 1280 / 1920 and with `prefers-reduced-motion`.
5. Report lists files changed and any cleanup done. If you spotted debt you did not fix, say so.

If an existing file violates this standard, fix it when you touch it, and mention it in the report.

## Working style
- Work in small, reviewable steps. For anything touching architecture, **plan first, wait for approval**, then implement.
- After each task: list files changed, what to check in the browser, and what you intentionally left undone. Then stop. Do not start the next task unless asked.
- Never delete files without listing them first. Commit after each approved task with a clear message.
- If something is ambiguous, ask one precise question instead of guessing.
- Do not add code comments that narrate the obvious. Comment only the "why".

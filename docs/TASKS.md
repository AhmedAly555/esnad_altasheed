# Esnad Website — Task Prompts for Claude Code

How to use: run **one task at a time**. Paste the prompt, review, test in the browser, approve, then `/clear` before the next task (saves your plan usage). Tasks 1 and 2 start in Plan Mode (press Shift+Tab until you see "plan mode").

---

## Task 0 — Safety setup (you do this manually, 2 minutes)

```bash
cd <your-copied-project-folder>
git init && git add -A && git commit -m "baseline: heaven life copy"
git checkout -b esnad-redesign
```
Put `CLAUDE.md` in the project root. Make sure `Esnad-color-palette.md` and `project_context.md` are also in the root. Then run `claude`.

---

## Task 1 — Audit and architecture plan (Plan Mode, no code changes)

```
Read CLAUDE.md, Esnad-color-palette.md and project_context.md, then inspect the actual code in html/, css/, js/ and assets/.

Do NOT change any file yet. Produce a written plan:
1. What from the Heaven Life codebase is worth keeping (structure ideas, data-driven projects) and what must be deleted.
2. A proposed folder structure for the Esnad site (src partials, content JSON, css tokens/base/components/pages, js modules, assets, dist output).
3. Your recommendation for removing header/footer duplication: a zero-dependency Node build script vs JS injection. Give pros/cons for a static site that needs good Arabic SEO and will be deployed on Netlify or Cloudflare Pages. Recommend one.
4. A page map: home, about, services, projects, project detail, contact (+ optional privacy page). Also propose the demo-data plan: which legacy data (13 projects, contact details, stats, services) gets replaced by realistic Saudi demo data, per the Demo data policy in CLAUDE.md. Do not delete any section.
5. List of every legacy bug from project_context.md section 9 and where it will be fixed.
6. Risks and open questions for me.

Keep it under 2 pages. Stop and wait for my approval.
```

---

## Task 2 — Foundation: design tokens, typography, RTL base

```
Implement the approved plan's foundation only. No page content yet.

1. Create the new folder structure and the build setup we agreed on.
2. css/tokens.css: copy the :root variables from Esnad-color-palette.md exactly, plus a spacing scale (4px base), radius scale, type scale (fluid with clamp), container widths, z-index scale, and transition tokens.
3. css/base.css: modern reset, RTL-first defaults (lang="ar" dir="rtl"), body 17-18px / line-height 1.8 for Arabic, heading styles (Noto Kufi Arabic 700, green on light, ivory on dark), link and focus styles from the palette, selection color, scrollbar styling that stays subtle.
4. css/components.css: buttons (primary light, primary dark gold, outline), cards (light and dark glass), gold-line divider with optional diamond, form fields. Follow section 10 of the palette file exactly.
5. Fonts: set up Noto Kufi Arabic, IBM Plex Sans Arabic and Inter with font-display swap, only the weights we use.
6. Create a temporary /styleguide page showing every token, type style and component on both ivory and dark green backgrounds, so I can review it visually. This page must not be linked from the site nav.

Use logical properties only. No hard-coded hex outside tokens.css. When done, list files and stop.
```

---

## Task 3 — Shared layout: header, footer, SEO head, config

```
Build the shared layout once, used by every page.

1. content/site.config.json: company names (ar/en), tagline, phone, WhatsApp, email, address, CR number, VAT number, social links, working hours. Fill it with realistic fake Saudi demo values (phone, WhatsApp, email, address, CR, VAT, hours, social links), each flagged "demo": true. Do not reuse any Heaven Life contact data.
2. Head partial: charset, viewport, title/description per page, canonical, Open Graph, Twitter card, theme-color (#013A1E), favicon links, hreflang placeholders for ar/en.
3. Header: logo (ivory/green version per palette section 11), nav: الرئيسية، من نحن، خدماتنا، مشاريعنا، تواصل معنا, plus a language switch placeholder and one gold CTA "اطلب عرض سعر". Transparent over the hero, turns deep green with a thin gold line on scroll. Accessible mobile menu (focus trap, Esc to close, aria-expanded), no hamburger-icon hacks.
4. Footer on green-950 with a gold line on top: logo (reversed version), short company line, quick links, contact details from config, copyright with the current year. No "Crafted by" credit from the old project.
5. Remove the legacy header.html, header.js, script.js duplication.

If the logo files are missing, use a clearly named placeholder file and tell me which asset to drop in and at what path.
Stop after listing files changed.
```

---

## Task 4 — Home page

```
Build the home page following the section flow in section 9 of the palette file, in Arabic, RTL.

Sections: hero (deep green + overlay, strong headline, one gold CTA and one outline CTA), about teaser (asymmetric layout, not centered), services (vary the layout, avoid a repetitive icon-card grid), why Esnad / how we work (numbered process with gold line dividers), projects teaser, CTA band with glass card, footer.

Rules:
- Write real, specific Arabic copy for a Saudi contracting company that is new and ambitious: emphasis on quality, schedule discipline, safety, transparent communication. No empty superlatives. Demo stats must be modest and plausible and come from the config file.
- The stats strip and the projects teaser are fully populated from demo data in content/*.json (never hard-coded in HTML). They render whatever the data contains, so swapping in real client data later needs no code change.
- Hero image: neutral placeholder block now, structured so I can drop in a real photo.
- Subtle scroll reveals only, using IntersectionObserver, respecting prefers-reduced-motion.
- Mobile first. Check 360px, 768px, 1280px, 1920px.

Stop after listing files and what to review.
```

---

## Task 5 — Inner pages: About, Services, Projects, Contact

```
Build the four inner pages using the existing layout and components.

- About (من نحن): vision, mission, values, approach. Include a team block with fictional demo members flagged demo.
- Services (خدماتنا): General contracting, structural works, finishing and interior fit-out, renovation and maintenance, project management and supervision. One strong page with anchored sections, each with scope, how we work, and a CTA. Data in content/services.json.
- Projects (مشاريعنا): data-driven from content/projects.json (fields: id, slug, title, sector, city, year, role, client, mainImage, gallery, description). Populate it with ~13 realistic Saudi demo projects (keep the old project's card count, gallery and detail structure), all flagged demo. Keep the legacy images temporarily as placeholders flagged imageDemo. Project detail template with gallery and accessible lightbox (keyboard + Esc + focus return).
- Contact (تواصل معنا): phone, WhatsApp, email, address, map placeholder, and a real form (name, phone, email, project type, message) with validation, accessible error messages, and a success state. The form action is configurable in site.config.json (Formspree or similar); do not hard-code an endpoint. Also add a WhatsApp deep link with a prefilled Arabic message.

Fix the legacy issues: no duplicate ids, valid HTML, no missing files.
Stop after listing files.
```

---


## Task 6 — Polish pass: "does it look human-made?"

```
Review the whole site as a critical art director.

1. Hunt for AI/template tells: repeated identical card grids, symmetrical centered layouts everywhere, generic icons, filler copy, uniform spacing, overused rounded-corner-shadow cards, decoration without purpose. Fix them with real layout variation and tighter copy.
2. Check typography: Arabic line-height, weights, widows, number formatting (Arabic vs Latin digits consistently), punctuation direction in mixed AR/EN strings.
3. Check color discipline against palette sections 7, 8 and 14 (gold usage, contrast, forbidden combinations).
4. Check the gold is metallic (3-stop gradients) and never flat orange.
5. Motion: remove anything that loops or distracts.
Give me a before/after list of what you changed. Do not add new features.
```

---

## Task 7 — SEO, performance, accessibility

```
Production readiness.

- SEO: unique title and meta description per page in Arabic, canonical URLs, Open Graph images, sitemap.xml, robots.txt with a valid directive, JSON-LD (Organization and GeneralContractor, built from site.config.json (still demo values for now)), clean slugs.
- Performance: optimize images, preload the critical font, defer scripts, no layout shift, target Lighthouse 95+ on mobile for Performance, Accessibility, Best Practices, SEO.
- Accessibility: keyboard-only walkthrough of every page, skip link, aria correctness, color-contrast audit against palette section 7.
- Cross-browser: Safari iOS and Chrome Android notes, especially RTL and backdrop-filter fallbacks.
- Run an HTML validity check and a broken-link check, and report results.
- Run `npm run check:demo` and report every record, image and config value still flagged as demo. Do not remove them; I will replace them with real client data.
```

---

## Task 8 — English version

```
Add the English mirror of the site (dir="ltr"), reusing the same components and content structure.

- Separate URL space (/en/) with hreflang pairs, a working language switch that goes to the equivalent page.
- Translate by meaning, in confident professional English, not word for word.
- Verify that logical properties flip layouts correctly and that nothing is hard-coded left/right.
- Update sitemap and JSON-LD.
```

---

## Tips for the $20 plan

- One task per session, `/clear` between tasks, `/compact` if a session gets long.
- Use Plan Mode for Tasks 1 and 2 so no tokens are wasted on wrong directions.
- Commit after every approved task so you can roll back with `git checkout`.
- If Claude Code puts demo data in HTML/JS instead of the content JSON files, or reuses Heaven Life contact details, point it back to the Demo data policy in `CLAUDE.md`.

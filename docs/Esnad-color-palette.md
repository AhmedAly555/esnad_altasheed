# Esnad Al-Tasheed (إسناد التشييد) — Color Palette & Design Tokens

> Source of truth for all web colors. Claude Code: read this file before writing any CSS/HTML/Tailwind. Never invent colors outside this file. Every value was sampled from the final logo (deep forest green + brushed gold) and matches the Word letterhead.

**Brand character:** Trusted · Premium · Structural · Saudi. Deep green carries authority and national identity; gold carries quality and craftsmanship. Ivory keeps everything warm and human instead of cold-corporate.

---

## 1. Core Brand Colors (from the logo)

| Role | Token | HEX | Use |
|---|---|---|---|
| Forest Green (primary) | `--green-700` | `#013A1E` | Primary brand color, headings, primary buttons, footer |
| Deep Green | `--green-900` | `#00240F` | Hero/dark sections, navbar on scroll, dark backgrounds |
| Midnight Green | `--green-950` | `#04180C` | Deepest background, overlays, text on gold |
| Emerald | `--green-500` | `#0A5A2D` | Hover states, icons, secondary accents |
| Leaf | `--green-400` | `#1F7A44` | Links on light bg (hover), success states |
| Gold (primary accent) | `--gold-500` | `#D89C24` | Accent, key lines, icons, CTA on dark |
| Bright Gold | `--gold-300` | `#F0C03C` | Highlights, gradient peak, hover on dark |
| Antique Gold | `--gold-600` | `#B47818` | Decorative lines, borders, gradient low end |
| Bronze Gold | `--gold-800` | `#8A5E0C` | Gold **text** on light backgrounds (accessible) |

## 2. Neutrals (warm, never pure gray)

| Token | HEX | Use |
|---|---|---|
| `--ivory` | `#FAF7F0` | Main page background (instead of pure white) |
| `--sand` | `#F1EBDD` | Alternate section background, cards on ivory |
| `--line` | `#E3DCCB` | Borders, dividers on light |
| `--stone` | `#6B7168` | Secondary/muted text on light |
| `--graphite` | `#2B332E` | Body text on light |
| `--ink` | `#0B1410` | Strongest text, near-black |
| `--white` | `#FFFFFF` | Cards, form fields, text on green |
| `--mist` | `#C9D6CD` | Secondary text on dark green |

## 3. Functional Colors

| Token | HEX | Use |
|---|---|---|
| `--success` | `#1F7A44` | Success messages |
| `--warning` | `#D89C24` | Warnings (reuse gold) |
| `--error` | `#B3261E` | Errors, form validation |
| `--info` | `#2F5D7C` | Info notices (muted steel blue, used sparingly) |

---

## 4. Gradients

Gold gradients must always look like brushed metal (3 stops, diagonal), never flat orange.

```css
--grad-gold: linear-gradient(135deg, #8A5E0C 0%, #D89C24 38%, #F0C03C 55%, #B47818 100%);
--grad-gold-soft: linear-gradient(135deg, #D89C24 0%, #F0C03C 100%);
--grad-green: linear-gradient(160deg, #0A5A2D 0%, #013A1E 45%, #00240F 100%);
--grad-hero: linear-gradient(180deg, rgba(4,24,12,.55) 0%, rgba(0,36,15,.92) 100%); /* overlay on hero photo */
--grad-gold-line: linear-gradient(90deg, transparent, #D89C24 20%, #F0C03C 50%, #D89C24 80%, transparent);
```

## 5. CSS Variables (copy as-is into `:root`)

```css
:root {
  /* Green */
  --green-950: #04180C;
  --green-900: #00240F;
  --green-700: #013A1E;
  --green-500: #0A5A2D;
  --green-400: #1F7A44;

  /* Gold */
  --gold-300: #F0C03C;
  --gold-500: #D89C24;
  --gold-600: #B47818;
  --gold-800: #8A5E0C;

  /* Neutrals */
  --ivory: #FAF7F0;
  --sand: #F1EBDD;
  --line: #E3DCCB;
  --stone: #6B7168;
  --graphite: #2B332E;
  --ink: #0B1410;
  --white: #FFFFFF;
  --mist: #C9D6CD;

  /* Functional */
  --success: #1F7A44;
  --error: #B3261E;
  --info: #2F5D7C;

  /* Semantic (use these in components, not raw colors) */
  --bg: var(--ivory);
  --bg-alt: var(--sand);
  --bg-dark: var(--green-900);
  --surface: var(--white);
  --text: var(--graphite);
  --text-strong: var(--ink);
  --text-muted: var(--stone);
  --text-on-dark: var(--ivory);
  --text-muted-on-dark: var(--mist);
  --primary: var(--green-700);
  --primary-hover: var(--green-500);
  --accent: var(--gold-500);
  --accent-text: var(--gold-800);
  --border: var(--line);

  /* Glass (dark sections only) */
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(240, 192, 60, 0.22);
  --glass-blur: 16px;

  /* Shadows (green-tinted, never pure black) */
  --shadow-sm: 0 1px 2px rgba(0, 36, 15, 0.08);
  --shadow-md: 0 8px 24px rgba(0, 36, 15, 0.12);
  --shadow-lg: 0 24px 60px rgba(0, 36, 15, 0.22);
  --shadow-gold: 0 8px 30px rgba(216, 156, 36, 0.28);
}
```

## 6. Tailwind Config (if the project uses Tailwind)

```js
colors: {
  green: { 950:'#04180C', 900:'#00240F', 700:'#013A1E', 500:'#0A5A2D', 400:'#1F7A44' },
  gold:  { 300:'#F0C03C', 500:'#D89C24', 600:'#B47818', 800:'#8A5E0C' },
  ivory: '#FAF7F0', sand: '#F1EBDD', line: '#E3DCCB',
  stone: '#6B7168', graphite: '#2B332E', ink: '#0B1410', mist: '#C9D6CD',
}
```

---

## 7. Approved Combinations & Contrast (WCAG)

| Text on Background | Ratio | Verdict |
|---|---|---|
| Ivory `#FAF7F0` on Forest `#013A1E` | 12.1 : 1 | AAA — body text OK |
| Ivory on Deep Green `#00240F` | 15.6 : 1 | AAA |
| Gold `#D89C24` on Deep Green `#00240F` | 6.9 : 1 | AA — OK for headings, buttons, icons |
| Bright Gold `#F0C03C` on Forest `#013A1E` | 7.6 : 1 | AAA |
| Ink `#0B1410` on Ivory | 17.5 : 1 | AAA |
| Graphite `#2B332E` on Ivory | 12.2 : 1 | AAA — default body text |
| Stone `#6B7168` on Ivory | 4.7 : 1 | AA — muted text only |
| Bronze `#8A5E0C` on Ivory | 5.3 : 1 | AA — the **only** gold allowed for text on light |
| Mist `#C9D6CD` on Forest | 8.6 : 1 | AAA |

**Forbidden:**
- Gold `#D89C24` or `#B47818` as **text** on ivory/white (2.4:1 and 3.5:1 — fails). Use `--gold-800` for text, or use gold only as lines/icons/large decoration on light backgrounds.
- White text on gold (2.4:1). Text on gold buttons must be `--green-950`.
- Green text on green background, gold on gold.
- Pure black `#000` and pure gray anywhere.
- Any blue, purple, or bright/neon color besides the functional `--info`.

## 8. Usage Ratio (60 / 30 / 10)

- **60%** — Ivory / Sand (light sections) and Deep Green (dark sections), alternated for rhythm
- **30%** — Forest/Deep Green as brand presence (nav, footer, headings, buttons)
- **10%** — Gold, used with discipline: thin lines, icons, numbers, one CTA per view, hover details

Gold is jewelry, not paint. If a screen feels "yellow", reduce it.

## 9. Section Rhythm (recommended page flow)

1. Hero — Deep green + photo overlay `--grad-hero`, ivory text, gold CTA
2. About / Services — Ivory
3. Stats strip (projects, years, sqm) — Forest with gold numbers
4. Projects — Sand
5. Why us / Process — Ivory with gold line dividers
6. Clients / Certifications — White card on Sand
7. CTA band — `--grad-green` with glass card
8. Footer — `--green-950`, mist text, gold line on top

## 10. Component Rules

**Buttons**
- Primary on light: bg `--green-700`, text `--ivory`, hover bg `--green-500`, radius 10px, shadow `--shadow-md`
- Primary on dark: bg `--grad-gold-soft`, text `--green-950`, hover brightness 1.08 + `--shadow-gold`
- Secondary (outline): 1.5px border `--gold-500` on dark / `--green-700` on light, transparent bg, hover fills
- Focus ring: `outline: 3px solid rgba(216,156,36,.55); outline-offset: 3px`

**Cards**
- Light: bg `--white`, border 1px `--line`, radius 16px, `--shadow-sm` → `--shadow-md` on hover with 4px lift
- Dark glass: bg `--glass-bg`, border 1px `--glass-border`, `backdrop-filter: blur(var(--glass-blur))`, radius 16px

**Dividers / Section accents**
- A 2px `--grad-gold-line` under section titles (width 64–96px, centered or aligned to reading start). Echoes the gold curve and the diamond divider in the logo.
- Optional small gold diamond (rotated 8px square) in the middle of long dividers, like the logo tagline divider.

**Forms**
- Field bg `--white`, border `--line`, focus border `--green-500` + gold focus ring, error border `--error`
- Labels `--graphite`, placeholders `--stone`

**Links**
- On light: `--green-700`, underline on hover in `--gold-500`
- On dark: `--gold-300`, hover `--ivory`

**Images**
- Project photos get a subtle green tint overlay (`rgba(0,36,15,.18)`) for brand cohesion
- Never place the logo on a busy photo without a `--green-950` panel behind it

## 11. Logo Placement

- The logo (green + gold) sits on **ivory, white, or sand only**.
- On green/dark backgrounds, use a white-and-gold reversed version (green parts become ivory `#FAF7F0`, gold stays). Do not place the green logo on green.
- Clear space around the logo = the height of the crane hook on all sides. Minimum width: 120px on screen.

## 12. Typography Pairing (for color-weight consistency)

- Arabic headings: **Noto Kufi Arabic** (700), matches the geometric weight of the wordmark
- Arabic body: **IBM Plex Sans Arabic** (400/500)
- Latin: **Inter** or **Plus Jakarta Sans**
- Headings: `--green-700` on light, `--ivory` on dark. Never gold for long headings, only for key words or numbers.
- Body size 17–18px, line-height 1.8 for Arabic.

## 13. RTL Notes

- Default direction `rtl`, `lang="ar"`; English version flips with `dir="ltr"`.
- Use logical properties (`margin-inline-start`, `padding-inline`, `inset-inline-end`) so gradients, borders, and layouts flip correctly.
- Directional gradients (`--grad-gold-line`) are symmetric on purpose, so they need no flipping.

## 14. Quick Do / Don't

| Do | Don't |
|---|---|
| Ivory backgrounds, warm and premium | Pure white full-page backgrounds |
| One gold CTA per viewport | Gold everywhere |
| Green-tinted shadows | Gray/black drop shadows |
| 3-stop metallic gold gradients | Flat yellow or orange |
| Generous whitespace, big photography | Dense, cluttered sections |
| Semantic variables (`--primary`, `--accent`) | Hard-coded hex in components |

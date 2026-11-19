# Deploying (Netlify / Cloudflare Pages)

## Staging settings

| Setting               | Value                                         |
| --------------------- | --------------------------------------------- |
| Build command         | `npm run build`                               |
| Output directory      | `dist`                                        |
| Environment variables | `NODE_VERSION=22` and `ESNAD_STAGING=1`       |

With `ESNAD_STAGING=1` the build adds `noindex, nofollow` to every page, writes a
`robots.txt` that disallows everything, adds `dist/_headers` with `X-Robots-Tag`, and skips `sitemap.xml`.
Locally, `npm run build:staging` does the same on Windows and Linux.

## At launch

1. Remove the `ESNAD_STAGING` environment variable from the platform.
2. Set `web.url` in `content/site.config.json` to the real domain.
3. Run `npm run check:demo` until it passes.

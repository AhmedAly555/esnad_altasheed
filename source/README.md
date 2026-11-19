# Source files

Originals that are **not** shipped: the build only copies `assets/`, `js/` and the bundled CSS.

| File                     | Shipped as                       | Why that size                                                                        |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| `logo/logo-badge.png`    | `assets/logo/logo-badge.webp`    | 192 px square: shown at 44 px, so this stays sharp up to 4x pixel density            |
| `logo/logo-on-light.png` | `assets/logo/logo-on-light.webp` | 640 px wide, WebP quality 0.9 with alpha, for the light-background logo (unused yet) |

Re-export from the originals at the same sizes if the logo changes. Never link anything in this folder from a page.

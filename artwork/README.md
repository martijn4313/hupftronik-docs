# Artwork sources

Full-resolution source images for the Hüpftronik mascot, logo, and icons. They live outside `docs/`
so they are not deployed with the site.

The site uses smaller derived copies:

| Source | Derived file(s) in `docs/` |
|---|---|
| `hupftronik_logo.png` | `assets/pictures/hupftronik_logo_header.png` (header logo, 96 px high) |
| `hupftronik_lowress.png` | `assets/pictures/hupftronik_banner.webp` (homepage banner), `assets/icons/cards/about.png` |
| `volvo_turbo_hare.png` | `assets/icons/volvo_turbo_hare.webp` (Volvo guide), `assets/icons/cards/vehicles.png` |
| `turbo-boost-orange.png` | `assets/icons/favicon.png`, `assets/icons/cards/tuning.png` |
| `turbo-blue.png` | `assets/icons/cards/product.png` |
| `settings-dark.png` | `assets/icons/cards/tools.png` |
| `info_reading.png` | `assets/icons/cards/getting-started.png` |
| `welcome_banner.png` | not used yet |
| `board-photo-24p-v1.jpg` | `products/motorsteuergerat-24p-v1/board-layout.webp` (annotated, cropped, 1100 px wide) |

When you change a source image, regenerate its derived copies: WebP at quality 85–90 for
illustrations shown on pages, and PNG scaled to display size (128 px high for cards) for small
icons. Keep each file served on the site under 300 KB.


# FreshFind — Fresh All Along

A frontend-only React + Vite single-page app that helps residents of Doha and Qatar find local farmers markets, see which are open **right now**, and learn what produce is in season. Built for the Aptech Techwiz “Web Innovation Unleashed” SRS.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve dist/ locally
```

Requires Node 18+. Deploys as static files. Asset paths are absolute (`/assets/...`), so the site expects to live at the domain root; for a sub-folder (e.g. GitHub Pages), set `base: '/your-folder/'` in `vite.config.js`.

## How it works

- **Journey:** Home (painted market arch) → Enter the market → **Market globe** (every market and crop as tiles on a sphere) → scroll/drag/“Explore markets” **unfolds** the sphere into a curved **archive wall** → open any tile → detail sheet → close flies the image back → **Return to globe** folds it up again. Reverse scrolling in the archive only pans; only “Return to globe” rebuilds the sphere.
- **3D engine:** `src/components/MarketWorld.jsx` renders DOM tiles in CSS 3D and writes one `matrix3d` per tile per frame (position lerp + quaternion slerp in `src/lib/quat.js`). No WebGL or animation libraries, so the only runtime dependencies are React and ReactDOM.
- **Routing:** hash routes — `#/`, `#/explore`, `#/markets`, `#/markets/:id`, `#/produce`, `#/produce/:id`, `#/seasonal`, `#/saved`, `#/about`, `#/contact`. Directory filters are kept in the URL, so links are shareable.
- **Data:** static JSON in `src/data/` (`markets.json`, `produce.json`, `seasonal.json`, `chatbot.json`, `site.json`). Edit these to change content; schedules use `day` 0 = Sunday … 6 = Saturday and 24-hour times.

## SRS checklist

| Requirement | Where |
|---|---|
| Home: Quick Find (area / day / produce), highlights (open now, nearby, featured, seasonal picks) | `IntroScene`, `QuickFind`, `FeaturedShowcase` |
| Market directory: name, area, days, hours, description, thumbnail; filter by area/day/produce; sort A–Z / next open / nearest | `Markets.jsx` → `MarketDirectory` |
| Market details: address, map, weekly schedule, typical produce, bookmark, note, share, breadcrumbs | `Markets.jsx` → `MarketDetail` |
| Geolocation with graceful denial (choose a neighbourhood instead) | `useGeolocation.js`, `LocationBar` |
| Open-now logic from real schedules + real-time clock | `lib/schedule.js`, `Clock.jsx` |
| Produce guide with category filter and seasons | `Produce.jsx` |
| Seasonal recommendations (month wheel, weekly picks, ending soon) | `SeasonalPicks.jsx` |
| Bookmarks (localStorage), notes (sessionStorage), export .txt, copy, print, share | `useBookmarks.js`, `BookmarksPanel.jsx` |
| Floating chatbot with quick replies and links (rule-based, no live AI) | `Chatbot.jsx`, `lib/chatEngine.js` |
| Contact with map and live-location toggle; About with team | `Info.jsx` |
| Visitor counter, breadcrumbs, dummy login/signup, global search (`/`) | `VisitorCounter`, `UI.jsx`, `AuthDialog`, `SearchOverlay` |
| Responsive (desktop / tablet / phone), keyboard access, reduced motion, print styles | `freshfind.css`, all components |

## Visual notes

- **Vines** are SVG (`src/components/Vines.jsx`), not bitmaps: stems grow along their curve and leaves unfurl (~1 s), then only a slight idle sway. Variants: `sheet` (content-sheet corner), `auth` (login / sign-up), `sprig` (hero-box corners). Static under `prefers-reduced-motion`.
- **Globe composition:** side columns share `--side-w` / `--side-m`, and `MarketWorld.measure()` sizes the globe so it always has clear air between the left panel and the right card. Tiles are grouped into latitude bands by category (markets, fruits, vegetables, herbs, dairy & eggs); each orbit tag sits level with its band and lights that category on hover.
- **Produce art:** all produce images are 400×420 canvases with the art fitted to one box. `tools/normalize_sprite_produce.py` regenerates the nine painted-sprite items (herbs, sunflowers, lavender, microgreens) onto that canvas.

## Tests

`test/e2e.mjs` is a Playwright script (55 checks: world interactions, filters, sorting, geolocation granted/denied, storage, export, chatbot, search, keyboard, reduced motion). It expects the built site served on `http://localhost:4173` (`npm run build && npm run preview -- --port 4173`) and Playwright installed (`npm i -D playwright`; adjust the import path at the top of the file). `test/*.test.mjs` are unit tests for the rotation maths, wheel handling and chatbot.

## Assumptions (for the ReadMe document)

- Market names, addresses and team members are fictional demo content, placed in real Qatar areas (West Bay, Al Sadd, Al Rayyan, Al Wakrah, Lusail, The Pearl, Katara, Old Airport …) with coordinates that match those areas.
- “Open now” uses the visitor’s device clock and time zone.
- Local crops follow Qatar’s cool growing season (about November–April); regional orchard fruit follows its own harvest. The weekend is Friday–Saturday.
- The visitor counter is simulated and stored in the browser (no backend, per SRS).
- Login/Sign-up are non-functional previews; nothing is stored or sent.
- Maps use Google Maps embeds and fonts load from Google Fonts, so both need an internet connection.
- Native sharing uses the Web Share API where available; otherwise WhatsApp / X / Facebook / email links and copy-link are offered.

## Tools and credits

Market scenes, botanical sprites and UI-kit artwork come from the project’s supplied concept sheets (`tools/build_assets.py` extracts and compresses them). Produce illustrations are generated SVG artwork (`tools/produce-art/`). AI assistance (Claude) was used to write code and documentation; all content and behaviour were reviewed and tested in the browser.
=======
# Fresh-Find
A farmers market ecommerce website
>>>>>>> dd68b8544fe435b44aa4543d2e196e90adacb9e2

# MoilanenAri.fi — verkkokaupan konseptidemo

A frontend-only redesign prototype for **Moilanen Ari** (used professional kitchen equipment and
Eurowagon trailers, Joensuu). It shows how a rebuilt online store could look and behave.

> **This is not a working store.** There is no backend, no payments, no order submission and no
> data collection. Every demo-only interaction is labelled "Demo" in the UI.

## Running locally

Requires Node.js 20.19+ (developed on Node 24).

```bash
npm install
npm run dev          # http://localhost:5180 (opens the browser)
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build on http://localhost:4180
npm run lint         # oxlint
npm run sync-catalog # re-import products from the live site (read-only, see below)
```

## Design concept — "Varastoluettelo"

An editorial equipment catalogue rather than a template store.

- **Palette:** warm paper (`#f2f0ea`), graphite ink (`#121416`), steel greys and a single
  "infrared" signal orange (`#e5501e`), the glow of a heating element. All tokens are in `src/index.css`.
- **Type:** Archivo variable (the width axis pushed to 125% for nameplate-like headlines) with
  IBM Plex Mono for inventory-tag details: item numbers, stock, specs. Both are self-hosted via Fontsource.
- **Details:** sharp corners, hairline rules, printer's crop marks on photos, running section
  numbers, and the original "MOILANEN | ARI.FI" boxed wordmark redrawn in type.
- **Photography:** the real warehouse photos are presented as a feature (every product is the
  actual item), framed consistently on a neutral ground.

## Structure

```
scripts/
  sync-catalog.mjs   Store API → local dataset + optimised WebP images
  curation.mjs       name tidy-up, department mapping, seller fault notes
src/
  types/catalog.ts   domain model (Product, Category, Price, Availability…)
  data/              generated products, departments, verified company facts, merchandising
  lib/catalog.ts     data access layer (CatalogRepository) + hooks
  lib/productQuery.ts search / filter / sort, URL ⇄ query mapping
  lib/specs.ts       pulls key facts from seller descriptions (never inferred)
  cart/              cart reducer, persistence, context (demo, localStorage)
  components/        layout, home sections, product, catalog, ui primitives
  pages/             Home, Catalog, Product, Cart, Checkout, About, Contact, 404
```

Routes: `/`, `/tuotteet`, `/tuotteet/:osasto`, `/tuote/:slug`, `/ostoskori`, `/kassa`, `/yritys`,
`/yhteystiedot`.

## Where the content comes from

`npm run sync-catalog` performs **GET requests only** against the public WooCommerce Store API of
moilanenari.fi (120 products, publish dates) and writes `src/data/products.generated.ts` plus images
under `public/images/products/` (max 6 per product, 1100px + 560px WebP). Raw responses are cached
in `scripts/.cache` (git-ignored).

Editorial changes on top of the live data:

- Product **names** were tidied (ALL CAPS, typos, price text in titles). See `nameOverrides`.
- About 80 overlapping WooCommerce categories were consolidated into **9 departments**.
- **Condition** labels are only shown when the seller's own text states one. Nothing is guessed.
- "Hinta sis. alv" sentences were removed from descriptions. VAT (25,5 %) is stated once, site-wide.
  Some original texts still mention the old 24 % rate.
- Listings covering several items ("hinnat alkaen") are shown as *alk.* prices and use
  "Pyydä tarjous" instead of add-to-cart. Listings with no price are shown as *Kysy hintaa*.

Company facts in `src/data/company.ts` come from the current site's header, front page and contact
page. The About page's company story is an explicitly marked **placeholder**.

## Demo vs. real functionality

| Feature | In this demo | Production |
| --- | --- | --- |
| Catalogue, search, filters, sort | Works on the local dataset | Same UI, API-backed |
| Cart | Local only (`localStorage`), stock-limited quantities | Server cart with stock checks |
| Checkout | 4-step concept; ends in a "this is a demo" dialog | Real order + payment provider |
| Payments | No payment fields at all | Hosted payment page (e.g. Paytrail / Stripe) |
| Contact form | Validates, then shows a demo message; nothing is sent | Sends to info@moilanenari.fi |
| Financing link | Real link to Rahoitusturva | Same |

## Connecting a backend later

- **Catalogue:** implement `CatalogRepository` (`src/lib/catalog.ts`) with real API calls and swap
  the `catalog` export. Pages use `useProducts()` / `useProduct()` built on promises + React `use()`,
  so a Suspense boundary is all that needs adding for loading states.
- **Query:** `ProductQuery` in `src/lib/productQuery.ts` maps 1:1 to URL params and can be
  forwarded to a search endpoint.
- **Cart:** `cartReducer` is pure. Lines carry a price/name snapshot, as a server cart response would.
  Replace `loadCart`/`saveCart` with API calls and validate prices server-side.
- **Checkout:** `CheckoutPage` collects contact, delivery and payment choice; wire the final step to
  an order endpoint that redirects to the payment provider.

## Deployment notes

Every push to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`:
<https://samijturunen01.github.io/moilanenari-demo/>

- The site is served under `/moilanenari-demo/`, so the workflow builds with
  `VITE_BASE=/moilanenari-demo/`. The router `basename` and product image URLs follow
  `import.meta.env.BASE_URL`, so a custom domain or another host only needs a different `VITE_BASE`
  (default `/`).
- This is a client-side routed SPA. The workflow copies `index.html` to `404.html` so deep links
  work on Pages; other hosts need their own fallback (Netlify `_redirects`, Vercel rewrites).
- `index.html` has `noindex` set while the site is a demo. The live moilanenari.fi site is untouched.

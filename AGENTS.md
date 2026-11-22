# ShopLedger

## Stack
- Node.js CommonJS app using Express and body-parser; `server.js` serves static files from `public/` and mounts the API routers.
- Browser UI is plain HTML, CSS, and JavaScript; application data is stored in `data/db.json` through `lib/store.js`.
- `package.json` declares Express `^4.17.1` and body-parser `^1.19.0`.

## Module map
- `routes/customers.js` — lists customers and settlements; records customer settlements.
- `routes/orders.js` — lists and fetches orders, places orders, and cancels orders.
- `routes/products.js` — lists/searches products and lists active coupons.
- `routes/reports.js` — dashboard and GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — normalizes, validates, lists, and calculates coupon discounts.
- `lib/dates.js` — formats today’s date, normalizes date keys, and computes fiscal years.
- `lib/inventory.js` — finds products, checks sellable stock, deducts/releases stock, and summarizes inventory.
- `lib/invoice.js` — computes invoice figures and renders printable invoice HTML.
- `lib/ledger.js` — lists customers, charges/reverses Khata orders, and records settlements.
- `lib/orders.js` — adds, finds, cancels, and filters orders.
- `lib/pricing.js` — computes subtotals, discounts, tax, and order totals.
- `lib/reports.js` — computes dashboard summaries and GST reconciliation.
- `lib/store.js` — reads/writes `data/db.json` and appends audit entries.
- `lib/tax.js` — resolves item GST rates and splits tax into CGST and SGST.

## Commands
- Start the app: `npm start`
- Run tests: `node --test`.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js`; use `lib/tax.js` only if truly needed.

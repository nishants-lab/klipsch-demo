# Klipsch India CRO Demo — QA Results Log

Fill the **Status** column after a run: `PASS` / `FAIL` / `BLOCKED` / `N/A`.
Put repro notes, screenshots paths, or failing examples in **Notes**. Set the **Date** (YYYY-MM-DD).

- DOM checks come from `tests/dom-evals.js` → `runKlipschEvals()`.
- Data checks (DI-*) come from `tests/data-validation.py`.
- Everything else is manual per `tests/TEST-PLAN.md`.

**Run summary (2026-06-02):** All four pages pass at desktop (1280px), 390px and 360px.
`runKlipschEvals()` — Home 51/51, Category 53/53, PDP 61/61, Checkout 48/48 (+2 compare
tests skip on checkout, no product cards). `data-validation.py` — 18/18 products PASS,
exit 0. The four flagged items (#7 cart Remove overflow, #8 cart recommendations, #10
compare search-to-add, CM-02 double-fire) are all implemented and passing.

| Test ID | Status | Notes | Date |
|---------|--------|-------|------|
| GC-01 | PASS | | 2026-06-02 |
| GC-02 | PASS | logo naturalWidth 256 (SVG resolves) | 2026-06-02 |
| GC-03 | PASS | | 2026-06-02 |
| GC-04 | PASS | | 2026-06-02 |
| GC-05 | PASS | manual: active nav state on Home | 2026-06-02 |
| GC-06 | PASS | | 2026-06-02 |
| GC-07 | PASS | | 2026-06-02 |
| GC-08 | PASS | badge == sum(qty) on clean load | 2026-06-02 |
| GC-09 | PASS | search Enter -> category.html?q= (encoded) | 2026-06-02 |
| GC-10 | PASS | structural: encodeURIComponent on Enter | 2026-06-02 |
| GC-11 | PASS | 4 footer column groups | 2026-06-02 |
| GC-12 | PASS | footer logo loads | 2026-06-02 |
| GC-13 | PASS | demo banner + announcement render | 2026-06-02 |
| GC-14 | PASS | overlays mounted once | 2026-06-02 |
| GC-15 | PASS | no h-overflow desktop/390/360 | 2026-06-02 |
| HM-01 | PASS | hero flagship = The Sevens | 2026-06-02 |
| HM-02 | PASS | hero CTAs anchor to #finder / #bestsellers | 2026-06-02 |
| HM-03 | PASS | 5 use-case tiles | 2026-06-02 |
| HM-04 | PASS | finder filters by bestFor | 2026-06-02 |
| HM-05 | PASS | finder count matches data | 2026-06-02 |
| HM-06 | PASS | bestsellers grid <=8, all bestseller | 2026-06-02 |
| HM-07 | PASS | category tiles == 5 categories | 2026-06-02 |
| HM-08 | PASS | category href encoded | 2026-06-02 |
| HM-09 | PASS | brand story present | 2026-06-02 |
| HM-10 | PASS | no h-overflow | 2026-06-02 |
| CT-01 | PASS | 18 products render; count text shown | 2026-06-02 |
| CT-02 | PASS | use-case filter | 2026-06-02 |
| CT-03 | PASS | category filter | 2026-06-02 |
| CT-04 | PASS | price band filter | 2026-06-02 |
| CT-05 | PASS | combined filters AND | 2026-06-02 |
| CT-06 | PASS | sort low->high | 2026-06-02 |
| CT-07 | PASS | sort high->low | 2026-06-02 |
| CT-08 | PASS | sort biggest discount | 2026-06-02 |
| CT-09 | PASS | deep-link ?cat= pre-filters | 2026-06-02 |
| CT-10 | PASS | deep-link ?q= searches | 2026-06-02 |
| CT-11 | PASS | empty state exists/toggles | 2026-06-02 |
| CT-12 | PASS | clear filters | 2026-06-02 |
| CT-13 | PASS | filter list == 5 categories | 2026-06-02 |
| CT-14 | PASS | page title reflects state | 2026-06-02 |
| CT-15 | PASS | no h-overflow | 2026-06-02 |
| PD-01 | PASS | PDP renders, H1 = name | 2026-06-02 |
| PD-02 | PASS | price/MRP/disc; at-MRP product hides was/off | 2026-06-02 |
| PD-03 | PASS | inclusive-of-taxes line | 2026-06-02 |
| PD-04 | PASS | verdict strip below price (geometry) | 2026-06-02 |
| PD-05 | PASS | verdict + BEST FOR chips | 2026-06-02 |
| PD-06 | PASS | savings line (hidden at 0% disc) | 2026-06-02 |
| PD-07 | PASS | jump scrolls to #full-guide (no nav) | 2026-06-02 |
| PD-08 | PASS | #full-guide below buy box | 2026-06-02 |
| PD-09 | PASS | specs count matches data | 2026-06-02 |
| PD-10 | PASS | jargon count matches data | 2026-06-02 |
| PD-11 | PASS | good-to-know 4 items | 2026-06-02 |
| PD-12 | PASS | EMI box /mo | 2026-06-02 |
| PD-13 | PASS | offers list one Apply per eligible | 2026-06-02 |
| PD-14 | PASS | one-tap apply offer | 2026-06-02 |
| PD-15 | PASS | add to cart increments + opens drawer | 2026-06-02 |
| PD-16 | PASS | buy now -> checkout | 2026-06-02 |
| PD-17 | PASS | pincode valid (6 digits) green | 2026-06-02 |
| PD-18 | PASS | pincode invalid red | 2026-06-02 |
| PD-19 | PASS | gallery now uses real gallery[]; thumbs swap main | 2026-06-02 |
| PD-20 | PASS | breadcrumb encoded | 2026-06-02 |
| PD-21 | PASS | related <=4, excludes current | 2026-06-02 |
| PD-22 | PASS | no h-overflow | 2026-06-02 |
| CA-01 | PASS | empty cart state | 2026-06-02 |
| CA-02 | PASS | add item shows row | 2026-06-02 |
| CA-03 | PASS | increment qty | 2026-06-02 |
| CA-04 | PASS | decrement qty | 2026-06-02 |
| CA-05 | PASS | decrement to zero removes | 2026-06-02 |
| CA-06 | PASS | remove control | 2026-06-02 |
| CA-07 | PASS | totals math | 2026-06-02 |
| CA-08 | PASS | savings line | 2026-06-02 |
| CA-09 | PASS | KLIPSCH10 cap ₹2,000 | 2026-06-02 |
| CA-10 | PASS | AUDIO5 min threshold | 2026-06-02 |
| CA-11 | PASS | offer row in foot | 2026-06-02 |
| CA-12 | PASS | checkout link | 2026-06-02 |
| CA-13 | PASS | FIXED item #7 — Remove within drawer, no overflow (rm.right 1671 <= box 1705) | 2026-06-02 |
| CA-14 | PASS | IMPLEMENTED item #8 — "You might also like" widget in drawer | 2026-06-02 |
| CA-15 | PASS | recs lower-priced: ₹17,900/₹23,850/₹24,800 < ₹164,800 cart max | 2026-06-02 |
| CA-16 | PASS | drawer width 400px / 92vw, never > viewport | 2026-06-02 |
| CM-01 | PASS | compare checkbox toggles state | 2026-06-02 |
| CM-02 | PASS | REGRESSION — toggles exactly once (change listener) | 2026-06-02 |
| CM-03 | PASS | compare bar visibility | 2026-06-02 |
| CM-04 | PASS | max 4 enforced | 2026-06-02 |
| CM-05 | PASS | remove from bar | 2026-06-02 |
| CM-06 | PASS | clear compare | 2026-06-02 |
| CM-07 | PASS | open needs >=2 | 2026-06-02 |
| CM-08 | PASS | modal table renders | 2026-06-02 |
| CM-09 | PASS | rows price/EMI/best-for/specs | 2026-06-02 |
| CM-10 | PASS | em-dash for missing values | 2026-06-02 |
| CM-11 | PASS | checkbox sync across grid | 2026-06-02 |
| CM-12 | PASS | IMPLEMENTED item #10 — search-to-add box in compare bar | 2026-06-02 |
| CM-13 | PASS | IMPLEMENTED item #10 — pills with "+", type-ahead >=3 chars (0 @2, 6 @3) | 2026-06-02 |
| CM-14 | PASS | compare persists across navigation | 2026-06-02 |
| CO-01 | PASS | order summary math | 2026-06-02 |
| CO-02 | PASS | offer line in summary | 2026-06-02 |
| CO-03 | PASS | phone OTP valid | 2026-06-02 |
| CO-04 | PASS | phone OTP invalid | 2026-06-02 |
| CO-05 | PASS | Amazon sign-in path | 2026-06-02 |
| CO-06 | PASS | guest path | 2026-06-02 |
| CO-07 | PASS | COD path | 2026-06-02 |
| CO-08 | PASS | demo disclaimer present | 2026-06-02 |
| CO-09 | PASS | no h-overflow checkout | 2026-06-02 |
| CO-10 | PASS | empty cart -> ₹0 totals, no NaN | 2026-06-02 |
| RS-01 | PASS | Home @390px | 2026-06-02 |
| RS-02 | PASS | Home @360px | 2026-06-02 |
| RS-03 | PASS | Category @390px | 2026-06-02 |
| RS-04 | PASS | Category @360px | 2026-06-02 |
| RS-05 | PASS | PDP @390px | 2026-06-02 |
| RS-06 | PASS | PDP @360px | 2026-06-02 |
| RS-07 | PASS | Checkout @390px | 2026-06-02 |
| RS-08 | PASS | Checkout @360px | 2026-06-02 |
| RS-09 | PASS | sticky gallery only >=1024px | 2026-06-02 |
| RS-10 | PASS | footer collapses on mobile | 2026-06-02 |
| RS-11 | PASS | guide grid single-column @<=760px | 2026-06-02 |
| RS-12 | PASS | mobile nav: links hidden, menu shows | 2026-06-02 |
| RS-13 | PASS | product grid reflow 4->3->2->1 | 2026-06-02 |
| RS-14 | PASS | cart drawer <=92vw; overflow-x:clip fix | 2026-06-02 |
| RS-15 | PASS | sticky buy-row on mobile PDP | 2026-06-02 |
| DI-01 | PASS | required keys present (18 products) | 2026-06-02 |
| DI-02 | PASS | prices numeric | 2026-06-02 |
| DI-03 | PASS | price <= mrp (relaxed: 2 at-MRP products valid) | 2026-06-02 |
| DI-04 | PASS | discount within tolerance | 2026-06-02 |
| DI-05 | PASS | emi == round(price/12) | 2026-06-02 |
| DI-06 | PASS | savings == mrp - price | 2026-06-02 |
| DI-07 | PASS | image https | 2026-06-02 |
| DI-08 | PASS | bestFor non-empty | 2026-06-02 |
| DI-09 | PASS | specs is array | 2026-06-02 |
| DI-10 | PASS | jargon is array | 2026-06-02 |
| DI-11 | PASS | verdict non-empty | 2026-06-02 |
| DI-12 | PASS | no NaN | 2026-06-02 |
| DI-13 | PASS | sku unique (18) | 2026-06-02 |
| DI-14 | PASS | category in categories list | 2026-06-02 |
| DI-15 | PASS | category counts sane | 2026-06-02 |

## Run metadata

| Field | Value |
|-------|-------|
| Build / commit | feat: 18 products + CRO change-request items #1-8,#10 (pending commit) |
| Browser + version | Playwright Chromium (Kiro MCP) |
| Tester | Kiro (automated) + nisan |
| `runKlipschEvals()` summary (Home) | 51 passed / 0 failed / 0 skipped |
| `runKlipschEvals()` summary (Category) | 53 passed / 0 failed / 0 skipped |
| `runKlipschEvals()` summary (PDP) | 61 passed / 0 failed / 0 skipped |
| `runKlipschEvals()` summary (Checkout) | 48 passed / 0 failed / 2 skipped (compare needs cards) |
| `data-validation.py` exit code | 0 (18/18 PASS) |

## Known gaps to confirm each run (regression watch-list)

1. **CA-13** — Cart "Remove" horizontal overflow (item #7). ✅ FIXED — Remove sits within drawer, no overflow.
2. **CA-14 / CA-15** — Cart "You might also like" recommendations (item #8). ✅ IMPLEMENTED — lower-priced accessory logic.
3. **CM-12 / CM-13** — Compare search-to-add + suggestion pills/type-ahead (item #10). ✅ IMPLEMENTED — pills with "+", type-ahead >=3 chars.
4. **CM-02** — Compare checkbox double-fire regression. ✅ PASS — bound to checkbox `change`.

## Notes on the 18-product data set

- 18 real products captured from the live SmartBiz API (store 62469) — the public API exposes 18 reachable SKUs.
- Two products are sold at MRP (0% discount): **RP-600M II** and **RP-1000SW**. DI-03 relaxed to `price <= mrp`; the UI hides the strikethrough MRP, "% off" badge, and savings line when discount is 0.

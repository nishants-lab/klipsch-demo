# Klipsch India CRO Demo — QA Test Plan

**Scope:** Full functional, layout, regression and data-integrity coverage for the static
e-commerce demo (`index.html`, `category.html`, `product.html`, `checkout.html` + shared
chrome injected by `assets/app.js`).

**App under test:** vanilla JS, no build step. State (cart, compare, applied offer) persists
in `localStorage` (`klipsch_cart`, `klipsch_compare`, `klipsch_offer`). Chrome (header, footer,
cart drawer, compare bar, compare modal) is injected on every page by `KlipschApp.mountChrome()`.

## How to run

| Layer | Tool | What it covers |
|-------|------|----------------|
| Automated DOM checks | `tests/dom-evals.js` — paste into the browser console on a running page, call `runKlipschEvals()` | P0/P1 DOM, geometry, overflow, ordering, data wiring |
| Data integrity | `tests/data-validation.py` — `python tests/data-validation.py` | Catalog field/maths validation, exits non-zero on failure |
| Manual / exploratory | this document | Everything, incl. interaction flows hard to script |
| Results log | `tests/RESULTS.md` | One row per test ID, fill after a run |

**Priority key:** `P0` = blocks launch / core revenue path. `P1` = important, degrades experience.
`P2` = polish / edge case.

**Selector legend (real attributes/classes from source):**
`[data-open-cart]`, `[data-cart-drawer]`, `[data-cart-items]`, `[data-cart-foot]`,
`[data-cart-count]`, `[data-inc]`, `[data-dec]`, `[data-rm]`, `.search input`,
`[data-compare-sku]`, `[data-compare-bar]`, `[data-compare-items]`, `[data-open-compare]`,
`[data-clear-compare]`, `[data-compare-modal]`, `[data-compare-table]`, `.cmp-table`,
`.guide-strip`, `.price-block`, `[data-jump]`, `#full-guide`, `.fg-cols`, `.spec-row`,
`.jargon-row`, `.gtk`, `.emi-offers`, `[data-offers]`, `[data-apply-offer]`, `[data-add]`,
`[data-buy]`, `[data-pin]`, `[data-pin-btn]`, `[data-pin-result]`, `[data-finder]`,
`[data-uc]`, `[data-finder-grid]`, `[data-finder-title]`, `#finder-results`,
`[data-grid-best]`, `[data-cats]`, `[data-hero-card]`, `[data-f-use]`, `[data-f-cat]`,
`[data-f-price]`, `[data-sort]`, `[data-clear-filters]`, `[data-count]`, `[data-empty]`,
`[data-grid]`, `[data-otp]`, `[data-phone]`, `[data-amazon]`, `[data-guest]`, `[data-cod]`,
`[data-summary]`, `.auth-card`, `.brand-logo`, `[data-related]`.

---

## 1. Global chrome (header, footer, cart control, search) — all pages

Preconditions for this section: any page loaded; `KlipschApp.mountChrome()` has run.

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| GC-01 | Header renders on every page | Page loaded | Inspect DOM for `header.site` | Exactly one `header.site` exists, injected as first child of body | P0 |
| GC-02 | Logo image loads (SVG, non-zero) | Page loaded, network ok | Read `.brand-logo` `naturalWidth` | At least one `.brand-logo` present and `naturalWidth > 0` (SVG resolved, not broken) | P0 |
| GC-03 | Brand links to home | Page loaded | Inspect `a.brand` `href` | `href` resolves to `index.html` | P1 |
| GC-04 | Nav links present | Page loaded | Count `.nav-links a` | Links for Home, Shop, Find your Klipsch, Best Sellers all present with correct hrefs | P1 |
| GC-05 | Active nav state | On Home | Inspect `.nav-links a.active` | The link matching the active page is marked `.active` | P2 |
| GC-06 | Cart control opens drawer | Drawer closed | Click `[data-open-cart]` | `[data-cart-drawer]` gains class `show` (drawer slides in) | P0 |
| GC-07 | Cart drawer closes | Drawer open | Click `[data-close-cart]` | `[data-cart-drawer]` loses `show` | P1 |
| GC-08 | Cart count badge reflects state | Known cart | Read `[data-cart-count]` | Text equals sum of `qty` across cart items | P0 |
| GC-09 | Search submits to category page | Header search visible | Type `the fives` in `.search input`, press Enter | Navigates to `category.html?q=the%20fives` (URL-encoded) | P0 |
| GC-10 | Search uses Enter key (no form) | Header search | Inspect handler | `keydown` on input with `key === "Enter"` triggers navigation; query is `encodeURIComponent` of value | P1 |
| GC-11 | Footer renders with columns | Page loaded | Inspect `footer.site .cols` | Footer present with 4 column groups (brand, Shop, Help, Why Klipsch) | P1 |
| GC-12 | Footer logo loads | Page loaded | Read footer `.brand-logo` `naturalWidth` | Footer logo `naturalWidth > 0` | P2 |
| GC-13 | Announcement + demo banner present | Page loaded | Inspect `.demo-banner`, `.announce` | Both render above header | P2 |
| GC-14 | Overlays mounted once | Page loaded | Count `[data-cart-drawer]`, `[data-compare-bar]`, `[data-compare-modal]` | Exactly one of each exists | P1 |
| GC-15 | No horizontal overflow from chrome | Page loaded desktop | Compare `scrollWidth` vs `innerWidth` | `documentElement.scrollWidth <= innerWidth + 1` | P0 |

---

## 2. Home page (`index.html`)

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| HM-01 | Hero renders flagship card | Home loaded | Inspect `[data-hero-card]` | Card shows highest-priced product (The Sevens) image, name, price + struck MRP, View button | P1 |
| HM-02 | Hero CTAs anchor correctly | Home loaded | Inspect hero anchors | "Find your Klipsch" → `#finder`, "Shop bestsellers" → `#bestsellers` | P2 |
| HM-03 | Product finder tiles render | Home loaded | Count `[data-finder] [data-uc]` | 5 use-case tiles render (TV, Music, Parties, Travel, Vinyl) | P1 |
| HM-04 | Finder filters by use case | Home loaded | Click a `[data-uc]` tile | `#finder-results` becomes visible; `[data-finder-grid]` shows only products whose `bestFor` includes that tag; title shows count | P1 |
| HM-05 | Finder result count correct | After HM-04 | Compare grid card count to data | Card count equals number of products with that `bestFor` tag | P1 |
| HM-06 | Bestsellers grid renders | Home loaded | Count `[data-grid-best] .card` | Up to 8 cards, each with `isBestSeller === true` | P1 |
| HM-07 | Category tiles render | Home loaded | Count `[data-cats] a` | One tile per `DATA.categories` (5), each links to `category.html?cat=` and shows count | P1 |
| HM-08 | Category tile href encoded | Home loaded | Inspect a `[data-cats] a` href | Category name is URL-encoded in `cat` param | P2 |
| HM-09 | Brand story section present | Home loaded | Inspect `#brandstory` | Two-column brand story renders | P2 |
| HM-10 | No horizontal overflow (Home) | Home loaded | `scrollWidth` vs `innerWidth` | No horizontal overflow at desktop width | P0 |

---

## 3. Shop / Category page (`category.html`)

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| CT-01 | Default grid renders all products | `category.html` no params | Count `[data-grid] .card` | All 10 products render; `[data-count]` shows "10 products" | P0 |
| CT-02 | Use-case filter | Category loaded | Select a `[data-f-use]` radio | Grid shows only products with that `bestFor` tag; count updates | P1 |
| CT-03 | Category filter | Category loaded | Select a `[data-f-cat]` radio | Grid shows only that category; count updates | P0 |
| CT-04 | Price band filter | Category loaded | Select a `[data-f-price]` radio | Grid shows only products with `price >= min && price < max` | P1 |
| CT-05 | Combined filters (AND) | Category loaded | Select category + price | Both predicates applied (logical AND) | P1 |
| CT-06 | Sort: price low to high | Category loaded | `[data-sort]` = "low" | Cards ordered ascending by price | P1 |
| CT-07 | Sort: price high to low | Category loaded | `[data-sort]` = "high" | Cards ordered descending by price | P1 |
| CT-08 | Sort: biggest discount | Category loaded | `[data-sort]` = "disc" | Cards ordered descending by `discount` | P1 |
| CT-09 | Deep-link `?cat=` pre-filters | Open `category.html?cat=Subwoofers` | Load | Only Subwoofers shown; matching `[data-f-cat]` radio checked; title = "Subwoofers" | P0 |
| CT-10 | Deep-link `?q=` searches | Open `category.html?q=fives` | Load | Grid filtered by query across name+category+bestFor; title shows `"fives"` | P0 |
| CT-11 | Empty state | Apply impossible filter combo | e.g. category + non-matching price band | `[data-empty]` visible; `[data-grid]` empty; count = "0 products" | P1 |
| CT-12 | Clear filters | After applying filters | Click `[data-clear-filters]` | `cat/use/price` reset to null, `q` cleared, full grid restored | P1 |
| CT-13 | Filter list completeness | Category loaded | Inspect `[data-f-cat]` | One radio per `DATA.categories`; each label shows `(count)` | P2 |
| CT-14 | Page title reflects state | Category loaded | Inspect `[data-page-title]` | Default "Shop all Klipsch", else category name or quoted query | P2 |
| CT-15 | No horizontal overflow (Category) | Category loaded | `scrollWidth` vs `innerWidth` | No horizontal overflow at desktop width | P0 |

---

## 4. Product detail page + buying guide (`product.html?sku=...`)

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| PD-01 | PDP renders for valid sku | Open `product.html?sku=<valid>` | Load | `.pdp` renders; H1 = product name; falls back to first product if sku missing | P0 |
| PD-02 | Price block shows price/MRP/discount | PDP loaded | Inspect `.price-block` | `.now` = price, `.was` = MRP (struck), `.off` = `<discount>% off` | P0 |
| PD-03 | "Inclusive of all taxes" line | PDP loaded | Inspect `.incl` | Present directly under price | P2 |
| PD-04 | Verdict strip is BELOW price | PDP loaded | Compare geometry of `.guide-strip` vs `.price-block` | `.guide-strip` top is below `.price-block` bottom (vertical DOM/visual order) | P0 |
| PD-05 | Verdict text + BEST FOR chips | PDP loaded | Inspect `.guide-strip .verdict` and `.pill` | Verdict text = `p.verdict`; one `.pill` per `bestFor` entry | P1 |
| PD-06 | Savings line in strip | PDP loaded | Inspect `.guide-strip .save` | Shows "You save ₹<savings> (<discount>% off MRP)" | P2 |
| PD-07 | "See full buying guide" jump | PDP loaded | Click `[data-jump]` | Page scrolls to `#full-guide` (SPA-safe `scrollIntoView`, no navigation) | P1 |
| PD-08 | Full guide section exists | PDP loaded | Inspect `#full-guide` | Section present below buy box with header "Buying Guide" | P0 |
| PD-09 | Specs-at-a-glance | PDP loaded | Count `.fg-cols .spec-row` | One `.spec-row` per `p.specs` entry (key + val) | P1 |
| PD-10 | Jargon buster | PDP loaded | Count `.jargon-row` | One `.jargon-row` per `p.jargon` entry (term + why); graceful empty msg if none | P1 |
| PD-11 | Good-to-know block | PDP loaded | Inspect `.gtk ul li` | 4 items (Warranty, Returns, Payment, Delivery) | P2 |
| PD-12 | EMI box | PDP loaded | Inspect `.emi-offers .box` | First box shows "From ₹<emiPerMonth>/mo" | P1 |
| PD-13 | Offers list renders | PDP loaded | Count `[data-offers] [data-apply-offer]` | One Apply button per eligible offer (`price >= offer.min`) | P1 |
| PD-14 | One-tap apply offer | PDP loaded | Click an `[data-apply-offer]` | Button becomes "✓ Applied"; toast shown; `klipsch_offer` set; cart total reflects discount | P0 |
| PD-15 | Add to Cart | PDP loaded | Click `[data-add]` | Product added (qty +1); drawer opens; count increments; toast shown | P0 |
| PD-16 | Buy Now → checkout | PDP loaded | Click `[data-buy]` | Product added then navigates to `checkout.html` | P0 |
| PD-17 | Pincode valid (6 digits) | PDP loaded | Enter `560022` in `[data-pin]`, click `[data-pin-btn]` | `[data-pin-result]` visible, green, "Delivers to 560022…" | P1 |
| PD-18 | Pincode invalid | PDP loaded | Enter `12ab` / `123`, click `[data-pin-btn]` | `[data-pin-result]` visible, red, "Enter a valid 6-digit pincode" | P1 |
| PD-19 | Gallery renders | PDP loaded | Inspect `.gallery .main img` + `.thumbs` | Main image present (`data-main-img`), at least one thumb, first thumb `.active` | P1 |
| PD-20 | Breadcrumb | PDP loaded | Inspect `.crumb` | Home / Category / product name; category link encoded | P2 |
| PD-21 | Related ("You might also like") | PDP loaded | Count `[data-related] .card` | Up to 4 related cards, same category first then others, current sku excluded | P1 |
| PD-22 | No horizontal overflow (PDP) | PDP loaded | `scrollWidth` vs `innerWidth` | No horizontal overflow at desktop width | P0 |

---

## 5. Cart drawer

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| CA-01 | Empty cart state | Empty cart | Open drawer | `.empty` message + "Discover products" CTA; no totals | P1 |
| CA-02 | Add item shows row | Empty cart | Add a product | One `.ci` row with image, short name, price + struck MRP | P0 |
| CA-03 | Increment qty | Item in cart | Click `[data-inc]` | Qty +1; totals recompute; count badge updates | P0 |
| CA-04 | Decrement qty | Item qty ≥ 2 | Click `[data-dec]` | Qty −1; totals recompute | P0 |
| CA-05 | Decrement to zero removes | Item qty = 1 | Click `[data-dec]` | Item removed (filtered out at qty 0) | P1 |
| CA-06 | Remove control | Item in cart | Click `[data-rm]` | Item removed immediately | P0 |
| CA-07 | Totals math — price/MRP | ≥1 item | Inspect `.total` and `cartTotals()` | `payable = price − offerDiscount`; `mrpSaving = mrp − price` | P0 |
| CA-08 | Savings line | ≥1 item | Inspect `.save-line` | "You're saving ₹<mrpSaving + offerDiscount>" | P1 |
| CA-09 | Offer discount cap (KLIPSCH10) | Cart price high | Apply KLIPSCH10 | Discount = min(round(price·10%), 2000) — capped at ₹2,000 | P0 |
| CA-10 | Offer min threshold (AUDIO5) | Cart price < 5000 | Apply AUDIO5 | No discount applied until price ≥ ₹5,000; then flat ₹500 | P1 |
| CA-11 | Offer row appears in foot | Offer applied | Inspect `.summary .row` | Shows "Offer (<code>) −₹<discount>" line | P1 |
| CA-12 | Checkout link | ≥1 item | Inspect drawer CTA | "Checkout securely" anchors to `checkout.html` | P0 |
| CA-13 | **REGRESSION (item #7): Remove must NOT overflow horizontally** | ≥1 item, drawer open | Measure `.ci` row + `[data-rm]` right edge vs drawer content width | `[data-rm]` right edge ≤ drawer items content right edge; no horizontal scroll inside `.items` | P0 |
| CA-14 | **GAP (item #8): "You might also like" recommendations in drawer** | ≥1 item, drawer open | Look for a recommendations widget inside `[data-cart-drawer]` | EXPECTED: drawer shows a "You might also like" widget recommending LOWER-priced / accessory items than what's in the cart. CURRENT BUILD: no such widget exists in the drawer (only the PDP has `[data-related]`). Test should FAIL until implemented. | P1 |
| CA-15 | Recommendation relevance (item #8) | Recommendations present | Inspect recommended items' prices | Each recommended item price < max price in cart (accessory/upsell-down logic), excludes items already in cart | P1 |
| CA-16 | Drawer max width respected | Drawer open narrow screen | Inspect `.drawer` width | `width:400px; max-width:92vw` — never wider than viewport | P1 |

---

## 6. Compare

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| CM-01 | Compare checkbox toggles state | Grid with cards | Check a `[data-compare-sku]` box | sku added to compare; `klipsch_compare` updated; compare bar shows | P0 |
| CM-02 | **REGRESSION: toggle fires EXACTLY once (label+input double-fire)** | Grid card | Click the compare label/checkbox once | `toggleCompare` runs once → sku appears once in compare array (no add-then-remove cancel). Handler is bound to checkbox `change`, not label click | P0 |
| CM-03 | Compare bar visibility | ≥1 compared | Inspect `[data-compare-bar]` | Bar has `show` when `compare.length > 0`, hidden when 0 | P1 |
| CM-04 | Select up to 4 max | Try to add 5th | Check a 5th box | 5th rejected; toast "Compare up to 4 products"; array length stays 4 | P1 |
| CM-05 | Remove from compare bar | ≥1 compared | Click `[data-cmp-rm]` in bar | sku removed; card checkbox unchecks (synced) | P1 |
| CM-06 | Clear compare | ≥1 compared | Click `[data-clear-compare]` | Array emptied; bar hides; all checkboxes uncheck | P1 |
| CM-07 | Open compare needs ≥2 | Exactly 1 compared | Click `[data-open-compare]` | Toast "Pick at least 2 products to compare"; modal stays closed | P1 |
| CM-08 | Compare modal table renders | ≥2 compared | Click `[data-open-compare]` | `[data-compare-modal]` gets `show`; `.cmp-table` renders columns per product | P0 |
| CM-09 | Table rows: price/EMI/best-for/specs | Modal open | Inspect `.cmp-table` rows | Rows for Price, EMI from, Category, Best for + up to 6 common spec keys | P1 |
| CM-10 | Em-dash for missing values | Products with differing specs | Inspect cells | Missing spec/best-for cells show "—" (em-dash) | P1 |
| CM-11 | Checkbox sync across grid | sku compared | Re-render grid | `syncCompareChecks()` keeps boxes checked for compared skus | P2 |
| CM-12 | **GAP (item #10): search-to-add box in compare** | Compare modal/bar open | Look for a text input to search & add products | EXPECTED: a search-to-add box exists in compare UI. CURRENT BUILD: no such input present. Test should FAIL until implemented. | P1 |
| CM-13 | **GAP (item #10): suggestion pills with "+" and type-ahead (≥3 chars)** | Search-to-add present | Type ≥3 chars | EXPECTED: suggestion pills appear (each with a "+" to add), filtering only after ≥3 chars typed. CURRENT BUILD: not implemented → FAIL | P1 |
| CM-14 | Compare persists across navigation | ≥2 compared | Navigate to another page | compare bar still shows same items (localStorage) | P2 |

---

## 7. Checkout (`checkout.html`)

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| CO-01 | Order summary math | ≥1 item in cart | Inspect `[data-summary]` | Rows: Item total (MRP, struck), Price, Delivery FREE, Total payable, You save; `payable = price − offerDiscount` | P0 |
| CO-02 | Offer line in summary | Offer applied | Inspect summary | "Offer discount −₹<x>" row shown only when offerDiscount > 0 | P1 |
| CO-03 | Phone OTP valid (10 digits) | On checkout | Enter `9876543210`, click `[data-otp]` | Success state ("You're all set (demo)") rendered in `.auth-card` | P0 |
| CO-04 | Phone OTP invalid | On checkout | Enter `12345` / non-digits, click `[data-otp]` | Toast "Enter a valid 10-digit mobile number"; no success state | P0 |
| CO-05 | Amazon sign-in path | On checkout | Click `[data-amazon]` | Success state with Amazon import message | P1 |
| CO-06 | Guest path | On checkout | Click `[data-guest]` | Success state with guest message | P1 |
| CO-07 | COD path | On checkout | Click `[data-cod]` | Success state with COD message | P1 |
| CO-08 | Demo disclaimer present | On checkout | Inspect page | "no real order is placed" disclaimer shown | P2 |
| CO-09 | No horizontal overflow (Checkout) | On checkout | `scrollWidth` vs `innerWidth` | No horizontal overflow at desktop width | P1 |
| CO-10 | Summary reflects empty cart | Empty cart | Load checkout | Totals all ₹0 (no NaN), page still renders | P1 |

---

## 8. Responsive layout (all pages)

Tested at **390px** and **360px** widths (plus 430/760/1024 breakpoints). Use device toolbar /
`window.resizeTo` is unreliable; prefer DevTools device emulation. The eval helper measures
`documentElement.scrollWidth` vs `innerWidth` at whatever the current viewport is.

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| RS-01 | No h-overflow @390 — Home | Home @390px | Measure scrollWidth | `scrollWidth <= innerWidth + 1` | P0 |
| RS-02 | No h-overflow @360 — Home | Home @360px | Measure | No horizontal overflow | P0 |
| RS-03 | No h-overflow @390 — Category | Category @390px | Measure | No horizontal overflow | P0 |
| RS-04 | No h-overflow @360 — Category | Category @360px | Measure | No horizontal overflow | P0 |
| RS-05 | No h-overflow @390 — PDP | PDP @390px | Measure | No horizontal overflow | P0 |
| RS-06 | No h-overflow @360 — PDP | PDP @360px | Measure | No horizontal overflow | P0 |
| RS-07 | No h-overflow @390 — Checkout | Checkout @390px | Measure | No horizontal overflow | P0 |
| RS-08 | No h-overflow @360 — Checkout | Checkout @360px | Measure | No horizontal overflow | P0 |
| RS-09 | Sticky gallery only ≥1024px | PDP | Read `.pdp .gallery` computed `position` | `sticky` above 1024px; `static` at ≤1024px (mobile) | P1 |
| RS-10 | Footer collapses on mobile | Any page @≤430px | Read `footer .cols` computed `grid-template-columns` | Collapses to single column at ≤430px (2-col at ≤760px) | P1 |
| RS-11 | Guide grid single-column on mobile | PDP @≤760px | Read `.fg-cols` computed `grid-template-columns` | Single column at ≤760px | P1 |
| RS-12 | Mobile nav: links hidden, menu shows | Any @≤760px | Inspect `.nav-links` / `.menu-toggle` | `.nav-links` hidden; `.menu-toggle` visible | P2 |
| RS-13 | Product grid reflows | Category @various | Read `.grid` columns | 4→3 (≤1024) →2 (≤760) →1 (≤430) | P2 |
| RS-14 | Cart drawer never exceeds viewport | Drawer open @360px | Measure drawer width | `≤ 92vw`, no body overflow when open | P1 |
| RS-15 | Sticky buy-row on mobile PDP | PDP @≤760px | Read `.buy-row` computed `position` | `sticky` (bottom) on mobile | P2 |

---

## 9. Data integrity (`assets/data.js` → `window.KLIPSCH_DATA`)

Automated by `tests/data-validation.py`. Each product validated.

| ID | Title | Steps | Expected result | Priority |
|----|-------|-------|-----------------|----------|
| DI-01 | Required keys present | For each product check keys | Every product has `sku, name, price, mrp, image, bestFor, specs, jargon, verdict, emiPerMonth` (also `shortName, discount, savings, category`) | P0 |
| DI-02 | Prices are numbers | Check types | `price` and `mrp` are numeric, not strings/NaN | P0 |
| DI-03 | price < mrp | Compare | For every product `price < mrp` | P0 |
| DI-04 | Discount ≈ computed | Compare `discount` to `round((1−price/mrp)·100)` | Within ±2 percentage points | P1 |
| DI-05 | EMI == round(price/12) | Compare | `emiPerMonth === round(price/12)` exactly | P1 |
| DI-06 | Savings == mrp − price | Compare | `savings === mrp − price` | P1 |
| DI-07 | Image is https | Check prefix | `image` starts with `https` | P0 |
| DI-08 | bestFor non-empty array | Check | `bestFor` is a non-empty array | P1 |
| DI-09 | specs is array | Check | `specs` is an array (each `{key,val}`) | P1 |
| DI-10 | jargon is array | Check | `jargon` is an array (each `{term,why}`) | P1 |
| DI-11 | verdict non-empty string | Check | `verdict` is a non-empty string | P1 |
| DI-12 | No NaN anywhere in numerics | Scan numeric fields | No `NaN` in price/mrp/discount/savings/emiPerMonth | P0 |
| DI-13 | sku unique | Check uniqueness | All `sku` values unique | P1 |
| DI-14 | category in categories list | Cross-check | Each product `category` exists in `DATA.categories[].name` | P2 |
| DI-15 | Category counts sane | Compare declared count vs actual | `DATA.categories[].count` ≥ number of products in that category present in payload | P2 |

---

## 10. Cross-cutting / regression watch-list

These are the four flagged regression/gap areas — keep them visible every release:

1. **Item #7 — Cart "Remove" overflow** → `CA-13`. The Remove button uses `margin-left:auto`; long
   short-names must not push it past the drawer edge. Verify on the longest-name product
   (e.g. "Detroit Bluetooth Stereo Speaker – …20-Hour Playtime").
2. **Item #8 — Cart recommendations** → `CA-14`, `CA-15`. "You might also like" inside the drawer
   recommending lower-priced/accessory items. **Not implemented in current build.**
3. **Item #10 — Compare search-to-add** → `CM-12`, `CM-13`. Search box + suggestion pills with `+`
   and type-ahead (≥3 chars). **Not implemented in current build.**
4. **Compare double-fire** → `CM-02`. Already mitigated (checkbox `change` listener); guard against
   regressing to a label-click handler that double-counts.

**Total test cases: 132** — GC 15, HM 10, CT 15, PD 22, CA 16, CM 14, CO 10, RS 15, DI 15.
All 132 IDs are tracked in `tests/RESULTS.md`. The 15 DI cases are additionally automated by
`tests/data-validation.py`; a large P0/P1 subset across all sections is automated by
`runKlipschEvals()` in `tests/dom-evals.js`.

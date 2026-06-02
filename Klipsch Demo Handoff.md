# Klipsch Demo Handoff

This document hands off an in-progress Kiro session to the next window. Read it
end-to-end before continuing. It captures: what the project is, every user prompt
given so far (verbatim), what's done, what's mid-flight, and the exact next steps.

---

## 0. TL;DR — where we are right now

- We built a static, GitHub-Pages-hosted CRO concept demo of an **enhanced** Klipsch
  India (Cinebels) storefront, using **real product data** captured from the live
  SmartBiz storefront API.
- **It is LIVE on GitHub:** repo `https://github.com/nishants-lab/klipsch-demo`
  (branch `main`). Pages URL expected: `https://nishants-lab.github.io/klipsch-demo/`
  (user was enabling Pages; confirm it resolves).
- We are **mid-way through a 10-item change request** (see Section 4). The data layer
  is being expanded from 10 → **18 real products** right now. **`assets/data.js` has
  NOT yet been regenerated** with the 18 products — that is the immediate next step.
- A **QA sub-agent already authored a 132-case test suite** under `tests/`
  (TEST-PLAN.md, dom-evals.js, data-validation.py, RESULTS.md). Use it.

### ⚠️ Immediate next action (do this first)
1. Overwrite `build/raw_products.json` with the **18-product** array captured from the
   API (the full JSON is in Section 6 of this doc — it was the last big tool result).
2. Run `python scripts/build_klipsch_data.py` to regenerate `assets/data.js`.
   - NOTE: `build_klipsch_data.py` was **already updated** to handle the new
     `gallery` + `sellingPrice` fields (price fallback, gallery fallback). Verify.
3. Then continue the change-request items in Section 4 that are not yet done.

---

## 1. What this project is

- **Goal:** A shareable prototype showing CRO (conversion-rate-optimization) ideas for
  the Klipsch India store, which is operated by **Cinebels (Cinerama Pvt. Ltd.)**, the
  authorised Klipsch distributor in India. The live site runs on Amazon **SmartBiz**
  (store id `62469`), a Next.js/React SPA backed by `api.smartbiz.in`.
- **Approach:** A native static site (vanilla HTML/CSS/JS, no build step) where the
  enhancements are first-class features, powered by real catalog data captured from
  the SmartBiz API and embedded in `assets/data.js`. Checkout is **simulated**.
- **Headline feature:** a **PDP "Buying Guide"** — a deterministic rules engine that
  reads each product's own data (title, specs, description) and renders: a compact
  "Quick Verdict + Best for" strip below price, plus a full guide below the buy box
  (Specs at a glance / What the features mean (jargon buster) / Good to know).
  No external data, no runtime LLM.

## 2. Repo / hosting facts

- **Local path:** `c:\Users\nisan\Documents\1. Work Related\1. Fresh\Kiro\klipsch-cro-demo`
- **Git remote:** `origin` = `https://github.com/nishants-lab/klipsch-demo.git`
- **Branch:** `main` (2 commits pushed so far):
  1. `feat: Klipsch India CRO concept demo with PDP buying guide`
  2. `feat: use Klipsch logo in header/footer; consolidate scripts and assets`
- **GitHub Pages:** enable via repo Settings → Pages → Deploy from branch → `main` / `/ (root)`.
  Pages serves from root; all asset paths are relative, so no `/docs` folder needed.
- **Git safety rules in effect (from steering):** never force-push, never rewrite
  pushed history, only commit when asked, fix-forward. `git push` is allowed here
  because the user explicitly asked us to host it.

## 3. Tooling / environment notes (gotchas)

- **Shell is PowerShell** on Windows. Use `;` not `&&`. `&` is illegal.
- **`gh` (GitHub CLI) is NOT installed.** `git` 2.54.0 is. User identity:
  `Nishant Sinha` / `nisan@amazon.com`, credential.helper = manager.
- **Playwright is a SINGLE shared browser.** Do not run two agents driving it at once.
  Pattern used: main agent drives the browser + builds; sub-agents do file-only work
  (e.g., the QA agent authored tests without touching the browser).
- **Playwright screenshots** save to the MCP output dir
  (`C:\Users\nisan\AppData\Local\Programs\Kiro\.playwright-mcp\`), which is OUTSIDE the
  workspace and **cannot be read back** with read_file. Verify via DOM/`browser_evaluate`
  geometry checks instead of reading PNGs.
- **`browser_run_code_unsafe` with a `filename`** is blocked (file outside allowed
  roots). To re-inject saved JS, pass the code inline to `browser_evaluate`.
- **Local server for testing:** `python -m http.server 8099` run from the demo folder
  (use `control_pwsh_process` start/stop). Test at `http://localhost:8099/index.html`.
- **CORS:** the SmartBiz API (`api.smartbiz.in`) can only be fetched from a page on the
  `klipschindia.com` origin (navigate Playwright there first), NOT from localhost or
  from Python. That's how all product data was captured.
- **Workspace steering conventions that matter:**
  - Python scripts must live in `scripts/` and never be deleted (there's a global
    `scripts/build_klipsch_data.py` AND a copy inside the demo at
    `klipsch-cro-demo/scripts/build_klipsch_data.py`). The demo copy is the canonical
    one now (paths fixed to be demo-relative).
  - No deleting files the user didn't ask to delete. Temp artifacts can be cleaned.
  - Browser safety: never complete a purchase / payment. Stop at checkout review.

## 4. The current 10-item change request (user's latest substantive ask)

User wants these done. **Except #9, push & merge to `main`.** #9 (visual refresh) is
local-only — open a local server and let the user QA it before merging.
Time box requested: under ~1 hour. Use a QA agent + UX verification in parallel
(QA agent = file-only test authoring; main agent = browser-driven build+verify).

Status legend: ✅ done · 🟡 in progress · ⬜ not started

- ⬜ **#1** Home "Shop bestsellers" button shows a blank white button; text only
  appears on hover. FIX the hover/contrast bug. (It's the `.btn-ghost` on the dark
  hero — white text on white until hover. Likely needs a hero-specific ghost style.)
- ⬜ **#2** Logo currently renders "Klipsch logo + INDIA" wordmark. The real site has
  NO "India" word. Remove the `INDIA` `<span class="brand-sub">` from header (and
  footer) in `assets/app.js`. (Logo files already added — see Section 5.)
- ⬜ **#3** Replace the top-right "Cart" **word** with a **cart ICON** (keep the count
  badge). Edit the `cart-btn` markup in `chrome()` in `assets/app.js` + CSS.
- ⬜ **#4** Remove the "No coupon hunting" text (it's in `product.js`, the offers EMI
  box `.sm` copy: "Apply below - no coupon hunting").
- 🟡 **#5** `/docs` NOT needed (confirmed — Pages serves from root). Instead: **add 20
  more products**. We could only reach **18 real products total** via the public API
  (the recommendations campaign pool = 17, + ProMedia Lumina = 18). User said
  *"17 works"* / use all-products if needed. **DECISION: ship 18 real products.**
  Raw data captured (Section 6). `raw_products.json` + `data.js` still need updating.
- ✅ **#6** (answered, no code) Live API calls we made: catalog/pricing via
  `api.smartbiz.in/stores/62469/v2/catalog/{sku}` and the Next.js
  `all-products.json` `featuredProductsList`; availability via `buyingOptions`/`oos`
  flags; **pincode serviceability was NOT a real API — it's simulated** (no public
  endpoint found). Could additionally wire real ratings (`/reviews-ratings/{sku}`) and
  offers (`/offers/customer/{sku}`, returned 401 earlier) — but keep static for Pages.
- ⬜ **#7** Cart drawer "Remove" control overflows horizontally (desktop AND mobile).
  FIX the `.ci .qty` row in `assets/app.js` renderCart + `.drawer` CSS (the
  `margin-left:auto` Remove button pushes past the drawer width with long names).
  Test ID **CA-13** covers this.
- ⬜ **#8** Add a **"You might also like" widget INSIDE the cart drawer** (the real
  site has one). Requirement: recommend **LOWER-priced / accessory** items than what's
  in the cart (better attach + conversion), NOT higher-priced. Currently only the PDP
  has `[data-related]`. Add to `renderCart()` in `assets/app.js`. Test IDs **CA-14/15**.
- ⬜ **#9** **(LOCAL ONLY — do NOT merge to main)** Overall look & feel more welcoming.
  Large images look good but can hurt catalog discovery/checkout — tune image sizing
  vs density. User will QA this on a local server separately. Do this on a **local
  branch** (e.g. `feature/visual-refresh`), keep it off `main`.
- ⬜ **#10** Compare upgrades: (a) let customers **search to add** compare products via
  a text box; (b) **suggestion pills with a "+"** so they don't have to type full
  names; (c) **type-ahead suggestions after ≥3 chars typed**. Add to the compare
  modal/bar in `assets/app.js`. Test IDs **CM-12/13**.

### QA expectation from the user
"The QA agent should write a full suite of evals and test cases and test each
component of the new website even if not explicitly mentioned." → DONE (132 cases).
After building, RUN the evals (`runKlipschEvals()` in console on each page at desktop
+ 390px + 360px) and `python tests/data-validation.py`, then fill `tests/RESULTS.md`.

## 5. Current file inventory (klipsch-cro-demo/)

```
index.html              home: hero, product finder, bestsellers, categories
category.html           shop page: faceted filters + sort + search
product.html            PDP shell (JS renders it)
checkout.html           simulated checkout (phone OTP / Amazon / guest / COD)
README.md               project readme (updated for scripts/ + img/)
HANDOFF.md              <-- this file
.gitignore              ignores *.png screenshots etc.
assets/
  styles.css            all styles; copper-on-dark theme; responsive (overflow:hidden on body)
  app.js                shared chrome: header/footer/cart drawer/compare/cards/offers/toast
                        + window.KlipschApp API. LOGO already wired here (header+footer).
  data.js               GENERATED by build script. STILL HAS 10 PRODUCTS — needs regen to 18.
  home.js               hero card, product finder (5 use-case tiles), bestsellers, cat tiles
  category.js           filters (use/category/price), sort, search, deep-links ?cat= / ?q=
  product.js            PDP + buying guide + EMI/offers + pincode + related
  checkout.js           simulated checkout flows
  img/
    klipsch-logo.svg    brand logo (used in header + footer + favicon)   [ADDED]
    klipsch-logo.webp   raster fallback                                  [ADDED]
build/
  raw_products.json     STILL 10 PRODUCTS — overwrite with the 18 in Section 6
  fetch_catalog.py      note explaining how data was captured (not runnable due to CORS)
scripts/
  build_klipsch_data.py canonical generator (demo-relative paths; UPDATED for gallery/sellingPrice)
  klipsch-buying-guide-injector.js  original console snippet to inject guide on the LIVE site
tests/                  (authored by QA sub-agent — 132 cases)
  TEST-PLAN.md          full plan: GC15, HM10, CT15, PD22, CA16, CM14, CO10, RS15, DI15
  dom-evals.js          paste in console -> runKlipschEvals() -> PASS/FAIL table
  data-validation.py    python tests/data-validation.py  (already passes 10/10)
  RESULTS.md            132 test IDs, all PENDING — fill after a run
```

Also note: there's a global build script copy at the workspace root
`scripts/build_klipsch_data.py` (older paths) — prefer the demo copy.

### Data shape produced by build script (per product in `window.KLIPSCH_DATA.products`)
`sku, name, shortName, category, mrp, price, discount, savings, image, gallery[],
color, isBestSeller, inStock, specs[{key,val}], features[{label,text}], form,
bestFor[], jargon[{term,why}], verdict, emiPerMonth`.
The buying-guide rules engine (keyword→use-case, spec→jargon, verdict templating)
lives in `scripts/build_klipsch_data.py` (USE_RULES, JARGON_RULES, derive()).

### Offers (demo, in app.js)
`KLIPSCH10` = 10% off capped ₹2,000; `AUDIO5` = flat ₹500 off, min cart ₹5,000.

### Categories (5): Bluetooth Speakers, Bookshelf Speakers, Powered Bookshelf
Speakers, Soundbar Speakers, Subwoofers.

## 6. The 18-product raw data (paste into build/raw_products.json)

The full 18-product array (with `gallery` arrays of up to 6 real image URLs each) was
returned by the last `browser_evaluate` capture in the prior window. If it is not
already saved, RE-CAPTURE it by navigating Playwright to `https://www.klipschindia.com`
and fetching `https://api.smartbiz.in/stores/62469/v2/catalog/{sku}` for each of these
18 SKUs, mapping: name=`attributes.name`, mrp=`attributes.price.mrp`,
sellingPrice=`attributes.price.discountedPrice`, discount=`attributes.price.discount`,
category=`businessCategory.division`, descriptionHtml=`attributes.description`,
image=`attributes.imageInfo.primaryUrl`, gallery=`[primaryUrl, ...secondaryUrls]`,
color=`variantDimensions.color.value`, isBestSeller=`attributes.bestSeller`.

The 18 SKUs (10 original + 8 new):
```
c87cf68a-964d-489d-bd3d-5be21dfc03ce  Austin Portable BT Speaker            BT Speakers     11900/14700
1376ed0d-9867-40f7-9e3d-f61c8e21d5cf  Detroit BT Stereo Speaker             BT Speakers     34800/42900
375fd424-d648-444f-82cf-74834e466406  Flexus Core 200 Dolby Atmos Soundbar  Soundbar        66800/82300
3795c32f-ed14-4e1f-9ce8-8e5e926f7b7d  Flexus Sub 100 Wireless Subwoofer     Soundbar        46800/57600
e33c14b9-288a-465d-a3a1-94fb1d05aa91  Gig XXL Party Speaker                 BT Speakers     24800/39200
056df707-bd5c-4383-b652-bde53abc1e49  Groove XL Portable BT Speaker         BT Speakers     23850/31800
6ef3e570-fc6f-4384-9067-5ac9ee38a780  The Fives Matte Black (Powered BS)    Powered BS      99800/122900
eb3dc67e-9f37-4387-9c4a-6ac9e3b66d40  The One Plus Matte Black              BT Speakers     31800/39200
4823aa62-8541-4b16-96bc-7e9542391ab6  The One Plus Walnut                   BT Speakers     31800/39200
f065bdac-f36e-4286-8715-8c9b6f639205  The Sevens Matte Black                Powered BS      164800/202900
6922c13f-3569-4506-b754-2e23a9512135  Nashville Portable BT 5.3 Speaker     BT Speakers     17900/22100   [NEW]
9fda6370-a586-4d49-90d3-7a69ee839090  RP-600M II Bookshelf Speakers         Bookshelf       99800/99800   [NEW, 0% disc]
9746608b-68d6-4da7-8052-c59a4751a5cb  R-50PM Powered BT Bookshelf           Powered BS      72800/89600   [NEW]
dffa2ac0-220c-43a1-8b19-c9dcbaa9c8cd  The Fives Walnut (Powered BS)         Powered BS      99800/122900  [NEW]
c88fddaa-e75d-4e73-aecd-d88b66536476  RP-1000SW Reference Premiere Sub      Subwoofers      139800/139800 [NEW, 0% disc]
d10f27c0-006c-4fae-91fe-1fc18625083f  The Three Plus Matte Black            BT Speakers     51800/63800   [NEW]
0a7b5481-a916-43a6-a7c6-ce3c381d310a  The Three Plus Walnut                 BT Speakers     51800/63800   [NEW]
888408d4-39ce-41cb-be08-2a2324c7fef0  ProMedia Lumina 2.1 Gaming System     BT Speakers     46800/57600   [NEW]
```
Note: two products have discount 0 (price==mrp). The data validator (DI-03 price<mrp)
will FLAG these. Decide: either relax DI-03 to allow price<=mrp, or keep as known
warnings. The build script already computes discount from price/mrp when missing.
Also `RP-600M II` and the soundbar `Flexus Sub 100` have category nuances — Flexus
Sub 100 returns division "Soundbar Speakers" from the API (keep as-is or move to
Subwoofers; original 10-product build had it under "Subwoofers" — minor).

## 7. Known bugs already found & fixed earlier (don't regress)
- Price parsing: price/MRP/%-off are separate text nodes; parse leaf nodes
  individually (don't regex the concatenated string) — fixed in injector + build.
- PDP buying-guide placement: must anchor to `.productPriceBlock` and `.buyButtons`
  directly (climbing slot wrappers pushed it full-width to page bottom).
- SPA jump link: plain `#hash` doesn't scroll in React SPA → use JS `scrollIntoView`.
- Compare checkbox double-fire: bind to checkbox `change`, NOT label `click`
  (label+input fired twice → net zero). Test CM-02 guards this.
- Mobile horizontal overflow: `body{overflow-x:hidden}` + footer collapses to 1 col
  ≤430px; cart drawer `max-width:92vw`.

## 8. Suggested execution order for next window
1. Save 18-product `raw_products.json`; run build; confirm `data.js` has 18 + galleries.
2. Quick edits #2 (remove INDIA), #3 (cart icon), #4 (remove copy), #1 (ghost button).
3. #7 cart Remove overflow fix.
4. #8 cart-drawer recommendations (lower-priced attach logic).
5. #10 compare search-to-add + suggestion pills + type-ahead.
6. Start local server; run `runKlipschEvals()` on home/category/PDP/checkout at
   1280px, 390px, 360px; run `python tests/data-validation.py`; fill RESULTS.md.
7. Use PDP gallery now that `gallery[]` exists (product.js currently only uses single
   image — wire thumbnails to real gallery images as a nice win).
8. Commit + push items #1-8,#10 to `main`. Keep #9 on a local `feature/visual-refresh`
   branch; start a local server and hand to user for QA before any merge.
9. After live confirmation, revisit earlier deferred (a)/(b): (a) `/docs` not needed;
   (b) full-catalog expansion if user still wants beyond 18.

## 9. Open questions / decisions to confirm with user
- 18 products acceptable as the "20 more" (only 18 reachable via public API)? User
  already said "17 works" so 18 is fine — confirm.
- Two zero-discount products: keep, or hide the "% off" badge when discount==0?
- Cart recommendations (#8): how many to show (suggest 2–3), and strictly cheaper than
  the cart's max-price item (accessory/upsell-down logic).

---

## 10. APPENDIX — ALL USER PROMPTS THIS SESSION (verbatim)

> Captured in order. These are the user's messages exactly as given (environment
> context blocks and steering-rule injections omitted for brevity).

**Prompt 1**
> I want you to go through this website as a customer and report back to me - who is
> the owner of this company - with findings on how you will optimize this website for
> improving conversion of traffic landing here.https://www.klipschindia.com/

**Prompt 2**
> MCP and midway are refreshed. Only search for https://www.klipschindia.com/

**Prompt 3**
> In my view, a few things missing on the website for these product category is
> compare feature, offers section in each DP, and easy way to apply them, login should
> be simpler for unrecognized (not signed-in customers). What else can we optimize for?
> Think as a product manager and UX lead.

**Prompt 4**
> Can we implement a buying guide on the homepage and DP. This should be placed below
> price section, but see if there is a better placement available. The guide should
> ideally be powered with all the information we have of the product in the website
> (assuming we dont have external data or an LLM to fetch details from web). How can we
> get it implemented on the playwright session we have

**Prompt 5**
> Can you host it on my github which I can use to share with my team with these changes?

**Prompt 6**
> Also - post your current deployment, help me with the below:
> 1. Where is the full buying guide. The click on the link does not seem to work.
> 2. Can you also optimize the DP for desktop and mobile. It seems to have a lot of
>    white space.
> 3. Do a basic UX-based QA once done to ensure the links are working and customers can
>    checkout (actual checkout and payment not needed).

**Prompt 7**
> Can you host it on my github which I can use to share with my team with these
> changes? (GitHub had git available; user offered to create a repo to push to.)
> [Follow-up clarification in same step:] I have Git available, and can create a
> repository where you can push.

**Prompt 8**
> How will we get rich data from the existing website though to host on github? Can you
> open 5-6 product pages, and links on the original website, capture data from console
> including API calls, and build a similar website on github on my repo with the
> enhancements we are discussing?

**Prompt 9**
> Put all artefacts, codes, scripts etc in a folder inside Kiro folder please. And then
> add the logo of the company instead of text. I have webp and svg both available here
> "C:\Users\nisan\Desktop\Klipsch.webp" and "C:\Users\nisan\Desktop\Klipsch-svg.svg".
> Then Step by step to host the page on github.io page please. And then we will do a)
> and b), but we will do it once the page is live on github.

**Prompt 10**
> This is the page: https://github.com/nishants-lab/klipsch-demo.git after step 2. Can
> you run step 3 please.

**Prompt 11** (the big 10-item change request — see Section 4 for full detail)
> 1. The home page shows a blank white button for Shop bestsellers. The text comes only
>    on hover.
> 2. The logo has Klipsch logo and India. The original website
>    (https://www.klipschindia.com/) does not have India word.
> 3. Cart can be a cart icon instead of word "Cart" at the top right of the homepage.
> 4. "No coupon hunting" text is not needed.
> 5. Is a) /docs needed? Add 20 more products instead of full catalog.
> 6. What live API calls have we made? Pricing, availability, pincode serviceability?
>    Is there anything more we can do?
> 7. Remove in cart is overflowing the website - might be happening for mobile as well.
> 8. The actual website also shows "You might also like" in cart - but shows higher
>    priced items as well. Our page is not showing that widget. Also, "You might also
>    like" can have lower priced accessories or items compared to what I am buying,
>    instead of showing higher priced item which has less chances of conversion. Having
>    lower priced item may improve attach to offers and improve conversions.
> 9. Overall look and feel of website can be more welcoming. Large images look good, but
>    can hamper catalog discovery and eventually checkout. But do this in local instead
>    of merging in main.
> 10. Comparison feature and suggested products for comparison. Customers can search for
>     compare products themselves as well by adding in a text box. Suggested products can
>     be in a pill with a plus incase customers dont want to type the full name. We can
>     also implement search suggestions when customers type atleast 3 or more characters.
>     Spawn a QA agent to verify the changes async while you keep building with a UX agent
>     to ensure nothing is failing in desktop and mobile views. Both agents should work
>     hand-in-hand and ensure you dont take more than 1 hour to accomplish this entire
>     task. Except #9, you can push and merge to main. #9 is something I will QA
>     separately once you open up a local server. The QA agent should write a full suite
>     of evals and test cases and test each component of the new website even if not
>     explicitly mentioned.

**Prompt 12**
> Use https://www.klipschindia.com/all-products if you are facing issues. If not, 17 works.

**Prompt 13**
> Create a handoff doc first to continue this session to the next window, and we continue
> there. Capture all the prompts I have given you as well.

---

## 11. Earlier-session optimization analysis (context, already delivered verbatim to user)

- **Owner finding:** Site is NOT owned by Klipsch. Klipsch brand is owned by Premium
  Audio Company, LLC (a Gentex Corp subsidiary, NASDAQ: GNTX). klipschindia.com is run
  by **Cinebels = Cinerama Private Limited**, Bengaluru — the authorised India
  distributor; MD **Sanjay Agarwal**. Built on Amazon SmartBiz.
- **CRO recommendations already given:** fix broken analytics/CSP (Clarity DNS fail,
  Google Ads conversion blocked by CSP, offers API 401, reviews widget error); add
  social proof; reframe "not eligible for return"; simplify login for un-recognized
  users; decision-support (buying guide / product finder / compare); EMI & offers on
  PDP; trust/authenticity messaging; faceted discovery; cart recommendations; WhatsApp
  retention; performance/accessibility. The demo implements the high-leverage subset.
```

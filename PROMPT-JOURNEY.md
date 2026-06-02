# The prompt journey — how this project was shaped

This project (a conversion-focused concept rebuild of Klipsch India / Cinebels) was
built entirely through a conversation with Kiro. This file captures every prompt given,
in order, and — more importantly — **how each one steered where we landed**. The verbatim
prompts from the first window are preserved; the value is in seeing how a vague starting
question turned into a hosted, measured, multi-theme storefront.

The throughline: each prompt narrowed scope, added a constraint, or raised the bar — and
the cumulative effect is why the demo is grounded in real data, actually works end to end,
and is measurably better than the live site rather than just prettier.

---

## Window 1 — research → concept → hosting → real data → change request

**Prompt 1**
> I want you to go through this website as a customer and report back to me - who is the
> owner of this company - with findings on how you will optimize this website for improving
> conversion of traffic landing here. https://www.klipschindia.com/

*Why it mattered:* set the entire frame — **conversion optimisation**, viewed **as a
customer**, anchored to a **real store**. It forced an ownership investigation (surfacing
that the site is run by Cinebels, not Klipsch) and a CRO teardown that became the backlog
for everything after. Without this, the project would have been a generic template.

**Prompt 2**
> MCP and midway are refreshed. Only search for https://www.klipschindia.com/

*Why it mattered:* a guardrail. Kept the research scoped to the actual store instead of
wandering to global Klipsch properties — so findings stayed relevant to this storefront.

**Prompt 3**
> In my view, a few things missing on the website for these product category is compare
> feature, offers section in each DP, and easy way to apply them, login should be simpler
> for unrecognized (not signed-in customers). What else can we optimize for? Think as a
> product manager and UX lead.

*Why it mattered:* injected **domain expertise** and a **persona** (PM + UX lead). This is
where the feature set crystallised — compare, on-PDP offers, simpler login — and invited
expansion beyond the user's list. Many of the eventual features trace directly here.

**Prompt 4**
> Can we implement a buying guide on the homepage and DP. This should be placed below price
> section, but see if there is a better placement available. The guide should ideally be
> powered with all the information we have of the product in the website (assuming we dont
> have external data or an LLM to fetch details from web). How can we get it implemented on
> the playwright session we have.

*Why it mattered:* defined **the headline feature** and, crucially, a hard constraint —
**no external data, no runtime LLM**. That constraint is the reason the buying guide is a
deterministic, data-driven rules engine instead of an API call. It also introduced the
"use the live Playwright session" working method.

**Prompt 5**
> Can you host it on my github which I can use to share with my team with these changes?

*Why it mattered:* turned a sandbox experiment into a **shareable artifact**. Forced static,
dependency-free, GitHub-Pages-friendly architecture (relative paths, no build step) — which
shaped every technical decision afterward.

**Prompt 6**
> Also - post your current deployment, help me with the below:
> 1. Where is the full buying guide. The click on the link does not seem to work.
> 2. Can you also optimize the DP for desktop and mobile. It seems to have a lot of white space.
> 3. Do a basic UX-based QA once done to ensure the links are working and customers can
>    checkout (actual checkout and payment not needed).

*Why it mattered:* the first **quality bar**. Established that things must actually *work*
(jump link, checkout flow), be **responsive**, and be **QA'd** — not just exist. This is the
origin of the testing discipline that later became a 132-case suite.

**Prompt 7**
> Can you host it on my github which I can use to share with my team with these changes?
> [clarification] I have Git available, and can create a repository where you can push.

*Why it mattered:* unblocked hosting and explicitly authorised pushing — which is why the
git workflow (commit + push to a real repo) is part of the project rather than local-only.

**Prompt 8**
> How will we get rich data from the existing website though to host on github? Can you open
> 5-6 product pages, and links on the original website, capture data from console including
> API calls, and build a similar website on github on my repo with the enhancements we are
> discussing?

*Why it mattered:* the pivotal **"use real data"** decision. This is why the demo is backed
by genuine SmartBiz catalog data (captured via the browser console, respecting CORS) rather
than lorem-ipsum. It defined the capture → `raw_products.json` → `build_klipsch_data.py` →
`data.js` pipeline.

**Prompt 9**
> Put all artefacts, codes, scripts etc in a folder inside Kiro folder please. And then add
> the logo of the company instead of text. I have webp and svg both available here ... Then
> Step by step to host the page on github.io page please. And then we will do a) and b), but
> we will do it once the page is live on github.

*Why it mattered:* imposed **structure and brand fidelity** (real logo, organised folder)
and a **sequenced plan** (host first, enhance later). Discipline that kept the repo clean.

**Prompt 10**
> This is the page: https://github.com/nishants-lab/klipsch-demo.git after step 2. Can you
> run step 3 please.

*Why it mattered:* confirmed the repo and drove the project from "built" to **actually live**
on GitHub Pages.

**Prompt 11** — the 10-item change request
> 1. Blank white "Shop bestsellers" button (text only on hover). 2. Logo shows "India" — the
> real site doesn't. 3. Cart can be an icon, not the word "Cart". 4. Remove "No coupon
> hunting" text. 5. Is /docs needed? Add 20 more products. 6. What live API calls have we
> made (pricing, availability, pincode)? Anything more? 7. "Remove" in cart overflows (mobile
> too). 8. The live site shows "You might also like" in cart (even higher-priced) — ours
> doesn't; and lower-priced accessories may convert better. 9. Overall look & feel more
> welcoming; large images can hurt discovery/checkout — but do this locally, not in main.
> 10. Compare: let customers search to add, suggestion pills with "+", type-ahead after 3+
> chars. Spawn a QA agent to verify async while a UX agent keeps building; both hand-in-hand;
> under 1 hour; push & merge to main except #9; QA agent writes a full eval suite testing
> every component even if not explicitly mentioned.

*Why it mattered:* the **single most shaping prompt.** It was specific, prioritised, and set
the bar that defined the current state: fix real bugs, expand the catalog, justify the API
story, add attach-oriented recommendations, upgrade compare, and — critically — **write a
full test suite and verify everything works on desktop and mobile**. Item #9 (a local-only
look-and-feel revision) seeded what became the "Klipsch New" theme. Item #8's insight
(recommend *down*, not up) is now a core conversion principle in the cart.

**Prompt 12**
> Use https://www.klipschindia.com/all-products if you are facing issues. If not, 17 works.

*Why it mattered:* an unblock + a pragmatic compromise on catalog size. It's why we shipped
the **18 real SKUs actually reachable via the public API** instead of stalling on a round
"20."

**Prompt 13**
> Create a handoff doc first to continue this session to the next window, and we continue
> there. Capture all the prompts I have given you as well.

*Why it mattered:* introduced **continuity discipline** — a handoff doc capturing state and
prompts. It's the reason the work survived a context reset intact, and the direct ancestor of
this very file.

---

## Window 2 — finish the change request, then deepen

**Prompt 14 (this window's first ask): "Klipsch demo - 2nd part."**

*Why it mattered:* resumed from the handoff and **finished the 10-item batch**: expanded to
18 real products, fixed the hero button, removed the "India" wordmark, swapped the cart word
for an icon, dropped the coupon copy, fixed the cart-Remove overflow, added the cart
recommendations (lower-priced attach logic), and built the compare search-to-add with
type-ahead. The QA suite was run across desktop / 390px / 360px and all of it was committed
and pushed to `main` — exactly the bar Prompt 11 had set.

**Prompt 15 (this window): the depth request**
> 1. Build one toggle called Klisch New (like #9), where the revised look & feel lives —
> focused on improving CX/UX and conversion, not just a pretty site; all sub-links / checkout
> / features must work in the new toggle; add the missing Login button. 2. Build a .md on the
> 5 new features vs the existing site, including the live APIs we call. 3. Build a .md of all
> the prompts I gave Kiro and how important they were. 4. Is there a standard metric for how a
> website looks/functions? If yes, rate our 2 sites (incl. the new one) against klipschindia;
> if no, don't invent metrics. 5. Create a Quip with sections for #2, #3 and #4.

*Why it mattered:* raised the project from "feature-complete" to **measured and defensible.**
- The **"Klipsch New" toggle** turned the local-only #9 idea into a shippable, A/B-able theme —
  with the explicit guardrail that it must be a *real CX/conversion* redesign and everything
  must keep working. It also closed the **missing-login** gap vs the original.
- Asking for a **standard metric** (rather than letting Kiro invent one) is what brought in
  **Google Lighthouse** — an industry standard — and produced an objective scorecard showing
  the demo beats the live site by a wide margin (Perf 99 vs ~42, etc.). Running it also
  surfaced and fixed a real CLS bug (1.0 → 0.003).
- The two docs + Quip turned tacit work into **shareable artifacts** for the team.

---

## What the journey reveals

The project succeeded because the prompts did three things consistently:

1. **Anchored to reality** — a real store, real ownership, real catalog data, real APIs, and
   finally a real industry metric. Nothing was hand-waved.
2. **Set rising quality bars** — "does the link work?" → "does checkout work on mobile?" →
   "write a full eval suite" → "rate it against a standard." Each prompt assumed the last one
   was done well and pushed further.
3. **Constrained the solution space productively** — "no external LLM," "host on GitHub,"
   "static site," "don't invent metrics," "don't merge #9 to main." Constraints like these are
   what made the output buildable, shareable, and trustworthy rather than sprawling.

The single highest-leverage prompt was **#11** (the change request with a mandated QA suite),
and the highest-leverage *constraint* was **#4 + #8** (no external data; the buying guide must
run on the product's own info), because it forced the deterministic rules engine that is the
demo's signature feature.

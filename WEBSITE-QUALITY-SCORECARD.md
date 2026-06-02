# Website quality scorecard — is there a standard, and how do we score?

**Yes, there is an industry standard.** The widely accepted, vendor-neutral way to measure
how a website "looks and functions" is **Google Lighthouse**, which scores four categories
0–100, plus **Core Web Vitals** (Google's published UX metrics: LCP, CLS, INP/TBT). These
are the same metrics Google uses as a ranking and page-experience signal, so they are a
defensible, non-arbitrary yardstick. We did **not** invent any metric — everything below is
straight Lighthouse output.

- **Performance** — load speed and runtime responsiveness (built on Core Web Vitals).
- **Accessibility** — can everyone, including assistive-tech users, use it.
- **Best Practices** — security, correct APIs, console health, image handling.
- **SEO** — crawlability and discoverability fundamentals.

> Note: Lighthouse Performance has run-to-run variance (network, server load). We ran the
> live site multiple times and report the **median**. Accessibility, Best Practices and SEO
> are deterministic and were stable across runs. Lighthouse measures technical quality and
> page experience — it does **not** directly measure conversion, brand, or visual taste, so
> read it alongside the CX rationale in `NEW-FEATURES.md`.

## How it was measured

- Tool: `npx lighthouse` (Google Lighthouse), **desktop preset**, headless Chrome — identical
  settings for all three targets, so the comparison is like-for-like.
- Targets:
  - **Classic demo** — `index.html?theme=classic` (served locally)
  - **Klipsch New demo** — `index.html?theme=new` (the new toggle)
  - **Live store** — `https://www.klipschindia.com/`
- Reproduce: start a local server (`python -m http.server 8099`) and run
  `python scripts/run_lighthouse.py`. Raw JSON reports are in `build/lighthouse/`.

---

## Scorecard (Lighthouse, desktop, 0–100)

| Category | Existing site (klipschindia.com) | Demo — Classic | Demo — Klipsch New |
|---|:--:|:--:|:--:|
| **Performance** | 42 *(median of 41/42/44)* | **99** | **99** |
| **Accessibility** | 73 | **90** | **90** |
| **Best Practices** | 54 | **100** | **100** |
| **SEO** | 91 | **100** | **100** |

### Core Web Vitals & key load metrics

| Metric (lower is better) | Existing site | Demo — Classic | Demo — Klipsch New | Google "good" threshold |
|---|:--:|:--:|:--:|:--:|
| First Contentful Paint (FCP) | 1.0 s | 0.5 s | 0.5 s | < 1.8 s |
| Largest Contentful Paint (LCP) | 1.2 s | 0.9 s | 0.9 s | < 2.5 s |
| Total Blocking Time (TBT) | ~1,400 ms | 0 ms | 0 ms | < 200 ms |
| Cumulative Layout Shift (CLS) | 0.329 | 0.002 | 0.003 | < 0.1 |
| Speed Index (SI) | 3.2 s | 0.7 s | 0.6 s | < 3.4 s |

---

## Reading the results

- **The demo (both themes) scores near-perfect and beats the live store in every category.**
  The biggest gaps are **Best Practices (100 vs 54)** and **Performance (99 vs 42)**.
- **Classic and Klipsch New score effectively identically.** That's by design and is the key
  takeaway: the "welcoming" redesign is **not** paid for in speed or stability — the denser
  catalog grid, warmer palette and stronger CTAs add zero performance or accessibility cost.
  So the new look is a free CX upgrade, not a trade-off.
- **The live store's two real problems are TBT (~1.4 s) and CLS (0.329).** High blocking time
  means the page is unresponsive to taps/clicks for over a second while scripts run; a CLS of
  0.329 (Google's threshold is < 0.1) means visible content jumps around as it loads — both
  are direct conversion killers on mobile.
- **We hit the same CLS trap and fixed it.** An early version of the demo scored Performance 75
  with a CLS of ~1.0, because the header/footer were injected by JavaScript after first paint,
  shoving the page down. Reserving that space (hiding content until the chrome mounts) took CLS
  to ~0.003 and Performance to 99 — a concrete example of using the metric to find and fix a
  real UX defect, not just to grade.

## Caveats (so the numbers are used honestly)

- Lighthouse rates **technical quality and page experience**, not sales. A great score is a
  necessary foundation for conversion, not a guarantee of it — pair it with the conversion
  rationale and (in production) real A/B/Weblab data.
- The demo is a **static site with a small, embedded catalog**, so it has a structural speed
  advantage over a live SPA hitting real services. The fairest comparison is **like-for-like
  within the demo** (Classic vs Klipsch New), and **directionally** vs the live site for the
  deterministic categories (Accessibility, Best Practices, SEO) and for clear UX defects
  (CLS, TBT) that are independent of backend load.
- Accessibility 90 is strong but not 100 — full WCAG conformance still requires manual testing
  with assistive technology and expert review; Lighthouse only catches automatable checks.

## Verdict

Against the one widely accepted standard for "how a website looks and functions," **both demo
themes substantially outperform the existing klipschindia.com**, and the conversion-tuned
"Klipsch New" theme delivers that improved experience **at no measurable performance or
accessibility cost**.

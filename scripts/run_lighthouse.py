"""
run_lighthouse.py — run Google Lighthouse audits and print category scores.

Standard, industry-recognised website quality metric (Performance, Accessibility,
Best Practices, SEO; 0-100 each). Used here to objectively rate the demo (classic
and Klisch New themes) against the live klipschindia.com store.

Usage:  python scripts/run_lighthouse.py
Requires: Node/npm (uses `npx lighthouse`), a local server on :8099 for the demo.

Notes:
  - We set a dedicated TMP dir to dodge a Windows EPERM on Lighthouse's temp
    cleanup (the report still writes fine; the error is post-run only).
  - Desktop preset is used for a like-for-like comparison across all three.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "build", "lighthouse")
os.makedirs(OUT_DIR, exist_ok=True)

# dedicated temp dir to avoid EPERM on cleanup
TMP = os.path.join(OUT_DIR, "_tmp")
os.makedirs(TMP, exist_ok=True)

TARGETS = [
    ("classic", "http://localhost:8099/index.html?theme=classic"),
    ("new",     "http://localhost:8099/index.html?theme=new"),
    ("live",    "https://www.klipschindia.com/"),
]

CATS = ["performance", "accessibility", "best-practices", "seo"]


def run_one(name, url):
    out_json = os.path.join(OUT_DIR, "lh-%s.json" % name)
    env = dict(os.environ)
    env["TMP"] = TMP
    env["TEMP"] = TMP
    cmd = [
        "npx", "--yes", "lighthouse", url,
        "--only-categories=" + ",".join(CATS),
        "--output=json",
        "--output-path=" + out_json,
        "--chrome-flags=--headless --no-sandbox --disable-gpu",
        "--preset=desktop",
        "--quiet",
        "--max-wait-for-load=45000",
    ]
    print("\n=== Lighthouse: %s (%s) ===" % (name, url))
    try:
        subprocess.run(cmd, env=env, shell=True, timeout=240,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.TimeoutExpired:
        print("  (timed out, checking for partial report)")
    if not os.path.exists(out_json):
        print("  FAILED: no report written")
        return None
    with open(out_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    scores = {}
    for c in CATS:
        cat = data.get("categories", {}).get(c)
        scores[c] = round(cat["score"] * 100) if cat and cat.get("score") is not None else None
    # a few key audit metrics
    audits = data.get("audits", {})
    def metric(k):
        a = audits.get(k, {})
        return a.get("displayValue") or (round(a.get("numericValue", 0)) if a.get("numericValue") else None)
    metrics = {
        "FCP": metric("first-contentful-paint"),
        "LCP": metric("largest-contentful-paint"),
        "TBT": metric("total-blocking-time"),
        "CLS": metric("cumulative-layout-shift"),
        "SI": metric("speed-index"),
    }
    print("  scores:", scores)
    print("  metrics:", metrics)
    return {"scores": scores, "metrics": metrics, "url": url}


def main():
    results = {}
    for name, url in TARGETS:
        results[name] = run_one(name, url)
    summary_path = os.path.join(OUT_DIR, "summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print("\nWrote summary to", summary_path)
    # print a compact table
    print("\n%-10s %5s %5s %5s %5s" % ("target", "Perf", "A11y", "BP", "SEO"))
    for name in results:
        r = results[name]
        if not r:
            print("%-10s   (no report)" % name)
            continue
        s = r["scores"]
        print("%-10s %5s %5s %5s %5s" % (name, s["performance"], s["accessibility"], s["best-practices"], s["seo"]))


if __name__ == "__main__":
    main()

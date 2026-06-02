"""
build_klipsch_data.py

Transforms the raw Klipsch product data (captured from the live SmartBiz
storefront API) into the data.js file consumed by the static CRO demo site.

For each product it:
  - parses the description HTML into structured spec key/values + feature bullets
  - derives a "form factor" and "best for" use-case tags (the buying-guide rules engine)
  - builds a plain-language jargon list from the spec text

Input : klipsch-cro-demo/build/raw_products.json
Output: klipsch-cro-demo/assets/data.js  (window.KLIPSCH_DATA.products = [...])

Re-run after editing raw_products.json:  python scripts/build_klipsch_data.py
"""
import json
import re
import os

# This script lives in <demo>/scripts/, so the demo root is one level up.
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "build", "raw_products.json")
OUT = os.path.join(ROOT, "assets", "data.js")

CATEGORIES = [
    {"id": "bcefac8e", "name": "Bluetooth Speakers", "count": 15},
    {"id": "b6cad1e1", "name": "Bookshelf Speakers", "count": 5},
    {"id": "04995441", "name": "Powered Bookshelf Speakers", "count": 10},
    {"id": "6caaae9f", "name": "Soundbar Speakers", "count": 7},
    {"id": "973e7b37", "name": "Subwoofers", "count": 11},
]
COLLECTIONS = [
    {"id": "best", "name": "Best Sellers"},
    {"id": "portable", "name": "Portable"},
    {"id": "tv", "name": "TV Solutions"},
    {"id": "epic", "name": "Epic Performance"},
    {"id": "luxury", "name": "Luxury"},
    {"id": "atmos", "name": "Dolby Atmos"},
    {"id": "stereo", "name": "Stereo"},
]

USE_RULES = [
    (["hdmi-arc", "dolby atmos", "soundbar", " tv", "home theater"], "TV & movies"),
    (["phono", "turntable", "vinyl"], "Vinyl & turntables"),
    (["party", "light show", "mic input", "karaoke", "dual 6.5"], "Parties & gatherings"),
    (["portable", "travel", "battery", "waterproof", "ip67", "ipx4"], "Travel & outdoors"),
    (["subwoofer", "deep bass output", "built-in subwoofer"], "Adding bass / home theatre"),
    (["bookshelf", "stereo", "desktop"], "Music & stereo listening"),
    (["bluetooth"], "Wireless streaming"),
    (["built-in mic", "hands-free", "answer calls"], "Hands-free calls"),
    (["high-res", "24-bit", "192khz", "audiophile"], "Critical / Hi-Res listening"),
]

JARGON_RULES = [
    (r"bluetooth\s*5", "Bluetooth 5.x", "Latest wireless standard - stable pairing and longer range than older Bluetooth."),
    (r"hdmi-?arc", "HDMI-ARC", "Connects to your TV with one cable and syncs volume with the TV remote."),
    (r"dolby atmos", "Dolby Atmos", "Adds height / overhead sound for a 3D, cinema-style effect."),
    (r"phono", "Phono input", "Plug a turntable in directly - no separate phono preamp needed."),
    (r"tractrix|horn-loaded|horn", "Tractrix Horn", "Klipsch's signature design for clear, detailed, efficient sound."),
    (r"passive radiator", "Passive radiators", "Produce deeper bass than the cabinet size suggests, without a powered sub."),
    (r"full-range driver", "Full-range driver", "A single driver handles highs and lows - simple, balanced sound."),
    (r"24-?bit|192khz|high-res|hi-res", "Hi-Res / 24-bit audio", "Decodes studio-quality files with more detail than standard streaming."),
    (r"\beq\b|adjustable eq", "Adjustable EQ", "Tune bass, mids and treble to taste, usually via the companion app."),
    (r"ip67|ipx4|waterproof|water-resistant", "IP rating / Waterproof", "Resists dust and water - safe for outdoors, pool-side and travel."),
    (r"onkyo", "Onkyo tuning", "Sound tuned by Onkyo, a respected Japanese audio engineering brand."),
    (r"bi-amplified|2\.1", "2.1 / Bi-amplified", "Separate amps for woofer and drivers - cleaner, more powerful sound."),
]

SPEC_KEYS_WANTED = [
    "output power", "speaker maximum output power", "maximum output power",
    "connectivity", "connectivity technology", "audio output mode",
    "frequency response", "mounting type", "special feature",
    "subwoofer diameter", "dimensions", "country of origin",
]


def strip_tags(html):
    return re.sub(r"<[^>]+>", "", html).replace("&amp;", "&").strip()


def parse_description(html):
    """Return (specs[list of {key,val}], features[list of {label,text}])."""
    specs, features = [], []
    # split into <li> blocks
    for m in re.finditer(r"<li>(.*?)</li>", html, re.S):
        inner = m.group(1)
        sm = re.search(r"<strong[^>]*>(.*?)</strong>(.*)", inner, re.S)
        if not sm:
            continue
        key = strip_tags(sm.group(1)).rstrip(":").strip()
        val = strip_tags(sm.group(2)).lstrip(":").strip()
        if not key:
            continue
        low = key.lower()
        if any(w == low or w in low for w in SPEC_KEYS_WANTED):
            if val:
                specs.append({"key": key, "val": val})
        else:
            if val:
                features.append({"label": key, "text": val})
    return specs, features


def derive(name, html):
    hay = (name + " " + strip_tags(html)).lower()

    if "soundbar" in hay:
        form = "soundbar"
    elif "subwoofer" in hay:
        form = "subwoofer"
    elif "powered bookshelf" in hay or ("bookshelf" in hay and ("hdmi" in hay or "powered" in hay)):
        form = "powered bookshelf speaker"
    elif "bookshelf" in hay:
        form = "bookshelf speaker"
    elif "party" in hay:
        form = "party speaker"
    elif "portable" in hay or "travel" in hay:
        form = "portable speaker"
    else:
        form = "speaker"

    best = []
    for keys, tag in USE_RULES:
        if any(k in hay for k in keys) and tag not in best:
            best.append(tag)
    best = best[:4]

    jargon = []
    for pat, term, why in JARGON_RULES:
        if re.search(pat, hay) and not any(j["term"] == term for j in jargon):
            jargon.append({"term": term, "why": why})
    jargon = jargon[:6]

    if any(w in hay for w in ["compact", "portable", "mini", "travel"]):
        size = "compact, easy-to-carry"
    elif any(w in hay for w in ["flagship", "reference", "premiere", "the sevens", "the nines"]) or "400 watt" in hay:
        size = "premium, high-performance"
    else:
        size = "well-rounded"

    verdict = "A {} {}".format(size, form)
    if best:
        verdict += ", best suited for {}.".format(" and ".join(best[:2]).lower())
    else:
        verdict += "."
    return form, best, jargon, verdict


def main():
    with open(RAW, "r", encoding="utf-8") as f:
        raw = json.load(f)

    products = []
    for p in raw:
        specs, features = parse_description(p["descriptionHtml"])
        form, best, jargon, verdict = derive(p["name"], p["descriptionHtml"])
        # short display name: take text before the first | or ( or , clause
        short = re.split(r"\s[|(]", p["name"])[0]
        short = re.sub(r"\s+(with|featuring)\b.*$", "", short, flags=re.I).strip()
        price = p["sellingPrice"] if p.get("sellingPrice") else p["mrp"]
        discount = p.get("discount") or (round((1 - price / p["mrp"]) * 100) if p["mrp"] else 0)
        gallery = p.get("gallery") or ([p["image"]] if p.get("image") else [])
        products.append({
            "sku": p["sku"],
            "name": p["name"],
            "shortName": short,
            "category": p["category"],
            "mrp": p["mrp"],
            "price": price,
            "discount": discount,
            "savings": p["mrp"] - price,
            "image": p["image"],
            "gallery": gallery,
            "color": p.get("color", "Black"),
            "isBestSeller": p.get("isBestSeller", False),
            "inStock": p.get("inStock", True),
            "specs": specs,
            "features": features,
            "form": form,
            "bestFor": best,
            "jargon": jargon,
            "verdict": verdict,
            "emiPerMonth": round(price / 12),
        })

    header = (
        "/*\n"
        " * Klipsch India - product catalog data (CRO demo)\n"
        " * Source: live SmartBiz storefront API (api.smartbiz.in / store 62469),\n"
        " * featuredProductsList payload. Real public product data only.\n"
        " * Generated by scripts/build_klipsch_data.py - do not edit by hand.\n"
        " */\n"
    )
    payload = {
        "store": {"name": "Klipsch India", "operator": "Cinebels (Cinerama Pvt. Ltd.)", "storeId": 62469},
        "categories": CATEGORIES,
        "collections": COLLECTIONS,
        "products": products,
    }
    js = header + "window.KLIPSCH_DATA = " + json.dumps(payload, indent=2, ensure_ascii=False) + ";\n"

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(js)

    print("Wrote {} products to {}".format(len(products), OUT))
    for pr in products:
        print("  - {:<45} {:>9}  best:{}".format(pr["shortName"][:45], "Rs" + str(pr["price"]), ", ".join(pr["bestFor"][:3])))


if __name__ == "__main__":
    main()

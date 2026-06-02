#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Klipsch India CRO Demo - Catalog Data Validation
=================================================
Standalone, re-runnable validator for ``assets/data.js``.

It loads ``window.KLIPSCH_DATA`` by stripping the JS wrapper
(``window.KLIPSCH_DATA = ... ;``) and parsing the remaining JSON, then validates
every product object against the buying-guide / pricing contract used by the UI.

Checks (per product, IDs mirror tests/TEST-PLAN.md section 9):
  DI-01  required keys present
  DI-02  price & mrp are numbers (not strings / None)
  DI-03  price <= mrp (0% discount / at-MRP products are valid real data)
  DI-04  discount ~= round((1 - price/mrp) * 100)  within +/- 2
  DI-05  emiPerMonth == round(price / 12)
  DI-06  savings == mrp - price
  DI-07  image starts with "https"
  DI-08  bestFor is a non-empty list
  DI-09  specs is a list (of {key,val})
  DI-10  jargon is a list (of {term,why})
  DI-11  verdict is a non-empty string
  DI-12  no NaN in numeric fields
  DI-13  sku unique across catalog (catalog-level)
  DI-14  category exists in DATA.categories (catalog-level)

Usage:
    python tests/data-validation.py
    python tests/data-validation.py --data path/to/data.js

Exit code:
    0  all products valid
    1  one or more validation failures
    2  could not locate / parse data.js
Only the Python standard library is used.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REQUIRED_KEYS = [
    "sku", "name", "price", "mrp", "image",
    "bestFor", "specs", "jargon", "verdict", "emiPerMonth",
]
# Extra keys the UI also relies on (reported as warnings if absent, not failures).
RECOMMENDED_KEYS = ["shortName", "category", "discount", "savings"]

DISCOUNT_TOLERANCE = 2  # +/- percentage points allowed vs. computed discount


def default_data_path() -> str:
    """assets/data.js sits one directory up from this tests/ folder."""
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, "..", "assets", "data.js"))


# ---------------------------------------------------------------------------
# Loading / parsing
# ---------------------------------------------------------------------------

def load_klipsch_data(path: str) -> dict:
    """Read data.js, strip the ``window.KLIPSCH_DATA = ...;`` wrapper, parse JSON.

    Raises:
        FileNotFoundError: file missing.
        ValueError: wrapper not found or JSON invalid.
    """
    with open(path, "r", encoding="utf-8") as fh:
        raw = fh.read()

    # Locate the assignment, tolerating whitespace: window . KLIPSCH_DATA =
    match = re.search(r"window\s*\.\s*KLIPSCH_DATA\s*=\s*", raw)
    if not match:
        raise ValueError("Could not find 'window.KLIPSCH_DATA =' assignment in data.js")

    body = raw[match.end():].strip()

    # Drop a single trailing semicolon (and any trailing whitespace/newlines).
    if body.endswith(";"):
        body = body[:-1].rstrip()

    try:
        return json.loads(body)
    except json.JSONDecodeError as exc:
        raise ValueError("data.js payload is not valid JSON: %s" % exc)


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def is_number(value) -> bool:
    """True for int/float that is not a bool and not NaN/inf."""
    if isinstance(value, bool):
        return False
    if not isinstance(value, (int, float)):
        return False
    return not (math.isnan(value) or math.isinf(value))


class ProductReport:
    """Accumulates failures/warnings for a single product."""

    def __init__(self, index: int, product: dict):
        self.index = index
        self.sku = product.get("sku", "<no-sku>")
        self.name = product.get("shortName") or product.get("name") or "<unnamed>"
        self.failures: list[str] = []
        self.warnings: list[str] = []

    def fail(self, check_id: str, message: str) -> None:
        self.failures.append("[%s] %s" % (check_id, message))

    def warn(self, message: str) -> None:
        self.warnings.append(message)

    @property
    def ok(self) -> bool:
        return not self.failures


def validate_product(index: int, p: dict) -> ProductReport:
    """Run all per-product checks; return a ProductReport."""
    r = ProductReport(index, p)

    # DI-01 required keys ----------------------------------------------------
    for key in REQUIRED_KEYS:
        if key not in p:
            r.fail("DI-01", "missing required key '%s'" % key)
    for key in RECOMMENDED_KEYS:
        if key not in p:
            r.warn("missing recommended key '%s'" % key)

    price = p.get("price")
    mrp = p.get("mrp")
    discount = p.get("discount")
    emi = p.get("emiPerMonth")
    savings = p.get("savings")

    # DI-02 / DI-12 numeric, no NaN -----------------------------------------
    price_num = is_number(price)
    mrp_num = is_number(mrp)
    if not price_num:
        r.fail("DI-02", "price is not a valid number: %r" % (price,))
    if not mrp_num:
        r.fail("DI-02", "mrp is not a valid number: %r" % (mrp,))
    if "discount" in p and not is_number(discount):
        r.fail("DI-12", "discount is not a valid number (NaN?): %r" % (discount,))
    if "emiPerMonth" in p and not is_number(emi):
        r.fail("DI-12", "emiPerMonth is not a valid number (NaN?): %r" % (emi,))
    if "savings" in p and not is_number(savings):
        r.fail("DI-12", "savings is not a valid number (NaN?): %r" % (savings,))

    # DI-03 price <= mrp (0% discount / at-MRP products are valid real data) ----
    if price_num and mrp_num:
        if not (price <= mrp):
            r.fail("DI-03", "price (%s) is greater than mrp (%s)" % (price, mrp))

        # DI-04 discount within tolerance -----------------------------------
        if is_number(discount):
            computed = round((1 - price / mrp) * 100)
            if abs(discount - computed) > DISCOUNT_TOLERANCE:
                r.fail("DI-04", "discount %s%% off computed %s%% by >%d pts"
                       % (discount, computed, DISCOUNT_TOLERANCE))

        # DI-06 savings == mrp - price --------------------------------------
        if is_number(savings):
            expected_sav = mrp - price
            if savings != expected_sav:
                r.fail("DI-06", "savings %s != mrp-price %s" % (savings, expected_sav))

    # DI-05 emiPerMonth == round(price/12) ----------------------------------
    if price_num and is_number(emi):
        expected_emi = round(price / 12)
        if emi != expected_emi:
            r.fail("DI-05", "emiPerMonth %s != round(price/12)=%s" % (emi, expected_emi))

    # DI-07 image https ------------------------------------------------------
    image = p.get("image")
    if not isinstance(image, str) or not image.startswith("https"):
        r.fail("DI-07", "image must start with 'https': %r" % (image,))

    # DI-08 bestFor non-empty list ------------------------------------------
    best_for = p.get("bestFor")
    if not isinstance(best_for, list) or len(best_for) == 0:
        r.fail("DI-08", "bestFor must be a non-empty array: %r" % (best_for,))

    # DI-09 specs is list ----------------------------------------------------
    specs = p.get("specs")
    if not isinstance(specs, list):
        r.fail("DI-09", "specs must be an array: %r" % (type(specs).__name__,))
    else:
        for i, s in enumerate(specs):
            if not (isinstance(s, dict) and "key" in s and "val" in s):
                r.fail("DI-09", "specs[%d] missing key/val: %r" % (i, s))

    # DI-10 jargon is list ---------------------------------------------------
    jargon = p.get("jargon")
    if not isinstance(jargon, list):
        r.fail("DI-10", "jargon must be an array: %r" % (type(jargon).__name__,))
    else:
        for i, j in enumerate(jargon):
            if not (isinstance(j, dict) and "term" in j and "why" in j):
                r.fail("DI-10", "jargon[%d] missing term/why: %r" % (i, j))

    # DI-11 verdict non-empty string ----------------------------------------
    verdict = p.get("verdict")
    if not isinstance(verdict, str) or not verdict.strip():
        r.fail("DI-11", "verdict must be a non-empty string: %r" % (verdict,))

    return r


def validate_catalog(data: dict) -> tuple[list[ProductReport], list[str]]:
    """Run per-product + catalog-level checks. Returns (reports, catalog_errors)."""
    products = data.get("products")
    catalog_errors: list[str] = []

    if not isinstance(products, list) or not products:
        catalog_errors.append("DATA.products is missing or empty")
        return [], catalog_errors

    reports = [validate_product(i, p) for i, p in enumerate(products)]

    # DI-13 unique skus ------------------------------------------------------
    seen: dict[str, int] = {}
    for p in products:
        sku = p.get("sku")
        seen[sku] = seen.get(sku, 0) + 1
    dups = [sku for sku, n in seen.items() if n > 1]
    if dups:
        catalog_errors.append("DI-13 duplicate sku(s): %s" % ", ".join(map(str, dups)))

    # DI-14 product.category exists in DATA.categories ----------------------
    cat_names = {c.get("name") for c in data.get("categories", []) if isinstance(c, dict)}
    if cat_names:
        unknown = sorted({
            p.get("category") for p in products
            if p.get("category") and p.get("category") not in cat_names
        })
        if unknown:
            catalog_errors.append(
                "DI-14 product category not in DATA.categories: %s" % ", ".join(unknown)
            )

    return reports, catalog_errors


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------

def print_report(reports: list[ProductReport], catalog_errors: list[str], data: dict) -> int:
    """Print a human-readable report. Returns process exit code."""
    line = "=" * 72
    print(line)
    print("KLIPSCH INDIA — CATALOG DATA VALIDATION")
    store = (data.get("store") or {}).get("name", "?")
    print("Store: %s   Products: %d   Categories: %d"
          % (store, len(reports), len(data.get("categories", []))))
    print(line)

    total_failures = 0
    for r in reports:
        status = "PASS" if r.ok else "FAIL"
        marker = " " if r.ok else "x"
        print("[%s] %s  #%-2d  %-34s  (%s)"
              % (status, marker, r.index + 1, (r.name[:34]), r.sku))
        for msg in r.failures:
            print("        FAIL %s" % msg)
            total_failures += 1
        for w in r.warnings:
            print("        warn %s" % w)

    print(line)
    if catalog_errors:
        print("CATALOG-LEVEL ERRORS:")
        for e in catalog_errors:
            print("   FAIL %s" % e)
        print(line)

    products_failed = sum(1 for r in reports if not r.ok)
    products_passed = len(reports) - products_failed

    print("SUMMARY: %d passed, %d failed (product-level failures: %d, catalog errors: %d)"
          % (products_passed, products_failed, total_failures, len(catalog_errors)))
    print(line)

    if products_failed or catalog_errors:
        print("RESULT: FAIL")
        return 1
    print("RESULT: PASS — all %d products valid." % len(reports))
    return 0


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Validate Klipsch CRO demo catalog data.js")
    parser.add_argument("--data", default=default_data_path(),
                        help="path to assets/data.js (default: ../assets/data.js)")
    args = parser.parse_args(argv)

    try:
        data = load_klipsch_data(args.data)
    except FileNotFoundError:
        print("ERROR: data.js not found at: %s" % args.data, file=sys.stderr)
        return 2
    except ValueError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2

    reports, catalog_errors = validate_catalog(data)
    if not reports and catalog_errors:
        for e in catalog_errors:
            print("FAIL %s" % e, file=sys.stderr)
        return 1

    return print_report(reports, catalog_errors, data)


if __name__ == "__main__":
    sys.exit(main())

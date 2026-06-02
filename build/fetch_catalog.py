"""
fetch_catalog.py — placeholder note.

The catalog data in raw_products.json was captured live from the SmartBiz
storefront API (api.smartbiz.in/stores/62469/v2/catalog/{sku}) via the browser
session (CORS prevents calling it from this static origin / from Python here).

SKUs were discovered by snowballing the recommendations campaign endpoint
(/campaigns/{id}/recommendations?sku=...) plus the /all-products page. The
captured objects (name, mrp, discountedPrice, discount, description HTML,
primaryUrl + secondaryUrls gallery, color, bestSeller) were written directly
into raw_products.json, which scripts/build_klipsch_data.py transforms into
assets/data.js.

To refresh in future: open https://www.klipschindia.com in a browser, and in the
console fetch `https://api.smartbiz.in/stores/62469/v2/catalog/<sku>` for each SKU.
"""

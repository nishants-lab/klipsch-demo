/* Product Detail Page: renders gallery, buy box, the BUYING GUIDE (verdict strip
   below price + full guide below buy box), EMI + offers, trust, compare, related. */
(function () {
  var A = window.KlipschApp, P = A.PRODUCTS, esc = A.esc, inr = A.inr;
  var sku = new URLSearchParams(location.search).get("sku");
  var p = A.bySku(sku) || P[0];

  A.mountChrome("");
  document.querySelector("[data-title]").textContent = "Buy " + p.name + " | Klipsch India";
  var dEl = document.querySelector("[data-desc]"); if (dEl) dEl.setAttribute("content", p.shortName + " - genuine Klipsch with official warranty, EMI & COD from India's authorised distributor.");

  /* ---- gallery: use the single product image as main + thumbs (demo) ---- */
  var imgs = [p.image];

  /* ---- buying guide pieces (data already computed by build script) ---- */
  var bestChips = p.bestFor.map(function (t) { return '<span class="pill">' + esc(t) + '</span>'; }).join("");

  var specRows = p.specs.map(function (s) {
    return '<div class="spec-row"><span class="k">' + esc(s.key) + '</span><span class="v">' + esc(s.val) + '</span></div>';
  }).join("") || '<div style="font-size:13px;color:var(--muted)">Specs not listed.</div>';

  var jargonRows = p.jargon.map(function (j) {
    return '<div class="jargon-row"><div class="term">' + esc(j.term) + '</div><div class="why">' + esc(j.why) + '</div></div>';
  }).join("") || '<div style="font-size:13px;color:var(--muted)">No technical terms to explain.</div>';

  var goodToKnow = [
    ["Warranty", "Sold by the authorised Klipsch India distributor (Cinerama Pvt. Ltd.) with official brand warranty."],
    ["Returns", "Covered by manufacturer warranty for defects; contact support for DOA / damaged units."],
    ["Payment", "No-cost / standard EMI, COD and secure online payment available at checkout."],
    ["Delivery", "Free delivery on orders above \u20B91,000; typically delivered in 2-5 days."]
  ];
  var gtk = goodToKnow.map(function (k) { return '<li><strong>' + k[0] + ':</strong> ' + k[1] + '</li>'; }).join("");

  /* ---- features (About this item) ---- */
  var featRows = p.features.map(function (f) { return '<li><strong>' + esc(f.label) + ':</strong> ' + esc(f.text) + '</li>'; }).join("");

  /* ---- offers eligible for this product (demo) ---- */
  var eligible = A.OFFERS.filter(function (o) { return p.price >= (o.min || 0); });
  var offerRows = eligible.map(function (o) {
    return '<div class="offer-row"><span><b>' + o.code + '</b> - ' + esc(o.label) + '</span><button data-apply-offer="' + o.code + '">Apply</button></div>';
  }).join("") || '<div style="font-size:13px;color:var(--muted)">No offers on this product right now.</div>';

  /* ---- assemble PDP ---- */
  var html =
    '<nav class="crumb"><a href="index.html">Home</a> / <a href="category.html?cat=' + encodeURIComponent(p.category) + '">' + esc(p.category) + '</a> / ' + esc(p.shortName) + '</nav>' +
    '<div class="pdp">' +
      // gallery
      '<div class="gallery"><div class="main"><img src="' + p.image + '" alt="' + esc(p.shortName) + '" data-main-img></div>' +
        '<div class="thumbs">' + imgs.map(function (s, i) { return '<div class="' + (i === 0 ? "active" : "") + '"><img src="' + s + '" alt="view ' + (i + 1) + '"></div>'; }).join("") + '</div>' +
      '</div>' +
      // info column
      '<div class="info">' +
        '<h1>' + esc(p.name) + '</h1>' +
        '<div class="rating-row"><span class="stars">\u2605\u2605\u2605\u2605\u2605</span> <b>4.6</b> &middot; <a href="#reviews" style="color:var(--copper)">128 ratings</a> &middot; <span>Bestseller</span></div>' +

        // PRICE
        '<div class="price-block"><span class="now">' + inr(p.price) + '</span><span class="was">' + inr(p.mrp) + '</span><span class="off">' + p.discount + '% off</span></div>' +
        '<p class="incl">Inclusive of all taxes</p>' +

        // ===== BUYING GUIDE: QUICK VERDICT STRIP (directly below price) =====
        '<div class="guide-strip">' +
          '<div class="hd">\uD83E\uDDED BUYING GUIDE \u00B7 QUICK VERDICT</div>' +
          '<div class="verdict">' + esc(p.verdict) + '</div>' +
          (p.bestFor.length ? '<div class="bf-label">BEST FOR</div><div>' + bestChips + '</div>' : "") +
          '<div class="save">You save ' + inr(p.savings) + ' (' + p.discount + '% off MRP) on this purchase.</div>' +
          '<span class="jump" data-jump>\u2193 See full buying guide</span>' +
        '</div>' +

        // EMI + OFFERS
        '<div class="emi-offers">' +
          '<div class="box"><div class="lbl">EMI</div><div class="big">From ' + inr(p.emiPerMonth) + '/mo</div><div class="sm">12-mo, no-cost EMI on select cards</div></div>' +
          '<div class="box"><div class="lbl">Offers</div><div class="big">' + eligible.length + ' available</div><div class="sm">Apply below - no coupon hunting</div></div>' +
        '</div>' +
        '<div data-offers>' + offerRows + '</div>' +

        // BUY BUTTONS
        '<div class="buy-row"><button class="btn btn-primary" style="flex:1" data-add>Add to Cart</button>' +
        '<button class="btn btn-dark" style="flex:1" data-buy>Buy Now</button></div>' +

        // trust strip
        '<div class="trust-strip">' +
          '<div class="t"><div class="ic">\uD83D\uDD12</div>Secure payments</div>' +
          '<div class="t"><div class="ic">\u2705</div>Genuine &amp; warrantied</div>' +
          '<div class="t"><div class="ic">\uD83C\uDFE7</div>Expert support</div>' +
          '<div class="t"><div class="ic">\uD83D\uDE9A</div>Free delivery 2-5 days</div>' +
        '</div>' +

        // delivery pincode
        '<div class="deliver"><h4>Check delivery</h4><div class="pin"><input placeholder="Enter pincode" maxlength="6" data-pin><button class="btn btn-ghost" data-pin-btn>Check</button></div><div data-pin-result style="font-size:13px;color:var(--green);margin-top:8px;display:none"></div></div>' +

        // ===== FULL BUYING GUIDE (below buy box) =====
        '<section class="full-guide" id="full-guide">' +
          '<div class="fg-head">\uD83E\uDDED Buying Guide <span class="meta">Generated from this product\u2019s details</span></div>' +
          '<div class="fg-body"><div class="fg-cols">' +
            '<div><div class="fg-h">SPECS AT A GLANCE</div>' + specRows + '</div>' +
            '<div><div class="fg-h">WHAT THE FEATURES MEAN</div>' + jargonRows + '</div>' +
          '</div>' +
          '<div class="gtk"><div class="fg-h">GOOD TO KNOW</div><ul>' + gtk + '</ul></div>' +
          '</div>' +
        '</section>' +

        // description
        (featRows ? '<div class="desc"><p class="dh">About this item</p><ul>' + featRows + '</ul></div>' : "") +
      '</div>' +
    '</div>';

  document.querySelector("[data-pdp]").innerHTML = html;

  /* ---- wire interactions ---- */
  document.querySelector("[data-add]").addEventListener("click", function () { A.addToCart(p.sku, 1); });
  document.querySelector("[data-buy]").addEventListener("click", function () { A.addToCart(p.sku, 1); location.href = "checkout.html"; });
  document.querySelector("[data-jump]").addEventListener("click", function () {
    document.getElementById("full-guide").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-apply-offer]"), function (b) {
    b.addEventListener("click", function () {
      A.applyOffer(b.getAttribute("data-apply-offer"));
      b.outerHTML = '<span class="offer-applied">\u2713 Applied</span>';
      A.toast("Offer applied - see it in your cart");
    });
  });
  var pinBtn = document.querySelector("[data-pin-btn]");
  pinBtn.addEventListener("click", function () {
    var v = document.querySelector("[data-pin]").value.trim();
    var r = document.querySelector("[data-pin-result]");
    r.style.display = "block";
    r.textContent = (/^\d{6}$/.test(v)) ? "\u2713 Delivers to " + v + " in 2-5 days \u00B7 Free over \u20B91,000" : "Enter a valid 6-digit pincode";
    r.style.color = (/^\d{6}$/.test(v)) ? "var(--green)" : "#c0392b";
  });

  /* ---- related: same category first, then others ---- */
  var related = P.filter(function (x) { return x.sku !== p.sku && x.category === p.category; })
    .concat(P.filter(function (x) { return x.sku !== p.sku && x.category !== p.category; }))
    .slice(0, 4);
  A.renderGrid("[data-related]", related);
})();

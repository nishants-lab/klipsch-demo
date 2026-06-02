/* Klipsch India CRO demo - shared app logic
   Pure vanilla JS, no build step. Works on GitHub Pages and from file://.
   State (cart, compare) persists in localStorage so it survives navigation. */
(function () {
  "use strict";
  var DATA = window.KLIPSCH_DATA || { products: [], categories: [], collections: [] };
  var PRODUCTS = DATA.products;

  /* ---------- helpers ---------- */
  function inr(n) { return "\u20B9" + Number(n).toLocaleString("en-IN"); }
  function bySku(sku) { return PRODUCTS.filter(function (p) { return p.sku === sku; })[0]; }
  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function pageUrl(p) { return "product.html?sku=" + encodeURIComponent(p.sku); }

  /* ---------- persistent state ---------- */
  function load(key, def) { try { return JSON.parse(localStorage.getItem(key)) || def; } catch (e) { return def; } }
  function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  var cart = load("klipsch_cart", []);      // [{sku, qty}]
  var compare = load("klipsch_compare", []); // [sku]
  var appliedOffer = load("klipsch_offer", null);

  /* ---------- offers (demo) ---------- */
  var OFFERS = [
    { code: "KLIPSCH10", label: "10% instant discount (max \u20B92,000)", pct: 10, max: 2000 },
    { code: "AUDIO5", label: "Flat \u20B9500 off above \u20B95,000", flat: 500, min: 5000 }
  ];

  /* ---------- toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- cart ops ---------- */
  function cartCount() { return cart.reduce(function (n, i) { return n + i.qty; }, 0); }
  function cartTotals() {
    var mrp = 0, price = 0;
    cart.forEach(function (it) {
      var p = bySku(it.sku); if (!p) return;
      mrp += p.mrp * it.qty; price += p.price * it.qty;
    });
    var offerDiscount = 0;
    if (appliedOffer) {
      var o = OFFERS.filter(function (x) { return x.code === appliedOffer; })[0];
      if (o && price >= (o.min || 0)) {
        offerDiscount = o.flat ? o.flat : Math.min(Math.round(price * o.pct / 100), o.max || Infinity);
      }
    }
    return { mrp: mrp, price: price, offerDiscount: offerDiscount, payable: price - offerDiscount, mrpSaving: mrp - price };
  }
  function addToCart(sku, qty) {
    var ex = cart.filter(function (i) { return i.sku === sku; })[0];
    if (ex) ex.qty += (qty || 1); else cart.push({ sku: sku, qty: qty || 1 });
    save("klipsch_cart", cart); renderCart(); updateCartCount();
    toast(bySku(sku).shortName + " added to cart");
    openCart();
  }
  function setQty(sku, qty) {
    cart = cart.map(function (i) { return i.sku === sku ? { sku: sku, qty: qty } : i; }).filter(function (i) { return i.qty > 0; });
    save("klipsch_cart", cart); renderCart(); updateCartCount();
  }
  function updateCartCount() { qsa("[data-cart-count]").forEach(function (e) { e.textContent = cartCount(); }); }

  /* ---------- compare ops ---------- */
  function toggleCompare(sku) {
    var i = compare.indexOf(sku);
    if (i >= 0) compare.splice(i, 1);
    else { if (compare.length >= 4) { toast("Compare up to 4 products"); return; } compare.push(sku); }
    save("klipsch_compare", compare); renderCompareBar(); syncCompareChecks();
  }
  function syncCompareChecks() {
    qsa("[data-compare-sku]").forEach(function (el) {
      var on = compare.indexOf(el.getAttribute("data-compare-sku")) >= 0;
      var box = qs("input", el); if (box) box.checked = on;
    });
  }

  /* =====================================================================
     HEADER / FOOTER / CHROME  (injected so every page shares one source)
  ===================================================================== */
  function chrome(active) {
    var links = [
      ["index.html", "Home"], ["category.html", "Shop"],
      ["index.html#finder", "Find your Klipsch"], ["index.html#bestsellers", "Best Sellers"]
    ];
    var nav = links.map(function (l) {
      var a = (active && l[1].toLowerCase().indexOf(active.toLowerCase()) >= 0) ? " active" : "";
      return '<a class="' + a.trim() + '" href="' + l[0] + '">' + l[1] + "</a>";
    }).join("");
    return '' +
      '<div class="demo-banner wrap-full">CRO concept demo for <b>Cinebels / Klipsch India</b> \u2014 built from real catalog data. Not the live store; checkout is simulated.</div>' +
      '<div class="announce"><span>MANAGED BY CINEBELS &nbsp;|&nbsp; AUTHORISED KLIPSCH DISTRIBUTOR &nbsp;|&nbsp; EMI &amp; COD AVAILABLE &nbsp;|&nbsp; FREE DELIVERY ABOVE \u20B91,000</span></div>' +
      '<header class="site"><div class="wrap nav">' +
      '<button class="menu-toggle" aria-label="Menu">\u2630</button>' +
      '<a class="brand" href="index.html" aria-label="Klipsch India home"><img src="assets/img/klipsch-logo.svg" alt="Klipsch India" class="brand-logo"><span class="brand-sub">INDIA</span></a>' +
      '<div class="search"><input type="text" placeholder="Search speakers, soundbars, subwoofers\u2026" aria-label="Search products"></div>' +
      '<nav class="nav-links">' + nav + "</nav>" +
      '<button class="cart-btn" data-open-cart aria-label="Open cart">Cart <span class="cart-count" data-cart-count>0</span></button>' +
      "</div></header>";
  }
  function footer() {
    return '<footer class="site"><div class="wrap cols">' +
      '<div><div class="brand brand-footer" style="margin-bottom:10px"><img src="assets/img/klipsch-logo.svg" alt="Klipsch India" class="brand-logo"><span class="brand-sub">INDIA</span></div>' +
      '<p class="addr">Authorised India distributor<br>Cinerama Private Limited (Cinebels)<br>16A, Goraguntepalya, Yeshwanthpur Industrial Suburb, Bengaluru, Karnataka 560022</p>' +
      '<p class="addr">Talk to us: +91 93413 30907</p></div>' +
      '<div><h5>Shop</h5><a href="category.html">All Products</a><a href="category.html?cat=Soundbar%20Speakers">Soundbars</a><a href="category.html?cat=Bluetooth%20Speakers">Bluetooth Speakers</a><a href="category.html?cat=Subwoofers">Subwoofers</a></div>' +
      '<div><h5>Help</h5><a href="#">Track your order</a><a href="#">Warranty &amp; Trust</a><a href="#">Return Policy</a><a href="#">Store Policies</a></div>' +
      '<div><h5>Why Klipsch India</h5><p>Genuine, warrantied Klipsch products</p><p>EMI, COD &amp; secure payments</p><p>Expert audio support</p></div>' +
      '</div><div class="wrap pay"><span>We accept: UPI \u00B7 Cards \u00B7 Net Banking \u00B7 Wallets \u00B7 Cash on Delivery</span><span style="margin-left:auto">\u00A9 2026 Cinerama Pvt. Ltd. \u00B7 Demo build</span></div></footer>';
  }
  function overlays() {
    return '' +
      // cart drawer
      '<div class="drawer" data-cart-drawer><div class="dh"><h3>Your Cart</h3><button data-close-cart aria-label="Close">\u00D7</button></div>' +
      '<div class="items" data-cart-items></div>' +
      '<div class="foot" data-cart-foot></div></div>' +
      // compare bar
      '<div class="compare-bar" data-compare-bar><div class="wrap">' +
      '<strong style="font-size:13px">Compare</strong><div class="items" data-compare-items></div>' +
      '<button class="btn btn-primary" data-open-compare>Compare</button>' +
      '<button class="btn btn-ghost" style="color:#fff;border-color:#555" data-clear-compare>Clear</button></div></div>' +
      // compare modal
      '<div class="modal" data-compare-modal><div class="panel"><div class="mh"><h3>Compare products</h3><button data-close-compare>\u00D7</button></div>' +
      '<div data-compare-table></div></div></div>';
  }

  function mountChrome(active) {
    var head = document.createElement("div"); head.innerHTML = chrome(active);
    document.body.insertBefore(head, document.body.firstChild);
    var foot = document.createElement("div"); foot.innerHTML = footer() + overlays();
    document.body.appendChild(foot);
    wireChrome();
    updateCartCount(); renderCart(); renderCompareBar();
  }

  function wireChrome() {
    qsa("[data-open-cart]").forEach(function (b) { b.addEventListener("click", openCart); });
    qs("[data-close-cart]").addEventListener("click", closeCart);
    qs("[data-open-compare]").addEventListener("click", openCompare);
    qs("[data-close-compare]").addEventListener("click", closeCompare);
    qs("[data-clear-compare]").addEventListener("click", function () { compare = []; save("klipsch_compare", compare); renderCompareBar(); syncCompareChecks(); });
    // search -> category page
    var s = qs(".search input");
    if (s) s.addEventListener("keydown", function (e) { if (e.key === "Enter") location.href = "category.html?q=" + encodeURIComponent(s.value); });
  }

  /* ---------- cart drawer render ---------- */
  function openCart() { qs("[data-cart-drawer]").classList.add("show"); }
  function closeCart() { qs("[data-cart-drawer]").classList.remove("show"); }
  function renderCart() {
    var items = qs("[data-cart-items]"), foot = qs("[data-cart-foot]");
    if (!items) return;
    if (!cart.length) {
      items.innerHTML = '<div class="empty">Your cart is empty.<br><br><a class="btn btn-primary" href="category.html">Discover products</a></div>';
      foot.innerHTML = ""; return;
    }
    items.innerHTML = cart.map(function (it) {
      var p = bySku(it.sku); if (!p) return "";
      return '<div class="ci"><img src="' + p.image + '" alt="' + esc(p.shortName) + '">' +
        '<div style="flex:1"><div class="nm">' + esc(p.shortName) + "</div>" +
        '<div class="pr">' + inr(p.price) + ' <span style="color:#999;text-decoration:line-through;font-size:12px">' + inr(p.mrp) + "</span></div>" +
        '<div class="qty"><button data-dec="' + p.sku + '">\u2212</button><span>' + it.qty + '</span><button data-inc="' + p.sku + '">+</button>' +
        '<button data-rm="' + p.sku + '" style="margin-left:auto;color:#b5651d;border:none;background:none;cursor:pointer;font-size:12px">Remove</button></div></div></div>';
    }).join("");
    var t = cartTotals();
    foot.innerHTML =
      '<div class="save-line">You\u2019re saving ' + inr(t.mrpSaving + t.offerDiscount) + ' on this order</div>' +
      (t.offerDiscount ? '<div class="summary" style="margin-bottom:12px;padding:10px 12px"><div class="row"><span>Item total</span><span>' + inr(t.price) + '</span></div><div class="row" style="color:#067647"><span>Offer (' + appliedOffer + ')</span><span>\u2212' + inr(t.offerDiscount) + '</span></div></div>' : "") +
      '<div class="total"><span>Total</span><span>' + inr(t.payable) + "</span></div>" +
      '<a class="btn btn-primary btn-block" href="checkout.html">Checkout securely</a>' +
      '<div class="login-note">No account needed to start \u2014 sign in with phone or Amazon at checkout.</div>';
    qsa("[data-inc]", foot.parentElement).forEach(function (b) { b.addEventListener("click", function () { var s = b.getAttribute("data-inc"); setQty(s, (cart.filter(function (i) { return i.sku === s; })[0].qty) + 1); }); });
    qsa("[data-dec]", foot.parentElement).forEach(function (b) { b.addEventListener("click", function () { var s = b.getAttribute("data-dec"); setQty(s, (cart.filter(function (i) { return i.sku === s; })[0].qty) - 1); }); });
    qsa("[data-rm]", foot.parentElement).forEach(function (b) { b.addEventListener("click", function () { setQty(b.getAttribute("data-rm"), 0); }); });
  }

  /* ---------- compare render ---------- */
  function renderCompareBar() {
    var bar = qs("[data-compare-bar]"); if (!bar) return;
    var items = qs("[data-compare-items]");
    items.innerHTML = compare.map(function (sku) {
      var p = bySku(sku);
      return '<span class="ci">' + esc(p.shortName) + ' <button data-cmp-rm="' + sku + '">\u00D7</button></span>';
    }).join("");
    qsa("[data-cmp-rm]", items).forEach(function (b) { b.addEventListener("click", function () { toggleCompare(b.getAttribute("data-cmp-rm")); }); });
    bar.classList.toggle("show", compare.length > 0);
  }
  function openCompare() {
    if (compare.length < 2) { toast("Pick at least 2 products to compare"); return; }
    var prods = compare.map(bySku);
    var rows = [
      ["Price", function (p) { return '<strong>' + inr(p.price) + "</strong> <span style='color:#999;text-decoration:line-through'>" + inr(p.mrp) + "</span>"; }],
      ["EMI from", function (p) { return inr(p.emiPerMonth) + "/mo"; }],
      ["Category", function (p) { return p.category; }],
      ["Best for", function (p) { return p.bestFor.join(", ") || "\u2014"; }],
    ];
    // dynamic spec rows from common spec keys
    var specKeys = {};
    prods.forEach(function (p) { p.specs.forEach(function (s) { specKeys[s.key] = true; }); });
    Object.keys(specKeys).slice(0, 6).forEach(function (k) {
      rows.push([k, function (p) { var m = p.specs.filter(function (s) { return s.key === k; })[0]; return m ? m.val : "\u2014"; }]);
    });
    var html = '<table class="cmp-table"><tr><th class="rowlabel"></th>' + prods.map(function (p) {
      return '<th class="cmp-prod"><img src="' + p.image + '" alt="' + esc(p.shortName) + '"><div>' + esc(p.shortName) + "</div>" +
        '<a class="btn btn-primary" style="margin-top:8px;font-size:12px;padding:7px 12px" href="' + pageUrl(p) + '">View</a></th>';
    }).join("") + "</tr>";
    rows.forEach(function (r) {
      html += "<tr><td class='rowlabel'>" + r[0] + "</td>" + prods.map(function (p) { return "<td>" + r[1](p) + "</td>"; }).join("") + "</tr>";
    });
    html += "</table>";
    qs("[data-compare-table]").innerHTML = html;
    qs("[data-compare-modal]").classList.add("show");
  }
  function closeCompare() { qs("[data-compare-modal]").classList.remove("show"); }

  /* ---------- product card ---------- */
  function card(p) {
    return '<div class="card">' +
      (p.isBestSeller ? '<span class="tag-bestseller">Bestseller</span>' : "") +
      '<a class="imgwrap" href="' + pageUrl(p) + '"><img src="' + p.image + '" alt="' + esc(p.shortName) + '" loading="lazy"></a>' +
      '<div class="body"><div class="cat">' + esc(p.category) + "</div>" +
      '<a class="name" href="' + pageUrl(p) + '">' + esc(p.name) + "</a>" +
      '<div class="price"><span class="now">' + inr(p.price) + '</span><span class="was">' + inr(p.mrp) + '</span><span class="off">' + p.discount + "% off</span></div>" +
      '<div class="emi">EMI from <b>' + inr(p.emiPerMonth) + "/mo</b></div>" +
      '<div class="card-best">' + p.bestFor.slice(0, 2).map(function (t) { return '<span class="mini">' + esc(t) + "</span>"; }).join("") + "</div>" +
      '<div class="card-cta"><a class="btn btn-primary btn-block" href="' + pageUrl(p) + '">View details</a></div>' +
      '<label class="compare-check" data-compare-sku="' + p.sku + '"><input type="checkbox"> Compare</label>' +
      "</div></div>";
  }
  function renderGrid(target, list) {
    var el = qs(target); if (!el) return;
    el.innerHTML = list.map(card).join("");
    qsa("[data-compare-sku]", el).forEach(function (lbl) {
      var box = qs("input", lbl);
      // listen on the checkbox 'change' so the native label->input click isn't double-counted
      box.addEventListener("change", function () { toggleCompare(lbl.getAttribute("data-compare-sku")); });
    });
    syncCompareChecks();
  }

  /* expose a small API for pages */
  window.KlipschApp = {
    DATA: DATA, PRODUCTS: PRODUCTS, inr: inr, bySku: bySku, esc: esc, pageUrl: pageUrl,
    mountChrome: mountChrome, renderGrid: renderGrid, addToCart: addToCart,
    toggleCompare: toggleCompare, OFFERS: OFFERS,
    applyOffer: function (code) { appliedOffer = code; save("klipsch_offer", code); renderCart(); },
    cartTotals: cartTotals, toast: toast, openCart: openCart
  };
})();

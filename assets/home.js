/* Homepage logic: chrome, hero card, product finder (homepage buying guide),
   bestsellers grid, category tiles. */
(function () {
  var A = window.KlipschApp, P = A.PRODUCTS;
  A.mountChrome("Home");

  /* hero featured card = highest-value bestseller (The Sevens) */
  var hero = P.slice().sort(function (a, b) { return b.price - a.price; })[0];
  var hc = document.querySelector("[data-hero-card]");
  if (hc && hero) {
    hc.innerHTML = '<img src="' + hero.image + '" alt="' + A.esc(hero.shortName) + '">' +
      '<div style="font-size:11px;color:var(--copper);font-weight:700;text-transform:uppercase;margin-top:12px">Flagship pick</div>' +
      '<div style="font-weight:700;margin:4px 0 6px;font-size:14px">' + A.esc(hero.shortName) + '</div>' +
      '<div style="display:flex;align-items:baseline;gap:8px"><span style="font-size:18px;font-weight:800">' + A.inr(hero.price) + '</span>' +
      '<span style="color:#999;text-decoration:line-through;font-size:13px">' + A.inr(hero.mrp) + '</span></div>' +
      '<a class="btn btn-primary btn-block" style="margin-top:12px" href="' + A.pageUrl(hero) + '">View details</a>';
  }

  /* product finder - use-case tiles -> filter by bestFor tag */
  var USE_CASES = [
    { ic: "\uD83D\uDCFA", t: "TV & Movies", d: "Soundbars & home theatre", tag: "TV & movies" },
    { ic: "\uD83C\uDFB5", t: "Music & Stereo", d: "Bookshelf & powered", tag: "Music & stereo listening" },
    { ic: "\uD83C\uDF89", t: "Parties", d: "Big sound & lights", tag: "Parties & gatherings" },
    { ic: "\uD83C\uDFD6\uFE0F", t: "Travel & Outdoor", d: "Portable & waterproof", tag: "Travel & outdoors" },
    { ic: "\uD83D\uDCBF", t: "Vinyl", d: "Turntable-ready", tag: "Vinyl & turntables" }
  ];
  var fwrap = document.querySelector("[data-finder]");
  fwrap.innerHTML = USE_CASES.map(function (u, i) {
    return '<div class="finder-card" data-uc="' + i + '"><div class="ic">' + u.ic + '</div><div class="t">' + u.t + '</div><div class="d">' + u.d + '</div></div>';
  }).join("");
  Array.prototype.forEach.call(fwrap.querySelectorAll("[data-uc]"), function (el) {
    el.addEventListener("click", function () {
      var u = USE_CASES[+el.getAttribute("data-uc")];
      var list = P.filter(function (p) { return p.bestFor.indexOf(u.tag) >= 0; });
      document.querySelector("[data-finder-title]").textContent = u.t + " - " + list.length + " recommended";
      A.renderGrid("[data-finder-grid]", list);
      document.getElementById("finder-results").style.display = "block";
      document.getElementById("finder-results").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  /* bestsellers */
  A.renderGrid("[data-grid-best]", P.filter(function (p) { return p.isBestSeller; }).slice(0, 8));

  /* category tiles */
  var icons = { "Bluetooth Speakers": "\uD83D\uDD0A", "Bookshelf Speakers": "\uD83D\uDCDA", "Powered Bookshelf Speakers": "\u26A1", "Soundbar Speakers": "\uD83D\uDCFA", "Subwoofers": "\uD83C\uDF0A" };
  var cats = document.querySelector("[data-cats]");
  cats.innerHTML = A.DATA.categories.map(function (c) {
    return '<a class="finder-card" href="category.html?cat=' + encodeURIComponent(c.name) + '"><div class="ic">' + (icons[c.name] || "\uD83C\uDFB6") + '</div><div class="t">' + c.name + '</div><div class="d">' + c.count + ' products</div></a>';
  }).join("");
})();

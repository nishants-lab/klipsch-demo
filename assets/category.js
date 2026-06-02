/* Category / shop page: faceted filters (use case, category, price), sort, search. */
(function () {
  var A = window.KlipschApp, P = A.PRODUCTS;
  A.mountChrome("Shop");

  var params = new URLSearchParams(location.search);
  var state = {
    cat: params.get("cat") || null,
    q: (params.get("q") || "").toLowerCase().trim(),
    use: null,
    price: null,
    sort: "featured"
  };

  var USE_TAGS = ["TV & movies", "Music & stereo listening", "Parties & gatherings", "Travel & outdoors", "Vinyl & turntables", "Adding bass / home theatre"];
  var PRICE_BANDS = [
    { label: "Under \u20B925,000", min: 0, max: 25000 },
    { label: "\u20B925,000 - \u20B950,000", min: 25000, max: 50000 },
    { label: "\u20B950,000 - \u20B91,00,000", min: 50000, max: 100000 },
    { label: "Above \u20B91,00,000", min: 100000, max: Infinity }
  ];

  function radio(name, value, label, checked) {
    return '<label style="display:flex;align-items:center;gap:8px;font-size:13.5px;padding:4px 0;cursor:pointer">' +
      '<input type="radio" name="' + name + '" value="' + value + '"' + (checked ? " checked" : "") + "> " + label + "</label>";
  }

  function buildFilters() {
    var fu = document.querySelector("[data-f-use]");
    fu.innerHTML = USE_TAGS.map(function (t) { return radio("use", t, t, state.use === t); }).join("");
    var fc = document.querySelector("[data-f-cat]");
    fc.innerHTML = A.DATA.categories.map(function (c) { return radio("cat", c.name, c.name + " (" + c.count + ")", state.cat === c.name); }).join("");
    var fp = document.querySelector("[data-f-price]");
    fp.innerHTML = PRICE_BANDS.map(function (b, i) { return radio("price", i, b.label, state.price === i); }).join("");

    fu.addEventListener("change", function (e) { state.use = e.target.value; render(); });
    fc.addEventListener("change", function (e) { state.cat = e.target.value; render(); });
    fp.addEventListener("change", function (e) { state.price = +e.target.value; render(); });
    document.querySelector("[data-clear-filters]").addEventListener("click", function () {
      state.cat = state.use = state.price = null; state.q = ""; buildFilters(); render();
    });
    document.querySelector("[data-sort]").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  }

  function render() {
    var list = P.slice();
    if (state.cat) list = list.filter(function (p) { return p.category === state.cat; });
    if (state.use) list = list.filter(function (p) { return p.bestFor.indexOf(state.use) >= 0; });
    if (state.price !== null && PRICE_BANDS[state.price]) {
      var b = PRICE_BANDS[state.price];
      list = list.filter(function (p) { return p.price >= b.min && p.price < b.max; });
    }
    if (state.q) list = list.filter(function (p) { return (p.name + " " + p.category + " " + p.bestFor.join(" ")).toLowerCase().indexOf(state.q) >= 0; });

    if (state.sort === "low") list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "high") list.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === "disc") list.sort(function (a, b) { return b.discount - a.discount; });

    document.querySelector("[data-count]").textContent = list.length + " product" + (list.length === 1 ? "" : "s");
    document.querySelector("[data-empty]").style.display = list.length ? "none" : "block";
    A.renderGrid("[data-grid]", list);

    var title = state.cat || (state.q ? '"' + state.q + '"' : "Shop all Klipsch");
    document.querySelector("[data-page-title]").textContent = title;
  }

  buildFilters();
  render();
})();

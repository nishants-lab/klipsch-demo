/* Simulated checkout - demonstrates simplified login for un-recognized users:
   phone+OTP (India default), Amazon sign-in, and true guest/COD paths.
   No real auth, order, or payment. */
(function () {
  var A = window.KlipschApp;
  A.mountChrome("");

  function renderSummary() {
    var t = A.cartTotals();
    var rows =
      '<div class="row"><span>Item total (MRP)</span><span style="text-decoration:line-through;color:#999">' + A.inr(t.mrp) + '</span></div>' +
      '<div class="row"><span>Price</span><span>' + A.inr(t.price) + '</span></div>' +
      (t.offerDiscount ? '<div class="row" style="color:#067647"><span>Offer discount</span><span>\u2212' + A.inr(t.offerDiscount) + '</span></div>' : "") +
      '<div class="row"><span>Delivery</span><span style="color:#067647">FREE</span></div>' +
      '<div class="row total"><span>Total payable</span><span>' + A.inr(t.payable) + '</span></div>' +
      '<div class="row" style="color:#067647;font-weight:600"><span>You save</span><span>' + A.inr(t.mrpSaving + t.offerDiscount) + '</span></div>';
    document.querySelector("[data-summary]").innerHTML = '<h3 style="margin:0 0 10px;font-size:16px">Order summary</h3>' + rows;
  }
  renderSummary();

  function done(msg) {
    A.toast(msg);
    var card = document.querySelector(".auth-card");
    card.innerHTML = '<div style="text-align:center;padding:20px 0">' +
      '<div style="font-size:40px">\u2705</div>' +
      '<h2 style="margin:10px 0 6px">You\u2019re all set (demo)</h2>' +
      '<p class="s">' + msg + ' In the real store, this is where address, payment (UPI / cards / EMI / COD) and order confirmation would happen.</p>' +
      '<a class="btn btn-primary" href="index.html">Back to store</a></div>';
  }

  document.querySelector("[data-otp]").addEventListener("click", function () {
    var v = (document.querySelector("[data-phone]").value || "").trim();
    if (!/^\d{10}$/.test(v)) { A.toast("Enter a valid 10-digit mobile number"); return; }
    done("OTP verification would happen here for +91 " + v + ".");
  });
  document.querySelector("[data-amazon]").addEventListener("click", function () { done("Amazon sign-in (Buy with Amazon) would import your saved addresses and cards."); });
  document.querySelector("[data-guest]").addEventListener("click", function () { done("Guest checkout - you\u2019d enter delivery details on the next step."); });
  document.querySelector("[data-cod]").addEventListener("click", function () { done("Cash on Delivery selected - confirm address to place the order."); });
})();

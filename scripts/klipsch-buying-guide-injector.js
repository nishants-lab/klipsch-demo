/*
 * Klipsch India — PDP Buying Guide (prototype / rules engine)
 * ----------------------------------------------------------------
 * WHAT IT DOES
 *   Reads the product data already on the PDP (title, price, the
 *   "Product Details" / "About this Item" key-values, breadcrumb category)
 *   and renders two UI pieces:
 *     1. A compact "Quick Verdict + Best for" strip  -> directly below the price
 *     2. A detailed "Buying Guide" card               -> directly below the buy box
 *   No external data, no runtime LLM. The keyword->use-case and
 *   spec->plain-language maps are authored once (below) and reused on every PDP.
 *
 * HOW TO RUN (demo)
 *   Open any klipschindia.com product page, open DevTools console,
 *   paste this whole file, hit Enter. Re-running is safe (idempotent).
 *
 * NOTE
 *   This is a client-side prototype for stakeholder review. Production
 *   should render this server-side / in the storefront component, not via
 *   injected DOM. Placement anchors (.productPriceBlock, .buyButtons) are
 *   SmartBiz storefront classes and may change.
 */
(function klipschBuyingGuide() {
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inr = n => '₹' + Number(n).toLocaleString('en-IN');

  // ---- cleanup prior injection (idempotent) ----
  document.querySelectorAll('[data-klipsch-guide]').forEach(n => n.remove());
  const oldStyle = document.getElementById('klipsch-guide-style');
  if (oldStyle) oldStyle.remove();

  // ---------------- 1. EXTRACT ----------------
  const titleEl = document.querySelector('h1');
  const title = norm(titleEl && titleEl.textContent);

  const priceBlock = document.querySelector('.productPriceBlock');
  let price = null, mrp = null, pct = null;
  if (priceBlock) {
    // read leaf nodes individually — the price/MRP/%-off text nodes concatenate
    // without separators, so a regex on combined text mis-parses (e.g. 1470019).
    const leaves = Array.from(priceBlock.querySelectorAll('*'))
      .filter(e => e.children.length === 0)
      .map(e => norm(e.textContent)).filter(Boolean);
    leaves.forEach(t => {
      const off = t.match(/(\d+)\s*%\s*Off/i); if (off) { pct = parseInt(off[1]); return; }
      const m = t.match(/M\.R\.P[.:\s]*₹\s?([\d,]+)/i); if (m) { mrp = parseInt(m[1].replace(/,/g, '')); return; }
      const p = t.match(/^₹\s?([\d,]+)$/); if (p && price === null) { price = parseInt(p[1].replace(/,/g, '')); }
    });
    if (price && mrp && !pct) pct = Math.round((1 - price / mrp) * 100);
  }

  const crumbs = Array.from(document.querySelectorAll('nav[aria-label="Breadcrumb"] li'))
    .map(l => norm(l.textContent)).filter(t => t && t !== '/');
  const category = crumbs.length > 1 ? crumbs[crumbs.length - 2] : '';

  const details = [];
  document.querySelectorAll('li').forEach(li => {
    const strong = li.querySelector('strong');
    if (strong) {
      const key = norm(strong.textContent).replace(/:$/, '');
      const val = norm(li.textContent).replace(norm(strong.textContent), '').replace(/^:/, '').trim();
      if (key && key.length < 40) details.push({ key, val });
    }
  });
  const haystack = (title + ' ' + details.map(d => d.key + ' ' + d.val).join(' ')).toLowerCase();
  const has = (...t) => t.some(x => haystack.includes(x));

  // ---------------- 2. RULES ENGINE ----------------
  let form = 'speaker';
  if (has('soundbar')) form = 'soundbar';
  else if (has('subwoofer')) form = 'subwoofer';
  else if (has('powered bookshelf')) form = 'powered bookshelf speaker';
  else if (has('bookshelf')) form = 'bookshelf speaker';
  else if (has('party')) form = 'party speaker';
  else if (has('portable', 'travel')) form = 'portable speaker';
  else if (category) form = category.replace(/s$/, '').toLowerCase();

  const useRules = [
    { w: () => has('hdmi-arc', 'dolby atmos', 'soundbar', 'tv'), t: 'TV & movies' },
    { w: () => has('phono', 'turntable', 'vinyl'), t: 'Vinyl & turntables' },
    { w: () => has('party', 'light show', 'mic input', 'dual 6.5', 'dual woofer'), t: 'Parties & gatherings' },
    { w: () => has('portable', 'travel', 'battery', 'waterproof', 'ip67', 'strap'), t: 'Travel & outdoors' },
    { w: () => has('subwoofer', 'deep bass output', 'class d'), t: 'Adding bass to a setup' },
    { w: () => has('bookshelf', 'stereo', 'desktop'), t: 'Music & stereo listening' },
    { w: () => has('bluetooth'), t: 'Wireless streaming' },
    { w: () => has('built-in mic', 'hands-free', 'answer calls'), t: 'Hands-free calls' },
    { w: () => has('high-res', '24-bit', '192khz', 'audiophile'), t: 'Critical / Hi-Res listening' }
  ];
  const bestFor = useRules.filter(r => r.w()).map(r => r.t).slice(0, 4);

  const jargonRules = [
    { k: /bluetooth\s*5\.?\d?/, term: 'Bluetooth 5.x', why: 'Latest wireless standard — stable pairing and longer range than older Bluetooth.' },
    { k: /hdmi-?arc/, term: 'HDMI-ARC', why: 'Connects to your TV with one cable and syncs volume with the TV remote.' },
    { k: /dolby atmos/, term: 'Dolby Atmos', why: 'Adds height/overhead sound for a 3D, cinema-style effect.' },
    { k: /phono/, term: 'Phono input', why: 'Plug a turntable in directly — no separate phono preamp needed.' },
    { k: /tractrix|horn/, term: 'Tractrix Horn', why: "Klipsch's signature design for clear, detailed, efficient sound." },
    { k: /passive radiator/, term: 'Passive radiators', why: 'Produce deeper bass than the cabinet size suggests, without a powered sub.' },
    { k: /full-range driver/, term: 'Full-range driver', why: 'A single driver handles highs and lows — simple, balanced sound.' },
    { k: /24-?bit|192khz|high-res|hi-res/, term: 'Hi-Res / 24-bit audio', why: 'Decodes studio-quality files with more detail than standard streaming.' },
    { k: /\beq\b|adjustable eq/, term: 'Adjustable EQ', why: 'Tune bass, mids and treble to taste, usually via the companion app.' },
    { k: /ip6\d|waterproof|water-resistant/, term: 'IP rating / Waterproof', why: 'Resists dust and water — safe for outdoors, pool-side and travel.' },
    { k: /class d/, term: 'Class D amplifier', why: 'A compact, efficient built-in amp that runs cool and saves power.' },
    { k: /cerametallic/, term: 'Cerametallic woofer', why: 'A stiff, light cone material for clean bass with low distortion.' },
    { k: /onkyo/, term: 'Onkyo tuning', why: 'Sound tuned by Onkyo, a respected Japanese audio engineering brand.' }
  ];
  const jargon = [];
  jargonRules.forEach(r => { if (r.k.test(haystack) && jargon.length < 6) jargon.push({ term: r.term, why: r.why }); });

  const wanted = ['Output Power', 'Connectivity', 'Special Feature', 'Mounting Type', 'Battery', 'Country of Origin'];
  const specs = details.filter(d => wanted.some(w => d.key.toLowerCase().includes(w.toLowerCase())) && d.val);

  const sizeWord = has('compact', 'portable', 'mini', 'travel') ? 'compact, easy-to-carry'
    : has('flagship', 'reference', 'premiere', 'epic') ? 'premium, high-performance'
      : 'well-rounded';
  const verdict = `A ${sizeWord} ${form}` + (bestFor.length ? `, best suited for ${bestFor.slice(0, 2).join(' and ').toLowerCase()}.` : '.');

  const goodToKnow = [];
  goodToKnow.push({ label: 'Warranty', text: 'Sold by the authorised Klipsch India distributor (Cinerama Pvt. Ltd.) with official brand warranty.' });
  if (/not eligible for return/i.test(document.body.textContent))
    goodToKnow.push({ label: 'Returns', text: 'Not eligible for return — covered by manufacturer warranty for defects. Contact support for DOA/damaged units.' });
  const origin = details.find(d => /country of origin/i.test(d.key));
  if (origin) goodToKnow.push({ label: 'Origin', text: 'Country of origin: ' + origin.val + '.' });
  if (price && price >= 3000) goodToKnow.push({ label: 'Payment', text: 'No-cost / standard EMI, COD and secure online payment available at checkout.' });
  goodToKnow.push({ label: 'Delivery', text: 'Free delivery on orders above ₹1,000; typically delivered in 2–5 days (check your pincode above).' });

  // ---------------- 3. STYLES (responsive + sticky gallery + anchor offset) ----------------
  const style = document.createElement('style');
  style.id = 'klipsch-guide-style';
  style.textContent = `
    #klipsch-full-guide{scroll-margin-top:90px;}
    .klipsch-guide-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
    @media (min-width:1024px){
      .klipsch-sticky-media{position:sticky !important;top:90px !important;align-self:flex-start !important;}
    }
    @media (max-width:640px){
      .klipsch-guide-grid{grid-template-columns:1fr;gap:14px;}
      [data-klipsch-guide="strip"]{margin:12px 0 !important;padding:12px 14px !important;}
      #klipsch-full-guide .klipsch-guide-body{padding:14px !important;}
    }`;
  document.head.appendChild(style);

  // ---------------- 4. RENDER: compact strip ----------------
  const strip = document.createElement('div');
  strip.setAttribute('data-klipsch-guide', 'strip');
  strip.style.cssText = 'margin:14px 0;padding:14px 16px;border:1px solid #e3a72f;border-radius:12px;background:linear-gradient(180deg,#fffaf0,#fff6e3);font-family:inherit;';
  const chips = bestFor.map(t => `<span style="display:inline-block;background:#fff;border:1px solid #e3a72f;color:#8a5a00;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;">${esc(t)}</span>`).join('');
  strip.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <span style="font-size:16px;">🧭</span>
      <span style="font-weight:700;font-size:14px;color:#5a3d00;letter-spacing:.02em;">BUYING GUIDE · QUICK VERDICT</span>
    </div>
    <div style="font-size:14px;color:#1a1a1a;line-height:1.5;margin-bottom:8px;">${esc(verdict)}</div>
    ${bestFor.length ? `<div style="font-size:12px;color:#8a5a00;font-weight:700;margin-bottom:4px;">BEST FOR</div><div style="display:flex;flex-wrap:wrap;gap:6px;">${chips}</div>` : ''}
    ${(mrp && price) ? `<div style="margin-top:10px;font-size:13px;color:#067647;font-weight:600;">You save ${inr(mrp - price)} (${pct}% off MRP) on this purchase.</div>` : ''}
    <button type="button" data-klipsch-jump="1" style="display:inline-flex;align-items:center;gap:4px;margin-top:10px;font-size:13px;color:#b5651d;font-weight:700;background:none;border:none;padding:0;cursor:pointer;">↓ See full buying guide</button>`;

  // ---------------- 5. RENDER: full guide ----------------
  const specRows = specs.map(s => `<div style="display:flex;justify-content:space-between;gap:16px;padding:9px 0;border-bottom:1px solid #f0f0f0;"><span style="color:#666;font-size:13px;">${esc(s.key)}</span><span style="color:#111;font-size:13px;font-weight:600;text-align:right;max-width:60%;">${esc(s.val)}</span></div>`).join('');
  const jargonRows = jargon.map(j => `<div style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><div style="font-size:13px;font-weight:700;color:#111;">${esc(j.term)}</div><div style="font-size:13px;color:#555;line-height:1.5;margin-top:2px;">${esc(j.why)}</div></div>`).join('');
  const gtkRows = goodToKnow.map(k => `<li style="font-size:13px;color:#444;line-height:1.55;margin-bottom:7px;"><strong style="color:#111;">${esc(k.label)}:</strong> ${esc(k.text)}</li>`).join('');

  const full = document.createElement('section');
  full.setAttribute('data-klipsch-guide', 'full');
  full.id = 'klipsch-full-guide';
  full.style.cssText = 'margin:22px 0;border:1px solid #e6e6e6;border-radius:14px;overflow:hidden;font-family:inherit;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.04);';
  full.innerHTML = `
    <div style="background:#111;color:#fff;padding:14px 18px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:18px;">🧭</span><span style="font-weight:700;font-size:15px;">Buying Guide</span>
      <span style="margin-left:auto;font-size:11px;color:#bbb;font-weight:600;">Generated from this product's details</span>
    </div>
    <div class="klipsch-guide-body" style="padding:18px;">
      <div class="klipsch-guide-grid">
        <div><div style="font-size:12px;font-weight:800;color:#b5651d;letter-spacing:.04em;margin-bottom:8px;">SPECS AT A GLANCE</div>${specRows || '<div style="font-size:13px;color:#888;">Specs not available.</div>'}</div>
        <div><div style="font-size:12px;font-weight:800;color:#b5651d;letter-spacing:.04em;margin-bottom:8px;">WHAT THE FEATURES MEAN</div>${jargonRows || '<div style="font-size:13px;color:#888;">No technical terms to explain.</div>'}</div>
      </div>
      <div style="margin-top:18px;padding-top:16px;border-top:1px solid #eee;">
        <div style="font-size:12px;font-weight:800;color:#b5651d;letter-spacing:.04em;margin-bottom:8px;">GOOD TO KNOW</div>
        <ul style="margin:0;padding-left:18px;">${gtkRows}</ul>
      </div>
    </div>`;

  // ---------------- 6. PLACEMENT ----------------
  // Insert as immediate siblings so they inherit the right info-column width.
  // (Climbing to the storefront's slot wrappers pushes content full-width to the
  //  bottom of the tall column — confirmed during QA — so anchor to the blocks directly.)
  if (priceBlock && priceBlock.parentElement) {
    priceBlock.parentElement.insertBefore(strip, priceBlock.nextSibling);
  }
  const buyButtons = document.querySelector('.buyButtons');
  if (buyButtons && buyButtons.parentElement) {
    buyButtons.parentElement.insertBefore(full, buyButtons.nextSibling);
  } else if (priceBlock) {
    priceBlock.parentElement.insertBefore(full, strip.nextSibling);
  }

  // ---------------- 7. SPA-SAFE SMOOTH SCROLL ----------------
  // A plain #hash link does not scroll in this React app, so use a JS handler.
  const jump = strip.querySelector('[data-klipsch-jump]');
  if (jump) jump.addEventListener('click', e => {
    e.preventDefault();
    const t = document.getElementById('klipsch-full-guide');
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---------------- 8. STICKY GALLERY (desktop whitespace fix) ----------------
  // The info column is very tall while the gallery is short, leaving a large
  // empty left half on desktop. Pin the gallery so it follows the scroll.
  const media = document.querySelector('.productMediaBlock');
  let mediaCol = media;
  for (let i = 0; i < 4 && mediaCol; i++) {
    mediaCol = mediaCol.parentElement;
    if (mediaCol && /lg:!w-\[50%\]/.test((mediaCol.className || '').toString())) break;
  }
  if (mediaCol && /lg:!w-\[50%\]/.test((mediaCol.className || '').toString())) mediaCol.classList.add('klipsch-sticky-media');
  else if (media && media.parentElement) media.parentElement.classList.add('klipsch-sticky-media');

  return { placed: true, title, price, mrp, pct, bestFor, specCount: specs.length, jargonCount: jargon.length };
})();

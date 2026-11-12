/* tes-site.js: de cookiekeuze, de meting en de cookiemelding.
   Gebruikt door index.html, cursus/, start/ en privacy/.

   Keuze
   - De keuze staat 12 maanden in localStorage (tes_cookiekeuze), niet in een cookie.
   - Nog geen keuze of "Alleen noodzakelijke cookies": geen meetcookies. Een bezoek
     telt dan als los bezoek: een sessie-id in het geheugen van de pagina, zonder
     bezoeker-id. De ref uit de link gaat wel mee met een formulier (tesBron).
   - "Accepteren": de meting zoals altijd, met tes_vid, tes_src, tes_sid en tes_lsrc.
   - Wie later alsnog "Alleen noodzakelijke cookies" kiest, raakt de vier cookies kwijt. */
(function(){
  var SLEUTEL = 'tes_cookiekeuze', GELDIG = 365 * 86400000;
  var MEETCOOKIES = ['tes_vid', 'tes_src', 'tes_sid', 'tes_lsrc'];
  var veilig = location.protocol === 'https:' ? '; Secure' : '';

  function leesKeuze(){
    try {
      var v = JSON.parse(localStorage.getItem(SLEUTEL) || 'null');
      if (v && (v.k === 'ja' || v.k === 'nee') && Date.now() - v.t < GELDIG) return v.k;
    } catch (e) {}
    return null;
  }
  var keuze = leesKeuze(), luisteraars = [];

  function wisMeetcookies(){
    MEETCOOKIES.forEach(function(n){ document.cookie = n + '=; Max-Age=0; Path=/; SameSite=Lax' + veilig; });
  }
  if (keuze === 'nee') wisMeetcookies();

  function kies(k){
    try { localStorage.setItem(SLEUTEL, JSON.stringify({ k: k, t: Date.now() })); } catch (e) {}
    var oud = keuze; keuze = k;
    if (k === 'nee') wisMeetcookies();
    verberg();
    if (oud !== k) luisteraars.forEach(function(f){ try { f(k); } catch (e) {} });
  }

  // ─── Meting ───────────────────────────────────────────────────
  // metVid: false voor /start (die stuurde nooit een bezoeker-id mee).
  window.tesStartMeting = function(API, metVid){
    var mag = keuze === 'ja';
    function gc(n){ if (!mag) return ''; var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : ''; }
    function sc(n, v, sec){ if (!mag) return; document.cookie = n + '=' + encodeURIComponent(v) + '; Max-Age=' + sec + '; Path=/; SameSite=Lax' + veilig; }
    function clean(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9:_.-]/g, '').slice(0, 60); }
    function nieuw(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
    var qs = new URLSearchParams(location.search), ref = clean(qs.get('ref')), bron = ref;
    if (!bron) { try { var h = document.referrer ? new URL(document.referrer).hostname : ''; if (h && !/executionsystem\.nl$/.test(h)) bron = 'extern:' + h.replace(/^www\./, ''); } catch (e) {} }
    var eerste = '', laatste = '', sid = '', vid = '';
    // Leest en schrijft de cookies als dat mag. Zonder toestemming blijft alles in het geheugen.
    function zetOp(){
      var e = gc('tes_src');
      if (e) eerste = e; else { eerste = eerste || bron || 'direct'; sc('tes_src', eerste, 90 * 86400); }
      if (!laatste) laatste = bron || gc('tes_lsrc') || 'direct'; sc('tes_lsrc', laatste, 1800);
      if (!sid) sid = gc('tes_sid') || nieuw(); sc('tes_sid', sid, 1800);
      if (metVid && mag) { vid = gc('tes_vid') || ('v' + nieuw()); sc('tes_vid', vid, 400 * 86400); } else vid = '';
    }
    zetOp();
    if (ref) { qs.delete('ref'); try { history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs : '') + location.hash); } catch (e) {} }
    function send(soort, pad, meta){
      sc('tes_sid', sid, 1800);
      var body = JSON.stringify({ soort: soort, sid: sid, vid: vid, eb: eerste, lb: laatste, pad: pad || location.pathname, meta: meta || null });
      try { if (navigator.sendBeacon && navigator.sendBeacon(API, new Blob([body], { type: 'text/plain' }))) return; } catch (e) {}
      try { fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: body, keepalive: true }); } catch (e) {}
    }
    luisteraars.push(function(k){
      mag = k === 'ja';
      if (mag) {
        zetOp();
        // ?ref=ik: pas met een bezoeker-id kan de server dit apparaat als eigen onthouden
        if (eerste === 'ik' || laatste === 'ik') send('pageview');
      } else vid = '';
    });
    window.tesMeet = send;
    window.tesBron = function(){ return { sid: sid, vid: vid, eb: eerste, lb: laatste }; };
  };

  // ─── Cookiemelding ────────────────────────────────────────────
  var CSS =
    '#tes-ck{position:fixed;left:12px;right:12px;bottom:12px;z-index:99990;max-width:620px;margin:0 auto;box-sizing:border-box;' +
      'background:#131210;border:1px solid rgba(201,168,76,.35);border-radius:10px;padding:16px 18px;color:#F5F0E8;' +
      "font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:300;" +
      'box-shadow:0 12px 40px rgba(0,0,0,.55);opacity:0;transform:translateY(16px);transition:opacity .3s,transform .3s}' +
    '#tes-ck.aan{opacity:1;transform:none}' +
    '#tes-ck p{margin:0 0 12px;font-size:13px;line-height:1.55;color:#A09880;text-align:left}' +
    '#tes-ck a{color:#C9A84C;text-decoration:underline;text-underline-offset:2px}' +
    '#tes-ck .tes-ck-nu{margin:-4px 0 12px;font-size:12px;color:#8A8270}' +
    '#tes-ck .tes-ck-k{display:flex;gap:10px}' +
    '#tes-ck button{flex:1 1 0;min-height:42px;padding:10px 12px;margin:0;border:1px solid rgba(201,168,76,.7);border-radius:6px;' +
      'background:transparent;color:#F5F0E8;font:inherit;font-size:13px;font-weight:500;letter-spacing:.02em;cursor:pointer;transition:background .2s,border-color .2s}' +
    '#tes-ck button:hover,#tes-ck button:focus-visible{background:rgba(201,168,76,.12);border-color:#C9A84C;outline:none}' +
    '@media(max-width:480px){#tes-ck{left:10px;right:10px;bottom:10px;padding:14px}#tes-ck .tes-ck-k{flex-direction:column}}';
  var el = null, open = false;
  function bouw(){
    if (el) return el;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    el = document.createElement('div');
    el.id = 'tes-ck'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Cookiemelding');
    el.innerHTML =
      '<p>Wij meten met vier eigen cookies hoe de site gebruikt wordt en via welke link je binnenkwam. ' +
      'Wij gebruiken geen cookies van advertentiebedrijven. Lees meer in de <a href="/privacy/#cookies">privacyverklaring</a>.</p>' +
      '<p class="tes-ck-nu" hidden></p>' +
      '<div class="tes-ck-k"><button type="button" data-k="ja">Accepteren</button>' +
      '<button type="button" data-k="nee">Alleen noodzakelijke cookies</button></div>';
    el.querySelectorAll('button').forEach(function(b){ b.addEventListener('click', function(){ kies(b.getAttribute('data-k')); }); });
    document.body.appendChild(el);
    return el;
  }
  function toon(){
    var m = bouw(), nu = m.querySelector('.tes-ck-nu');
    if (keuze) { nu.hidden = false; nu.textContent = 'Je huidige keuze: ' + (keuze === 'ja' ? 'Accepteren.' : 'Alleen noodzakelijke cookies.'); }
    else nu.hidden = true;
    open = true; m.style.display = '';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ if (open) m.classList.add('aan'); }); });
  }
  function verberg(){
    open = false;
    if (!el) return;
    el.classList.remove('aan');
    setTimeout(function(){ if (el && !open) el.style.display = 'none'; }, 300);
  }

  window.tesToestemming = { keuze: function(){ return keuze; }, kies: kies, open: toon };
  function start(){ if (!keuze) toon(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* ═══════════════════════════════════════════════════════════════
   Vult de weggever "Timemanagement voor ondernemers" in met de
   antwoorden uit de stepper. Draait in de browser met pdf-lib.

   De plaatsen hieronder zijn opgemeten in de pdf zelf (A4, 595x842
   punten, nulpunt linksonder). Verandert het ontwerp van de pdf,
   meet dan opnieuw op met _meet/meet.html en pas deze tabel aan.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  var PDFLIB = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
  var INKT   = [0.09, 0.09, 0.08];   // bijna zwart, leest goed op de crème pagina
  var GOUD   = [0.55, 0.42, 0.12];   // iets donkerder, leest beter op crème

  // ── waar alles staat ─────────────────────────────────────────
  var VEL = {
    onderwerp: { pagina:8, vak:107, regels:{
      'Marketing en leads':262, 'Verkoop':225, 'Aanbod':204,
      'Levering':183, 'Capaciteit':163, 'Cijfers':143 } },
    eigenOnderwerp: { pagina:8, x:130, y:88 },        // als iemand geen ondernemer is
    taken:   { pagina:9, x:113, ys:[667, 621, 576] },
    janee:   { pagina:9, ja:432, nee:470, bereikbaar:408, delegeren:382 },
    rust:    { pagina:9, x:113, y:336 },
    energie: { pagina:9, x:113, y:290 },
    afleiding: { pagina:10, vak:107, regels:{
      'Ik zet mijn telefoon op niet storen tijdens het blok':690,
      'Ik sluit mijn mail en berichten-apps':669,
      'Ik haal social media uit de ruimte':648,
      'Ik geef een klus uit handen die niet door mij hoeft te worden gedaan':628,
      'Ik plan een vast moment waarop ik mensen terugbel':607,
      'Ik zet een fles water op mijn bureau':587,
      'Ik eet voor mijn blok, of maak mijn eten van tevoren klaar':567,
      'Ik werk aan de grootste constraint van mijn bedrijf':546 } },
    taakblok: { pagina:10, regels:{
      'E-mail':                        {x:107, y:398},
      'Klantvragen die niet urgent zijn':{x:107, y:378},
      'Facturen':                      {x:107, y:340},
      'Administratie':                 {x:107, y:320},
      'Appjes en berichten':           {x:321, y:398},
      'Afspraken inplannen':           {x:321, y:378},
      'Een kleine operationele klus':  {x:321, y:357} },
      extra:{ x:321, ys:[337, 317] } },
    vrij: { pagina:10, regels:{
      'Wandelen':          {x:107, y:249},
      'Sporten':           {x:107, y:228},
      'Eten zonder scherm':{x:107, y:207},
      'Tijd met partner, kinderen of vrienden zonder aan werk te denken':{x:321, y:249},
      'Een uur niets met werk':{x:321, y:195} },
      extra:{ x:107, ys:[186, 166] } },
    week: { pagina:11,
      rijen:{ ma:520, di:467, wo:413, do:359, vr:305, za:251, zo:197 },
      kolommen:[ {start:150, eind:196, d:150, t:182, v:213},
                 {start:248, eind:294, d:248, t:280, v:311},
                 {start:346, eind:392, d:346, t:378, v:409},
                 {start:444, eind:490, d:444, t:476, v:507} ],
      tijdOffset:16, letterOffset:-13 },
    terug: { pagina:12, x:70, y:610 }
  };
  var SOORTLETTER = { diep:'d', taak:'t', vrij:'v', terug:'t' };

  function laadPdfLib(){
    if(window.PDFLib) return Promise.resolve(window.PDFLib);
    return new Promise(function(klaar, fout){
      var s=document.createElement('script'); s.src=PDFLIB;
      s.onload=function(){ klaar(window.PDFLib); }; s.onerror=function(){ fout(new Error('pdf-lib laadt niet')); };
      document.head.appendChild(s);
    });
  }

  async function vul(bronUrl, d){
    var PDFLib = await laadPdfLib();
    var bytes = await fetch(bronUrl).then(function(r){ if(!r.ok) throw new Error('pdf niet gevonden'); return r.arrayBuffer(); });
    var pdf = await PDFLib.PDFDocument.load(bytes);
    var tekstFont = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
    var paginas = pdf.getPages();
    var P = function(n){ return paginas[n-1]; };
    var schrijf = function(n, x, y, tekst, maat, kleur){
      if(!tekst) return;
      P(n).drawText(String(tekst), { x:x, y:y, size:maat||10.5, font:tekstFont,
        color:PDFLib.rgb.apply(null, kleur||INKT) });
    };
    // het vinkje tekenen we met twee lijntjes: altijd scherp, geen fontgedoe
    var vink = function(n, x, y){
      var kleur = PDFLib.rgb.apply(null, GOUD);
      P(n).drawLine({ start:{x:x+1.5, y:y+3.5}, end:{x:x+3.8, y:y+1}, thickness:1.8, color:kleur });
      P(n).drawLine({ start:{x:x+3.8, y:y+1}, end:{x:x+8.5, y:y+7.5}, thickness:1.8, color:kleur });
    };
    var omcirkel = function(n, x, y){
      P(n).drawEllipse({ x:x+3, y:y+3, xScale:9, yScale:8, borderColor:PDFLib.rgb.apply(null,GOUD), borderWidth:1.2, opacity:0 });
    };

    // 1. het onderwerp
    if(d.onderwerp && VEL.onderwerp.regels[d.onderwerp]) vink(VEL.onderwerp.pagina, VEL.onderwerp.vak, VEL.onderwerp.regels[d.onderwerp]);
    else if(d.onderwerp) schrijf(VEL.eigenOnderwerp.pagina, VEL.eigenOnderwerp.x, VEL.eigenOnderwerp.y, 'Mijn onderwerp: ' + d.onderwerp);

    // 2. de drie taken
    (d.taken||[]).slice(0,3).forEach(function(t,i){ schrijf(VEL.taken.pagina, VEL.taken.x, VEL.taken.ys[i], t, 11); });

    // 3. bereikbaarheid en delegeren
    if(d.bereikbaar) vink(VEL.janee.pagina, d.bereikbaar==='ja'?VEL.janee.ja:VEL.janee.nee, VEL.janee.bereikbaar);
    if(d.delegeren)  vink(VEL.janee.pagina, d.delegeren==='ja'?VEL.janee.ja:VEL.janee.nee, VEL.janee.delegeren);
    if(d.bereikbaar==='ja' && d.bereikVan) schrijf(VEL.janee.pagina, 113, 366, 'Bereikbaar ' + (d.bereikDagen||'') + ' van ' + d.bereikVan + ' tot ' + d.bereikTot, 9, [0.35,0.33,0.3]);

    // 4. minst gestoord en energie
    schrijf(VEL.rust.pagina, VEL.rust.x, VEL.rust.y, d.rust, 11);
    schrijf(VEL.energie.pagina, VEL.energie.x, VEL.energie.y, d.energie, 11);

    // 5. afleiding
    (d.afleiding||[]).forEach(function(t){ var y=VEL.afleiding.regels[t]; if(y) vink(VEL.afleiding.pagina, VEL.afleiding.vak, y); });

    // 6. taakblok en vrije tijd
    var lijst = function(vak, gekozen){
      var extra=[];
      (gekozen||[]).forEach(function(t){ var p=vak.regels[t]; if(p) vink(vak.pagina, p.x, p.y); else extra.push(t); });
      extra.slice(0, vak.extra.ys.length).forEach(function(t,i){
        vink(vak.pagina, vak.extra.x, vak.extra.ys[i]);
        schrijf(vak.pagina, vak.extra.x+14, vak.extra.ys[i], t, 9.5);
      });
    };
    lijst(VEL.taakblok, d.taakwat);
    lijst(VEL.vrij, d.vrijwat);

    // 7. het weekschema
    var perDag = {};
    (d.blokken||[]).forEach(function(b){ (perDag[b.dag] = perDag[b.dag] || []).push(b); });
    Object.keys(perDag).forEach(function(dag){
      var rij = VEL.week.rijen[dag]; if(rij===undefined) return;
      perDag[dag].sort(function(a,b){ return a.start.localeCompare(b.start); }).slice(0,4).forEach(function(b,i){
        var k = VEL.week.kolommen[i];
        schrijf(VEL.week.pagina, k.start, rij + VEL.week.tijdOffset, b.start, 9);
        schrijf(VEL.week.pagina, k.eind,  rij + VEL.week.tijdOffset, b.eind,  9);
        var letter = SOORTLETTER[b.soort] || 't';
        omcirkel(VEL.week.pagina, k[letter], rij + VEL.week.letterOffset);
      });
    });

    // 8. terugkijken
    if(d.terug) schrijf(VEL.terug.pagina, VEL.terug.x, VEL.terug.y, d.terug, 11);

    return await pdf.save();
  }

  function bewaar(bytes, naam){
    var blob = new Blob([bytes], { type:'application/pdf' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = naam;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  window.TESPDF = { vul: vul, bewaar: bewaar, VEL: VEL };
})();

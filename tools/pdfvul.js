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
    onderwerp: { pagina:8, vak:115.3, regels:{
      'Marketing en leads':262, 'Verkoop':225, 'Aanbod':204,
      'Levering':183, 'Capaciteit':163, 'Cijfers':143 } },
    eigenOnderwerp: { pagina:8, x:130, y:88 },        // als iemand geen ondernemer is
    taken:   { pagina:9, x:113, ys:[667, 621, 576] },
    janee:   { pagina:9, ja:435.8, nee:473.3, bereikbaar:408, delegeren:382 },
    rust:    { pagina:9, x:113, y:336 },
    energie: { pagina:9, x:113, y:290 },
    afleiding: { pagina:10, vak:115.3, regels:{
      'Ik zet mijn telefoon op niet storen tijdens het blok':690,
      'Ik sluit mijn mail en berichten-apps':669,
      'Ik haal social media uit de ruimte':648,
      'Ik geef een klus uit handen die niet door mij hoeft te worden gedaan':628,
      'Ik plan een vast moment waarop ik mensen terugbel':607,
      'Ik zet een fles water op mijn bureau':587,
      'Ik eet voor mijn blok, of maak mijn eten van tevoren klaar':567,
      'Ik werk aan de grootste constraint van mijn bedrijf':546 } },
    taakblok: { pagina:10, regels:{
      'E-mail':                        {x:115.3, y:398},
      'Klantvragen die niet urgent zijn':{x:115.3, y:378},
      'Facturen':                      {x:115.3, y:340},
      'Administratie':                 {x:115.3, y:320},
      'Appjes en berichten':           {x:329.8, y:398},
      'Afspraken inplannen':           {x:329.8, y:378},
      'Een kleine operationele klus':  {x:329.8, y:357} },
      extra:{ x:329.8, ys:[337, 317] } },
    vrij: { pagina:10, regels:{
      'Wandelen':          {x:115.3, y:249},
      'Sporten':           {x:115.3, y:228},
      'Eten zonder scherm':{x:115.3, y:207},
      'Tijd met partner, kinderen of vrienden zonder aan werk te denken':{x:329.8, y:249},
      'Een uur niets met werk':{x:329.8, y:195} },
      extra:{ x:115.3, ys:[186, 166] } },
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
    // Het vinkje: twee lijntjes, gecentreerd in het vakje. De vakjes zijn
    // opgemeten op 10,5 bij 9 punt, met het midden 3 punt boven de schrijfregel.
    var vink = function(n, midX, midY){
      var kleur = PDFLib.rgb.apply(null, GOUD);
      P(n).drawLine({ start:{x:midX-3.2, y:midY+0.3}, end:{x:midX-1.0, y:midY-2.3}, thickness:1.5, color:kleur, lineCap:PDFLib.LineCapStyle.Round });
      P(n).drawLine({ start:{x:midX-1.0, y:midY-2.3}, end:{x:midX+3.4, y:midY+3.2}, thickness:1.5, color:kleur, lineCap:PDFLib.LineCapStyle.Round });
    };
    var vinkRegel = function(n, kolomX, regelY){ vink(n, kolomX, regelY + 3); };
    // eigen punt: zelf een vakje tekenen en aanvinken
    var eigenVak = function(n, kolomX, regelY){
      P(n).drawRectangle({ x:kolomX-5.25, y:regelY-1.5, width:10.5, height:9, borderColor:PDFLib.rgb(0.55,0.53,0.5), borderWidth:0.7, opacity:0 });
      vink(n, kolomX, regelY+3);
    };
    var omcirkel = function(n, x, y){
      P(n).drawEllipse({ x:x+3, y:y+3, xScale:9, yScale:8, borderColor:PDFLib.rgb.apply(null,GOUD), borderWidth:1.2, opacity:0 });
    };

    // 1. het onderwerp
    if(d.onderwerp && VEL.onderwerp.regels[d.onderwerp]) vinkRegel(VEL.onderwerp.pagina, VEL.onderwerp.vak, VEL.onderwerp.regels[d.onderwerp]);
    else if(d.onderwerp) schrijf(VEL.eigenOnderwerp.pagina, VEL.eigenOnderwerp.x, VEL.eigenOnderwerp.y, 'Mijn onderwerp: ' + d.onderwerp);

    // 2. de drie taken
    (d.taken||[]).slice(0,3).forEach(function(t,i){ schrijf(VEL.taken.pagina, VEL.taken.x, VEL.taken.ys[i], t, 11); });

    // 3. bereikbaarheid en delegeren
    if(d.bereikbaar) vinkRegel(VEL.janee.pagina, d.bereikbaar==='ja'?VEL.janee.ja:VEL.janee.nee, VEL.janee.bereikbaar);
    if(d.delegeren)  vinkRegel(VEL.janee.pagina, d.delegeren==='ja'?VEL.janee.ja:VEL.janee.nee, VEL.janee.delegeren);
    if(d.bereikbaar==='ja' && d.bereikVan) schrijf(VEL.janee.pagina, 113, 370, 'Bereikbaar ' + (d.bereikDagen||'') + ' van ' + d.bereikVan + ' tot ' + d.bereikTot, 8, [0.35,0.33,0.3]);

    // 4. minst gestoord en energie
    schrijf(VEL.rust.pagina, VEL.rust.x, VEL.rust.y, d.rust, 11);
    schrijf(VEL.energie.pagina, VEL.energie.x, VEL.energie.y, d.energie, 11);

    // 5. afleiding
    (d.afleiding||[]).forEach(function(t){ var y=VEL.afleiding.regels[t]; if(y) vinkRegel(VEL.afleiding.pagina, VEL.afleiding.vak, y); });

    // 6. taakblok en vrije tijd
    var lijst = function(vak, gekozen){
      var extra=[];
      (gekozen||[]).forEach(function(t){ var p=vak.regels[t]; if(p) vinkRegel(vak.pagina, p.x, p.y); else extra.push(t); });
      extra.slice(0, vak.extra.ys.length).forEach(function(t,i){
        eigenVak(vak.pagina, vak.extra.x, vak.extra.ys[i]);
        schrijf(vak.pagina, vak.extra.x+14.5, vak.extra.ys[i], t, 9.5);
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

    // 7b. het weekoverzicht in beeld: een extra pagina na het weekschema
    if((d.blokken||[]).length) {
      var vet = await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
      var pg = pdf.insertPage(VEL.week.pagina, [595, 842]);   // direct na het ingevulde weekschema
      var PAPIER=[0.949,0.937,0.914], LIJN=[0.82,0.80,0.77], GRIJS=[0.42,0.40,0.38];
      pg.drawRectangle({ x:0, y:0, width:595, height:842, color:PDFLib.rgb.apply(null,PAPIER) });
      pg.drawText("TIMEMANAGEMENT VOOR ONDERNEMERS", { x:68, y:777, size:7.5, font:vet, color:PDFLib.rgb(0.42,0.52,0.71), characterSpacing:1.6 });
      pg.drawText("MIJN WEEK IN BEELD", { x:68, y:720, size:24, font:vet, color:PDFLib.rgb.apply(null,INKT) });
      pg.drawText("Zo ziet je week eruit met de blokken die je hebt gepland.", { x:68, y:700, size:10, font:tekstFont, color:PDFLib.rgb.apply(null,GRIJS) });

      var dagen=[["ma","MA"],["di","DI"],["wo","WO"],["do","DO"],["vr","VR"],["za","ZA"],["zo","ZO"]];
      var minuut=function(t){ var p=String(t).split(":"); return (+p[0])*60+(+p[1]||0); };
      var van=Math.min.apply(null, d.blokken.map(function(b){ return minuut(b.start); }));
      var tot=Math.max.apply(null, d.blokken.map(function(b){ return minuut(b.eind); }));
      van=Math.max(5*60, Math.floor((van-30)/60)*60); tot=Math.min(24*60, Math.ceil((tot+30)/60)*60);
      var uren=(tot-van)/60;
      var links=100, rechts=527, boven=660, onder=Math.max(150, boven - uren*30);
      var hoog=boven-onder, perUur=hoog/uren, kolB=(rechts-links)/7;

      dagen.forEach(function(dg,i){
        var x=links+i*kolB;
        pg.drawText(dg[1], { x:x+kolB/2-7, y:boven+10, size:8, font:vet, color:PDFLib.rgb.apply(null,GRIJS), characterSpacing:0.8 });
        pg.drawLine({ start:{x:x, y:boven}, end:{x:x, y:onder}, thickness:0.5, color:PDFLib.rgb.apply(null,LIJN) });
      });
      pg.drawLine({ start:{x:rechts, y:boven}, end:{x:rechts, y:onder}, thickness:0.5, color:PDFLib.rgb.apply(null,LIJN) });
      for(var u=0; u<=uren; u++){
        var y=boven-u*perUur;
        pg.drawLine({ start:{x:links, y:y}, end:{x:rechts, y:y}, thickness:0.5, color:PDFLib.rgb.apply(null,LIJN) });
        var uur=String(van/60+u).padStart(2,"0")+":00";
        pg.drawText(uur, { x:links-28, y:y-2.5, size:7, font:tekstFont, color:PDFLib.rgb.apply(null,GRIJS) });
      }
      var kleuren={ diep:[0.294,0.498,0.831], taak:[0.945,0.796,0.318], vrij:[0.725,0.784,0.643], terug:[0.60,0.60,0.60] };
      d.blokken.forEach(function(b){
        var i=dagen.map(function(x){return x[0];}).indexOf(b.dag); if(i<0) return;
        var x=links+i*kolB+1.5, bw=kolB-3;
        var y1=boven-(minuut(b.start)-van)/60*perUur, y2=boven-(minuut(b.eind)-van)/60*perUur;
        var h=Math.max(12, y1-y2);
        pg.drawRectangle({ x:x, y:y1-h, width:bw, height:h, color:PDFLib.rgb.apply(null, kleuren[b.soort]||kleuren.taak), opacity:0.95 });
        var woorden=String(b.titel||"").split(" "), regels=[], regel="";
        woorden.forEach(function(w){
          var kandidaat = regel ? regel+" "+w : w;
          if(vet.widthOfTextAtSize(kandidaat, 5.6) > bw-6){ if(regel) regels.push(regel); regel=w; } else regel=kandidaat;
        });
        if(regel) regels.push(regel);
        regels.slice(0, Math.max(1, Math.floor((h-4)/7))).forEach(function(r, n){
          pg.drawText(r, { x:x+3, y:y1-9-n*7, size:5.6, font:vet, color:PDFLib.rgb(0.04,0.04,0.04) });
        });
        pg.drawText(b.start+"-"+b.eind, { x:x+3, y:y1-h+3, size:5, font:tekstFont, color:PDFLib.rgb(0.1,0.1,0.1) });
      });
      // legenda
      var leg=[["Diepwerk","diep"],["Taakblok","taak"],["Vrije tijd","vrij"],["Terugkijken","terug"]], lx=links;
      leg.forEach(function(l){
        pg.drawRectangle({ x:lx, y:onder-26, width:8, height:8, color:PDFLib.rgb.apply(null, kleuren[l[1]]) });
        pg.drawText(l[0], { x:lx+12, y:onder-24, size:8, font:tekstFont, color:PDFLib.rgb.apply(null,GRIJS) });
        lx += 12 + tekstFont.widthOfTextAtSize(l[0], 8) + 22;
      });
      if(d.onderwerp) pg.drawText("Diepwerk: " + d.onderwerp, { x:links, y:onder-48, size:9.5, font:vet, color:PDFLib.rgb.apply(null,INKT) });
      (d.taken||[]).filter(function(t){ return String(t).trim(); }).forEach(function(t,i){
        pg.drawText((i+1)+". "+t, { x:links, y:onder-64-i*13, size:9, font:tekstFont, color:PDFLib.rgb.apply(null,GRIJS) });
      });
      pg.drawText("TIMEMANAGEMENT VOOR ONDERNEMERS", { x:68, y:49, size:7, font:tekstFont, color:PDFLib.rgb.apply(null,GRIJS), characterSpacing:1.4 });
      pg.drawText("THE EXECUTION SYSTEM", { x:414, y:49, size:7, font:tekstFont, color:PDFLib.rgb.apply(null,GRIJS), characterSpacing:1.4 });
    }

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

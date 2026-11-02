# Archief: de oude jaardoeltool

De jaardoeltool met levensgebieden, zoals hij tot 2 november 2026 op de site
stond. Bewaard voordat de nieuwe doeltool hem verving.

- `index.html` — een volledige kopie van de site van dat moment. Alle code van
  de tool (de stappen, de logica en de opmaak) zit in dit ene bestand; daarom is
  de hele pagina meegekopieerd in plaats van er stukken uit te knippen. De
  pagina opent meteen op de tool.
- In git staat dezelfde versie onder de tag **jaardoeltool-v1** (commit 2b4e543).

## Hoe draai je hem

Serveer de map van de site en open `/archief/jaardoeltool/`. Lokaal:

    node serve.js tes-landing-repo 8082

en dan http://localhost:8082/archief/jaardoeltool/

Je kunt het bestand ook rechtstreeks openen vanaf je schijf. De tool werkt dan
gewoon; alleen de foto's van de andere pagina's laden niet, want die staan in de
map `img` van de site.

## Wat er met de antwoorden gebeurde

De tool stuurde de antwoorden naar `https://tes-leadmagnet.onrender.com/genereer`.
Die dienst maakte het document en gaf de lead door aan de backend
(`POST /api/lead-intake`), waar hij in de tabel `leads` kwam te staan — zichtbaar
in het coach-dashboard. Die data en die koppeling blijven staan.

De pagina is op `noindex` gezet en wordt nergens vanaf de site gelinkt.

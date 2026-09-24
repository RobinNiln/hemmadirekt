# HemmaDirekt – prototyp

En klickbar MVP av en svensk bostadsplattform där privatpersoner säljer bostad utan mäklare.
Byggd med React, TypeScript, Tailwind CSS och Lucide-ikoner. All data är påhittad och
BankID, betalningar och juridik är simulerade.

## Publicera på GitHub Pages (utan terminal)

1. **Skapa ett repo** på github.com → *New repository*. Välj **Public**, eftersom gratis-GitHub bara publicerar Pages från publika repon.
2. **Ladda upp filerna:** I det nya repot klickar du *uploading an existing file*. Packa upp zip-filen och dra in **innehållet** i mappen `hemmadirekt` (alltså `src`, `public`, `package.json` och så vidare, inte själva mappen). Klicka *Commit changes*.
3. **Lägg till bygg-filen:** Mappen `.github` är dold på Mac och Windows och följer ofta inte med när du drar filer. Skapa den därför direkt i GitHub:
   - Klicka *Add file → Create new file*.
   - Skriv exakt `.github/workflows/deploy.yml` som filnamn.
   - Klistra in innehållet från avsnittet *Innehåll i deploy.yml* nedan och klicka *Commit changes*.
4. **Slå på Pages:** Gå till *Settings → Pages*. Under *Build and deployment → Source* väljer du **GitHub Actions**.
5. **Vänta cirka 1–2 minuter.** Under fliken *Actions* ser du bygget. När det är grönt finns sidan på
   `https://DITT-ANVÄNDARNAMN.github.io/REPONAMN/`

Blev bygget rött efter steg 3? Då kördes det troligen innan Pages var påslaget. Gå till *Actions* → välj bygget → *Re-run all jobs*.

Varje gång du laddar upp en ändrad fil byggs sidan om automatiskt.

### Innehåll i deploy.yml

```yaml
name: Bygg och publicera på GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Var finns vad?

| Vill du ändra… | Fil |
|---|---|
| Tjänstens namn och priser | `src/config/brand.ts` |
| Bostäderna i sökningen | `src/data/listings.ts` |
| Bilder | `src/lib/images.ts` |
| Färger och typsnitt | `tailwind.config.js` |
| Demodata (bud, intressenter) | `src/state/presets.ts` |
| Affärslogiken (här kopplas en riktig backend in senare) | `src/state/SaleContext.tsx` |
| Sidorna | `src/pages/` |

Du kan redigera filer direkt på GitHub: klicka på filen och sedan på pennikonen. När du sparar byggs sidan om.

## Testa resan

- **Snabbdemo:** På startsidan klickar du *Testa en pågående försäljning*.
- **Hela resan:** Klicka *Sälj din bostad* och följ stegen: publicera, simulera visning och bud i demolägets ruta, acceptera ett bud, skapa och signera avtalet, dokument, tillträde.
- **Köparens vy:** Länken *Köparens vy* finns i dashboarden.

Försäljningen sparas i din webbläsare. Klicka *Återställ demon* för att börja om.

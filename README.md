# Drivstoff

Norsk mobilapp som etter hvert skal sammenligne drivstoffpriser i nærheten av brukeren. Første tekniske milepæl er en minimal Expo-app med norsk startskjerm. Kart, lokasjon og priser kommer i neste milepæler.

## Kom i gang

Bruk Node.js 24 LTS og pnpm 11.19.0. Prosjektmappen er den innerste `Drivstoff app`-mappen, som inneholder denne filen og package.json.

```powershell
pnpm install --frozen-lockfile
pnpm start
```

Åpne appen i Expo Go som støtter SDK 57. Telefon og PC må være på samme nettverk. Skann QR-koden i terminalen med iPhone-kameraet eller Expo Go på Android. Godkjenn lokal nettverkstilgang hvis telefonen spør. Det kreves ingen Expo-konto eller egne API-nøkler for denne milepælen.

På Windows brukes en fysisk iPhone; iOS-simulator krever macOS. Android-emulator krever separat Android SDK-oppsett.

### Denne maskinen uten pnpm på PATH

Den medfølgende pnpm kan kjøres slik i PowerShell, fra prosjektmappen:

```powershell
$projectPnpm = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs'
node $projectPnpm start
```

Bytt `start` med for eksempel `lint`, `typecheck` eller `install --frozen-lockfile`. På andre maskiner brukes vanlig pnpm-installasjon. Hvis npm er tilgjengelig, kan riktig pnpm installeres med `npm install --global pnpm@11.19.0`.

## Kontroller

```powershell
pnpm lint
pnpm typecheck
pnpm exec expo install --check
pnpm peers check
pnpm export:mobile
pnpm dlx expo-doctor
```

Expo Doctor bruker npm internt. Hvis npm mangler, kjør `pnpm --package=npm --package=expo-doctor dlx expo-doctor` for en midlertidig installasjon kun til kontrollen.

Det finnes ingen domenelogikk å enhetsteste i denne milepælen. Tester av avstand, sortering og prisalder kommer sammen med funksjonene. Se [teststatus](docs/TESTING.md).

## Valg og struktur

- Expo SDK 57, React Native og Expo Router. Filer i `src/app` definerer skjermene.
- Streng TypeScript og Expo sin ESLint-konfigurasjon.
- `pnpm-lock.yaml` låser avhengighetene; ikke bland npm/yarn-lockfiler inn i prosjektet.
- `.npmrc` bruker hoisted installasjon for kompatibilitet med native verktøy.
- React DOM, Reanimated/Worklets og Metro-konfigurasjonen er eksplisitt versjonslåst for å oppfylle rammeverkets avhengighetskrav. Appen har ingen webflate eller egne animasjoner.
- ESLint 9 brukes fordi React- og import-pluginene i Expo-konfigurasjonen ikke støtter ESLint 10 ennå. Registeret markerer ESLint 9 som utgått; oppgrader når Expo-konfigurasjonen støtter nyere versjon.
- Ingen backend, secrets eller API-nøkler. `.env` og genererte filer ignoreres av Git.

Se [implementeringsplanen](docs/IMPLEMENTERINGSPLAN.md) og [prosjektreglene](AGENTS.md).

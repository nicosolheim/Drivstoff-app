# Drivstoff

Norsk mobilapp med kart og stasjonsliste. Milepæl 4B henter ekte stasjoner og priser direkte fra Drivstoffpriser Norges offentlige JSON-filer. Ingen backend, konto eller API-nøkkel er nødvendig. Velg «Bruk min posisjon» for å finne stasjoner rundt telefonen.

Velg bensin 95, bensin 98 eller diesel. Appen finner inntil ti nærmeste stasjoner innen den faste radiusen på 25 km luftlinje, også stasjoner uten pris. Innen utvalget rangeres bare priser med entydig tidspunkt og alder høyst 24 timer på literpris, deretter avstand og ID. Andre stasjoner følger etter avstand. Prisalder oppfriskes hvert 30. sekund og når appen blir aktiv igjen. «Billigst nå» gjelder dette utvalget og er ingen garanti for pumpepris eller total kjørekostnad.

Kart og liste mottar nøyaktig samme utvalg. Trykk på en markør eller et kort: rød markør, ramme og «Valgt stasjon» viser valget. Blå markør viser hentet telefonposisjon, brun markør viser det faste Oslo S-utgangspunktet og er aldri merket som GPS. Oslo-demo er et eksplisitt, separat valg med seks fiktive stasjoner i utvalget, faste historiske testtidspunkter og ingen blanding med ekte data.

**Viktig databegrensning:** Nettprøven 19. september 2026 importerte 1 885 stasjoner og 202 prisoppføringer. Alle prisene hadde tidsstempler uten tidssone og kunne derfor ikke delta i «Billigst nå». Kildeundersøkelsen viste også svært gamle priser. Appen viser derfor normalt stasjoner etter avstand og forklarer at aktuelle prisdata mangler. Produkteier har sendt et spørsmål til kilden; vi avventer svar. Et punkt kan vise seg å være bilvask eller ladested, og stasjonsdekningen er ikke garantert komplett.

## Datainnhenting og offline

- [Stasjoner](https://drivstoffpriser.github.io/Drivstoffpriser-App/data/stations.json) og [priser](https://drivstoffpriser.github.io/Drivstoffpriser-App/data/prices.json) lastes ned via HTTPS. Appen validerer struktur, antall, ID-er, koordinater, prisverdier og at filene tilhører samme eksport. Feil forkaster hele paret. Nye ukjente drivstofftyper ignoreres; manglende/tvetydig pristid beholdes som ukjent.
- Siste gyldige lokale datasett vises først. Deretter sjekkes behov for oppfrisking ved oppstart, retur til forgrunnen og hvert minutt mens appen er aktiv. Maksimalt ett ordinært nedlastingsforsøk per 12 timer, også etter mislykket forsøk; forsøkstid lagres på telefonen. Ved feil kan brukeren uttrykkelig prøve igjen før fristen.
- To versjonsmerkede cachefiler i appens dokumentmappe lagrer originale eksportpar. Bare tom/eldre fil skrives, og innholdet leses tilbake. Ugyldig eller avbrutt lagring skal ikke ødelegge siste gyldige kopi. Cache revalideres ved oppstart. Eldre kildeeksport erstatter ikke et nyere datasett i minnet. Lagringsfeil forklares i UI.
- FetchedAt (nedlasting), sourceExportedAt (kildens eksport) og reportedAt/sourceUpdatedAtRaw (prisregistrering) er separate. Tidssone antas aldri. Observasjonstid ved pumpen er ukjent; observedAt forblir null. Rapportantall beholdes, men brukes ikke som kvalitetsgaranti.
- Offline med cache: ekte stasjoner og deres opprinnelige priser/tidspunkter beholdes. Offline uten cache: forklaring, nytt forsøk og fiktiv Oslo-demo. Kartfliser er avhengige av kartleverandørens nett/cache. Ingen bakgrunnssynkronisering eller lagring av GPS-posisjon.

## Kilder og lisens

Drivstoffpriser Norge og © OpenStreetMap-bidragsytere er kreditert ved kart/listen og på «Datakilder og lisenser». Databasen tilbys under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Lisenssiden lar brukeren lagre/dele hele det bearbeidede datagrunnlaget som JSON, med originaleksport, kildehenvisninger og endringsbeskrivelse. Eksporten inneholder ikke brukerposisjon eller demo. Dermed er datatilgangen ikke avhengig av tilgang til vårt private GitHub-repository. Native deling må verifiseres på telefon.

Dette gjør ikke appens egen kode GPL-lisensiert; vi har ikke kopiert GPL-kode fra kildeprosjektet. Rettighetskjeden for andre upstream-kilder, fremtidig blanding med egne rapporter og endelig oppfyllelse av ODbL ved kommersiell distribusjon må avklares som beskrevet i [arkitekturvurderingen](docs/PRISDATA-ARKITEKTUR.md).

## Lokasjon og kart

- Appen starter med ekte data rundt et tydelig merket fast utsnitt ved Oslo S. «Bruk min posisjon» ber om tillatelse kun mens appen brukes. Fiktiv demo aktiveres bare ved eksplisitt valg.
- Posisjonen hentes én gang, uten kontinuerlig sporing. «Oppdater posisjon» henter en ny måling. Måletidspunkt og estimert nøyaktighet vises.
- Posisjonen finnes bare i minnet. Den logges ikke, lagres ikke lokalt og sendes ikke til egen backend. Kartleverandøren laster kartdata for området som vises.
- Appen bruker ingen bakgrunnslokasjon. Ved retur fra bakgrunnen sjekkes tillatelse og posisjon på nytt dersom brukeren tidligere valgte faktisk posisjon. Ingen ny systemdialog åpnes automatisk.
- Avslag, avslåtte stedstjenester, GPS-feil eller 20 sekunders venting på GPS gir forklaring, fast Oslo-utsnitt og mulighet til å velge demo. En sen GPS-respons får ikke overstyre brukerens demovalg.
- Ved permanent avslag kan innstillinger åpnes. Slå på stedstjenester i telefonens innstillinger hvis GPS er deaktivert.
- Uten registrerte stasjoner innen 25 km vises telefonposisjonen og en tomtilstand med «Utforsk Oslo-demo». Ingen fiktiv dekning opprettes rundt telefonen.
- Kartet krever nettverk for kartfliser. Listen er lokal og kan fortsatt brukes hvis kartet laster langsomt.

Kart fungerer i Expo Go uten egne kartnøkler. En selvstendig Android-app trenger senere Google Maps-oppsett; dette er ikke konfigurert nå. Expo Go bruker sin egen tillatelsesdialog; den norske systemteksten i app.json gjelder egne native builds. Se [Expo kart](https://docs.expo.dev/versions/latest/sdk/map-view/) og [Expo lokasjon](https://docs.expo.dev/versions/v57.0.0/sdk/location/).

Datakildevalget er beskrevet i [PRISDATA.md](docs/PRISDATA.md). Egen prisrapportering og backend er fortsatt utenfor milepælen.

## Kom i gang

Bruk Node.js 24 LTS og pnpm 11.19.0. Prosjektmappen er den innerste `Drivstoff app`-mappen, som inneholder denne filen og package.json.

```powershell
pnpm install --frozen-lockfile
pnpm start
```

Ved testing av milepæl 4B: velg `feature/live-station-data` i GitHub Desktop før installasjon og oppstart. PR-en skal gjennomgås og mobiltestes før merge.

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
pnpm test
pnpm exec expo install --check
pnpm peers check
pnpm export:mobile
pnpm dlx expo-doctor
```

Expo Doctor bruker npm internt. Hvis npm mangler, kjør `pnpm --package=npm --package=expo-doctor dlx expo-doctor` for en midlertidig installasjon kun til kontrollen.

Testene bruker Nodes innebygde testverktøy og TypeScript-støtten i Node 24, syntetiske kildefiler og fast klokke. Ingen ekstra testløper er installert. De dekker import, tre drivstofftyper, prisalder/rangering, manglende data, utvalg, demo-isolasjon, nettfeil, cache, avbrutt skriving, lokasjon og lisenseksport. Node kan skrive en ufarlig MODULE_TYPELESS_PACKAGE_JSON-advarsel. Se [teststatus](docs/TESTING.md).

## Valg og struktur

- Expo SDK 57, React Native og Expo Router. Filer i `src/app` definerer skjermene.
- Streng TypeScript og Expo sin ESLint-konfigurasjon.
- `src/lib/import-stations.ts`, `download-stations.ts` og `station-cache.ts` inneholder testbar innhenting/validering/cache. `services/station-storage.ts` kobler til Expo-filer, mens `hooks/use-station-data.tsx` styrer forgrunnsoppdateringer og deler datasettet mellom de to skjermene. Eksisterende beregninger og komponenter bruker samme Station-type.
- Nye native avhengigheter: `expo-file-system` for cache og `expo-sharing` for brukerens ODbL-dataeksport. Versjonene følger Expo SDK 57. Ingen global state-pakke eller valideringspakke.
- `pnpm-lock.yaml` låser avhengighetene; ikke bland npm/yarn-lockfiler inn i prosjektet.
- `.npmrc` bruker hoisted installasjon for kompatibilitet med native verktøy.
- React DOM, Reanimated/Worklets og Metro-konfigurasjonen er eksplisitt versjonslåst for å oppfylle rammeverkets avhengighetskrav. Appen har ingen webflate eller egne animasjoner.
- ESLint 9 brukes fordi React- og import-pluginene i Expo-konfigurasjonen ikke støtter ESLint 10 ennå. Registeret markerer ESLint 9 som utgått; oppgrader når Expo-konfigurasjonen støtter nyere versjon.
- Ingen backend, secrets eller API-nøkler. `.env` og genererte filer ignoreres av Git.

Se [implementeringsplanen](docs/IMPLEMENTERINGSPLAN.md) og [prosjektreglene](AGENTS.md).

## Tilbakerulling

Velg fiktiv Oslo-demo for å teste lokalt dersom kilden er utilgjengelig. Før merge kan produkteier gå tilbake til `main` i GitHub Desktop uten å endre historikk. Etter eventuell merge brukes en separat revert-PR av milepælen, deretter installasjon med den gjenopprettede lockfilen. Cachefilene er versjonsmerket og kan ignoreres av tidligere appversjoner. Ingen serverdata eller brukerposisjoner må migreres eller slettes.

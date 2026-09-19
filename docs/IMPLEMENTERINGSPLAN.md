# Drivstoff – første MVP

## Miljøkontroll 18. september 2026

- Arbeidsmappe: C:\Users\nicos\Code\Drivstoff app. Tom ved første inspeksjon, uten .git.
- Ønsket GitHub-repository: nicosolheim/drivstoff-app. Tilgang og historikk må verifiseres før kloning/oppsett.
- Node 24.19.0 og Git 2.53.0.windows.3 er tilgjengelige.
- npm, npx og GitHub CLI er ikke tilgjengelige på PATH. Medfølgende pnpm 11.19.0 er verifisert via Node.
- Ingen Git-forfatteridentitet ble funnet gjennom git config.
- adb og Java ble ikke funnet på PATH, og Android SDK ble ikke funnet på standardplassen. Emulator er ikke verifisert.
- iOS-simulator kan ikke kjøres lokalt på Windows. Fysiske telefoner med Expo Go er første testmål.

## Enkel arkitektur

Én Expo Router-skjerm setter sammen kart, drivstoffvalg og liste. React-state holder valgt drivstoff og posisjon. En hook håndterer lokasjon; rene funksjoner beregner avstand og sortering. Data ligger i en lokal TypeScript-fil. Ingen server, database, innlogging eller ekstra lag for datatilgang.

```text
src/
  app/
    _layout.tsx           # Router og felles ramme
    index.tsx             # Kart, valg og liste
  components/
    station-map.tsx
    station-card.tsx
    fuel-selector.tsx
  hooks/
    use-user-location.ts
  data/
    stations.ts
  lib/
    stations.ts           # Luftlinjeavstand, nærmeste utvalg og prisrangering
    format.ts             # Norske priser, avstander og prisalder
  types/
    station.ts
tests/
  stations.test.ts
  format.test.ts
docs/
  IMPLEMENTERINGSPLAN.md
  TESTING.md
AGENTS.md
README.md
```

Bruk expo-location for lokasjon og react-native-maps for kart. Begge støttes i Expo Go. Kartet krever ikke egen API-nøkkel ved testing i Expo Go; separat Android-app krever senere kartkonfigurasjon. Velg stabil Expo-versjon som passer tilgjengelig Expo Go ved oppsett, og lås avhengighetene. Bruk pnpm dersom npm fortsatt mangler.

Kilder: [Expo kart](https://docs.expo.dev/versions/latest/sdk/map-view/), [Expo lokasjon](https://docs.expo.dev/versions/latest/sdk/location/), [Expo oppsett](https://docs.expo.dev/get-started/set-up-your-environment/).

## Produktregler for MVP

- Fiktive eksempelstasjoner i Oslo-området med koordinater, bensinpris, dieselpris og faste oppdateringstidspunkter. Synlig merking av at dette ikke er reelle, innhentede priser.
- Finn inntil 10 nærmeste eksempelstasjoner innen 25 km luftlinje. Sorter utvalget på pris for valgt drivstoff, deretter avstand og ID for stabil rekkefølge.
- Kart og liste bruker samme utvalg. Vis kr/l, luftlinjeavstand og prisalder for hver stasjon.
- Marker prisinformasjon eldre enn 24 timer som gammel. Dette er en enkel MVP-regel, ikke en garanti for prisens gyldighet.
- Hvis ingen stasjoner finnes i området, vis en tydelig tomtilstand. Tilby eksplisitt Oslo-demo ved behov; demo-posisjon må aldri fremstå som faktisk brukerposisjon.
- Be om lokasjon i forgrunnen etter kort forklaring. Ved avslag skal brukeren kunne prøve igjen eller åpne innstillinger når nødvendig.
- Ingen beregning av kjørekostnad eller faktisk omvei ennå. Appen rangerer literpris blant nærliggende eksempelstasjoner.

## Små milepæler

Forarbeid (utført): undersøk miljø og GitHub, skriv prosjektregler og plan.

1. **Kjørbar grunnapp:** opprett minimal Expo/Router-app med strict TypeScript, norsk startskjerm og kommandoer for lint/typecheck. Kontroller avhengigheter og bundling. Commit og push fungerende grunnlag.
2. **Data og liste:** legg inn domenetyper, eksempeldata, testet avstandsberegning, utvalg, drivstoffvalg, prisrangering og alder. Bruk fast Oslo-demo, uten kart eller lokasjonstillatelser. Én commit etter kontroller; produkteier håndterer GitHub Desktop-push hvis terminalen ikke får tilgang.
3. **Lokasjon og kart:** koble til tillatelser, brukerposisjon og stasjonsmarkører. Legg til feil-, demo- og tomtilstander. Kontroller og commit/push.
4. **Mobilverifisering:** test på iOS og Android med Expo Go, dokumenter oppstart og testresultater. Rett funn før endelig MVP-milepæl.

## Kontroll ved kodeendringer

- Lint og TypeScript-kontroll.
- Enhetstester av nullavstand, kjent avstand, radiusgrense, nærmeste utvalg før prissortering, bensin/diesel og lik pris.
- Tester av prisalder rundt minutt/time/døgn og 24-timersgrensen. Klokke injiseres i funksjonene for stabile tester.
- Expo-kompatibilitetskontroll og bundling for Android/iOS ved integrasjonsmilepæler.
- Mobiltest: godta/avslå lokasjon, permanent avslag, GPS avslått, feil ved posisjon, utenfor dataområdet, drivstoffbytte og samme stasjoner på kart og i liste.

## Status

Milepæl 1 er implementert med Expo SDK 57, Expo Router og streng TypeScript. Produkteier har bekreftet at grunnappen fungerer som forventet på fysisk iPhone i Expo Go. Android-test gjenstår.

Milepæl 2 er fullført og mobiltestet av produkteier: bensin/diesel fungerer som forventet og prisrangeringen oppleves intuitiv. Endringene er pushet til GitHub. Telefonmodell og versjoner ble ikke oppgitt.

Milepæl 3 gjennomføres på `feature/location-and-map`, opprettet fra ren main etter vellykket fetch og verifisert null avvik mot origin/main. Den legger til expo-location, kart med samme stasjonsutvalg som listen, felles stasjonsvalg og eksplisitt demo ved avslag/feil. Posisjon hentes på forespørsel, ikke gjennom bakgrunnssporing. Se TESTING.md for kontrollresultater og mobiltest.

Fra nå av brukes én branch per milepæl, små commits og Pull Request mot main. Ingen automatisk merge. Beslutningen om fremtidige eksterne prisdata er dokumentert i PRISDATA.md; prisformatet beholdes foreløpig.

Repositoryet ligger i `C:\Users\nicos\Code\Drivstoff app\Drivstoff app`. Git bruker noreply-adressen. Neste steg etter milepæl 3 er produkteiers fysiske mobiltest og PR-gjennomgang før eventuell merge.

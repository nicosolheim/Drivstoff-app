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
    StationMap.tsx
    StationCard.tsx
    FuelSelector.tsx
  hooks/
    useUserLocation.ts
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

1. **Forarbeid:** undersøk miljø og GitHub, skriv prosjektregler og denne planen. Avklar Git-tilgang og forfatteridentitet før commit.
2. **Kjørbar grunnapp:** opprett minimal Expo/Router-app med strict TypeScript, norsk startskjerm og kommandoer for lint/typecheck. Kontroller avhengigheter og bundling. Commit og push fungerende grunnlag.
3. **Data og liste:** legg inn domenetyper, eksempeldata, testet avstandsberegning, utvalg, drivstoffvalg, prisrangering og alder. Commit og push etter kontroller.
4. **Lokasjon og kart:** koble til tillatelser, brukerposisjon og stasjonsmarkører. Legg til feil-, demo- og tomtilstander. Kontroller og commit/push.
5. **Mobilverifisering:** test på iOS og Android med Expo Go, dokumenter oppstart og testresultater. Rett funn før endelig MVP-milepæl.

## Kontroll ved kodeendringer

- Lint og TypeScript-kontroll.
- Enhetstester av nullavstand, kjent avstand, radiusgrense, nærmeste utvalg før prissortering, bensin/diesel og lik pris.
- Tester av prisalder rundt minutt/time/døgn og 24-timersgrensen. Klokke injiseres i funksjonene for stabile tester.
- Expo-kompatibilitetskontroll og bundling for Android/iOS ved integrasjonsmilepæler.
- Mobiltest: godta/avslå lokasjon, permanent avslag, GPS avslått, feil ved posisjon, utenfor dataområdet, drivstoffbytte og samme stasjoner på kart og i liste.

## Status

Grunnappen er implementert med Expo SDK 57, Expo Router og streng TypeScript. Lint, typecheck, Expo-versjonskontroll, peer-kontroll, Expo Doctor (21/21) og mobilbundling for iOS/Android er bestått. Test på fysisk telefon gjenstår; se TESTING.md.

Repositoryet ligger i `C:\Users\nicos\Code\Drivstoff app\Drivstoff app`, og prosjektreglene og planen er kopiert inn der. Git-forfatteridentitet er konfigurert. Terminalens GitHub-autentisering har tidligere feilet; push kontrolleres ved milepælen. Neste utviklingsmilepæl er lokale eksempeldata, drivstoffvalg og testet stasjonsliste.

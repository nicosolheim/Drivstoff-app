# Teststatus

## Milepæl 2 – stasjonsliste

Kontrollert 19. september 2026 på Windows med Node 24.19.0 og pnpm 11.19.0.

| Kontroll | Resultat |
| --- | --- |
| ESLint med null tillatte advarsler | Bestått |
| TypeScript, inkludert testene | Bestått |
| Node-enhetstester | 14 av 14 bestått |
| Expo Doctor, med midlertidig npm | 21 av 21 bestått |
| Hermes-bundling for iOS og Android | Bestått |
| Fysisk iPhone / Android med ny liste | Gjenstår |

Testene dekker nullavstand, kjent avstand, symmetri, datolinje, antipoder, radiusgrense, maksimum ti nærmeste før prissortering, begge drivstofftyper, like priser, deterministisk ID-sortering, tomt utvalg og ugyldige data. Formatering testes ved meter/kilometer- og minutt/time/døgn-grenser, nøyaktig 24 timer og rett etter grensen, ulike tidssoner samt ugyldige og fremtidige tidspunkter. Klokken er fast i testene. Node skriver en ufarlig moduldeteksjonsadvarsel; ingen tester feiler.

### Manuell sjekkliste for milepæl 2

1. Start med `pnpm start` og åpne i Expo Go på iPhone/Android.
2. Kontroller tydelig «OSLO-DEMO · FIKTIVE TESTDATA» og at avstand er fra Oslo S, ikke fra telefonen.
3. Bensin skal vise seks stasjoner, med Demo Bryn øverst til 20,59 kr/l. Demo Grünerløkka skal stå foran Demo Sagene ved lik bensinpris.
4. Velg diesel: Demo Skøyen skal være øverst til 19,79 kr/l. Bytt tilbake og kontroller at bensinprisene og rekkefølgen gjenopprettes.
5. Demo Drøbak skal ikke vises; den ligger utenfor 25 km.
6. Kontroller prisalder og merket «Gammel pris · eldre enn 24 timer». Antall gamle priser øker over tid siden tidsstemplene er faste. Ukjent/fremtidig tidspunkt vises som ukjent alder.
7. Kontroller rulling, stor systemtekst, trykkflater og valgt drivstoff med VoiceOver/TalkBack. Ingen innhold skal skjules bak systemfeltene.
8. La appen ligge i bakgrunnen og åpne den igjen; prisalder skal oppfriskes. Appen skal ikke spørre om lokasjon.

Loggfør plattform, telefonmodell, system-/Expo Go-versjon og resultat når mobiltesten utføres.

## Milepæl 1 – grunnapp

Kontrollert 18. september 2026 på Windows med Node 24.19.0 og pnpm 11.19.0.

| Kontroll | Resultat |
| --- | --- |
| ESLint, ingen tillatte advarsler | Bestått |
| TypeScript, strict og noUncheckedIndexedAccess | Bestått |
| Expo install --check, med nettverk | Bestått |
| pnpm peers check | Ingen konflikter |
| Expo Doctor | 21 av 21 bestått, med midlertidig npm |
| Expo export, Android og iOS | Bestått, Hermes-bundler generert |
| Expo Go-utviklingsserver | Metro startet på localhost:8081 |
| Fysisk iPhone, Expo Go – milepæl 1 | Bestått, bekreftet av produkteier: fungerer som forventet |
| Fysisk Android – milepæl 1 | Ikke utført |

iPhone-testen er rapportert av produkteier. Telefonmodell og eksakt iOS-/Expo Go-versjon er ikke oppgitt. Bekreftelsen gjelder grunnappen i milepæl 1, ikke stasjonslisten i milepæl 2.

Bundling er ikke en installasjon eller kjøring av den native appen. Sandbox nektet første forsøk på å kjøre Hermes; eksporten ble deretter kjørt med utvidet tilgang og bestod. Utviklingsserveren brukte innebygd reserveversjon av React Native DevTools fordi sandkassen ikke kunne skrive til DevTools-cachen.

### Opprinnelig manuell sjekkliste for grunnappen

1. Start med `pnpm start` og åpne QR-koden i Expo Go for SDK 57.
2. Kontroller på både iOS og Android at «Et smartere sted å fylle.» og «Grunnappen er på plass» vises uten feilmelding.
3. Kontroller at skjermen ikke overlapper statuslinjen og at innhold kan rulles ved stor systemtekst.
4. Last appen på nytt og kontroller at den starter igjen uten feil.

Produkteier har bekreftet at milepæl 1 fungerer på iPhone. De enkelte sjekkpunktene er ikke rapportert separat. Android-test er fortsatt ikke rapportert.

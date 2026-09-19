# Teststatus

## Milepæl 3 – lokasjon og kart

Produkteier har senere bekreftet fullført og godkjent fysisk iPhone-test av GPS, kart, stasjonsliste og drivstoffvalg. PR #1 er godkjent og merget til main. Telefonmodell og eksakte system-/Expo Go-versjoner er ikke oppgitt; dette er ikke en bekreftelse på Android-test eller separat gjennomføring av hvert feilscenario nedenfor.

Kontrollert 19. september 2026. Mobiltest av denne milepælen er ikke utført av agenten.

- Lint og streng typecheck: bestått.
- 21 enhetstester: bestått. Nye tester dekker tillatelse/avslag, permanent avslag, passiv tillatelsessjekk, avslått GPS, feil, tidsavbrudd, sen respons, ugyldige/gamle koordinater, ukjent nøyaktighet og endret stasjonsutvalg ved faktisk posisjon.
- Generert native-konfigurasjon inspisert: norsk WhenInUse-tekst på iOS; coarse/fine location på Android; ingen Always-/bakgrunnslokasjon eller bevegelsestillatelse.
- Expo Doctor: 21 av 21 kontroller bestått.
- Hermes-bundling for iOS og Android: bestått. Dette verifiserer pakking, ikke native kjøring på telefon.

### Konkret iPhone-test

1. Velg `feature/location-and-map`, installer med `pnpm install --frozen-lockfile`, start med `pnpm start` og åpne i Expo Go.
2. Ved første åpning: ingen automatisk systemdialog. Se tydelig Oslo-demo og fiktive data. Demo-posisjonen skal være brun og merket Oslo S, aldri «din posisjon».
3. Trykk «Bruk min posisjon», tillat mens appen brukes. Kontroller blå markør, tidspunkt/nøyaktighet og avstander fra faktisk posisjon. «Oppdater posisjon» skal hente ny måling.
4. Utenfor Oslo-dekningen: forvent ingen stasjoner innen 25 km, men kart med telefonposisjon. Velg «Utforsk Oslo-demo» og få Oslo-utvalget tilbake.
5. Velg en grønn stasjonsmarkør. Den skal bli rød, navnet skal vises som valgt, og samme kort skal ha rød ramme og «Valgt stasjon». Velg et annet kort og kontroller tilsvarende markør.
6. Bytt bensin/diesel. Prisene og rekkefølgen skal endres; kart og liste skal fortsatt vise samme stasjoner. Valgt stasjon skal bevares hvis den fortsatt er i utvalget.
7. Avslå lokasjonstilgang via Expo Go-/telefoninnstillinger og prøv igjen. Appen skal vise forståelig forklaring og Oslo-demo. Ved permanent avslag skal «Åpne innstillinger» fungere. Gå tilbake etter å ha endret tillatelsen.
8. Slå av stedstjenester, prøv igjen og kontroller forklaringen. Ved dårlig GPS skal venting ende med feilmelding etter omtrent 20 sekunder. Velg demo mens GPS venter; et sent resultat skal ikke skifte tilbake til faktisk posisjon.
9. Legg appen i bakgrunnen og åpne igjen. Ved tidligere faktisk posisjon skal den sjekkes på nytt uten å spørre om tillatelse automatisk. Ved eksplisitt demo skal den forbli i demo.
10. Test stor tekst, VoiceOver, små skjermer, rulling og kartzoom. Kartet er 210 punkter høyt; liste og priser skal være lett tilgjengelige under kartet. Kontroller at valgt kort kan aktiveres med skjermleser.
11. Test uten nett: listen skal fortsatt fungere, selv om kartflisene kan mangle. Ved lang kartlasting skal en hjelpetekst vises.

Tillatelsesdialogen i Expo Go tilhører Expo Go; app.json-teksten gjelder en fremtidig egen build. Native kart og systemtillatelser må også testes på Android før full plattformgodkjenning. Tillatelsesendringer påvirker Expo Go og eventuelt andre prosjekter som kjører der.

## Milepæl 2 – stasjonsliste

Kontrollert 19. september 2026 på Windows med Node 24.19.0 og pnpm 11.19.0.

| Kontroll | Resultat |
| --- | --- |
| ESLint med null tillatte advarsler | Bestått |
| TypeScript, inkludert testene | Bestått |
| Node-enhetstester | 14 av 14 bestått |
| Expo Doctor, med midlertidig npm | 21 av 21 bestått |
| Hermes-bundling for iOS og Android | Bestått |
| Mobiltest av milepæl 2 | Bestått, bekreftet av produkteier; drivstoffvalg og prisrangering fungerer som forventet |

Mobiltest er rapportert av produkteier. Eksakt enhet og system-/Expo Go-versjon er ikke oppgitt i bekreftelsen. Dette godkjenner ikke automatisk kart og lokasjon i milepæl 3.

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

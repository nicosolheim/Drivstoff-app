# Teststatus

## Milepæl 4B – ekte stasjonsdata og lokal cache

Kontrollert 19. september 2026 på `feature/live-station-data`, fra ren og oppdatert main etter PR #2 (`e5e6c54`). Fysisk iPhone-/Android-test av 4B er ikke utført av agenten og gjenstår før godkjenning.

| Kontroll | Resultat |
| --- | --- |
| ESLint, null tillatte advarsler | Bestått |
| TypeScript strict, inkludert tester | Bestått |
| Node-enhetstester | 35 av 35 bestått |
| Expo Doctor | 21 av 21 bestått |
| Hermes-bundling iOS / Android | Begge bestått |
| Direkte HTTPS-nedlasting med produksjonens importer | Bestått: 1 885 stasjoner, 202 priser; alle priser klassifisert som usikre og utelatt fra aktuell rangering |
| Native fillagring/deling og kart på telefon | Ikke testet for 4B |

Nettprøven hentet data `2026-09-19T10:10:31.186Z`. Eksportparet oppga `2026-09-18T20:36:00.592877+00:00`. Både researchfilene fra 4A og direkte nettimport ble validert med ny importkode. Nettprøven bruker Node-fetch; Expo-fetch og native filsystem må også prøves på telefon. Ingen pris ble gjort aktuell av nytt hentetidspunkt.

Testene bruker syntetiske data og dekker stasjonsmetadata, kilde-ID/original-ID, tre drivstofftyper, kilde og rapportantall, manglende pris, gamle priser, tvetydige/ugyldige/fremtidige tidspunkter og 24-timersgrensen. Videre testes ufullstendige eksportpar, feil antall, duplikater, ukjente stasjonsreferanser, ugyldige koordinater/priser, HTTP-/JSON-feil, offline, tidsavbrudd, avbruddssignal, kald cache, revalidering, avbrutt skriving og 12-timersgrensen på tvers av cacheinstanser.

Utvalgstestene kontrollerer den felles funksjonen kart og liste får data fra, også når priser mangler, og isolasjon mellom ekte data/demo. De renderer ikke native kart. Lisenseksport testes for hele databasen, originalkildene, attribusjon og fravær av brukerposisjon. Eksisterende formaterings- og lokasjonstester består også.

Node gir den kjente MODULE_TYPELESS_PACKAGE_JSON-advarselen; Metro gir NO_COLOR/FORCE_COLOR-advarsler. Første nettprøve ble blokkert av sandkassen; kjøring med godkjent nettverkstilgang bestod. Ingen av disse er feil i appen.

### iPhone-test før godkjenning av 4B

1. Velg `feature/live-station-data` i GitHub Desktop. Kjør `pnpm install --frozen-lockfile` og `pnpm start` fra innerste prosjektmappe. Åpne med Expo Go for SDK 57.
2. Start med nett. Forvent «EKTE STASJONSDATA», automatisk nedlasting, «Sist hentet» og et fast Oslo S-utsnitt tydelig merket som ikke GPS. Ingen automatisk lokasjonsdialog eller fiktive stasjoner.
3. Trykk «Bruk min posisjon». Tillat mens appen brukes. Kontroller blå posisjonsmarkør, hentetid/nøyaktighet, ekte stasjoner og avstander. Maks ti nærmeste innen 25 km vises. Uten stasjoner: forståelig tomtilstand og demovalg.
4. Bytt bensin 95, bensin 98 og diesel. Kart/listen skal vise samme stasjoner også uten pris. Forvent «Pris ikke tilgjengelig» eller tydelig ubekreftet/historisk pris. Med dagens kilde forventes melding om manglende aktuelle priser og avstandssortering, ingen billigst-kåring.
5. Kontroller prisstatus også i markørens infoboble. Velg via kart og kort: samme stasjon skal bli rød og markert. Appstart eller nedlasting skal ikke gjøre prisen ferskere.
6. Velg «Bruk fiktiv Oslo-demo»: bare Demo-stasjoner, synlig testmerking, brun Oslo S-markør. Bare én demooppføring har bensin 98. «Vis ekte stasjoner» og «Bruk min posisjon» skal gå ut av demo uten kildeblanding. Gamle testpriser forblir gamle.
7. Etter vellykket henting: slå av Wi-Fi/mobildata. Listen, dataalder og demo skal fortsatt fungere. Kartfliser kan mangle. For full kaldstart uten nett må JS-bundelen allerede være tilgjengelig i Expo Go, eller en separat development/release-build brukes; utviklingsserverens nettbehov er ikke en feil i datacachen.
8. Med tom datacache og utilgjengelig datakilde: forvent forklaring, nytt forsøk og demo. Bruk ren testinstallasjon eller slett kun `stations-v1-a.json`, `stations-v1-b.json` og `stations-last-attempt.txt` i appens sandbox med native utviklingsverktøy. Ikke slett alle Expo Go-data uten å ta hensyn til andre prosjekter. Alternativt blokker datakilden selektivt mens Metro er tilgjengelig. Enhetstestene dekker dette dersom slike verktøy ikke finnes.
9. Åpne på nytt innen 12 timer: «Sist hentet» skal stå stille. Etter 12 timer hentes nye data i forgrunnen (innen omtrent ett minutt hvis appen står åpen). Ved feil kan «Prøv datainnhenting igjen» brukes før fristen. Prisregistreringstiden skal forbli uendret.
10. Legg appen i bakgrunnen under henting. Tidligere data beholdes og avbrutt henting kan prøves igjen. Test avvist lokasjon, deaktivert GPS og retur fra innstillinger som i milepæl 3. Fast Oslo-utsnitt skal aldri utgis for telefonposisjon.
11. Åpne «Datakilder og lisenser»: kontroller kildelenker og separat hentetid/eksporttid. Lagre JSON i Filer med «Lagre eller del datagrunnlag». Kontroller hele databasen, originalfiler og lisensmetadata, uten GPS-posisjon. Prøv også offline etter at data er lagret.
12. Kontroller liten skjerm, stor tekst, VoiceOver og rulling. Gjenta hovedflyt, fillagring og fildeling på Android før plattformgodkjenning.

Noter telefonmodell, systemversjon, Expo Go-versjon og resultat. Tidligere godkjenning av milepæl 3 omfatter ikke cache/deling i 4B.

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

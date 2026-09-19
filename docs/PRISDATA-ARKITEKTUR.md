# Milepæl 4A: ekte norske drivstoffdata – research og arkitektur

Undersøkt 19. september 2026. Beslutningsgrunnlag for produkteier, ikke en implementert integrasjon. Appkode, avhengigheter og funksjonalitet er uendret. Arbeidet ligger på `feature/real-fuel-data`, opprettet fra ren og oppdatert `main` (`9abf641`, merge av PR #1). Milepæl 3 er godkjent av produkteier etter fysisk iPhone-test av GPS, kart, liste og drivstoffvalg.

## 1. Konklusjon og anbefalt beslutning

**Den offentlige eksporten kan lastes ned uten konto eller API-nøkkel, men kan ikke anbefales som kilde til aktuelle drivstoffpriser nå.** Den undersøkte eksporten har 1 885 stasjoner, 202 prisrader og bare 101 stasjoner med pris (5,36 %). Nyeste prisdato er 15. mai 2026. Ingen pris er yngre enn 30 dager; alle er eldre enn 90 dager. En ny eksportdato gjør ikke prisene ferske.

**Anbefalt arkitektur er alternativ A for en avgrenset pilot:** direkte lesing av de to små JSON-filene, egen normalisering og lokal cache. Det krever ingen egen backend eller tjenesteabonnement. Ikke gå videre med offentlig «billigst nå»-funksjonalitet før kildeeier har avklart gammel priseksport, tidssone og registreringstidens betydning. Alternativ B blir aktuelt dersom det trengs sentral kvalitetskontroll eller kilden krever redusert belastning. Supabase (C) løser ikke manglende eller gamle kildedata og er unødvendig nå.

Vi kan eventuelt godkjenne 4B som **stasjonsoversikt med manglende/historiske priser**, men dette er et svakere produkt enn aktuell prissammenligning og må være en eksplisitt produktbeslutning. Automatisk import fra denne kilden betyr fortsatt at grunnprisene rapporteres av andre brukere, ikke at de er en automatisk prisstrøm fra kjedene.

## 2. Hvor dataene faktisk ligger

Prosjektet er [Drivstoffpriser-App](https://github.com/Drivstoffpriser/Drivstoffpriser-App). Eksporten ligger i **samme repository**, under `docs/data/`, og publiseres med GitHub Pages:

| Ressurs | Verifisert adresse |
| --- | --- |
| Dataportal | [data/index.html](https://drivstoffpriser.github.io/Drivstoffpriser-App/data/index.html) |
| Stasjoner | [stations.json](https://drivstoffpriser.github.io/Drivstoffpriser-App/data/stations.json) |
| Priser | [prices.json](https://drivstoffpriser.github.io/Drivstoffpriser-App/data/prices.json) |
| Filer i GitHub | [docs/data](https://github.com/Drivstoffpriser/Drivstoffpriser-App/tree/main/docs/data) |
| Stasjoner, alternativ råadresse | [raw stations.json](https://raw.githubusercontent.com/Drivstoffpriser/Drivstoffpriser-App/main/docs/data/stations.json) |
| Priser, alternativ råadresse | [raw prices.json](https://raw.githubusercontent.com/Drivstoffpriser/Drivstoffpriser-App/main/docs/data/prices.json) |

README-lenken `https://drivstoffpriser.github.io/data/` og det antatte repositoryet `https://github.com/Drivstoffpriser/data` ga **HTTP 404** ved kontroll. Den fungerende adressen inkluderer `/Drivstoffpriser-App/`. Det er ikke nødvendig å bruke Firestore, Firebase-nøkler eller deres operative backend for å lese eksporten.

Begge datafilene ga HTTP 200. `prices.json` hadde `Content-Type: application/json; charset=utf-8`, `Access-Control-Allow-Origin: *`, `Cache-Control: max-age=600` og en svak ETag. HTTP Last-Modified var `2026-09-18T20:36:45Z`. Dette er distribusjonsmetadata, ikke prisalder. Native Expo-fetch krever ikke nettleser-CORS, men headeren er også gunstig for en eventuell webklient. Ingen CSV, GeoJSON, paginering, historikkfil eller inkrementell eksport ble funnet i den publiserte `docs/data`-mappen; tilgjengelig tilbud er to JSON-snapshots og en HTML-indeks.

Programmatisk fremgangsmåte for 4B: vanlig HTTPS GET til begge JSON-adressene, kontroller HTTP-status, størrelse og JSON-struktur, sammenlign `exportedAt`, join `prices.stationId` mot `stations.id`. Bruk ETag/If-None-Match hvis støttet i praksis; verifiser 304 på telefon før dette brukes. Ved ulik eksportversjon: kort nytt forsøk, ellers behold siste komplette snapshot. Ingen nettverkskode legges inn i appen i 4A.

## 3. Faktiske eksportfunn

### Målegrunnlag og etterprøvbarhet

Komplett nedlasting av begge filer, ikke et utvalg. Tallene er beregnet lokalt med JSON-parsing, settoperasjoner og luftlinjeavstand. Analyseklokke: **2026-09-19T08:41:01.653Z**. Filene ble også lastet ned fra fast commit og SHA-256-sammenlignet med Pages-filene:

**Kildecommit:** `ca877daa63ed144d14f3fd361a8785024692818b`.

| Fil | Ukomprimert UTF-8 | SHA-256 |
| --- | ---: | --- |
| [Fast stations.json](https://raw.githubusercontent.com/Drivstoffpriser/Drivstoffpriser-App/ca877daa63ed144d14f3fd361a8785024692818b/docs/data/stations.json) | 423 413 byte | `483a16048eed82e3319d630b6b197cb268fbe74bd9a25b899f14c27a006ccfb1` |
| [Fast prices.json](https://raw.githubusercontent.com/Drivstoffpriser/Drivstoffpriser-App/ca877daa63ed144d14f3fd361a8785024692818b/docs/data/prices.json) | 35 031 byte | `49a8d04d6826b7b516e30c5d57cd19e1cf968d332e1c4c12dd469e9c559345b1` |

Samlet størrelse: **458 444 byte**, omtrent 448 KiB. Lokal gzip-måling: 76 850 + 4 134 byte; dette er et komprimeringsestimat, ikke målt faktisk overføring på mobil. Kildedata og leste GPL-filer ble bare undersøkt i ignorert `.expo/research`, og følger ikke denne commiten. Ingen GPL-kode er kopiert inn i appen.

### Format, identifikatorer og felter

Stasjonsfilen er et objekt med `exportedAt`, `count` og `stations`. Prisfilen har `exportedAt`, `count` og `prices`. Begge oppga `2026-09-18T20:36:00.592877+00:00`, og begge count-feltene stemmer med faktisk arraylengde.

Stasjoner har `id`, `name`, `brand`, `address`, `city`, `latitude`, `longitude`. 11 stasjoner har i tillegg `prices: []`; det finnes ingen ekstra priser i disse tomme feltene. Bruk den separate prisfilen. Ingen felt for drivstofftilbud, kommune-/fylkeskode, verifisert drift eller sikker stasjonstype finnes i eksporten.

ID-er er **opake strenger**, ikke én universell OSM-ID: 1 789 `osm_…`, 52 `dinarena_…`, 29 `user_…`, 11 `ck_…`, én hver av `automat1_…`, `esso_…`, `st1_…` og én UUID uten prefiks. Behold hele kilde-ID-en og legg til vårt eget namespace, for eksempel `drivstoffpriser:osm_1118788394`. Ikke generer identitet fra navn/koordinater, og ikke anta at alle prefikser er OSM. Stabilitet over sletting/migrasjon er ikke dokumentert som kontrakt.

En prisrad inneholder kun `stationId`, `fuelType`, `price`, `updatedAt`, `reportCount`. `price` er et JSON-tall med desimalpris; den norske appkonteksten tilsier NOK/liter, men eksporten har **ingen eksplisitt valuta- eller enhetsfelt**. Dette må bekreftes før adapteren låser semantikken. Eksempel fra eksporten: diesel ved `osm_1118788394` har pris 20,99, reportCount 4 og `updatedAt` `2026-04-18T12:51:02.310296`; bensin95 ved samme stasjon har separat tidspunkt og reportCount 3. Tidspunktet er altså individuelt per drivstofftype.

### Mengde og integritet

| Måling | Resultat |
| --- | ---: |
| Stasjoner / unike ID-er | 1 885 / 1 885 |
| Gyldige numeriske koordinatpar innen globale koordinatgrenser | 1 885 |
| Prisrader / unike stasjon–drivstoff-par | 202 / 202 |
| Stasjoner med minst én positiv pris | 101 / 1 885 = **5,36 %** |
| Stasjoner uten noen prisrad | 1 784 = **94,64 %** |
| Diesel | 100 stasjoner = 5,31 % |
| Bensin 95 (`petrol95`) | 97 stasjoner = 5,15 % |
| Bensin 98 (`petrol98`) | 5 stasjoner = 0,27 % |
| Både bensin 95 og diesel | 96 stasjoner |
| Prisrader uten matchende stasjon | 0 |
| Identiske koordinatpar | 0; dette utelukker ikke nesten-duplikater |
| Manglende/tomt navn | 1 |
| Manglende/tom adresse / by | 18 / 18 |
| Prisintervall | 16,27–29,29; alle 202 verdier positive og endelige |
| ReportCount | 1–20; 132 av 202 rader har verdien 1 |

En måling av prosentandel her gjelder **eksportens stasjonsliste**, ikke Norges faktiske antall bensinstasjoner. Korrekte koordinatgrenser er ikke bevis for at en stasjon finnes, er åpen eller selger drivstoff.

### Prisaldre og tidsusikkerhet

Alle 202 `updatedAt` er utfylt, men **ingen har `Z` eller tidssone-offset**. Flere har seks desimaler i sekundfeltet. De må ikke tolkes med telefonens lokale tidssone eller automatisk få påklistret `Z` i produksjon.

| Prisoppdatering | Resultat |
| --- | --- |
| Eldste rådato | `2026-03-22T13:04:45.604981` |
| Nyeste rådato | `2026-05-15T15:07:45.370402` |
| Alder, dersom råtid tolkes som UTC kun for denne analysen | Min. 126,73 døgn; median 168,21; maks. 180,82 |
| Under 24 timer / 7 dager / 30 dager | 0 / 0 / 0 prisrader |
| Over 90 dager | 202 av 202 |

Median er gjennomsnittet av de to midterste i sortert liste. UTC-antakelsen brukes bare for omtrentlig aldersstatistikk; usikker tidssone endrer ikke konklusjonen om måneder gamle data. I appmodellen skal presis alder være ukjent til tidssonen er dokumentert, samtidig som rådatoens åpenbare alder kan forklares uten å hevde nøyaktig observasjonstid.

### Publiseringsfrekvens er ikke prisoppdateringsfrekvens

[Eksportworkflowen](https://github.com/Drivstoffpriser/Drivstoffpriser-App/blob/ca877daa63ed144d14f3fd361a8785024692818b/.github/workflows/export-data.yml) planlegger eksport kl. 06:00 og 18:00 UTC, samt manuell kjøring. [Eksportskriptet](https://github.com/Drivstoffpriser/Drivstoffpriser-App/blob/ca877daa63ed144d14f3fd361a8785024692818b/scripts/export_data.py) leser stasjoner fra Firestore, men priser fra det eksisterende `aggregates/prices`-dokumentet. Det setter en ny `exportedAt` hver kjøring. Det oppdaterer ikke selve prisobservasjonene og gjenoppbygger ikke prisaggregatet fra prisrapportene.

De [20 siste eksportkjøringene](https://api.github.com/repos/Drivstoffpriser/Drivstoffpriser-App/actions/workflows/export-data.yml/runs?per_page=20) undersøkt var vellykkede scheduled-kjøringer, fra 9. til 18. september. [20 eksportcommits](https://api.github.com/repos/Drivstoffpriser/Drivstoffpriser-App/commits?path=docs/data/prices.json&per_page=20) hadde mellomrom på 9,18–15,68 timer, gjennomsnitt 11,88 timer. Siste kjøring: [35392299997](https://github.com/Drivstoffpriser/Drivstoffpriser-App/actions/runs/35392299997). Dette støtter omtrent to eksportjobber per dag, **ikke** en garanti om senest 12 timers publiseringsforsinkelse.

Alle 202 prisrader var semantisk identiske med [eksporten 9. september](https://raw.githubusercontent.com/Drivstoffpriser/Drivstoffpriser-App/22a511b3e43c356f47e600ea9aba07f1f1028fda/docs/data/prices.json), etter sortering på stasjon/drivstoff og normalisering av feltenes rekkefølge. Bare snapshot-metadata kan derfor ikke brukes som friskhetssignal.

Nyere [prisprovider](https://github.com/Drivstoffpriser/Drivstoffpriser-App/blob/ca877daa63ed144d14f3fd361a8785024692818b/lib/providers/price_provider.dart) sender rapporter gjennom en backend-klient, mens eksportskriptet fortsatt leser Firestore. [Backend-repositoryet](https://github.com/Drivstoffpriser/backend) beskriver PostgreSQL/FastAPI. **Mulig forklaring, ikke bevist driftsdiagnose:** eksporten kan lese en eldre datakjede etter migrasjon. Det krever avklaring med vedlikeholder. Deres [API-klient](https://github.com/Drivstoffpriser/Drivstoffpriser-App/blob/ca877daa63ed144d14f3fd361a8785024692818b/lib/services/backend_api_client.dart) bruker autentiseringsheadere for prisoppslag; vi har ikke kalt dette API-et eller forutsatt rett til å bruke det.

### Hva kvalitetsfeltene faktisk sier

Det finnes ingen eksportert kilde per pris, observatøridentitet, bildebevis, usikkerhetsscore, verifisert-status eller `observedAt`. Kilden kan merkes som Drivstoffpriser Norge på **datasett-/proveniensnivå**, ikke som en navngitt rapportør.

Den eldre [Firestore-rapportfunksjonen](https://github.com/Drivstoffpriser/Drivstoffpriser-App/blob/ca877daa63ed144d14f3fd361a8785024692818b/lib/services/firestore_service.dart#L234) øker `reportCount` når rapporter legges til og bruker innsendingsøyeblikket som `updatedAt`. Tallet er dermed ikke dokumentert som antall uavhengige bekreftelser av dagens konkrete pris. Registreringstid er heller ikke dokumentert tidspunkt for når prisskiltet ble sett. Ingen konstruert «høy sikkerhet» fra reportCount alene.

## 4. Geografisk dekning

Koordinatene spenner fra 58,026524 til 78,239257 nord og 4,843042 til 31,098553 øst. Dette inkluderer Svalbard og viser stor geografisk utstrekning, men er ikke dokumentasjon på full dekning. 213 oppføringer ligger nord for 66° N; bare fire av disse har noen prisrad.

Følgende er egen beregning med Haversine, jordradius 6 371 km, **25 km luftlinje fra oppgitte punkter**, ikke kommunegrenser:

| Område / sentrum (lat, lon) | Stasjoner | Med noen pris | Prisrader |
| --- | ---: | ---: | ---: |
| Oslo (59,911; 10,752) | 158 | 3 | 6 |
| Bergen (60,393; 5,324) | 72 | 10 | 21 |
| Stavanger (58,970; 5,733) | 76 | 1 | 2 |
| Trondheim (63,430; 10,395) | 49 | 7 | 16 |
| Kristiansand (58,147; 7,995) | 43 | 2 | 4 |
| Bodø (67,280; 14,405) | 13 | 0 | 0 |
| Tromsø (69,650; 18,956) | 15 | 0 | 0 |
| Alta (69,968; 23,271) | 8 | 0 | 0 |
| Kirkenes (69,727; 30,045) | 3 | 0 | 0 |

Alle prisene også i disse områdene er gamle. Det er derfor **ingen aktuell prisdekning i det analyserte snapshotet**, selv i byer med mange stasjonsoppføringer.

Sju navn inneholder «Bilvask» eller «Lader», blant annet `ck_circle-k-bilvask-honefoss` og `ck_circle-k-lader-ullevaal-stadion`; ingen av disse har pris. Det kan være andre anlegg enn utsalgssteder for bensin/diesel. Dette er kandidater for kontroll, ikke grunnlag for blind sletting basert på navn. Ikke hevde «alle bensinstasjoner i Norge», og ikke beregne nasjonal fullstendighetsprosent uten en uavhengig referanseliste. Det finnes også et separat [stations-repository](https://github.com/Drivstoffpriser/stations) under ODbL; en overgang dit må avklare ID-koblingen til prisene og er ikke utført her.

## 5. Lisensvurdering

Dette er en teknisk lisensgjennomgang, ikke endelig juridisk godkjenning for kommersiell lansering.

### Dokumenterte vilkår

[LICENSE-DATA](https://github.com/Drivstoffpriser/Drivstoffpriser-App/blob/ca877daa63ed144d14f3fd361a8785024692818b/LICENSE-DATA) angir ODbL 1.0. [LICENSE-CODE](https://github.com/Drivstoffpriser/Drivstoffpriser-App/blob/ca877daa63ed144d14f3fd361a8785024692818b/LICENSE-CODE) er GPL v3; flere kildefiler tillater v3 eller senere. Databruk er ikke det samme som gjenbruk av GPL-kode. Vi skriver vår egen adapter fra det dokumenterte dataformatet.

ODbL §3.1 tillater kommersiell bruk, kopiering og bearbeiding. Lokal cache og automatisk oppdatering er dermed prinsipielt tillatt under lisensvilkårene; dette gir ingen garanti om servertilgjengelighet eller ubegrenset trafikk. §4.2 krever at lisens og rettighetsmerknader følger distribuerte databaser; §4.3 krever synlig kilde-/lisensmerknad ved offentlig bruk av resultatet. §4.4 omfatter offentlig bruk av bearbeidede databaser. §4.6 krever tilbud om maskinlesbar bearbeidet database eller fullstendige endringer/metode med tillegg; distribusjon over internett skal være gratis. §4.7 begrenser ekstra restriksjoner og tekniske sperrer. Appkode omfattes ikke av databaselisensen som sådan (§2.3). [Full ODbL-tekst](https://opendatacommons.org/licenses/odbl/1-0/).

ODbL-oppsummeringen fremhever deling, bearbeiding, attribusjon og share-alike. En egen app kan være kommersiell, men en bearbeidet database kan ikke uten videre bli proprietær. Egne rapporter kan tilføyes dersom rettighetene er kompatible. Å legge egne data i en annen tabell er ikke i seg selv bevis på at resultatet er en juridisk uavhengig samling. [Lisensoppsummering](https://opendatacommons.org/licenses/odbl/summary/).

Stasjonsportalen oppgir OpenStreetMap som kilde, og ID-ene viser også andre prefikser. OSM krever attribusjon og lisensinformasjon for OSM-data. [OSM copyright](https://www.openstreetmap.org/copyright). OSMFs retningslinjer anbefaler leselig attribusjon ved kartet/resultatet, med tilgang til kilde- og lisensinformasjon; ikke skjul alt i en utilgjengelig hjelpeside. [Attribusjonsveiledning](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines).

### Anbefalt praktisk håndtering

- Vis ved ekte kart/liste: «Stasjons- og prisdata: Drivstoffpriser Norge · ODbL 1.0. Inneholder stasjonsdata fra © OpenStreetMap-bidragsytere.» Gjør kilden, ODbL og OSM klikkbare. Behold kartleverandørens eksisterende merknader.
- Egen «Datakilder og lisenser»-side viser eksportadresse, eksporttid, hentetid, betydningen av prisens tidspunkt, endringer vi har gjort og nedlastingslenke til relevant åpent datagrunnlag/endringsmateriale.
- Dersom vi distribuerer normalisert JSON, legg kilde, lisenslenke og transformasjonsversjon i filen og dokumentasjonen. Planlegg et gratis maskinlesbart tilbud, ikke bare en appvisning. Dette kan kreve en offentlig data-/transformasjonspublikasjon selv om app-repositoryet forblir privat.
- Fremtidige brukerbidrag trenger egne bidragsvilkår som tillater planlagt ODbL-deling. Identifiserende brukerdata skal ikke bli del av et offentlig prisdatasett.

### Avklaringer før kommersiell lansering

Juridisk gjennomgang bør klassifisere vår normaliserte/sammenslåtte database, kontrollere at nedlastingstilbudet og attribusjonen oppfyller vilkårene, og avklare kombinasjon med brukerbidrag og eventuelle andre datakilder. Rettigheter i individuelle innholdselementer kan være separate fra databaseretten; ODbL alene klarerer ikke varemerker, bilder eller personopplysninger. [ODC FAQ om database og innhold](https://opendatacommons.org/faq/licenses/). Be kildeeier forklare lisensgrunnlaget for ikke-OSM-stasjoner og eventuelle separate innholdsrettigheter. Ikke kopier kjedelogoer eller prosjektets grafikk som del av importen.

## 6. Arkitekturalternativer

| Tema | A: direkte JSON + lokal cache | B: normaliseringsjobb + publisert JSON | C: Supabase/PostgreSQL + synk |
| --- | --- | --- | --- |
| Kompleksitet | Lav: to GET, validator, join, cache | Middels: jobb, publisering, versjonering, klientcache | Høy: skjema, synk, API/RLS, drift og migrasjoner |
| Løpende kostnad | Ingen egen serverkostnad; brukernes datatrafikk og belastning på kilde | Kan passe gratisnivå i pilot; CI, lagring og trafikk avhenger av valgt vert | Gratisnivå for pilot; produksjon kan kreve betalt plan |
| Ytelse nå | Under 0,5 MB rådata; ca. 1 900 stasjoner er lite | Mindre payload og én konsistent fil, men begrenset gevinst nå | Effektive geografiske spørringer; nettverksrundtur og mer kode |
| Skalering | Kildetrafikk øker med brukere | To kildehentinger per jobb; distribusjon skaleres separat | God for mange skrivinger og historikk; DB/egress må dimensjoneres |
| Vedlikehold | Skjemaendringer kan kreve appoppdatering | Adapter kan rettes sentralt; jobbfeil må overvåkes | Flere feilflater, tilgangskontroll, backup, overvåking |
| Datakvalitet | Samme mangler som kilden; valider lokalt | Sentral kontroll/karantene, men skaper ikke ferske priser | Kan lagre historikk; skaper heller ikke ferske priser |
| Lisens | Cache og normalisering må vurderes; attribusjon | Offentlig avledet datasett krever tydelig lisens og tilgjengelighet | Samme datalisens gjelder; DB er ingen vei utenom share-alike |
| Egne rapporter senere | Ikke egnet til skriving; trenger senere API | Fortsatt leseløsning; separat mottak nødvendig | Godt egnet, men krever autentisering/moderering/sikkerhet senere |

Supabase oppgir ved undersøkelsen Free: 500 MB database og 5 GB egress, pause etter én ukes inaktivitet; Pro fra USD 25/måned. Dette er ikke et pristilbud eller totalbudsjett. [Supabase-priser](https://supabase.com/pricing). GitHub Actions inkluderer gratisbruk av standard runners for offentlige repositories og plankvoter for private; et privat app-repository har ikke ubegrenset gratis kjøring. [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions). GitHub Pages har uttrykkelige begrensninger for gratis hosting av nettvirksomhet/kommersiell SaaS; ikke velg det ukritisk som permanent kommersiell data-backend. [Pages-begrensninger](https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/github-pages-limits).

For A, som størrelsesillustrasjon uten komprimering/304: to nedlastinger daglig × 458 444 byte ≈ 0,92 MB per bruker/dag. 10 000 daglige brukere gir omtrent 9,17 GB/dag på kilden. Dette er en modell, ikke en trafikkprognose. Avklar akseptabel bruk og innfør cache før lansering. B kan redusere kildebelastningen sterkt, men apptrafikken til den nye verten forsvinner ikke.

### Anbefalt flyt i A

`Offentlige JSON-filer → validering → normalisering/join → atomisk lokal snapshot-cache → eksisterende nærhetsfilter → kart og liste`

Last cache først. Kontroller kilde tidligst etter foreslått 12 timers intervall mens appen er aktiv; manuell oppfrisking får rimelig begrensning. Ikke bygg bakgrunnsjobb på telefonen. Behold siste gyldige snapshot ved nettverks-/skjemafeil og vis at data ikke kunne oppfriskes. Sett en størrelsesgrense før parsing og bruk timeout/avbrudd. Skriv nytt snapshot først etter at begge filer er validert som samme eksport; ikke overskriv god cache med HTML-feilside eller delvis resultat. Ingen GPS-koordinater behøver sendes til datakilden.

Ved senere valg av B: bruk samme appvendte snapshotmodell, publiser atomisk med skjemaversjon, bevar original eksporttid og kilde-ID-er, og stopp publisering ved schema-/dekningstap. Velg driftsleverandør først etter egen vurdering. Ingen tjeneste opprettes nå.

## 7. Tre forskjellige klokker – og en fjerde kontrolltid

| Begrep | Hva vi vet / skal lagre |
| --- | --- |
| Kildens eksporttid | `sourceExportedAt` fra `exportedAt`; når eksportskriptet laget snapshotet |
| Faktisk publiseringstid | `sourcePublishedAt` kan være null. HTTP Last-Modified/Pages-deploy er bare et distribusjonssignal, ikke en dokumentert eksakt publiseringstid |
| Vår hentetid | `fetchedAt`, UTC når vi mottok og validerte nytt innhold; aldri en erstatning for prisdato |
| Sist kontrollert | `checkedAt`, også ved 304; 304 gir ikke nye prisobservasjoner |
| Prisens registrering | Bevar rå `updatedAt`; tidssone og registreringssemantikk må avklares før normalisering |
| Prisens faktiske observasjon | `observedAt` bare når kilden faktisk dokumenterer dette; ellers null |

Eksporten gir ingen sikker separat observasjonstid. Tilfeldig appstart, ny cachefil eller ny eksport skal aldri overskrive `observedAt`/prisens kildetid. UI kan si «Kilden registrerte pris …» når bare registreringstid er kjent, og «Observasjonstid ukjent» ved manglende bevis. Ikke vis «Oppdatert for 2 minutter siden» på priskortet fordi en import nettopp ble kjørt.

## 8. Foreslått datamodell – ikke implementert

Dagens `Station` har `Record<'petrol' | 'diesel', number>` og ett `updatedAt` per stasjon. Det forutsetter at begge prisene finnes og er like ferske; dette holder ikke for eksporten. Flytt tidspunkt og kilde inn i prisoppføringen, behold koordinattypen og en enkel stasjonsliste. Utkast:

```ts
type FuelType = 'petrol95' | 'petrol98' | 'diesel';
type PriceFlag = 'unverified' | 'estimated' | 'suspect';

type PriceQuote = Readonly<{
  amountOrePerLiter: number; // Positivt heltall; NOK/liter må bekreftes
  sourceId: string; // f.eks. drivstoffpriser eller senere egen rapportkilde
  sourceRecordId: string | null;
  sourceUpdatedAtRaw: string | null;
  reportedAt: string | null; // ISO UTC først når tidssonen er avklart
  observedAt: string | null; // Ikke fyll fra reportedAt uten dokumentert grunnlag
  reportCount: number | null;
  flags: readonly PriceFlag[];
}>;

type Station = Readonly<{
  id: string; // namespace + opak kilde-ID
  sourceId: string;
  sourceStationId: string;
  name: string;
  brand?: string;
  address?: string;
  city?: string;
  coordinates: Coordinates;
  prices: Readonly<Partial<Record<FuelType, PriceQuote>>>;
}>;

type StationSnapshot = Readonly<{
  schemaVersion: 1;
  mode: 'live' | 'demo';
  sourceExportedAt: string | null;
  sourcePublishedAt: string | null;
  fetchedAt: string;
  checkedAt: string;
  stations: readonly Station[];
}>;
```

En liten kildekatalog kan holde navn, URL, lisens og attribusjon per `sourceId`, fremfor å gjenta lange tekster i hver pris. Ukjent pris er en **fraværende oppføring**, ikke 0, NaN eller estimert kjedepris. Alle eksternpriser starter som `unverified`; reportCount er metadata, ikke et tillitspoeng. «Gammel» beregnes fra klokke/tidspunkt og lagres ikke som permanent flagg. Nytt drivstoff legges til eksplisitt; ukjente kildeverdier utelates med diagnostikkteller, ikke feiltolkes som diesel.

Som første policyforslag: velg de inntil ti nærmeste stasjonene uavhengig av om de har pris. Prisranger bare oppføringer med brukbart tidspunkt og pris innen godkjent friskhetsgrense; vis eldre/ukjente priser som siste registrerte pris i en separat gruppe, sortert etter avstand. Behold stasjoner uten pris med «Pris ukjent». Kart og liste får samme utvalg. Åpne spørsmål: produktgrense for prisrangering (foreslått 24 timer), og om brukeren skal kunne velge å se historiske priser. Med dagens eksport vil ingen pris kvalifisere som aktuell. Ikke gi en gammel lav pris merkelappen «billigst».

Egne rapporter senere kan bruke samme PriceQuote-proveniens. Konflikthåndtering mellom flere observasjoner krever en separat observasjonsliste/API først når skrivefunksjonen faktisk bygges. Ikke legg til bruker-ID, rapporteringsskjema, database eller modereringssystem i 4B.

## 9. Konkret implementeringsplan for milepæl 4B

Planen aktiveres først etter produkteiers godkjenning av dette dokumentet. Bruk ny milepælbranch fra oppdatert main, ikke bland implementasjonen inn i research-PR-en.

| Steg | Filer som foreslås opprettet/endret | Leveranse og kontroll |
| --- | --- | --- |
| 0. Avklar kilde og pilotmål | `docs/PRISDATA-ARKITEKTUR.md` | Avklar eksport etter backendmigrasjon, tidssone, enhet, ID-stabilitet, observert kontra rapportert tid og lisensgrunnlag. Velg aktuell pris-pilot eller bare stasjonsoversikt |
| 1. Modell og eksisterende demo | `src/types/station.ts`, flytt fiktive data til `src/data/demo-stations.ts`, `src/data/sources.ts`, eksisterende tester | Separate priser/tider/kilder, eksplisitt bensin95, optional priser. Demo skal fungere før nettverk tilføyes |
| 2. Ren adapter | `src/lib/fuel-data.ts`, `tests/fuel-data.test.ts`, `tests/fixtures/` | Valider unknown-JSON, typer, count, koordinater, ID-er, prispar, tidsfelt, ukjente drivstoff. Join uten å miste stasjoner uten pris. Egne syntetiske fixtures; ikke GPL-kode |
| 3. Henting og cache | `src/services/fuel-data.ts`, `src/services/fuel-cache.ts`, `src/hooks/use-stations.ts`, tester | Native fetch, timeout, ETag om verifisert, samme eksportversjon, stale-cache ved feil, atomisk oppdatering, ingen GPS i forespørselen |
| 4. Utvalg og prisstatus | `src/lib/stations.ts`, `src/lib/format.ts`, tilhørende tester | Nærmeste utvalg separat fra prisens tilgjengelighet; ingen ferskhet fra fetchedAt; sikre sortering ved ukjent/gammel pris |
| 5. UI og kildevisning | `src/app/index.tsx`, `src/components/station-card.tsx`, `station-map.tsx`, `fuel-selector.tsx`, ev. `src/app/data-sources.tsx` | Live/demo eksplisitt, samme kart-/listeutvalg, attribusjon, oppfriskingsstatus, manglende pris og gammel pris uten misvisende rangering |
| 6. Kontroll og pilot | `README.md`, `docs/TESTING.md`, `docs/PRISDATA-ARKITEKTUR.md` | Mål payload, nedlastingstid, parsing/minne og UI på fysisk iPhone/Android. PR med testbevis, ingen automatisk merge |

**Avhengigheter:** innebygd fetch og dagens Node-testverktøy er nok for henting/tester. Foreslå `expo-file-system` i Expo-kompatibel versjon for en lokal snapshotfil i dokumentområdet, med midlertidig fil og erstattingsstrategi. Verifiser filoperasjonenes garantier og feilgjenoppretting før valg. Ingen Axios, React Query, Supabase, global state eller database trengs for dette omfanget. Validator kan være en liten håndskrevet TypeScript-funksjon; installer ikke skjemaavhengighet uten konkret behov.

### Tester og godkjenningskriterier

- Adapter: manglende/ukjent pris, flere drivstoff, null/tomt navn, ekstra felter, ugyldige koordinater, duplikat-ID/par, orphan-priser, feil valuta/enhet, forskjellig count og ulik export-versjon. Ved motstridende duplikatpris uten sikker tid: karantene/ukjent, aldri tilfeldig siste arrayelement.
- Tid: tidssonefri dato, mikrosekunder, null/umulig/fremtidig dato, sommertid, 24-timersgrense. Nedlasting av gammel pris på nytt endrer ikke prisalder. 304 endrer bare checkedAt.
- Nettverk/cache: 200/304/404/429/500, HTML i stedet for JSON, timeout, for stor fil, ugyldig cache og avbrutt skriving. Samme sist gyldige snapshot beholdes ved feil. Første oppstart uten nett gir forklaring og valgfri demo, ikke skjult demobytte.
- Utvalg: stasjoner uten priser forsvinner ikke; kvalifiserte priser rangeres deterministisk; kart og liste samsvarer; ingen «billigst»-påstand fra gammel/ukjent pris.
- UI: avslag på GPS, utenfor datadekning, kildeattribusjon med fungerende lenker, live kontra fiktiv demo, offline, stor tekst og stasjonsvalg på begge plattformer.
- Lint, strict typecheck, enhetstester, Expo Doctor og iOS-/Android-bundling. Kontroller lisens-/tilbudsløsningen før offentlig bruk av bearbeidet datasett.
- Før offentlig pris-pilot: dokumenter reelle priser innen valgt ferskhetsgrense i pilotområdet over flere eksporter. Avtal minste dekning med produkteier; én vellykket HTTP-nedlasting er ikke tilstrekkelig. Dagens snapshot stryker på friskhet uansett rimelig dekningsmål.

### Oslo-demo og rollback

Hold fiktive stasjoner i egen fil og modus, med egne ID-er. GPS-avslag kan fortsatt tilby eksplisitt Oslo-demo, men ekte Oslo-data og fiktive testdata må aldri blandes. Bruk separat cache/nøkkel for live-data; aldri skriv demo inn som fallback i live-snapshotet. I produksjon kan demo være en tydelig «Prøv med testdata»-funksjon; utviklere kan velge den direkte.

Legg en enkel lokal konfigurasjonsbryter for datakilde i 4B slik at pilot kan rulles tilbake med en appoppdatering uten å endre avstands-/kartlogikken. Ingen fjernstyrt kill-switch er tilgjengelig uten en egen tjeneste/oppdateringsløsning, og det må ikke loves øyeblikkelig rollback av installerte apper. Før merge kan branchen forkastes; etter merge kan integrasjonscommitene revertes og forrige appversjon bygges. Ikke slett fungerende cache ved midlertidig feil; ikke presenter den som fersk.

## 10. Åpne spørsmål og risikoer

1. **Blokkerer aktuell prislansering:** hvorfor stopper eksportens prisdatoer i mai, og følger Firestore-aggregatet fortsatt den operative prisdatabasen? Finnes ny offentlig eksport med ferske priser?
2. Hvilken tidssone har de offset-løse updatedAt-verdiene, og er de klienttid, servertid, registrering eller faktisk observasjon? Kan eksporten levere eksplisitt UTC og separate observedAt/reportedAt?
3. Kan NOK/liter, identifikatorstabilitet, drivstoffkoder, antallrapportens betydning og en versjonert skjemakontrakt bekreftes?
4. Hvor kommer de ikke-OSM-baserte stasjonene fra, hvilke rettigheter gjelder, og hvordan skilles lade-/bilvaskeanlegg fra drivstoffutsalg?
5. Hva er akseptabel polling/trafikk og forventet levetid for eksporten? Ingen SLA eller garantert 12-timers levering er funnet.
6. Juridisk: avledet database, bidragsvilkår, attribusjon og maskinlesbart tilgjengelighetstilbud må være avklart før kommersiell lansering.
7. Mange stasjoner uten pris og alle priser gamle betyr at mer infrastruktur alene ikke oppfyller produktmålet. Vurder alternativ åpen/avtalt kilde dersom eksporten ikke kan forbedres; ikke omgå autentisering eller innføre egen rapportering som skjult erstatning i 4B.

Ingen henvendelse er sendt til kildeeier i denne oppgaven. Ovenstående er forslag til avklaringer, ikke mottatte garantier.

## 11. Kontroll av research-leveransen

- Git: ren arbeidsmappe før oppstart; main fast-forwardet til merge av PR #1; ny branch opprettet før dokumentendringer.
- Etterprøvbarhet: HTTP-responser, begge komplette JSON-filer, SHA-256 mot fast commit, felt-/radkontroller, geografiske radiusberegninger og sammenligning med eldre snapshot.
- Bare Markdown-dokumentasjon sjekkes inn; ingen appkode, eksportfiler, GPL-kode, nye avhengigheter eller tjenester.
- Relevante sluttkontroller: Markdown-/lenkestruktur, kildekontroll, Git diff --check og verifisering av at diffen kun inneholder dokumentasjon. Mobilbundling/Expo Doctor trengs ikke på nytt for en ren dokumentendring; resultatene fra milepæl 3 videreføres ikke som en ny testkjøring.

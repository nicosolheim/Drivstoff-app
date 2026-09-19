# Prosjektregler

## Mål og avgrensning
- Bygg en enkel norsk mobilapp med React Native, Expo, Expo Router og streng TypeScript.
- MVP: lokasjon med samtykke, kart, lokale eksempelstasjoner, bensin/diesel, nærhet og prisrangering med prisalder.
- Ikke legg til backend, Supabase, innlogging, OCR, varslinger eller prisprognoser.
- Ikke bygg forbruk, rabatter, ruteplanlegging eller totaløkonomisk rangering før dette er avtalt.

## Implementering
- Velg enkleste løsning som dekker behovet. Bruk lokal React-state, ikke et globalt state-bibliotek.
- Hold skjermene i src/app, UI i src/components, lokasjonslogikk i src/hooks og rene beregninger i src/lib.
- Bruk eksplisitte domenetyper i src/types og lokale eksempeldata i src/data.
- TypeScript skal bruke strict. Unngå any og ikke skjul typefeil med ts-ignore.
- Installer bare nødvendige avhengigheter. Velg Expo-kompatible versjoner og sjekk inn én lockfil.
- All brukerrettet tekst skal være på norsk. Merk eksempeldata synlig som fiktive.
- Avstand er luftlinje i MVP, ikke kjørelengde eller omvei. Ikke presenter laveste literpris som garantert laveste totalkostnad.
- Prisoppdateringer skal ha faste ISO-tidsstempler med tidssone; ikke frisk opp gamle data ved appstart.
- Håndter avvist tillatelse, avslått lokasjon, lasting, feil og manglende nærliggende stasjoner.
- Be bare om lokasjon mens appen brukes. Ikke lagre eller send posisjonen til egen backend.

## Sikkerhet og Git
- Fra milepæl 3: én branch per milepæl fra oppdatert main. Bruk små, forståelige commits, push branchen og opprett PR mot main når autentisering tillater det. Ikke merge uten produkteiers godkjenning.
- Ingen secrets, tokens, API-nøkler eller private miljøfiler i repositoryet.
- Inspiser eksisterende repository og historikk før oppsett. Ikke overskriv brukerarbeid eller force-push.
- Gjør små commits ved fungerende milepæler og push dem til nicosolheim/drivstoff-app når tilgangen fungerer.
- Ikke finn på Git-identitet. Be om navn og e-post hvis dette mangler ved første commit.

## Kvalitet og kommunikasjon
- Forklar viktige valg kort og forståelig til produkteier.
- Kjør lint, typecheck og relevante tester etter kodeendringer. Test særlig avstand, utvalg, prisrangering og prisalder.
- Verifiser Expo-avhengigheter og at iOS- og Android-bundler kan bygges.
- Manuell mobiltest skal dekke begge plattformer, lokasjon tillatt/avvist, drivstoffbytte og samsvar mellom kart og liste.
- Ikke påstå at appen er testet på enhet når bare statiske kontroller eller bundling er kjørt.
- Dokumenter utførte kontroller, gjenstående arbeid og konkrete blokkeringer.

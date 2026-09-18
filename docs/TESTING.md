# Teststatus – grunnapp

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
| Fysisk iPhone / Android | Ikke utført |

Bundling er ikke en installasjon eller kjøring av den native appen. Sandbox nektet første forsøk på å kjøre Hermes; eksporten ble deretter kjørt med utvidet tilgang og bestod. Utviklingsserveren brukte innebygd reserveversjon av React Native DevTools fordi sandkassen ikke kunne skrive til DevTools-cachen.

## Manuell kontroll før milepælen regnes som enhetstestet

1. Start med `pnpm start` og åpne QR-koden i Expo Go for SDK 57.
2. Kontroller på både iOS og Android at «Et smartere sted å fylle.» og «Grunnappen er på plass» vises uten feilmelding.
3. Kontroller at skjermen ikke overlapper statuslinjen og at innhold kan rulles ved stor systemtekst.
4. Last appen på nytt og kontroller at den starter igjen uten feil.

Loggfør plattform, telefonmodell, Expo Go-versjon og resultat når dette er utført. Enhetstester legges til med beregningslogikken i neste milepæl.

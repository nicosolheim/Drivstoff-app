# Fremtidige prisdata

Primær strategi er automatisk innhenting fra eksterne åpne datakilder. Drivstoffpriser Norge er første kilde som skal undersøkes. Tilgjengelighet, tilgangsvilkår, lisens, identifikatorer og oppdateringsfrekvens er ikke verifisert her. Egen brukerrapportering kan senere supplere eksterne data.

Milepæl 3 integrerer ingen eksterne prisdata. Dagens lokale stasjoner har to tallpriser og ett felles tidspunkt fordi begge eksempelprisene er fra samme fiktive observasjon.

Ved første integrasjon bør hver drivstoffpris bli en egen prisoppføring med `amount`, `updatedAt`, `source` og en eksplisitt kvalitetsstatus, for eksempel `unverified`. Manglende pris bør representeres som manglende oppføring, aldri som null kroner. Ukjent tidspunkt skal ikke fremstilles som ferskt. Utdatert pris beregnes fra tidspunktet og nåværende klokke, og er forskjellig fra kildens usikkerhet. Kildeoppdatering og tidspunktet appen hentet dataene må holdes atskilt.

Denne endringen utsettes til vi kjenner kildens format. Ingen ekstra datalag eller backend innføres nå.

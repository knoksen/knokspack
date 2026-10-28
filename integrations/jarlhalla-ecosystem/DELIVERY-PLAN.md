# Jarlhalla – samlet gjennomføring

Arbeidsgrunnlag: 28.10.2026. Dette er implementering og arbeidsrekkefølge,
ikke erklæring om at økosystemet er ferdig integrert eller produksjonsklart.

## Verifisert utgangspunkt

| Kilde | Observasjon | Hva den beviser |
| --- | --- | --- |
| WordPress nettstedshelse, innlogget nettleser | 1 278 autoload-innstillinger / 845 KB; EDD uten gateway; speedycache_generate_ccss feilet | Aktuelle rapporterte driftsavvik, ikke rotårsak |
| WordPress Inquiries | 0 saker; eksisterende posttype jh_inquiry | Et register finnes; ingen form- eller leveransetest |
| /ecosystem/, direkte nettleserlesing | SustainArc, MykoKnoks, TBT, SamfunnsBro og medlemskap har lenker | Dagens navigasjonsmål, ikke full funksjonstest av målene |
| JARLHALLA GROUP i Notion | Eksisterende portefølje, oppgaver og redaksjon | Gjenbruk eksisterende hovedregistre |
| Integrasjonsplan, Notion | Arkitektur- og CI-arbeid pågår allerede | Ikke dupliser PR #48–#51 eller påstå at historiske tester er nye |
| Knokspack main ce004de36be0159c765c3e5b9e53d3ebf86fc84c | Lokal klone og kildeinspeksjon | Baserevisjon for isolert utvidelse |

Kilder:
- https://jarlhalla.com/ecosystem/
- https://app.notion.com/p/d18fe29092ad8272a76f81c1298aab1f
- https://app.notion.com/p/3f0fe29092ad815bbe1edef5a1927cef
- https://app.notion.com/p/406fe29092ad81f79938cc2e8a3e9dd1
- https://app.notion.com/p/26f414dbf092409bbe1cf02f11e093a6

## Funksjonskart og akseptanse

| Spor | Felles arbeidsflyt | Neste konkrete leveranse | Avhengighet / ansvar |
| --- | --- | --- | --- |
| Taksdal BT / ArchEng | Forespørsel → faglig avklaring → tilbud → prosjekt → kontrollert levering | Eksisterende skjema testet mot saksflyt; deretter ArchEng-lenke i fagkontekst | Eksisterende innsendingskode; fagansvarlig ikke avklart |
| SustainArc / Terratek / Njord / ARC | Behov → kilder → vurdering → dokumentert anbefaling | Kilde-/påstandsregister og avgrenset demo | Verifisert app og faglig kontroll |
| AI / Knokspack / JHLGI | Oppgave → rolle → kjøring → kontroll → sporbar oppfølging | Autentisert lesekobling til eksisterende Command Center | Identitet, kontrakt og ferske driftsbevis |
| Kunst / Nexium / Draug | Brief → konsept → tilbakemelding → leveranse | Verifisert porteføljeinngang og bestillingsbrief | Rettigheter og leveranseansvar |
| Natur / MykoKnoks / BioBuild | Spørsmål → kilder → analyse → kontroll → publisering | Kildebasert prosjektvisning med status | Originaldata og publiseringstilgang |
| SamfunnsBro | Behov → egnet tilbud → kontakt → aktivitet → oppfølging | Testet forespørsel og manuell fordeling | Kontakt-/oppfølgingsansvar; ingen automatisk personmatching |
| Læring / medlemskap | Konto → rettighet → kurs → fremdrift → støtte | Testkonto og rettighetsmatrise | LMS/medlemsutvidelse; betalt nivå avklares |
| RoomZero / Eir / JHLgame | Merket demo → tilbakemelding → utvikling → testet versjon | Isolert demo med eksplisitt status | Runtime/sikkerhet/ytelse og appansvar |
| Publisering / podkast | Idé → utkast → fagkontroll → publisering → måling | Eksisterende redaksjonskø koblet til kilde og fagområde | Notion redaksjon / WordPress; Castos RSS 404 |

## Rekkefølge

1. Kontroller og test gjenoppretting før endringer i produksjon.
2. Bekreft HTTPS/tema mot faktiske innstillinger og logger; AI-panelets råd er ikke bevis.
3. Finn rotårsak for SpeedyCache-jobben; kontroller cron og regenerering i staging.
4. Kartlegg de største autoload-verdiene og eierskap før eventuell justering.
5. Kontroller spam/moderering, RSS og fersk samtykkeatferd. Historiske rettinger skal ikke rulles tilbake.
6. Installer denne isolerte modulen i staging og test originalt kontaktskjema ende til ende.
7. Avklar administratorer som saksansvarlige, faktisk responstid og varslingskanal.
8. Koble hver sak til eksisterende Notion-oppgave; automatisk overføring er separat adapterarbeid.
9. Verifiser appenes autentisering, deploy-ruter og oppdaterte sikkerhets-/CI-funn før tilkobling.
10. Gjør godkjente, additive endringer på eksisterende sider; kontroller alle gamle ruter.
11. Test medlemskap, kurs og eventuell betaling med riktig leverandør og testmiljø.
12. Gjennomfør samlet akseptanse, dokumenter eksakt revisjon, utrulling og tilbakeføring.

## Datagrenser

WordPress eier offentlig innhold og henvendelser; Notion eier hovedoppgaver,
prosjekter og beslutninger; GitHub eier kode og CI; originalmodellene eier BIM.
Felles identitet må kartlegges før SSO. Ingen kopiering av passord eller nøkler.
Ingen privat prosjektinformasjon legges i offentlig økosystemregister.

## Gjenstående arbeid og blokkeringer

Alle funksjoner utover den lokale køen/directory må ha separat ende-til-ende-bevis.
Mail, automatisk Notion-synk, innsendingsduplikater, faktiske appkall, betaling,
restore, mobilvisuell kontroll og produksjonsutrulling er ikke ferdige her.
Ingen ansvarlige eller tidsfrister er funnet på. Bruk eksisterende Notion-oppgaver
og avklar manglende eierskap før frister behandles som forpliktelser.

Nettleseren ble blokkert av et annet utvidelsesvindu i Edge under videre
backup-kontroll. Produksjonstilstand er derfor ikke endret eller sluttverifisert.
Automatisk godkjenningskontroll avviste GitHub-push fordi ekstern kodepublisering
ikke var eksplisitt autorisert. Ingen alternativ publiseringsvei brukes.

-- Migration: podcast_seed_hot_topics
-- Version: 20260421172557
-- Dumped via MCP Supabase on 2026-04-23

-- Seed temi caldi §8
insert into podcast_hot_topics (title, body, intensity, suggested_questions) values
('Transizione STG → mercato libero (31 marzo 2027)',
 'Il tema che ossessiona il settore. A marzo 2027 circa 3 milioni di clienti (gli ex-MT passati in STG nel 2024) lasceranno il regime protetto e finiranno nel mercato libero dell''aggiudicatario STG alla sua offerta più favorevole. La partita su chi vince quei clienti sta iniziando ora.',
 'bollente',
 array[
   'Come state usando i 24 mesi di STG per costruire il rapporto con il cliente che erediterete (o perderete)?',
   'Gli aggiudicatari STG stanno già promuovendo attivamente altri prodotti?',
   'State vedendo i clienti STG che sono in portafoglio dei concorrenti? Li state targettizzando?'
 ]),
('Aste STG — chi ha vinto troppo aggressivo',
 'Alcuni parametri β vinti nel 2024 sono stati molto aggressivi. Il settore sospetta che alcuni aggiudicatari stiano gestendo forniture in perdita, auspicando di monetizzare il cliente a tutele finite.',
 'bollente',
 array[
   'I parametri vincenti nella vostra zona — li ritenete sostenibili?',
   'La regola del cherry picking sta funzionando? Gli aggiudicatari stanno facendo up-selling ai clienti STG?'
 ]),
('Concentrazione di mercato e M&A',
 'Il numero di venditori scende, i primi 10 accrescono la quota. Private equity internazionali (KKR, Macquarie, F2i) hanno fatto shopping negli ultimi 36 mesi. Le valutazioni sono alte.',
 'bollente',
 array[
   'Voi avete ricevuto approcci? O siete voi che state cercando acquisizioni?',
   'Le valutazioni EV/cliente che si vedono oggi sono sostenibili sui numeri reali?',
   'Il middle market (20-200mila clienti) sta sparendo — è la polarizzazione che vi preoccupa?'
 ]),
('Nuova bolletta dal 1° luglio 2025',
 'Frontespizio unificato, sezione trasparenza separata, logica di sintesi prima del dettaglio. Impatto operativo e IT significativo.',
 'bollente',
 array[
   'Come è andata l''implementazione? Picchi di complaint?',
   'Riuscite a usare la nuova struttura come opportunità (es. sezione informativa strutturata) o è solo onere?'
 ]),
('AI come leva di margine (non buzzword)',
 'Il settore sta passando dalla fase proviamo qualche LLM sul customer service alla fase dove mette realmente valore sul P&L. Le prime implementazioni serie sono su credit management, pricing dinamico, automazione back-office.',
 'bollente',
 array[
   'Il vostro primo AI use case in produzione — cosa ha insegnato?',
   'Quanto avete risparmiato (ore FTE, € di bad debt evitato, % di contatti contenuti nel primo livello)?',
   'Quale case d''uso considerate il prossimo obbligato?'
 ]),
('Recupero crediti post-bollette gonfie',
 'Le bollette 2022 sono state pagate (o non pagate) tardi. Molti reseller hanno grandi crediti in contenzioso. La tecnologia di recupero (scoring predittivo, debt collection con AI) sta diventando un tema.',
 'bollente',
 array[
   'Lo stock di crediti dubbi dal 2022-2023 — è smaltito o ancora presente?',
   'Avete cambiato partner/approccio al recupero negli ultimi 24 mesi?'
 ]),
('Comunità Energetiche Rinnovabili (CER)',
 'Il decreto attuativo del 2024, GSE come gestore, incentivi sul punto di scambio. I reseller stanno capendo se è una minaccia (perdono i consumi interni alla CER) o opportunità (servizi gestiti a CER).',
 'bollente',
 array[
   'State offrendo servizi CER? Che modello di pricing?',
   'Le vostre perdite nette (clienti che passano a CER e non consumano più sul vostro contratto) sono significative?'
 ]),
('Telemarketing e teleselling',
 'Il CCC 395/2024 ha messo responsabilità anche sulle reti terze. ARERA e AGCM collaborano. Il settore è diviso: chi ancora fa telemarketing aggressivo e chi si sta spostando su canali digitali.',
 'medio',
 array[]::text[]),
('Unbundling marchio e personale commerciale',
 'Per gli operatori integrati (distributore + venditore), le regole di separazione sono sempre più strette. Alcune multiutility stanno ristrutturando.',
 'medio',
 array[]::text[]),
('Salvaguardia 2.0',
 'Nuova disciplina post-DM 23 luglio 2024. Meno attrattiva economicamente, più meccanismi di tutela per i venditori.',
 'medio',
 array[]::text[]),
('Digitalizzazione contatori gas',
 'Il parco contatori gas è in ritardo sullo smart metering rispetto all''elettrico. L''evoluzione impatta la frequenza di fatturazione, l''indennizzo automatico TIVG, e i modelli di billing.',
 'medio',
 array[]::text[]),
('Fatturazione elettronica B2B e SdI',
 'Interazione tra fatturazione SdI e SII, gestione delle note di credito, contenziosi IVA con l''Agenzia delle Entrate.',
 'medio',
 array[]::text[]),
('Peso fiscale e oneri di sistema',
 'Gli oneri di sistema restano la maggior voce non-commodity in bolletta. Il dibattito su chi li paghi (solo elettrici vs fiscalità generale) continua.',
 'medio',
 array[]::text[]),
('Retail fisico vs digitale',
 'I negozi fisici chiudono. Il canale digitale richiede capabilities nuove. Molti reseller medi non hanno capacità.',
 'medio',
 array[]::text[]),
('Riforma dispacciamento (TIDE)',
 'Tecnica, affascinante per addetti ai lavori, ma rischia di non essere interessante per l''ascoltatore medio.',
 'freddo',
 array[]::text[]),
('Gas diverso da metano (GPL canalizzato)',
 'Settore residuale.',
 'freddo',
 array[]::text[]),
('Tariffe idriche (Servizio Idrico Integrato)',
 'Fuori scope del podcast (anche se ARERA lo regola).',
 'freddo',
 array[]::text[])
on conflict do nothing;;

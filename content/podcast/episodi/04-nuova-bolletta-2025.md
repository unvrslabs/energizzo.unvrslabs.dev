---
title: La bolletta che non ci lascia dormire. Dieci mesi dopo il 1° luglio 2025
subtitle: Frontespizio unificato, sezione trasparenza, QR code al Portale Offerte. Cosa ha rotto la delibera 315/2024 nelle nostre operation
intensity: bollente
numero: 4
ospite_ideale: COO di reseller o responsabile billing/IT con ownership end-to-end del ciclo fattura
durata_target: 20 min
---

# La bolletta che non ci lascia dormire. Dieci mesi dopo il 1° luglio 2025

## Cosa devi sapere (primer)

La bolletta dell'energia in Italia è un documento fiscale ma anche un campo di battaglia regolatorio. Fino al 2025 ogni venditore di luce e gas la componeva come voleva, nei limiti di alcuni requisiti minimi imposti da **ARERA** (Autorità di Regolazione per Energia Reti e Ambiente): chi metteva la componente materia prima in evidenza, chi la nascondeva; chi scriveva "spesa per la materia energia" in 5 punti diversi, chi in uno. Risultato: il cliente domestico medio non riusciva a confrontare due bollette di venditori diversi se non ingaggiando un consulente. Per l'industria questa opacità era un vantaggio, perché rendeva lo switching difficile e rallentava la concorrenza.

Nel luglio 2024 ARERA ha pubblicato la **delibera 315/2024/R/com**, che ha riscritto la bolletta. Obbligatoria dal **1° luglio 2025** per tutti i 741 venditori elettrici attivi in Italia e per i loro equivalenti gas. Tre novità strutturali: (1) **frontespizio unificato** — una prima pagina identica tra venditori, con le stesse voci nello stesso ordine; (2) **sezione trasparenza** separata — componenti regolate, oneri e imposte raggruppate in modo distinto dalla parte venditore; (3) **QR code al Portale Offerte** — stampato in bolletta, inquadrato con lo smartphone porta il cliente sul portale pubblico di ARERA con il suo codice offerta **RCU** già pre-compilato, così vede in 5 minuti quanto spenderebbe con ogni altro venditore.

Il cambio non è solo grafico. Per un reseller significa toccare quasi ogni sistema informatico: il **billing engine** (che calcola gli importi), il **document composition** (che genera il PDF), il CRM (che pilota messaggi e segmentazione), i flussi di stampa e postalizzazione, l'app area clienti, gli script del call center. Chi ha IT interno ha speso mesi-uomo; chi dipende da vendor esterni ha aspettato le patch. Tutto questo è avvenuto dopo il go-live dello **STG** (il 1° luglio 2024 avevano appena assorbito 3,7 milioni di clienti ex Maggior Tutela da gestire in bollettazione) e prima del picco estivo di conguagli e reclami.

Sigle da tenere a mente: **RCU** (Riferimento Contratto Utente, codice di 32 caratteri unico per offerta — pensalo come "nome fiscale" dell'offerta che hai firmato, imposto dalla delibera 135/2022), **Portale Offerte** (il comparatore pubblico di ARERA, delibera 51/2018), **TIVG** (Testo Integrato Vendita Gas, regolamento ARERA per il gas), **TIV** (equivalente per l'elettrico), **CCC** (Codice di Condotta Commerciale, le regole marketing/comunicazione ARERA), **CSEA** (Cassa per i Servizi Energetici e Ambientali, la cassa pubblica che gestisce oneri e incentivi del sistema energetico), **CMOR** (Corrispettivo Morosità, meccanismo per gestire debiti lasciati dal cliente al venditore precedente), **AHT** (Average Handle Time, tempo medio di gestione chiamata nel customer care), **NPS** (Net Promoter Score, indicatore di soddisfazione cliente), **MT** (Maggior Tutela, il vecchio regime amministrato), **STG** (Servizio a Tutele Graduali, la fase ponte post-MT), **PLACET** (Prezzo Libero a Condizioni Equiparate di Tutela, offerta ML standardizzata), **SII** (Sistema Informativo Integrato gestito da Acquirente Unico).

L'urgenza: dopo 10 mesi di dati veri, si vede chi è riuscito a sopravvivere al go-live e chi ha usato la delibera come leva di ripensamento più profondo, e si capisce se il QR code sta davvero accelerando lo switching come temuto dagli incumbent.

## Perché questa puntata ora

Siamo ad aprile 2026. La nuova bolletta prevista dalla delibera 315/2024/R/com è live dal 1° luglio 2025: dieci mesi di dati veri, non più simulazioni. Per molti reseller l'impatto non è stato solo grafico. Frontespizio unificato, sezione trasparenza separata, QR code verso il Portale Offerte, codice offerta RCU in chiaro: ogni singolo elemento tocca billing engine, CRM, template PDF, flussi di stampa e dematerializzazione, sportello clienti. In mezzo c'è stata l'estate — la finestra dove si concentrano i conguagli sui consumi stimati — e poi l'onda di reclami di settembre-novembre. Oggi con il senno di poi possiamo dire cosa ha funzionato, cosa no, e quanto è costato davvero adeguarsi.

## Numeri da avere in tasca

- Delibera **315/2024/R/com** — nuova bolletta in vigore dal **1° luglio 2025**
- **92,6% dei volumi** elettrici e **78,2% dei POD** sul mercato libero (fine 2024) — il bacino su cui la nuova bolletta morde
- **3,7 milioni di clienti** passati da Maggior Tutela a STG il 1° luglio 2024: primo ciclo di bollettazione con regime nuovo in contesto già caldo
- **741 venditori elettrici attivi** nel 2024 — tutti devono adeguare template e sistemi
- **28,21 c€/kWh** MT vulnerabili vs **22,33 c€/kWh** STG domestici (gen 2025): il differenziale che il QR code rende confrontabile in 5 minuti
- **PUN medio Italia 2024: 108,5 €/MWh**. Componente energia media mercato libero domestico 2024: **237,18 €/MWh**
- **Switching rate 2024**: domestico elettrico ~19%, gas ~12%, PMI elettrico 25-30%
- **TIVG art. 13** — dematerializzazione tutela vulnerabili: CSEA copre fino all'80% del differenziale se ≥7% clienti vulnerabili con bolletta dematerializzata, 100% se ≥20%
- **CCC art. 13** — preavviso variazioni unilaterali: 3 mesi, indennizzo 30 € per mancato preavviso
- **TIVG art. 16** — sanzioni pecuniarie per mancate comunicazioni: da **3.000 €** (fino a 5.000 CE) a **27.000 €** (oltre 5 mln CE)
- **2024-2025**: picco complaint su fatture di conguaglio e comunicazioni post-fine tutela (ARERA)

## Argomenti collegati da ripassare

- [**Delibera 315/2024/R/com**: frontespizio unificato, sezione trasparenza, codice offerta RCU, QR code al Portale Offerte](/dashboard/podcast/knowledge/04-operativita-retail)
- [**Portale Offerte** (delibera 51/2018/R/com, codice RCU 32 caratteri da 135/2022): come stima la spesa annua, quali profili usa (1.500/2.200/2.700/3.200 kWh e 120/480/700/1.400/2.000/5.000 Smc)](/dashboard/podcast/knowledge/04-operativita-retail)
- [**CCC 395/2024/R/com** (1° gennaio 2025): scheda sintetica, preavvisi, obblighi informativi precontrattuali](/dashboard/podcast/knowledge/01-testi-integrati)
- [**TIVG art. 13** sulla dematerializzazione bolletta per tutela vulnerabili gas](/dashboard/podcast/knowledge/01-testi-integrati)
- [**TIV art. 21bis** adeguamento costi operativi esercenti MT](/dashboard/podcast/knowledge/01-testi-integrati)
- [**Fine MT 1° luglio 2024**: come si è sovrapposta a preparazione nuova bolletta](/dashboard/podcast/knowledge/03-timeline)
- [**TIMOE/TIMG**: il conguaglio problematico come trigger di morosità](/dashboard/podcast/knowledge/04-operativita-retail)
- [**Switching in 5 minuti post-QR**: impatto teorico su churn e retention](/dashboard/podcast/knowledge/04-operativita-retail)

## Apertura — presentazione e warm-up

**Come presentare l'ospite** (template speaker notes): "Oggi con noi [nome], [COO/Direttore IT/Responsabile Billing] di [azienda], reseller energia italiano con circa [N] clienti. [Azienda] nel 2025 ha portato a terra l'adeguamento alla delibera 315 su tutta la base clienti in [quanti mesi] e oggi può raccontarci cosa ha funzionato e cosa no. [Nome] è in [azienda] da [dato 2: anni, ruolo precedente, progetto distintivo]. Benvenuto, entriamo subito nel cuore operativo."

### Domande di riscaldamento

1. **Come sei entrato nel mondo del billing energia e quale è stata la tua prima bolletta?** — Apertura biografica leggera, mette subito l'ospite nel mood "operativo".
2. **Una bolletta ben fatta, secondo te, è più un documento fiscale o una lettera al cliente?** — Misura mindset (tech vs customer-centric), utile per calibrare il tono.
3. **Prima della 315, qual era il fastidio principale che sentivi dal cliente sulla bolletta?** — Rompe il ghiaccio sul tema senza ancora chiedere KPI.
4. **Ti ricordi la prima volta che hai visto il mock-up del nuovo frontespizio ARERA? Reazione?** — Aneddoto che apre naturalmente alla domanda 1 delle 15.

## Le 15 domande

---

### 1. Partiamo dal 1° luglio 2025: il giorno in cui è andata live la nuova bolletta. Come lo avete vissuto in azienda?

**Risposta attesa / talking points**

- Racconto operativo del go-live: preparazione negli ultimi 6-9 mesi, test sul ciclo di giugno, scelta se emettere subito tutte le bollette con il nuovo format o fare cut-off per ciclo di fatturazione
- Clima interno: chi ha guidato (IT, billing, compliance, legale), quanti team coinvolti, quante riunioni dedicate dalla pubblicazione della 315/2024 in poi
- Variante reseller grande con IT interno: sprint dedicato, ambiente di test, parallel run su subset clienti, monitoring H+0, H+24, H+72
- Variante reseller piccolo con vendor terzo: dipendenza dal roadmap del fornitore billing, patch ricevute a ridosso, test minimi, go-live più rischioso

**Argomenti collegati**
- Delibera 315/2024/R/com tempistiche pubblicazione → cosa è stato lasciato a ridosso
- 1° luglio 2024 fine MT → carico già alto dei billing team prima della 315
- Cultura DevOps retail: chi ha staging, chi no

---

### 2. Mettiamoci nei panni di chi ascolta. Quando arriva oggi la bolletta dei vostri clienti, cosa vede di diverso rispetto a un anno fa?

**Risposta attesa / talking points**

- Frontespizio unificato: il cliente trova le stesse voci chiave nello stesso ordine a prescindere dal venditore — tema "comparabilità"
- Sezione trasparenza separata: componenti regolate/oneri/imposte raggruppate, con chiara distinzione da componente venditore
- QR code prominente che porta al Portale Offerte con pre-compilato codice offerta RCU attuale
- Codice offerta RCU visibile: il cliente sa esattamente come si chiama l'offerta che ha
- Per il dematerializzato (mail/area clienti): QR funziona identico, a volte anche con link diretto

**Argomenti collegati**
- Portale Offerte: profili tipo e stima spesa annua
- Codice RCU 32 caratteri (delibera 135/2022)
- Bolletta dematerializzata: art. 13 TIVG

---

### 3. Prima di scendere nelle operation, una domanda strategica. Era giusto che ARERA imponesse questo tipo di standardizzazione?

**Risposta attesa / talking points**

- Posizione "a favore": il mercato libero aveva finalmente bisogno di un livello minimo di leggibilità, altrimenti la fine tutela non diventava mai una scelta informata
- Posizione "contro" o sfumata: la standardizzazione comprime la capacità del venditore di comunicare il proprio valore; tutti si assomigliano
- Terza via: la delibera è un'opportunità, il vero fattore differenziante ora è qualità assistenza, canali digitali, servizi accessori (cose che la bolletta non racconta)
- Collegamento con fine STG 2027: la standardizzazione è preparatoria a un mercato libero pieno

**Argomenti collegati**
- Qualità servizio come leva competitiva non confrontata dal Portale
- Fine STG 31 marzo 2027
- 92,6% volumi elettrici già mercato libero

---

### 4. Veniamo al tema più tecnico. Quanti mesi-uomo avete dedicato all'adeguamento IT e con quale timeline rispetto al 1° luglio 2025?

**Risposta attesa / talking points**

- Reseller grande con IT interno: 6-12 mesi di lavoro complessivo tra analisi, sviluppo, test; team dedicato billing + CRM + document composition + stampa; parallel tra dev e fornitore stampa/postalizzazione
- Mesi-uomo stimati: dai 20-30 a 80-100 in base a numero di brand/PLACET/prodotti e integrazioni (stampa, PEC, area clienti, WhatsApp)
- Reseller piccolo con vendor terzo: forchetta di costo chiusa in una fee di licenza aggiornata, con consulenza di customizzazione separata; zero controllo su tempistiche rilascio
- Cose sottovalutate: i **test** (centinaia di varianti di bolletta — elettrico/gas, unica/separata, monoraria/trioraria, tutela/libero, clienti con rate, voltura, conguaglio, domiciliazione)
- Il rischio principale: bollette che passano i test sintetici ma rompono su edge case reali (cliente con più POD, cliente con CMOR, cliente con cessione credito in corso)

**Argomenti collegati**
- Document composition engine: chi ha Thunderhead/OpenText vs soluzioni custom
- Parallel run e A/B di emissione
- Dipendenza dai vendor di postalizzazione

---

### 5. Arriviamo a settembre-novembre 2025. ARERA e associazioni consumatori hanno segnalato un picco di reclami. Che ne dite dal vostro osservatorio?

**Risposta attesa / talking points**

- Conferma dei picchi: reclami concentrati su leggibilità componenti, confronto importo vs bolletta precedente, posizionamento del QR code, bollette ricevute con template "ibrido" nelle prime settimane
- Composizione reclami: ~30-40% su lettura/comprensione, ~20-30% su conguagli post-estate, resto su QR non funzionante, codice offerta "sparito"
- Variante reseller grande: struttura complaint management (CRM dedicato, KPI tempi di risposta 40 gg normativi), capacità di individuare il reclamo-tipo e fare patch template
- Variante reseller piccolo: sportello ingolfato, reclami gestiti manualmente, rischio superamento 40 gg → indennizzo automatico
- Lesson learned: chi aveva una FAQ preparata sul nuovo frontespizio ha dimezzato i tempi di risposta

**Argomenti collegati**
- Indennizzi automatici per ritardo risposta reclami
- TIVG art. 16 sanzioni pecuniarie per mancate comunicazioni
- CCC 395/2024 obblighi informativi

---

### 6. Il frontespizio unificato ha margini di "spazio" per il venditore. Come lo state usando?

**Risposta attesa / talking points**

- Spazio bolletta come canale media diretto: non più solo veicolo fiscale ma touchpoint a costo marginale zero
- Usi intelligenti: messaggio sul servizio clienti (app, WhatsApp, area utente), cross-sell energia-gas, avvisi di cambiamento prezzo con preavviso CCC 13.1 (3 mesi), promemoria rinnovi
- Usi sbagliati: banner generici brand, messaggi non rilevanti per il segmento, overloading visivo che confonde
- Segmentazione per bolletta: dare contenuti diversi a clienti STG vs mercato libero vs vulnerabili
- KPI da tracciare: call-to-action click, call deflection, activation app post-messaggio

**Argomenti collegati**
- Preavvisi CCC art. 13 (variazioni unilaterali 3 mesi, evoluzioni 2 mesi)
- Segmentazione CRM e document composition dinamica
- Call deflection e costo contatto

---

### 7. Il QR code al Portale Offerte: è una minaccia o un'opportunità?

**Risposta attesa / talking points**

- Minaccia: abbatte la barriera al confronto; il cliente fa switching in 5 minuti, non più in 50; lo switching rate domestico elettrico 2024 era ~19%, con QR è realistico vederlo crescere
- Opportunità: se il venditore è competitivo su una delle fasce del Portale, il QR è marketing gratis; chi è in top 5 su 2-3 profili tipo riceve traffico qualificato
- Realtà osservata dopo 10 mesi: impatto misurabile ma non catastrofico, in particolare su clienti passivi che comunque non scansionano
- Chi ha perso: offerte "gotcha" con sconti a tempo, bonus condizionati opachi — il Portale li penalizza
- Chi ha vinto: reseller con pricing trasparente e posizione top Portale

**Argomenti collegati**
- Portale Offerte: profili di consumo tipo
- Strategia "posizionamento top 5" su Portale
- Codice offerta RCU come chiave di confronto

---

### 8. Effetto sul churn: nei 10 mesi, cosa avete misurato?

**Risposta attesa / talking points**

- Reseller grande: analisi cohort pre-luglio 2025 vs post, segmentate per profilo consumo, canale acquisizione, anzianità cliente
- Ipotesi attesa: churn aumenta di 1-3 punti sui segmenti "freddi" (clienti passivi), molto di più sui clienti già attivi (quelli che avrebbero cambiato comunque, ma ora lo fanno prima)
- Reseller piccolo: misurazione più grezza ma stessa direzione — il "silenzio" post-fattura si è accorciato
- Clienti che hanno cambiato sono andati dove: spesso verso top Portale, conferma della tesi "è il Portale che ha moltiplicato la velocità, non solo il QR"
- Contromossa osservata: attivare retention outbound su clienti con bolletta appena emessa (pericolo: evoca variazione unilaterale, rispettare CCC art. 13)

**Argomenti collegati**
- Switching rate ARERA 2024 (domestico 19%, PMI 25-30%)
- CCC art. 13 preavvisi e indennizzo 30 €
- Retention outbound vs diritto ripensamento 14 gg

---

### 9. La bolletta dematerializzata e l'art. 13 TIVG: chi ha accelerato?

**Risposta attesa / talking points**

- Meccanismo incentivante TIVG art. 13: ≥7% clienti tutela vulnerabilità dematerializzati → CSEA copre 80% differenziale; ≥20% → 100%
- L'opportunità: il passaggio alla nuova bolletta è stato il momento naturale per spingere sul dematerializzato (template nuovo, cliente "rieducato")
- Reseller grande: campagna mirata ai vulnerabili gas, investimento in portale clienti e notifica via SMS/WhatsApp del PDF, obiettivo superamento soglia 20%
- Reseller piccolo: salto più difficile perché richiede area clienti evoluta e supporto telefonico per cliente anziano
- Stato dell'arte: chi è sopra il 20% beneficia del 100% coverage CSEA — piccola ma misurabile leva di margine

**Argomenti collegati**
- TIVG art. 13 meccanismo incentivante
- Tutela vulnerabilità gas (identificazione SII delibera 102/2023)
- UX area clienti e canali push bolletta

---

### 10. Luglio-agosto 2025 sono stati i mesi dei conguagli. Come è andata?

**Risposta attesa / talking points**

- Conguagli post-estate sono storicamente il trigger di picco reclami, unito al fatto che era la prima finestra con nuovo frontespizio
- Reseller grande: data quality sui consumi reali, letture effettive vs stimate, early warning sui clienti con delta > X € → campagna proattiva ("la tua bolletta di settembre sarà più alta del solito, ecco perché")
- Reseller piccolo: conguaglio arriva "a sorpresa", cliente apre la bolletta nuova, non capisce, telefona o fa reclamo
- Numero da tenere a mente: picco complaint 2024-2025 ARERA concentrato proprio su conguagli e comunicazioni post-fine tutela (riferimento Relazione Annuale)
- Best practice emersa: nella sezione comunicazioni del frontespizio, spiegare *nella stessa bolletta del conguaglio* come leggere la differenza

**Argomenti collegati**
- Letture effettive vs stimate (art. misura TIV/TIVG)
- Rateizzazione obbligatoria per importi > 50 € (regime PLACET/STG)
- Relazione Annuale ARERA 2025

---

### 11. Sportello consumatori e associazioni: 10 mesi dopo, siete nel mirino?

**Risposta attesa / talking points**

- Sportello per il Consumatore Energia (Acquirente Unico): volume reclami aumentato nei mesi post-luglio 2025, tempo medio risposta sotto pressione
- Associazioni consumatori (Altroconsumo, Federconsumatori, ecc.): focus su leggibilità, soprattutto per anziani e vulnerabili — cross-over con comunicazioni dematerializzazione
- Reseller grande: dialogo strutturato, team conciliazioni, KPI su esito conciliazione paritetica
- Reseller piccolo: rischio di essere segnalato come cattivo performer su indicatori ARERA pubblici
- Prossimo rischio: ARERA sta sviluppando controlli conformità automatizzati e anomaly detection (Relazione Annuale 2025) — chi ha la bolletta "fuori specchio" lo scoprirà molto prima

**Argomenti collegati**
- Sportello Consumatore Energia AU
- AI e regolatore: controlli conformità automatizzati ARERA
- Indicatori qualità ARERA pubblicati

---

### 12. Mettiamo un numero sul costo totale dell'adeguamento. Quanto vi è costato?

**Risposta attesa / talking points**

- Reseller grande con IT interno: costo "full-loaded" (mesi-uomo dev + billing + legale + training customer care + postalizzazione + test) — per chi ha 200k-500k clienti, la forchetta realistica è 300-800 k€, in qualche caso oltre il milione se c'erano vecchi sistemi legacy da toccare
- Reseller piccolo con vendor terzo: fee aggiornamento licenza + customizzazione + stampa; forchetta più bassa in valore assoluto (50-200 k€) ma impatto % sul fatturato potenzialmente più pesante
- Voci nascoste: training operatori sportello, FAQ interne, aggiornamento scheda sintetica, comunicazioni preventive ai clienti (costi di stampa/invio dedicati), allineamento CRM per spiegazione dell'importo
- Il costo non finisce il 1° luglio 2025: c'è un coda di 6-12 mesi di tuning, bug fix su edge case, gestione picco reclami
- TIV art. 21bis adeguamento costi operativi MT: parzialmente copre — solo per esercenti MT societariamente separati

**Argomenti collegati**
- TIV art. 21bis adeguamento costi operativi
- Sanzioni TIVG art. 16 in caso di mancate comunicazioni post-nuova bolletta
- M&A: pressione economica su reseller medi < 50-100k clienti

---

### 13. Una curiosità operativa. Come ha reagito il team customer care nei primi 30 giorni?

**Risposta attesa / talking points**

- Le prime 2-4 settimane: AHT (average handle time) aumenta, perché l'operatore deve spiegare voce per voce al cliente che chiama con la nuova bolletta in mano
- Reseller grande: script aggiornato, cheat sheet visivo, listening mirato, settimana di calibrazione quotidiana
- Reseller piccolo: operatori in difficoltà con la parte "trasparenza", spesso rimbalzano chiamate al back office
- Chatbot e AI: chi aveva knowledge base aggiornata ha retto; chi no ha dovuto rifare interamente gli script conversazionali
- Lesson: customer care formato *prima* del go-live → differenza netta di NPS nei primi 30 giorni

**Argomenti collegati**
- Call deflection e self-care
- Knowledge base e AI assistant (RAG su delibera 315)
- Formazione commerciale CCC art. 8 (responsabilità venditore su personale)

---

## Domande di chiusura — trasversali

---

### 14. Se oggi tornassi al gennaio 2025, cosa faresti di diverso per prepararti alla 315?

**Risposta attesa / talking points**

- Risposta "IT-driven": ambiente di test definito prima, parallel run su 1-2% dei clienti mesi prima, più budget per edge case
- Risposta "cliente-driven": comunicazione *prima* del go-live (bolletta di giugno 2025 con messaggio "dalla prossima cambierà questo"), FAQ su area clienti e WhatsApp, formazione anticipata customer care
- Risposta "business-driven": usare il go-live come momento di attivazione area clienti e dematerializzazione (campagna), non solo come obbligo
- Punto di onestà: molti reseller hanno trattato la delibera come "progetto IT", mancando la parte cliente

**Argomenti collegati**
- Comunicazione precontrattuale e in corso di contratto (CCC)
- Onboarding digitale e attivazione app
- Campagna dematerializzazione post-nuova bolletta

---

### 15. Guardiamo avanti. Con la fine STG al 31 marzo 2027 davanti, che ruolo ha la bolletta nella partita che si apre?

**Risposta attesa / talking points**

- 3 milioni di clienti STG domestici passano a mercato libero nel 2027 — la bolletta è il principale canale di comunicazione per spiegare "cosa cambia" e "cosa offriamo"
- Aggiudicatari STG: usare lo spazio bolletta per portare il cliente sul proprio mercato libero prima che lo faccia la concorrenza
- Non-aggiudicatari: la bolletta diventa leva di retention sui clienti già propri e di acquisizione indiretta (referral, brand)
- Il QR code al Portale, da qui al 2027, diventa più presente: se il benchmark è pubblico e il cliente lo sa leggere, il prezzo non basta più — servono qualità servizio, app, servizi accessori
- Conclusione: la delibera 315 non è un punto di arrivo, è l'infrastruttura sopra cui si giocherà la partita 2027

**Argomenti collegati**
- 31 marzo 2027 fine STG
- Parametri γ aggressivi (anche negativi) delle aste STG domestici → monetizzazione post-2027
- Valore aggiunto non confrontato dal Portale (qualità, app, servizi)

---

## Dopo l'intervista

- **Per temi caldi**:
  - Delibera 315/2024 — stato dell'arte 10 mesi dopo
  - Conguagli estivi e picco reclami settembre-novembre 2025
  - Impatto QR code su switching rate 2025-2026
  - Costo totale adeguamento e coda post go-live

- **Per glossario**:
  - Frontespizio unificato / sezione trasparenza
  - Codice offerta RCU (32 caratteri, del. 135/2022)
  - TIVG art. 13 (dematerializzazione tutela vulnerabili)
  - CCC art. 13 (preavvisi variazioni)
  - TIV art. 21bis (adeguamento costi operativi MT)
  - Sportello per il Consumatore Energia (AU)

- **Per pipeline**:
  - Episodio su fine STG 31 marzo 2027 e strategie retention
  - Episodio su qualità servizio come leva competitiva non confrontata dal Portale
  - Episodio su AI e regolatore: controlli conformità automatizzati ARERA
  - Episodio su morosità post-conguagli 2025 e unpaid ratio 2026

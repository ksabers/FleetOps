# FleetOps — applicazione (Step 6c: aggiornamenti in tempo reale via WebSocket)

Applicazione web **React + Vite + TypeScript** che riproduce la struttura di
navigazione e le schermate della PoC (`Fleet Dashboard PoC (standalone).html`),
pensata per essere riempita ed espansa un pezzo alla volta finché non parlerà
con un vero **Traccar Server**.

> Stato attuale: **Step 6c completato** — la Mappa operativa non fa più
> solo una chiamata REST una tantum: apre anche una connessione WebSocket
> verso Traccar (`/api/socket`) e si aggiorna DA SOLA, in tempo reale, ogni
> volta che una posizione cambia sul server, con riconnessione automatica se
> la connessione si interrompe. In più, `traccarApi.getEvents()` (storico
> eventi/allarmi via `GET /api/reports/events`) è ora una VERA chiamata di
> rete: nessuna funzione di `traccarApi.ts` resta più uno stub, anche se la
> pagina "Allarmi e regole" non la usa ancora (vedi "Cosa fa già e cosa non
> fa ancora"). L'Anagrafica veicoli resta invece ancora mock (richiede una
> decisione su come mappare i campi extra come VIN e reparto sugli attributi
> personalizzati di Traccar). Vedi "Come testare lo Step 6c" più sotto per
> collegarti al tuo server Traccar in locale, e "Avanzamento del progetto"
> per il dettaglio passo-per-passo.

## Perché queste scelte tecniche

- **Vite** invece di Create React App: più veloce, più semplice, standard
  attuale per progetti React nuovi.
- **TypeScript** (`.ts`/`.tsx`), non JavaScript puro: type-checking in fase
  di scrittura del codice invece di scoprire i bug solo nel browser a
  runtime. La web app ufficiale di Traccar (`traccar/traccar-web`) è in
  JavaScript, ma ne seguiamo comunque i pattern architetturali (struttura
  cartelle, routing, ecc.), aggiungendo la sicurezza dei tipi.
- **react-router-dom** (in modalità `HashRouter`, URL tipo `/#/veicoli`):
  stessa libreria di routing usata da traccar-web. `HashRouter` invece di
  `BrowserRouter` perché funziona sempre anche dentro iframe di anteprima o
  hosting statico senza configurazione server dedicata.
- **Nessuna libreria UI (MUI, Tailwind, ecc.) per ora**: solo CSS/stili
  inline, per restare semplici mentre impari le basi di React. Potremo
  introdurre una libreria di componenti in un passo successivo, se utile.
- **Nessun Redux ancora**: lo stato è gestito con `useState` locale a ogni
  pagina ("lifting state up"). Lo stato globale (dispositivi, posizioni,
  sessione) arriverà quando collegheremo i dati reali — probabilmente con
  Redux Toolkit, come fa traccar-web (`@reduxjs/toolkit`), per restare
  coerenti con il progetto ufficiale.
- **Caricamento dati asincrono fin da ora (Step 4)**: le pagine non leggono
  più i dati mock in modo sincrono/istantaneo, ma tramite
  `src/services/fleetService.ts` (funzioni che restituiscono una `Promise`,
  con un piccolo ritardo simulato) e l'hook riusabile
  `src/hooks/useAsyncData.ts`, che gestisce gli stati "in caricamento" /
  "errore" / "dati pronti". È lo stesso schema che serve con un vero server,
  dove la risposta non arriva mai istantaneamente.
- **ESLint 9 (flat config) + Prettier**: verifica automatica di stile e
  qualità del codice, eseguita prima di ogni build/deploy.
- **Context API di React per l'autenticazione (Step 6a)**, non ancora Redux:
  `AuthContext` è il primo "stato condiviso" tra più componenti dell'app
  (TopBar, RequireAuth, tutte le pagine). È la versione "semplice, già
  incorporata in React" dello stesso concetto che traccar-web risolve con
  Redux; potremo valutare Redux Toolkit più avanti se lo stato condiviso
  crescerà molto (dispositivi, posizioni live...).
- **Proxy di sviluppo di Vite verso Traccar (Step 6a)**: `vite.config.ts`
  ora instrada ogni richiesta a `/api/...` verso il vero server Traccar
  (`http://localhost:8082` di default), così il browser non incontra mai
  problemi di CORS. Funziona SOLO in `npm run dev`; una build pubblicata
  (Step futuro) richiederà una soluzione diversa — vedi "Cosa fa già e cosa
  non fa ancora" più sotto. Il proxy ha anche `ws: true`, impostato già allo
  Step 6a in previsione di questo step: senza quel flag Vite non instrada
  correttamente il traffico WebSocket (protocollo diverso da una normale
  richiesta HTTP), solo quello REST.
- **WebSocket nativo del browser per il tempo reale (Step 6c)**, non una
  libreria esterna (es. `socket.io-client`): Traccar espone un WebSocket
  "puro" standard (`/api/socket`), quindi basta l'oggetto `WebSocket` già
  incorporato nel browser, senza aggiungere dipendenze. La logica di
  connessione/riconnessione vive isolata in un hook dedicato
  (`src/hooks/useLiveVehicles.ts`), sullo stesso principio di
  `traccarApi.ts`: se la gestione dovesse complicarsi, si cambia in un
  punto solo.

## Struttura delle cartelle

```
fleet-dashboard-app/
├── index.html              punto di ingresso HTML (quasi vuoto: solo <div id="root">)
├── vite.config.ts          configurazione di Vite
├── tsconfig.json / tsconfig.node.json   configurazione TypeScript (app + Vite)
├── eslint.config.js        regole di lint (ESLint 9, flat config)
├── .prettierrc             regole di formattazione automatica
├── src/
│   ├── main.tsx             monta l'app React nel DOM
│   ├── App.tsx              definisce le rotte (URL -> pagina)
│   ├── index.css            variabili CSS globali (colori, spaziature, utility .badge/.mono)
│   ├── context/
│   │   └── AuthContext.tsx  NUOVO (Step 6a): stato globale di autenticazione
│   │                         (utente collegato, login/logout, controllo
│   │                         sessione all'avvio) tramite React Context
│   ├── layout/
│   │   ├── AppLayout.tsx    guscio comune: Sidebar + TopBar + contenuto pagina
│   │   ├── Sidebar.tsx      menu laterale scuro (Monitoraggio / Gestione)
│   │   ├── TopBar.tsx       intestazione (titolo, ricerca, orologio, utente+Esci)
│   │   ├── RequireAuth.tsx  NUOVO (Step 6a): guardia di rotta, reindirizza a
│   │   │                     /login se nessuno ha effettuato l'accesso
│   │   ├── navConfig.ts     dati delle voci di menu della sidebar
│   │   └── pageMeta.ts      titolo/sottotitolo per ogni pagina
│   ├── components/
│   │   ├── PlaceholderSection.tsx   riquadro "in costruzione" riusabile
│   │   └── VehicleCategoryIcon.tsx  icona lineare per categoria veicolo (leggero/pesante/speciale)
│   ├── types/
│   │   ├── vehicle.ts              tipo Vehicle (dati "live": posizione, stato, velocità)
│   │   ├── vehicleRegistry.ts      tipo VehicleRegistryEntry (estende Vehicle con dati di anagrafica)
│   │   ├── traccarDevice.ts        NUOVO (Step 6b): forma grezza di un Device Traccar (GET /api/devices)
│   │   ├── traccarPosition.ts      NUOVO (Step 6b): forma grezza di una Position Traccar (GET /api/positions)
│   │   ├── traccarSocketMessage.ts NUOVO (Step 6c): forma di un messaggio WebSocket (chiavi
│   │   │                             devices/positions/events opzionali, GET /api/socket)
│   │   └── traccarEvent.ts         NUOVO (Step 6c): forma grezza di un Event Traccar (GET
│   │                                 /api/reports/events); pronto ma non ancora usato da nessuna pagina
│   ├── common/                     "dizionari" tipizzati etichetta+colore per stato/categoria/telemetria
│   │   ├── vehicleStatus.ts
│   │   ├── vehicleCategory.ts
│   │   └── vehicleTelemetry.ts
│   ├── data/                       dati finti (mock), pronti per essere sostituiti da chiamate reali
│   │   ├── mockVehicles.ts
│   │   └── mockFleetRegistry.ts
│   ├── hooks/
│   │   ├── useAsyncData.ts        hook riusabile: gestisce caricamento/errore/dati di una Promise
│   │   └── useLiveVehicles.ts     NUOVO (Step 6c): come useAsyncData, ma dopo il primo caricamento
│   │                                apre anche il WebSocket e aggiorna i veicoli in tempo reale
│   │                                (usato SOLO da MapView.tsx, non dalle altre pagine)
│   ├── utils/
│   │   └── formatRelativeTime.ts  NUOVO (Step 6b): converte una data ISO in "N minuti fa" ecc.
│   ├── pages/                 una cartella per ciascuna sezione della sidebar
│   │   ├── Login/             NUOVO (Step 6a): schermata di accesso, fuori dal
│   │   │                       guscio AppLayout (niente sidebar/topbar)
│   │   │   └── Login.tsx
│   │   ├── MapView/           Mappa operativa — COMPLETA (Step 2)
│   │   ├── VehicleRegistry/   Anagrafica veicoli — COMPLETA (Step 3)
│   │   ├── Alarms/            Allarmi e regole — COMPLETA (Step 5)
│   │   │   ├── Alarms.tsx         orchestratore: carica i dati, poi delega ad AlarmsLoaded
│   │   │   └── AlarmList.tsx      chip di filtro + righe allarme + azioni (presa in carico/chiudi)
│   │   ├── Maintenance/       Manutenzione — COMPLETA (Step 5)
│   │   │   ├── Maintenance.tsx        orchestratore + 3 StatCard riepilogo
│   │   │   └── MaintenanceTable.tsx   tabella a righe espandibili (accordion) con dettaglio
│   │   ├── Activity/          Attività — COMPLETA (Step 5)
│   │   │   └── Activity.tsx           cronologia interventi, sola lettura
│   │   ├── Reports/           KPI e report — COMPLETA (Step 5)
│   │   │   ├── Reports.tsx        orchestratore + 10 StatCard (KPI principali + mini KPI)
│   │   │   └── KpiCharts.tsx      grafico a barre orario + barre di utilizzo flotta (senza librerie esterne)
│   │   └── DeviceStatus/      Stato dispositivi — COMPLETA (Step 5)
│   │       ├── DeviceStatus.tsx       orchestratore + 3 StatCard riepilogo
│   │       └── DeviceStatusTable.tsx  tabella a righe espandibili con pallino di connettività
│   ├── components/
│   │   ├── PlaceholderSection.tsx   riquadro "in costruzione" riusabile (non più usato dalle 7
│   │   │                             pagine principali dopo lo Step 5, resta per errori/futuro)
│   │   ├── StatCard.tsx             NUOVO (Step 5): riquadro riusabile "etichetta + numero grande",
│   │   │                             usato da Allarmi, Manutenzione, Report, Stato dispositivi
│   │   └── VehicleCategoryIcon.tsx  icona lineare per categoria veicolo (leggero/pesante/speciale)
│   └── services/
│       ├── fleetService.ts   livello "servizi" usato DAVVERO dalle pagine: dallo Step 6b
│       │                      fetchVehicles() chiama DAVVERO traccarApi.getDevices() +
│       │                      getPositions() e traduce il risultato in Vehicle[] tramite
│       │                      il nuovo helper interno toVehicle(). Dallo Step 6c la
│       │                      traduzione è stata estratta nella funzione esportata
│       │                      buildVehicles(device[], position[]), riusata anche da
│       │                      useLiveVehicles.ts per ricostruire l'elenco a ogni
│       │                      messaggio del WebSocket. Le altre funzioni (allarmi,
│       │                      manutenzione, attività, KPI, stato dispositivi,
│       │                      anagrafica) restano ancora mock
│       └── traccarApi.ts     "ponte" verso Traccar: dallo Step 6a login()/getSession()/
│                              logout() sono VERE chiamate di rete (POST/GET/DELETE
│                              /api/session); dallo Step 6b anche getDevices()/
│                              getPositions() sono VERE chiamate (GET /api/devices,
│                              GET /api/positions); dallo Step 6c anche getEvents()
│                              è una VERA chiamata (GET /api/reports/events) — nessuna
│                              funzione resta più stub. Il WebSocket (/api/socket) NON
│                              vive qui: la sua logica di connessione/riconnessione è in
│                              src/hooks/useLiveVehicles.ts, non in questo semplice ponte
```

File aggiuntivi introdotti allo Step 6a:

```
src/types/
└── traccarUser.ts   interfaccia TraccarUser (id, name, email, administrator):
                      versione "ridotta" dell'oggetto User che restituisce Traccar
```

File aggiuntivi introdotti allo Step 5 (dati mock e stili, uno per sezione,
seguendo lo stesso schema già visto per i veicoli):

```
src/data/
├── mockAlarms.ts        allarmi finti (7 voci, stati/severità diversi)
├── mockMaintenance.ts   interventi di manutenzione finti (7 voci)
├── mockActivity.ts      cronologia interventi finta (6 voci)
├── mockKpi.ts           numeri KPI + serie oraria + utilizzo flotta
└── mockDevices.ts       stato dispositivi finto (7 voci)

src/common/
├── alarmStyles.ts              colori/etichette per severità e stato allarme
├── maintenanceStatusStyles.ts  colori/etichette per stato manutenzione
├── deviceStatusStyles.ts       colori/etichette per installazione/connettività
└── activityStyles.ts           colori/etichette per tipo di evento in Attività

src/types/
├── alarm.ts             interfaccia Alarm
├── maintenanceItem.ts   interfaccia MaintenanceItem
├── activityEntry.ts     interfaccia ActivityEntry
├── kpi.ts               interfacce FleetKpi, HourlyEventCount, FleetUtilizationSlice
└── deviceStatus.ts      interfaccia DeviceStatus
```

Ogni pagina vive nella propria cartella sotto `src/pages/`: quando la
riempiamo di contenuto reale, tabelle, mappa ecc., i suoi file (componenti
piccoli, dati mock, stili) stanno tutti lì dentro, senza sporcare le altre
sezioni. Questa è la "modularità" richiesta: ogni sezione è un'isola che si
può modificare o anche riscrivere da zero senza impattare le altre.

## Come avviarla in locale

```bash
cd fleet-dashboard-app
npm install     # scarica le dipendenze (solo la prima volta, o dopo aver
                 # cambiato package.json)
npm run dev      # avvia il server di sviluppo su http://localhost:5173
```

Ogni modifica ai file dentro `src/` viene mostrata quasi istantaneamente nel
browser, senza bisogno di ricaricare la pagina a mano.

### Come testare il login reale (Step 6a)

Dallo Step 6a l'app richiede DAVVERO una sessione Traccar valida:

1. Assicurati che Traccar sia in esecuzione e raggiungibile su
   `http://localhost:8082` (la pagina di login di Traccar deve essere
   visibile andando lì con il browser).
2. Avvia l'app con `npm run dev` come sopra e apri `http://localhost:5173`.
3. Verrai reindirizzato automaticamente a `/login`: inserisci email e
   password del tuo account Traccar (lo stesso che usi sulla pagina di
   login del server) e premi "Accedi".
4. Se le credenziali sono corrette, Traccar imposta un cookie di sessione e
   vieni portato alla Mappa operativa; il tuo nome appare in alto a destra
   con il pulsante "Esci".
5. Se il server Traccar NON è in ascolto su `localhost:8082`, o le
   credenziali sono sbagliate, viene mostrato un messaggio d'errore sotto ai
   campi del form, senza far "sparire" i dati digitati.

Se il tuo server Traccar è su un indirizzo diverso da `localhost:8082`,
modifica il valore `target` dentro `server.proxy['/api']` in
`vite.config.ts` (vedi i commenti in quel file per i dettagli).

### Come testare lo Step 6b (dati reali sulla Mappa operativa)

1. Assicurati che Traccar sia in esecuzione (come sopra) e che il tuo
   account abbia almeno un dispositivo configurato che abbia già inviato
   almeno una posizione (un dispositivo mai connesso non comparirà sulla
   Mappa — vedi limite più sotto).
2. Avvia l'app (`npm run dev`) ed effettua il login come al solito.
3. Vai su "Mappa operativa": dopo un breve "Caricamento flotta…" dovresti
   vedere i TUOI veicoli reali (non più i 7 veicoli finti v1..v7), con:
   - **Targa** = nome del dispositivo su Traccar (`device.name`).
   - **Velocità** in km/h, convertita automaticamente dai nodi restituiti da
     Traccar.
   - **Stato**: "Offline" se il dispositivo non è online su Traccar,
     "Allarme" se l'ultima posizione ha un allarme attivo, "In movimento" se
     la velocità supera 3 km/h, altrimenti "Fermo". È una convenzione di
     partenza: se sul tuo parco veicoli restituisce risultati poco sensati
     (es. troppi falsi "in movimento"), è facile aggiustare le soglie in
     `fleetService.ts` (funzione `toVehicle`).
   - **Ultimo aggiornamento** in italiano ("12 secondi fa", "3 ore fa"...).
4. Se un dispositivo del tuo account non compare in lista, controlla che
   abbia già inviato almeno una posizione: i dispositivi senza nessuna
   posizione nota vengono esclusi (non avremmo comunque coordinate da
   mostrare sulla mappa).
5. Il campo "Conducente" resta vuoto per tutti i veicoli reali: Traccar
   gestisce i conducenti come risorsa separata (`/api/drivers`), non ancora
   collegata.
6. L'Anagrafica veicoli mostra ancora i 7 veicoli finti: non è stata
   toccata in questo step (vedi "Cosa non fa ancora").

### Come testare lo Step 6c (aggiornamenti in tempo reale)

1. Assicurati che Traccar sia in esecuzione (come sopra), avvia l'app
   (`npm run dev`) ed effettua il login come al solito.
2. Vai su "Mappa operativa": sotto il titolo della pagina noterai un nuovo
   piccolo indicatore con un pallino colorato:
   - **Pallino verde + "Live — aggiornamento in tempo reale"**: il
     WebSocket è connesso. Da questo momento NON serve più ricaricare la
     pagina per vedere un veicolo che si muove: la posizione sulla mappa e
     in lista si aggiornerà da sola quando Traccar riceve un nuovo dato dal
     dispositivo GPS.
   - **Pallino grigio + "Riconnessione in corso…"**: il WebSocket si è
     interrotto (es. hai fermato/riavviato Traccar, o la rete è caduta) e
     l'app sta ritentando automaticamente ogni 5 secondi; i veicoli mostrati
     restano gli ultimi conosciuti, "congelati" fino alla riconnessione.
3. **Prova pratica più semplice** (senza un GPS reale a disposizione): apri
   gli Strumenti di sviluppo del browser (F12) → scheda "Network"/"Rete" →
   filtra per "WS" (WebSocket): dovresti vedere una connessione verso
   `/api/socket` con lo stato "101 Switching Protocols" e, ogni volta che
   Traccar manda un aggiornamento, un nuovo frame in arrivo nella lista dei
   messaggi di quella connessione.
4. **Prova di riconnessione**: mentre l'app è aperta sulla Mappa operativa,
   ferma il servizio Traccar (o stacca la rete per qualche secondo). Il
   pallino deve diventare grigio ("Riconnessione in corso…"); riavvia
   Traccar (o riconnetti la rete): entro pochi secondi il pallino deve
   tornare verde SENZA che tu debba ricaricare manualmente la pagina.
5. Se cambi pagina (es. vai su "Anagrafica veicoli") e poi torni su "Mappa
   operativa", il WebSocket si chiude quando lasci la pagina e se ne apre
   uno nuovo quando ci torni: è voluto (`useLiveVehicles.ts` chiude la
   connessione nel cleanup dell'effetto), evita di lasciare connessioni
   aperte per pagine che l'utente non sta guardando.

> Nota per chi verifica dal thread di Perplexity Computer: l'ambiente
> sandbox che genera l'anteprima online NON può raggiungere il tuo
> `localhost:8082`, quindi la build pubblicata mostra solo la schermata di
> login (o un errore di connessione) e non può essere usata per verificare
> i dati reali. La verifica va fatta SEMPRE eseguendo l'app in locale con
> `npm run dev` contro il tuo server Traccar.

Prima di ogni commit/push conviene eseguire anche:

```bash
npm run build              # compila TypeScript (tsc -b) e crea la build di produzione
npx eslint .                # controlla la qualità del codice
npx prettier --check "src/**/*.{ts,tsx}"   # controlla la formattazione
```

## Cosa fa già e cosa non fa ancora

**Fa già:**

- Mostra il layout a due colonne (sidebar scura + area contenuto) come la PoC.
- Naviga tra le 7 sezioni tramite i link della sidebar, con evidenziazione
  della voce attiva e URL che cambia (es. `/veicoli`, `/allarmi`...).
- Ha un orologio funzionante in alto a destra, come nella PoC.
- **Mappa operativa**: lista dei 7 veicoli mock + mappa Leaflet con i
  relativi marker, selezione sincronizzata tra lista e mappa.
- **Anagrafica veicoli**: tabella "Registro flotta" (targa, modello, tipo,
  odometro, stato) cliccabile per aprire una scheda di dettaglio con
  telemetria live semplificata (velocità, accensione, qualità GPS) e i dati
  di assegnazione/anagrafica completi (reparto, VIN, immatricolazione,
  alimentazione, odometro, allestimento).
- **Caricamento dati asincrono**: tutte le pagine mostrano ora uno stato
  "Caricamento…" mentre i dati arrivano (tramite `fleetService.ts`) e un
  messaggio d'errore dedicato se qualcosa va storto, invece di leggere i
  dati mock in modo istantaneo/sincrono come prima.
- **Allarmi e regole**: 4 riquadri riepilogo (Nuovi/Presi in carico/Critici
  attivi/Chiusi), filtro a chip (Tutti/Nuovi/In carico/Chiusi) e, per ogni
  allarme, i pulsanti "Presa in carico" e "Chiudi" che aggiornano davvero lo
  stato in memoria (senza salvarlo su un server — vedi limiti sotto).
- **Manutenzione**: 3 riquadri riepilogo (Scadute/In scadenza/Programmate) e
  una tabella a righe espandibili (clic sulla riga per aprire/chiudere il
  dettaglio: reparto, VIN, immatricolazione, alimentazione, allestimento,
  intervallo e ultimo intervento).
- **Attività**: cronologia interventi in sola lettura (data/ora, tipo di
  evento, veicolo, nota facoltativa).
- **KPI e report**: 4 KPI principali + 6 mini-KPI, un grafico a barre
  verticali "eventi per ora" e delle barre orizzontali di utilizzo flotta
  per stato — tutto costruito con semplici `<div>` colorati, senza librerie
  di grafici esterne.
- **Stato dispositivi**: 3 riquadri riepilogo (Online/Offline/In
  installazione) e una tabella a righe espandibili con pallino colorato di
  connettività (verde/arancio/grigio) e dettaglio tecnico (SIM, protocollo
  dati, firmware, tensione di alimentazione, ecc.).

**Novità Step 6a:**

- **Login reale**: la app chiede email e password del server Traccar
  (`POST /api/session`) invece di entrare direttamente. In caso di
  credenziali errate o server non raggiungibile mostra un messaggio
  d'errore chiaro, mantenendo i valori digitati.
- **Sessione persistente tra ricariche**: al caricamento dell'app viene
  controllato se esiste già un cookie di sessione valido (`GET /api/session`);
  se sì, l'utente entra direttamente senza dover rifare il login.
- **Logout**: pulsante "Esci" in alto a destra nella TopBar (chiama
  `DELETE /api/session` e torna alla schermata di login).
- **Rotte protette**: tutte le 7 sezioni della sidebar sono ora raggiungibili
  solo con una sessione valida; senza sessione si viene reindirizzati a
  `/login` automaticamente.

**Novità Step 6b:**

- **Mappa operativa con dati reali**: `fetchVehicles()` non restituisce più
  i 7 veicoli finti, ma chiama davvero `GET /api/devices` e `GET
/api/positions` (in parallelo) e unisce i due risultati in un array di
  `Vehicle`.
- **Conversione nodi → km/h**: Traccar restituisce la velocità in nodi;
  viene moltiplicata per 1,852 per ottenere i km/h mostrati in UI.
- **Stato dedotto automaticamente**: "Offline"/"Allarme"/"In
  movimento"/"Fermo" sono calcolati da stato di connessione + eventuale
  allarme + velocità (Traccar non ha un campo "stato" unico equivalente).
  È un'euristica di partenza da validare sui tuoi dati reali (vedi "Come
  testare lo Step 6b").
- **"Ultimo aggiornamento" in italiano**: nuova utility
  `formatRelativeTime.ts` che trasforma la data ISO di Traccar in frasi
  come "12 secondi fa" / "3 ore fa", coerente con lo stile già usato nei
  dati mock.

**Novità Step 6c:**

- **Mappa operativa in tempo reale**: dopo il primo caricamento via REST, la
  pagina apre una connessione WebSocket verso `/api/socket` (nuovo hook
  `useLiveVehicles.ts`) e riceve da Traccar SOLO le novità (dispositivi e/o
  posizioni cambiate), senza dover più ricaricare la pagina o fare
  "polling" (richieste ripetute a intervalli).
- **Indicatore "Live"/"Riconnessione…"**: un pallino verde/grigio sotto il
  titolo della Mappa operativa mostra sempre se in questo momento i dati si
  aggiornano da soli o se la connessione si è interrotta.
- **Riconnessione automatica**: se il WebSocket si chiude in modo inatteso
  (rete assente, riavvio del server Traccar...), l'app ritenta la
  connessione dopo 5 secondi, rifacendo prima una chiamata REST completa
  per non perdere aggiornamenti persi durante l'interruzione.
- **`buildVehicles()` estratta e riusata**: la traduzione
  Device+Position → Vehicle (già introdotta allo Step 6b) è ora una
  funzione esportata da `fleetService.ts`, usata sia dal primo caricamento
  sia da ogni aggiornamento in arrivo dal WebSocket — un solo punto dove
  vive quella logica, invece di duplicarla.
- **Storico eventi reale**: `traccarApi.getEvents(deviceIds, from, to)`
  chiama davvero `GET /api/reports/events` (non più uno stub). Non è
  ancora collegata a nessuna pagina (vedi "Non fa ancora" più sotto).

**Non fa ancora (arriverà nei prossimi passi):**

- La scheda di dettaglio veicolo non include ancora la "Cronologia eventi"
  (timeline) né la "Disponibilità segnali" presenti nella PoC — rimandate a
  un passo successivo per mantenere gli incrementi piccoli.
- Il pulsante "Mostra su mappa" nella scheda veicolo apre la pagina Mappa
  ma non pre-seleziona ancora il veicolo lì (richiede di condividere lo
  stato di selezione tra le due pagine).
- Le azioni "Presa in carico"/"Chiudi" sugli allarmi modificano solo lo
  stato locale della pagina (si perdono ricaricando); non esiste ancora un
  flusso di escalation/note collegato a un server.
- La pagina Attività NON è collegata in diretta alle azioni fatte nella
  pagina Allarmi: sono due sezioni con dati mock indipendenti. Collegarle
  richiederebbe uno stato condiviso tra pagine (Context o Redux), che
  arriverà quando ci collegheremo ai dati reali.
- In Stato dispositivi la connettività è mostrata con un pallino colorato +
  testo, non con un badge pieno come altrove: scelta voluta per restare
  fedele alla PoC in quella sezione specifica.
- **Anagrafica veicoli resta mock**: `fetchFleetRegistry()` non è stata
  toccata in questo step. La tabella "Registro flotta" ha bisogno di campi
  che Traccar non espone come campi standard (VIN, reparto, alimentazione,
  allestimento, anno di immatricolazione...): andrebbero letti dagli
  `attributes` personalizzati del dispositivo su Traccar, il che richiede
  prima di decidere insieme quali nomi di attributo usare (e configurarli
  sul server). Ne parliamo appena avrai verificato lo Step 6b.
- **Dispositivi senza posizione nota vengono esclusi** dalla Mappa
  operativa: se un dispositivo Traccar non ha ancora mai inviato una
  posizione, non compare in lista (non avremmo comunque coordinate da
  mostrare).
- **Il conducente (`driver`) è sempre vuoto** per i veicoli reali: Traccar
  gestisce i conducenti come risorsa separata (`GET /api/drivers`), non
  ancora collegata.
- **Nessun "tipo di allarme" tradotto in italiano**: se `position.
attributes.alarm` è presente, il veicolo passa a stato "Allarme", ma il
  dettaglio del tipo di allarme non è ancora mostrato in UI.
- Allarmi/manutenzione/attività/KPI/stato dispositivi sono ANCORA dati
  mock: `traccarApi.getEvents()` esiste ed è già una vera chiamata di rete,
  ma `fleetService.ts` non la richiama ancora per nessuna di queste pagine.
  Serve prima decidere come tradurre un evento Traccar (`deviceId` + `type`
  numerici) nel tipo `Alarm` che la pagina "Allarmi e regole" si aspetta
  (che vuole già una targa/veicolo leggibile, non un id) — un prossimo step
  dedicato.
- Il campo `events` dei messaggi WebSocket viene ricevuto ma IGNORATO per
  ora (`useLiveVehicles.ts` gestisce solo `devices`/`positions`): un
  allarme che scatta in tempo reale non fa ancora comparire nulla nella
  pagina Allarmi, né emette un suono/notifica come fa la web app ufficiale
  di Traccar. Arriverà insieme al punto precedente.
- Nessuna gestione dedicata della sessione scaduta durante la connessione
  live: se il cookie di sessione scade mentre il WebSocket è aperto, il
  tentativo di riconnessione fallirà silenziosamente (il pallino resta
  grigio) invece di reindirizzare l'utente a `/login` come fa la web app
  ufficiale di Traccar in quel caso.
- Il proxy `/api` di `vite.config.ts` funziona SOLO in sviluppo
  (`npm run dev`): una build pubblicata online (es. su pplx.app) non ha un
  server Vite in ascolto, quindi login e dati reali funzionano solo
  eseguendo l'app in locale contro il proprio server Traccar. La versione
  pubblicata nel thread resta quindi "di sola anteprima grafica" per questo
  Step.
- Nessun refresh automatico del token/sessione: se il cookie scade mentre
  l'app è aperta, la prossima chiamata protetta fallirà (vedi anche il
  punto sulla sessione scaduta durante la connessione live, appena sopra).

## Avanzamento del progetto

| Step | Contenuto                                                                         | Stato         |
| ---- | --------------------------------------------------------------------------------- | ------------- |
| 1    | Scheletro app React/Vite: layout, sidebar, routing, 7 pagine segnaposto           | ✅ Completato |
| —    | Migrazione a TypeScript (tsc, ESLint 9 flat config, Prettier)                     | ✅ Completato |
| 2    | Mappa operativa: lista veicoli mock + mappa Leaflet con marker                    | ✅ Completato |
| 3    | Anagrafica veicoli: tabella "Registro flotta" + scheda di dettaglio               | ✅ Completato |
| 4    | Modulo servizi API (mock → pronto per Traccar reale)                              | ✅ Completato |
| 5    | Altre sezioni: Allarmi, Manutenzione, Attività, KPI, Stato dispositivi            | ✅ Completato |
| 6a   | Login reale su Traccar (`POST/GET/DELETE /api/session`, rotte protette)           | ✅ Completato |
| 6b   | Elenco dispositivi/posizioni reali (`GET /api/devices`, `GET /api/positions`)     | ✅ Completato |
| 6c   | Aggiornamenti in tempo reale via WebSocket (`/api/socket`) + storico eventi reale | ✅ Completato |

## Prossimi passi pianificati

1. Collegare la pagina "Allarmi e regole" ai dati reali: decidere come
   tradurre un Event Traccar (`traccarApi.getEvents()`, già pronta) nel
   tipo `Alarm` esistente, ed eventualmente gestire anche gli eventi in
   arrivo dal campo `events` dei messaggi WebSocket (per ora ignorato in
   `useLiveVehicles.ts`).
2. Decidere insieme la convenzione per gli attributi personalizzati Traccar
   necessari a collegare l'Anagrafica veicoli ai dati reali (VIN, reparto,
   alimentazione, allestimento, anno di immatricolazione...).
3. Gestire la sessione scaduta durante la connessione live (reindirizzare a
   `/login` invece di ritentare all'infinito una riconnessione che fallirà
   sempre).
4. Valutare l'introduzione di uno stato globale condiviso più ampio (Redux
   Toolkit) se, con dispositivi/posizioni live, il semplice Context iniziato
   allo Step 6a risultasse limitante.
5. Valutare come gestire il login e i dati reali anche sulla build
   pubblicata online (reverse proxy dedicato o configurazione CORS lato
   Traccar), oggi possibile solo eseguendo l'app in locale.

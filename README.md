# FleetOps — applicazione (Step 6a: login reale su Traccar)

Applicazione web **React + Vite + TypeScript** che riproduce la struttura di
navigazione e le schermate della PoC (`Fleet Dashboard PoC (standalone).html`),
pensata per essere riempita ed espansa un pezzo alla volta finché non parlerà
con un vero **Traccar Server**.

> Stato attuale: **Step 6a completato** — l'app ora richiede davvero il login
> con le credenziali del server Traccar (non più dati finti): chi non ha una
> sessione valida viene reindirizzato a `/login`, e dopo l'accesso può uscire
> con il pulsante "Esci" in alto a destra. Dispositivi/posizioni/eventi sono
> ancora dati mock: arriveranno negli Step 6b/6c. Vedi "Come testare il login
> reale" più sotto per collegarti al tuo server Traccar in locale, e
> "Avanzamento del progetto" per il dettaglio passo-per-passo.

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
  non fa ancora" più sotto.

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
│   │   └── vehicleRegistry.ts      tipo VehicleRegistryEntry (estende Vehicle con dati di anagrafica)
│   ├── common/                     "dizionari" tipizzati etichetta+colore per stato/categoria/telemetria
│   │   ├── vehicleStatus.ts
│   │   ├── vehicleCategory.ts
│   │   └── vehicleTelemetry.ts
│   ├── data/                       dati finti (mock), pronti per essere sostituiti da chiamate reali
│   │   ├── mockVehicles.ts
│   │   └── mockFleetRegistry.ts
│   ├── hooks/
│   │   └── useAsyncData.ts        hook riusabile: gestisce caricamento/errore/dati di una Promise
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
│       ├── fleetService.ts   livello "servizi" usato DAVVERO dalle pagine (Step 4): oggi
│       │                      avvolge i dati mock in una Promise con un piccolo ritardo;
│       │                      allo Step 6b chiamerà qui sotto traccarApi per
│       │                      dispositivi/posizioni. Dallo Step 5 espone anche le
│       │                      funzioni per allarmi, manutenzione, attività, KPI e stato
│       │                      dispositivi (ancora tutte mock)
│       └── traccarApi.ts     "ponte" verso Traccar: dallo Step 6a login()/getSession()/
│                              logout() sono VERE chiamate di rete (POST/GET/DELETE
│                              /api/session); getDevices()/getPositions()/getEvents()
│                              restano stub in attesa degli Step 6b/6c
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
- Dispositivi, posizioni, allarmi ed eventi sono ANCORA dati mock:
  `fleetService.ts` non chiama ancora `traccarApi.getDevices()` /
  `getPositions()` / `getEvents()` (restano funzioni stub). Arriverà negli
  Step 6b (dispositivi/posizioni) e 6c (eventi/WebSocket in tempo reale).
- Il proxy `/api` di `vite.config.ts` funziona SOLO in sviluppo
  (`npm run dev`): una build pubblicata online (es. su pplx.app) non ha un
  server Vite in ascolto, quindi il login reale funziona solo eseguendo
  l'app in locale contro il proprio server Traccar. La versione pubblicata
  nel thread resta quindi "di sola anteprima grafica" per questo Step.
- Nessun refresh automatico del token/sessione: se il cookie scade mentre
  l'app è aperta, la prossima chiamata protetta fallirà (verrà gestito con
  gli Step 6b/6c, quando ci saranno più chiamate da monitorare).

## Avanzamento del progetto

| Step | Contenuto                                                                     | Stato         |
| ---- | ----------------------------------------------------------------------------- | ------------- |
| 1    | Scheletro app React/Vite: layout, sidebar, routing, 7 pagine segnaposto       | ✅ Completato |
| —    | Migrazione a TypeScript (tsc, ESLint 9 flat config, Prettier)                 | ✅ Completato |
| 2    | Mappa operativa: lista veicoli mock + mappa Leaflet con marker                | ✅ Completato |
| 3    | Anagrafica veicoli: tabella "Registro flotta" + scheda di dettaglio           | ✅ Completato |
| 4    | Modulo servizi API (mock → pronto per Traccar reale)                          | ✅ Completato |
| 5    | Altre sezioni: Allarmi, Manutenzione, Attività, KPI, Stato dispositivi        | ✅ Completato |
| 6a   | Login reale su Traccar (`POST/GET/DELETE /api/session`, rotte protette)       | ✅ Completato |
| 6b   | Elenco dispositivi/posizioni reali (`GET /api/devices`, `GET /api/positions`) | ⏳ Da fare    |
| 6c   | Aggiornamenti in tempo reale via WebSocket (`/api/socket`)                    | ⏳ Da fare    |

## Prossimi passi pianificati

1. **Step 6b** — Elenco dispositivi/posizioni reali: `GET /api/devices` e
   `GET /api/positions`, con `fleetService.ts` che chiama `traccarApi.ts` al
   posto dei dati mock per Mappa operativa e Anagrafica veicoli (le altre
   sezioni restano mock per ora). Le pagine non cambieranno struttura.
2. **Step 6c** — Aggiornamenti in tempo reale via WebSocket (`/api/socket`),
   seguendo lo schema della web app ufficiale (`SocketController.jsx` nel
   repo `traccar/traccar-web`): niente più "polling", i dati si aggiornano
   da soli quando cambiano sul server.
3. Valutare l'introduzione di uno stato globale condiviso più ampio (Redux
   Toolkit) se, con dispositivi/posizioni live, il semplice Context iniziato
   allo Step 6a risultasse limitante.
4. Valutare come gestire il login reale anche sulla build pubblicata online
   (reverse proxy dedicato o configurazione CORS lato Traccar), oggi
   possibile solo eseguendo l'app in locale.

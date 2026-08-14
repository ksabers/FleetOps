# FleetOps — applicazione (Step 4: modulo servizi API)

Applicazione web **React + Vite + TypeScript** che riproduce la struttura di
navigazione e le schermate della PoC (`Fleet Dashboard PoC (standalone).html`),
pensata per essere riempita ed espansa un pezzo alla volta finché non parlerà
con un vero **Traccar Server**.

> Stato attuale: **Step 4 completato** — Mappa operativa e Anagrafica
> veicoli caricano i dati tramite un vero livello "servizi" asincrono
> (`fleetService.ts` + hook `useAsyncData`), con stati di caricamento ed
> errore, ancora appoggiato a dati finti (mock) ma pronto per essere
> ricollegato al vero server. Le altre 5 sezioni sono ancora segnaposto.
> Vedi "Avanzamento del progetto" più sotto per il dettaglio passo-per-passo.

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
│   ├── layout/
│   │   ├── AppLayout.tsx    guscio comune: Sidebar + TopBar + contenuto pagina
│   │   ├── Sidebar.tsx      menu laterale scuro (Monitoraggio / Gestione)
│   │   ├── TopBar.tsx       intestazione (titolo, ricerca, orologio)
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
│   │   ├── MapView/           Mappa operativa — COMPLETA (Step 2)
│   │   ├── VehicleRegistry/   Anagrafica veicoli — COMPLETA (Step 3)
│   │   ├── Alarms/            Allarmi e regole — segnaposto
│   │   ├── Maintenance/       Manutenzione — segnaposto
│   │   ├── Activity/          Attività — segnaposto
│   │   ├── Reports/           KPI e report — segnaposto
│   │   └── DeviceStatus/      Stato dispositivi — segnaposto
│   └── services/
│       ├── fleetService.ts   livello "servizi" usato DAVVERO dalle pagine (Step 4): oggi
│       │                      avvolge i dati mock in una Promise con un piccolo ritardo;
│       │                      allo Step 6 chiamerà qui sotto traccarApi
│       └── traccarApi.ts     "ponte" verso Traccar (per ora solo funzioni stub che lanciano
│                              un errore "non implementato"; richiamato da fleetService.ts
│                              a partire dallo Step 6, non ancora dalle pagine)
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
- **Caricamento dati asincrono**: entrambe le pagine sopra mostrano ora uno
  stato "Caricamento…" mentre i dati arrivano (tramite `fleetService.ts`) e
  un messaggio d'errore dedicato se qualcosa va storto, invece di leggere i
  dati mock in modo istantaneo/sincrono come prima.

**Non fa ancora (arriverà nei prossimi passi):**

- La scheda di dettaglio veicolo non include ancora la "Cronologia eventi"
  (timeline) né la "Disponibilità segnali" presenti nella PoC — rimandate a
  un passo successivo per mantenere gli incrementi piccoli.
- Il pulsante "Mostra su mappa" nella scheda veicolo apre la pagina Mappa
  ma non pre-seleziona ancora il veicolo lì (richiede di condividere lo
  stato di selezione tra le due pagine).
- Le altre 5 sezioni (Allarmi, Manutenzione, Attività, KPI, Stato
  dispositivi) sono ancora un riquadro segnaposto.
- Nessuna connessione a un Traccar Server reale: `src/services/traccarApi.ts`
  esiste solo come documentazione (funzioni stub) di cosa dovrà fare;
  `fleetService.ts` lo richiamerà al posto dei dati mock a partire dallo
  Step 6.

## Avanzamento del progetto

| Step | Contenuto                                                               | Stato         |
| ---- | ----------------------------------------------------------------------- | ------------- |
| 1    | Scheletro app React/Vite: layout, sidebar, routing, 7 pagine segnaposto | ✅ Completato |
| —    | Migrazione a TypeScript (tsc, ESLint 9 flat config, Prettier)           | ✅ Completato |
| 2    | Mappa operativa: lista veicoli mock + mappa Leaflet con marker          | ✅ Completato |
| 3    | Anagrafica veicoli: tabella "Registro flotta" + scheda di dettaglio     | ✅ Completato |
| 4    | Modulo servizi API (mock → pronto per Traccar reale)                    | ✅ Completato |
| 5    | Altre sezioni: Allarmi, Manutenzione, Attività, KPI, Stato dispositivi  | ⏳ Da fare    |
| 6    | Collegamento reale a Traccar Server (login, `/api/devices`, WebSocket)  | ⏳ Da fare    |

## Prossimi passi pianificati

1. Le altre sezioni (Allarmi, Manutenzione, Attività, KPI, Stato dispositivi).
2. Collegamento vero a Traccar Server: login, `GET /api/devices`,
   `GET /api/positions`, WebSocket per gli aggiornamenti live — seguendo lo
   stesso schema della web app ufficiale (`SocketController.jsx`,
   `store/session.js`, `store/devices.js` nel repo `traccar/traccar-web`).
   A quel punto basterà modificare `fleetService.ts` per chiamare
   `traccarApi.ts` al posto dei dati mock: le pagine non cambieranno.

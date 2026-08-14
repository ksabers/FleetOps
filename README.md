# FleetOps — scheletro applicazione (Step 1)

Scheletro di applicazione web **React + Vite** che riproduce la struttura di
navigazione della PoC (`Fleet Dashboard PoC (standalone).html`), pensato per
essere riempito ed espanso un pezzo alla volta finché non parlerà con un vero
**Traccar Server**.

## Perché queste scelte tecniche

- **Vite** invece di Create React App: più veloce, più semplice, standard
  attuale per progetti React nuovi.
  -- **react-router-dom**: stessa libreria di routing usata da traccar-web,
  per la navigazione tra le sezioni della sidebar.
- **Nessuna libreria UI (MUI, Tailwind, ecc.) per ora**: solo CSS/stili
  inline, per restare semplici. Potremo
  introdurre una libreria di componenti in un passo successivo, se utile.
- **Nessun Redux ancora**: le pagine sono per ora segnaposto statici. Lo
  stato globale (dispositivi, posizioni, sessione) arriverà quando
  collegheremo i dati reali — probabilmente con Redux Toolkit, come fa
  traccar-web (`@reduxjs/toolkit`), per restare coerenti con il progetto
  ufficiale.

## Struttura delle cartelle

```
fleet-dashboard-app/
├── index.html              punto di ingresso HTML (quasi vuoto: solo <div id="root">)
├── vite.config.js          configurazione di Vite
├── src/
│   ├── main.tsx             monta l'app React nel DOM
│   ├── App.tsx               definisce le rotte (URL -> pagina)
│   ├── index.css             variabili CSS globali (colori, spaziature)
│   ├── layout/
│   │   ├── AppLayout.tsx     guscio comune: Sidebar + TopBar + contenuto pagina
│   │   ├── Sidebar.tsx       menu laterale scuro (Monitoraggio / Gestione)
│   │   ├── TopBar.tsx        intestazione (titolo, ricerca, orologio)
│   │   ├── navConfig.ts      dati delle voci di menu della sidebar
│   │   └── pageMeta.ts       titolo/sottotitolo per ogni pagina
│   ├── components/
│   │   └── PlaceholderSection.tsx   riquadro "in costruzione" riusabile
│   ├── pages/                 una cartella per ciascuna sezione della sidebar
│   │   ├── MapView/           Mappa operativa
│   │   ├── VehicleRegistry/   Anagrafica veicoli
│   │   ├── Alarms/            Allarmi e regole
│   │   ├── Maintenance/       Manutenzione
│   │   ├── Activity/          Attività
│   │   ├── Reports/           KPI e report
│   │   └── DeviceStatus/      Stato dispositivi
│   └── services/
│       └── traccarApi.ts     "ponte" verso Traccar (per ora solo commenti/documentazione,
│                              nessuna pagina lo usa ancora)
```

Ogni pagina vive nella propria cartella sotto `src/pages/`: quando la
riempiremo di contenuto reale, tabelle, mappa ecc., i suoi file (componenti
piccoli, dati mock, stili) staranno tutti lì dentro, senza sporcare le altre
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

## Cosa fa già e cosa non fa ancora

**Fa già:**

- Mostra il layout a due colonne (sidebar scura + area contenuto) come la PoC.
- Naviga tra le 7 sezioni tramite i link della sidebar, con evidenziazione
  della voce attiva e URL che cambia (es. `/veicoli`, `/allarmi`...).
- Ha un orologio funzionante in alto a destra, come nella PoC.

**Non fa ancora (arriverà nei prossimi passi):**

- Nessuna sezione mostra dati veri: sono tutte un riquadro segnaposto.
- La mappa, le tabelle, i grafici e le azioni (es. "Presa in carico") non
  esistono ancora.
- Nessuna connessione a un Traccar Server reale: `src/services/traccarApi.js`
  esiste solo come documentazione di cosa dovrà fare.

## Prossimi passi pianificati

1. Sezione **Mappa operativa**: lista veicoli (con dati finti/mock) + mappa
   Leaflet con i marker della flotta.
2. Sezione **Anagrafica veicoli**: tabella + vista di dettaglio.
3. Modulo dati "mock" condiviso, pronto per essere sostituito dalle chiamate
   reali a `traccarApi.js`.
4. Le altre sezioni (Allarmi, Manutenzione, Attività, KPI, Stato dispositivi).
5. Collegamento vero a Traccar Server: login, `GET /api/devices`,
   `GET /api/positions`, WebSocket per gli aggiornamenti live — seguendo lo
   stesso schema della web app ufficiale (`SocketController.jsx`,
   `store/session.js`, `store/devices.js` nel repo `traccar/traccar-web`).

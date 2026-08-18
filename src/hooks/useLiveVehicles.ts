// ─────────────────────────────────────────────────────────────────────────
// useLiveVehicles — hook per la Mappa operativa AGGIORNATA IN TEMPO REALE.
// ─────────────────────────────────────────────────────────────────────────
// Fino allo Step 6b, MapView usava useAsyncData(fetchVehicles): una SOLA
// chiamata REST al montaggio della pagina, poi più nulla — se un veicolo si
// muoveva sul serio, la mappa lo scopriva solo ricaricando la pagina.
//
// Da questo step, invece:
//   1. Al primo montaggio, facciamo comunque una chiamata REST completa
//      (GET /api/devices + GET /api/positions) per mostrare subito
//      qualcosa: il WebSocket da solo non "racconta la storia" di un
//      dispositivo finché quel dispositivo non manda una novità.
//   2. Poi apriamo una connessione WebSocket verso /api/socket: da quel
//      momento Traccar ci invia da solo, in tempo reale, SOLO le novità
//      (non serve più richiedere nulla noi).
//   3. Se la connessione si interrompe (rete assente, riavvio del server,
//      sessione scaduta...) la riapriamo automaticamente dopo una breve
//      pausa, rifacendo prima una chiamata REST completa per non perdere
//      aggiornamenti avvenuti "alla cieca" durante l'interruzione.
//
// Questo file segue lo stesso pattern architetturale della web app
// ufficiale di Traccar (src/SocketController.jsx), semplificato per non
// dipendere da Redux (qui usiamo solo React Context + hook, coerentemente
// col resto di questo progetto).

import { useEffect, useRef, useState } from 'react';
import type { Vehicle } from '../types/vehicle';
import type { TraccarDeviceRaw } from '../types/traccarDevice';
import type { TraccarPositionRaw } from '../types/traccarPosition';
import type { TraccarSocketMessage } from '../types/traccarSocketMessage';
import { getDevices, getPositions } from '../services/traccarApi';
import { buildVehicles } from '../services/fleetService';

/** Le informazioni che MapView riceve da questo hook. */
interface LiveVehiclesState {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  error: string | null;
  // true quando il WebSocket è attualmente connesso e quindi i dati sulla
  // mappa si aggiornano da soli in tempo reale; false durante il primo
  // caricamento o mentre stiamo tentando di riconnetterci.
  isLive: boolean;
}

// Se la connessione WebSocket si chiude in modo INATTESO (non per un logout
// volontario), aspettiamo questo tanto prima di riprovare a connetterci. La
// web app ufficiale di Traccar usa 60 secondi; per un'app con pochi utenti
// come questa scegliamo un valore più breve, così l'utente si accorge prima
// che la connessione è tornata disponibile.
const RECONNECT_DELAY_MS = 5000;

export function useLiveVehicles(): LiveVehiclesState {
  const [state, setState] = useState<LiveVehiclesState>({
    vehicles: null,
    isLoading: true,
    error: null,
    isLive: false,
  });

  // I dati "grezzi" più recenti conosciuti per ogni dispositivo/posizione,
  // indicizzati per id. Usiamo delle Map dentro useRef (non useState)
  // perché possono cambiare molto spesso (un messaggio del WebSocket ogni
  // pochi secondi): aggiornarle non deve da sola causare un re-render,
  // altrimenti rischieremmo tanti render quanti sono i messaggi ricevuti.
  // Ricalcoliamo invece "vehicles" (quello sì in useState) una volta sola
  // dopo ogni aggiornamento delle Map.
  const devicesByIdRef = useRef(new Map<number, TraccarDeviceRaw>());
  const positionsByIdRef = useRef(new Map<number, TraccarPositionRaw>());

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Diventa true quando la pagina che usa questo hook viene smontata (es.
  // l'utente cambia sezione): serve per NON riconnetterci più e per NON
  // chiamare setState su un componente che React ha già distrutto.
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    isUnmountedRef.current = false;

    /** Ricalcola l'array di Vehicle dalle Map correnti e aggiorna lo stato
     * React: è l'UNICO modo in cui MapView "si accorge" di un cambiamento,
     * sia esso il caricamento iniziale o una singola posizione aggiornata. */
    function recomputeVehicles() {
      const vehicles = buildVehicles(
        Array.from(devicesByIdRef.current.values()),
        Array.from(positionsByIdRef.current.values()),
      );
      setState((precedente) => ({ ...precedente, vehicles }));
    }

    /** Applica un aggiornamento PARZIALE di dispositivi ricevuto dal
     * WebSocket: sovrascrive solo le voci ricevute, lasciando invariate
     * tutte le altre già presenti in Map (un messaggio del WebSocket non
     * contiene mai l'elenco completo, solo ciò che è cambiato). */
    function mergeDevices(devices: TraccarDeviceRaw[]) {
      devices.forEach((device) => devicesByIdRef.current.set(device.id, device));
      recomputeVehicles();
    }

    function mergePositions(positions: TraccarPositionRaw[]) {
      positions.forEach((position) =>
        positionsByIdRef.current.set(position.deviceId, position),
      );
      recomputeVehicles();
    }

    /** Scarica l'elenco COMPLETO di dispositivi e posizioni via le normali
     * chiamate REST (le stesse dello Step 6b) e sostituisce interamente il
     * contenuto delle Map. Usata sia al primissimo avvio sia come "rete di
     * sicurezza" ogni volta che il WebSocket si è interrotto e si sta per
     * riconnettere, per non perdere aggiornamenti persi nel frattempo. */
    async function loadFullSnapshot() {
      const [devices, positions] = await Promise.all([getDevices(), getPositions()]);
      devicesByIdRef.current = new Map(devices.map((device) => [device.id, device]));
      positionsByIdRef.current = new Map(
        positions.map((position) => [position.deviceId, position]),
      );
      recomputeVehicles();
    }

    function clearPendingReconnect() {
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }

    /** Apre (o riapre, in caso di riconnessione) la connessione WebSocket
     * verso /api/socket. */
    function connectSocket() {
      clearPendingReconnect();

      // "wss:" se la pagina è servita in HTTPS, altrimenti "ws:": il
      // WebSocket eredita lo stesso schema (sicuro o no) della pagina che
      // lo apre, esattamente come fa la web app ufficiale di Traccar
      // (src/SocketController.jsx). In sviluppo window.location è
      // "http://localhost:5173", quindi qui useremo sempre "ws:".
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}/api/socket`);
      socketRef.current = socket;

      socket.onopen = () => {
        if (isUnmountedRef.current) return;
        setState((precedente) => ({ ...precedente, isLive: true, error: null }));
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        if (isUnmountedRef.current) return;
        // Ogni messaggio è un oggetto JSON con chiavi opzionali: una
        // chiave assente significa "nessuna novità di quel tipo in questo
        // messaggio", non un array vuoto (vedi commenti in
        // src/types/traccarSocketMessage.ts).
        const message = JSON.parse(event.data) as TraccarSocketMessage;
        if (message.devices) mergeDevices(message.devices);
        if (message.positions) mergePositions(message.positions);
        // message.events: lo gestiremo in un prossimo step, insieme al
        // collegamento reale della pagina "Allarmi e regole".
      };

      socket.onclose = () => {
        socketRef.current = null;
        if (isUnmountedRef.current) return;
        setState((precedente) => ({ ...precedente, isLive: false }));

        // La chiusura non è stata voluta da noi (non abbiamo un logout in
        // corso, altrimenti il cleanup qui sotto avrebbe già impostato
        // isUnmountedRef=true e saremmo usciti alla riga precedente):
        // programmiamo un tentativo di riconnessione dopo una breve pausa.
        clearPendingReconnect();
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isUnmountedRef.current) return;
          // Prima di riaprire il socket, riallineiamo tutto con una
          // chiamata REST completa: potremmo aver perso messaggi durante
          // l'interruzione (es. il PC è stato in sospensione).
          loadFullSnapshot()
            .catch(() => {
              // Se anche la chiamata REST fallisce (es. sessione scaduta,
              // server ancora spento) non blocchiamo l'utente con un
              // ulteriore messaggio d'errore: ci riproverà comunque il
              // prossimo tentativo di connessione, più sotto.
            })
            .finally(() => {
              if (!isUnmountedRef.current) connectSocket();
            });
        }, RECONNECT_DELAY_MS);
      };
    }

    // Sequenza di avvio della pagina:
    //   1) primo caricamento completo via REST (per mostrare subito
    //      qualcosa, senza aspettare il primo messaggio del WebSocket);
    //   2) apertura del WebSocket per tutti gli aggiornamenti successivi.
    loadFullSnapshot()
      .then(() => {
        if (!isUnmountedRef.current) {
          setState((precedente) => ({ ...precedente, isLoading: false }));
          connectSocket();
        }
      })
      .catch((erroreCatturato: unknown) => {
        if (!isUnmountedRef.current) {
          const messaggio =
            erroreCatturato instanceof Error
              ? erroreCatturato.message
              : 'Errore sconosciuto.';
          setState((precedente) => ({
            ...precedente,
            isLoading: false,
            error: messaggio,
          }));
        }
      });

    // Funzione di cleanup: React la esegue quando MapView viene smontato
    // (es. l'utente naviga su un'altra sezione del menu). Chiudiamo la
    // connessione e annulliamo qualunque riconnessione già programmata,
    // altrimenti continuerebbero a "girare" inutilmente in background anche
    // dopo che l'utente ha lasciato la pagina.
    return () => {
      isUnmountedRef.current = true;
      clearPendingReconnect();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  return state;
}

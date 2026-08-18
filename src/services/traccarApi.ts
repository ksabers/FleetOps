// ─────────────────────────────────────────────────────────────────────────
// traccarApi.ts — il "ponte" verso il vero Traccar Server.
// ─────────────────────────────────────────────────────────────────────────
import type { TraccarUser } from '../types/traccarUser';
import type { TraccarDeviceRaw } from '../types/traccarDevice';
import type { TraccarPositionRaw } from '../types/traccarPosition';
import type { TraccarEventRaw } from '../types/traccarEvent';

// Questo file è UN SOLO punto del progetto in cui vive tutto il codice che
// parla con Traccar via rete. Dallo Step 6a le funzioni di login/sessione
// sono collegate DAVVERO al server; dallo Step 6b anche dispositivi e
// posizioni sono chiamate reali; dallo Step 6c anche gli eventi (storico
// via REST) e gli aggiornamenti in tempo reale (WebSocket, vedi
// src/hooks/useLiveVehicles.ts) sono collegati DAVVERO — nessuna funzione
// di questo file resta più uno "stub".
// Vantaggi di isolare questa logica qui invece che dentro ai componenti
// delle pagine:
//   - Se Traccar cambia un endpoint, si corregge in un posto solo.
//   - Le pagine (MapView, VehicleRegistry, ...) chiederanno semplicemente
//     "dammi i veicoli" senza sapere se i dati arrivano da un server remoto,
//     da dati finti (mock) o da una cache: potremo scambiare l'implementazione
//     senza toccare la UI.
//   - Rispecchia come fa la stessa web app ufficiale di Traccar: nel loro
//     codice sorgente (repo traccar-web) esiste un piccolo helper analogo,
//     "src/common/util/fetchOrThrow.js", usato da tutte le chiamate REST.
//
// Traccar espone una API REST molto semplice, documentata su:
//   https://www.traccar.org/api-reference/
// I concetti principali che useremo più avanti:
//
//   1. Login/sessione:
//        POST /api/session   (body: email, password)
//      Il server risponde impostando un cookie di sessione; le chiamate
//      successive dal browser lo includono automaticamente (fetch con
//      { credentials: 'include' }).
//
//   2. Elenco veicoli/dispositivi (REALE dallo Step 6b):
//        GET /api/devices
//      Restituisce un array di oggetti Device: { id, name, uniqueId,
//      status, lastUpdate, category, attributes: {...}, ... }. Vedi la
//      forma completa in src/types/traccarDevice.ts.
//
//   3. Ultima posizione nota di ogni dispositivo (REALE dallo Step 6b):
//        GET /api/positions
//      Restituisce un array di Position: { deviceId, latitude, longitude,
//      speed (in NODI, non km/h!), course, fixTime, attributes: {...}, ... }.
//      Vedi la forma completa in src/types/traccarPosition.ts. La
//      "traduzione" di Device+Position nel nostro tipo Vehicle (usato dalla
//      Mappa operativa) avviene in src/services/fleetService.ts, non qui:
//      questo file resta un semplice "ponte" verso Traccar, senza sapere
//      nulla della forma dei dati che usa la nostra UI.
//
//   4. Storico eventi/allarmi (REALE dallo Step 6c):
//        GET /api/reports/events?deviceId=...&from=...&to=...
//      Attenzione: NON è "/api/events" (quel percorso restituisce un
//      singolo evento dato il suo id, GET /api/events/{id} — utile solo se
//      si conosce già l'id esatto). Per un INTERVALLO di tempo, come serve
//      alla pagina "Allarmi e regole", l'endpoint giusto è quello sotto
//      "/api/reports/*" insieme agli altri report (rotte, riepiloghi...).
//      Richiede SEMPRE almeno un deviceId o un groupId, oltre a from/to in
//      formato ISO 8601.
//
//   5. Aggiornamenti in tempo reale (REALE dallo Step 6c):
//        WebSocket su  wss://<server>/api/socket
//      Il server invia via socket gli stessi oggetti Device/Position/Event
//      non appena cambiano, evitando di dover fare "polling" (richieste
//      ripetute) per sapere se qualcosa è cambiato. È quello che la web app
//      ufficiale gestisce nel file "src/SocketController.jsx"; la nostra
//      versione (più semplice, senza Redux) vive in
//      src/hooks/useLiveVehicles.ts e non in questo file, perché quel
//      codice deve anche sapere come "unire" i messaggi ricevuti con lo
//      stato già presente nella pagina — cosa che un semplice "ponte" REST
//      come questo file non fa per nessun'altra funzione.

// ─────────────────────────────────────────────────────────────────────────
// Step 6a — Autenticazione reale.
// ─────────────────────────────────────────────────────────────────────────
// Percorso dell'endpoint di sessione. Nota importante: NON scriviamo qui
// l'indirizzo completo del server (es. "http://localhost:8082/api/session").
// Usiamo invece un percorso RELATIVO ("/api/session"): il browser lo invia
// allo stesso indirizzo/porta da cui è stata caricata la pagina (in
// sviluppo, http://localhost:5173). È il server di sviluppo di Vite che,
// grazie alla configurazione "server.proxy" in vite.config.ts, intercetta
// ogni richiesta che comincia con "/api" e la ritrasmette lui stesso al
// vero server Traccar (http://localhost:8082), restituendo la risposta
// come se arrivasse dalla stessa origine. Questo evita completamente i
// problemi di CORS (Cross-Origin Resource Sharing): il browser non si
// accorge mai che i dati vengono "da un altro posto", quindi non serve
// configurare nulla sul server Traccar stesso.
const SESSION_URL = '/api/session';

/**
 * Traduce la risposta JSON grezza di Traccar (che contiene MOLTI più campi
 * di quelli che ci servono) nel nostro tipo "ridotto" TraccarUser.
 * Isoliamo questa conversione in una funzione sola: se un giorno ci servirà
 * un campo in più, si aggiunge qui, non in ogni punto che legge un utente.
 */
function toTraccarUser(raw: unknown): TraccarUser {
  // "raw" arriva tipato "unknown" (non sappiamo a priori la sua forma: è
  // JSON arrivato dalla rete). Il cast "as" qui sotto dice a TypeScript
  // "fidati, ho controllato io che i campi ci siano": è un compromesso
  // accettabile perché Traccar è un'API esterna che non possiamo tipizzare
  // in automatico, ma teniamolo in un unico punto isolato come questo.
  const record = raw as Record<string, unknown>;
  return {
    id: Number(record.id),
    name: String(record.name ?? record.email ?? 'Utente'),
    email: String(record.email ?? ''),
    administrator: Boolean(record.administrator),
  };
}

/**
 * Effettua il login sul server Traccar.
 *   POST /api/session
 *   Content-Type: application/x-www-form-urlencoded
 *   Corpo: email=...&password=...
 *
 * In caso di successo, Traccar risponde con lo stesso oggetto "User" (JSON)
 * e imposta un COOKIE DI SESSIONE nella risposta HTTP: il browser lo
 * salva da solo (non dobbiamo maneggiarlo noi in JavaScript) e lo rimanda
 * automaticamente in ogni chiamata successiva, PURCHÉ la chiamata includa
 * l'opzione "credentials: 'include'" — senza, il browser per sicurezza non
 * invierebbe il cookie e Traccar risponderebbe sempre "non autenticato".
 */
export async function login(email: string, password: string): Promise<TraccarUser> {
  // URLSearchParams costruisce da solo il corpo nel formato
  // "application/x-www-form-urlencoded" (es. "email=a%40b.it&password=..."),
  // occupandosi anche di codificare correttamente i caratteri speciali.
  const body = new URLSearchParams({ email, password });

  const response = await fetch(SESSION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    credentials: 'include',
  });

  if (!response.ok) {
    // Traccar risponde 401 Unauthorized quando email/password sono errate.
    if (response.status === 401) {
      throw new Error('Email o password non corretti.');
    }
    throw new Error(
      `Il server Traccar ha risposto con un errore (HTTP ${response.status}).`,
    );
  }

  return toTraccarUser(await response.json());
}

/**
 * Controlla se esiste già una sessione valida (es. l'utente aveva già
 * effettuato il login e poi ha semplicemente ricaricato la pagina: il
 * cookie di sessione è ancora presente nel browser).
 *   GET /api/session
 *
 * A differenza di login(), qui un 401 NON è un errore imprevisto: significa
 * solo "nessuna sessione attiva", cioè l'utente deve effettuare il login.
 * Per questo restituiamo `null` invece di lanciare un'eccezione: chi chiama
 * questa funzione (AuthContext) può distinguere facilmente i due casi.
 */
export async function getSession(): Promise<TraccarUser | null> {
  const response = await fetch(SESSION_URL, { credentials: 'include' });

  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `Il server Traccar ha risposto con un errore (HTTP ${response.status}).`,
    );
  }

  return toTraccarUser(await response.json());
}

/**
 * Effettua il logout, chiedendo al server di invalidare il cookie di
 * sessione corrente.
 *   DELETE /api/session
 */
export async function logout(): Promise<void> {
  await fetch(SESSION_URL, { method: 'DELETE', credentials: 'include' });
  // Non controlliamo la risposta: anche se qualcosa va storto lato server,
  // dal punto di vista dell'utente FleetOps vogliamo comunque tornare alla
  // schermata di login (il cookie, nel dubbio, viene comunque scartato).
}

// ─────────────────────────────────────────────────────────────────────────
// Step 6b — Dispositivi e posizioni reali.
// ─────────────────────────────────────────────────────────────────────────
const DEVICES_URL = '/api/devices';
const POSITIONS_URL = '/api/positions';

/**
 * Recupera l'elenco dei dispositivi/veicoli.
 *   GET /api/devices
 *
 * Restituisce SOLO i dispositivi dell'utente che ha fatto login (Traccar
 * filtra automaticamente in base al cookie di sessione, non serve alcun
 * parametro). Nota che questa è la forma "grezza" di Traccar
 * (TraccarDeviceRaw), non ancora il nostro tipo Vehicle: la traduzione
 * avviene in src/services/fleetService.ts.
 */
export async function getDevices(): Promise<TraccarDeviceRaw[]> {
  const response = await fetch(DEVICES_URL, {
    credentials: 'include',
    // Chiediamo esplicitamente JSON: senza questo header, in alcuni casi
    // (es. richiesta fatta digitando l'URL a mano nel browser) Traccar
    // potrebbe rispondere con un formato diverso (es. CSV).
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Il server Traccar ha risposto con un errore (HTTP ${response.status}) ` +
        'durante il recupero dei dispositivi.',
    );
  }

  return (await response.json()) as TraccarDeviceRaw[];
}

/**
 * Recupera l'ULTIMA posizione nota di ogni dispositivo (senza parametri,
 * Traccar restituisce solo l'ultima posizione per dispositivo, non la
 * cronologia: è esattamente quello che serve alla Mappa operativa).
 *   GET /api/positions
 */
export async function getPositions(): Promise<TraccarPositionRaw[]> {
  const response = await fetch(POSITIONS_URL, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Il server Traccar ha risposto con un errore (HTTP ${response.status}) ` +
        'durante il recupero delle posizioni.',
    );
  }

  return (await response.json()) as TraccarPositionRaw[];
}

// ─────────────────────────────────────────────────────────────────────────
// Step 6c — Storico eventi/allarmi.
// ─────────────────────────────────────────────────────────────────────────
const REPORTS_EVENTS_URL = '/api/reports/events';

/**
 * Recupera lo storico eventi (allarmi, ingressi/uscite da geofence, ecc.)
 * di uno o più dispositivi in un intervallo di tempo.
 *   GET /api/reports/events?deviceId=...&from=...&to=...
 *
 * Traccar richiede OBBLIGATORIAMENTE almeno un deviceId (o un groupId, che
 * qui non usiamo): per questo il parametro non è opzionale, a differenza
 * di getDevices()/getPositions() che non ne hanno bisogno (filtrano già
 * in automatico in base alla sessione). Se la flotta ha più dispositivi e
 * servono gli eventi di tutti, chi chiama questa funzione passa l'intero
 * array di id (es. quelli restituiti da getDevices()).
 *
 * NOTA: questa funzione è pronta ma ancora NON collegata a nessuna pagina
 * — la pagina "Allarmi e regole" (src/pages/Alarms) mostra ancora dati
 * mock. Collegarla richiede prima di decidere come tradurre un evento
 * Traccar (deviceId + type + attributes) nel nostro tipo Alarm (che si
 * aspetta già una targa/veicolo leggibile, non un id numerico): lo
 * affronteremo in un prossimo step dedicato, per non appesantire questo.
 *
 * @param deviceIds Elenco degli id dei dispositivi di cui vogliamo lo
 *   storico (almeno uno).
 * @param from Inizio dell'intervallo di tempo.
 * @param to Fine dell'intervallo di tempo.
 */
export async function getEvents(
  deviceIds: number[],
  from: Date,
  to: Date,
): Promise<TraccarEventRaw[]> {
  if (deviceIds.length === 0) {
    // Fallire qui, in modo esplicito e comprensibile, è preferibile a
    // lasciare che sia Traccar a rispondere con un generico HTTP 400: chi
    // ha scritto il codice che chiama questa funzione capisce subito qual
    // è l'errore (manca l'id) senza dover ispezionare la risposta di rete.
    throw new Error('getEvents(): serve almeno un deviceId.');
  }

  // URLSearchParams non supporta nativamente "la stessa chiave ripetuta
  // più volte" tramite il costruttore a oggetto (es. { deviceId: [1, 2] }
  // produrrebbe "deviceId=1%2C2", una singola chiave con virgola: NON è
  // quello che Traccar si aspetta). Costruiamo quindi i parametri a mano
  // con .append(), che invece permette chiavi ripetute
  // ("deviceId=1&deviceId=2"), il formato che Traccar richiede per un
  // parametro "Array of integers".
  const params = new URLSearchParams();
  deviceIds.forEach((id) => params.append('deviceId', String(id)));
  params.set('from', from.toISOString());
  params.set('to', to.toISOString());

  const response = await fetch(`${REPORTS_EVENTS_URL}?${params.toString()}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Il server Traccar ha risposto con un errore (HTTP ${response.status}) ` +
        'durante il recupero degli eventi.',
    );
  }

  return (await response.json()) as TraccarEventRaw[];
}

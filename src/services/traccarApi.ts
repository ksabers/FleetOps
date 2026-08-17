// ─────────────────────────────────────────────────────────────────────────
// traccarApi.ts — il "ponte" verso il vero Traccar Server.
// ─────────────────────────────────────────────────────────────────────────
import type { TraccarUser } from '../types/traccarUser';

// Questo file è UN SOLO punto del progetto in cui vive tutto il codice che
// parla con Traccar via rete. Dallo Step 6a le funzioni di login/sessione
// sono collegate DAVVERO al server (vedi più sotto); dispositivi, posizioni
// ed eventi restano invece ancora "stub" in attesa degli Step 6b/6c.
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
//   2. Elenco veicoli/dispositivi:
//        GET /api/devices
//      Restituisce un array di oggetti Device: { id, name, uniqueId,
//      status, lastUpdate, category, attributes: {...}, ... }.
//      Corrisponde alla nostra pagina "Anagrafica veicoli" / "Stato dispositivi".
//
//   3. Ultima posizione nota di ogni dispositivo:
//        GET /api/positions
//      Restituisce un array di Position: { deviceId, latitude, longitude,
//      speed, course, fixTime, attributes: { ignition, ... }, ... }.
//      Corrisponde alla "Mappa operativa": in questo Step 2 usiamo ancora
//      mockVehicles.ts, ma quando questo servizio sarà collegato per davvero,
//      il suo risultato dovrà poter essere "tradotto" in un array di Vehicle
//      (il tipo definito in src/types/vehicle.ts).
//
//   4. Eventi/allarmi:
//        GET /api/events?deviceId=...&from=...&to=...
//      Corrisponde alla pagina "Allarmi e regole".
//
//   5. Aggiornamenti in tempo reale:
//        WebSocket su  wss://<server>/api/socket
//      Il server invia via socket gli stessi oggetti Device/Position/Event
//      non appena cambiano, evitando di dover fare "polling" (richieste
//      ripetute) per sapere se qualcosa è cambiato. È quello che la web app
//      ufficiale gestisce nel file "src/SocketController.jsx".
//
// Per le funzioni non ancora collegate (dispositivi, posizioni, eventi)
// esponiamo solo la "forma" (le firme, con i loro tipi di ingresso/uscita)
// con un corpo che genera un errore esplicito: così se qualcuno le richiama
// per sbaglio prima del tempo, il messaggio in console lo dice chiaramente
// invece di fallire in modo silenzioso o confuso. Arriveranno negli Step
// 6b (dispositivi/posizioni) e 6c (eventi/WebSocket).

function notImplemented(nomeFunzione: string): never {
  throw new Error(
    `traccarApi.${nomeFunzione}(): non ancora collegato a un vero server Traccar. ` +
      'Per ora le pagine usano dati mock da src/data/mockVehicles.ts.',
  );
}

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

/** Recupera l'elenco dei dispositivi/veicoli (GET /api/devices). */
export async function getDevices(): Promise<never> {
  return notImplemented('getDevices');
}

/** Recupera le posizioni correnti di tutti i dispositivi (GET /api/positions). */
export async function getPositions(): Promise<never> {
  return notImplemented('getPositions');
}

/** Recupera gli eventi/allarmi in un intervallo di tempo (GET /api/events). */
export async function getEvents(_from: Date, _to: Date): Promise<never> {
  return notImplemented('getEvents');
}

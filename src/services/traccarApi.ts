// ─────────────────────────────────────────────────────────────────────────
// traccarApi.ts — il futuro "ponte" verso il vero Traccar Server.
// ─────────────────────────────────────────────────────────────────────────
// Questo file NON viene ancora usato da nessuna pagina (lo colleghiamo in un
// passo successivo). Lo creiamo già ora, vuoto di logica reale, per fissare
// UN SOLO punto del progetto in cui vivrà tutto il codice che parla con
// Traccar via rete. Vantaggi di isolare questa logica qui invece che dentro
// ai componenti delle pagine:
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
// Per ora esponiamo solo la "forma" (le firme delle funzioni, con i loro
// tipi di ingresso/uscita) che le pagine utilizzeranno in futuro, con un
// corpo che genera un errore esplicito: così se qualcuno le richiama per
// sbaglio prima del tempo, il messaggio in console lo dice chiaramente
// invece di fallire in modo silenzioso o confuso.

function notImplemented(nomeFunzione: string): never {
  throw new Error(
    `traccarApi.${nomeFunzione}(): non ancora collegato a un vero server Traccar. ` +
      'Per ora le pagine usano dati mock da src/data/mockVehicles.ts.',
  );
}

/** Effettua il login sul server Traccar (POST /api/session). */
export async function login(_email: string, _password: string): Promise<never> {
  return notImplemented('login');
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

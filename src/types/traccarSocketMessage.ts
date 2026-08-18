// ─────────────────────────────────────────────────────────────────────────
// Forma di un messaggio ricevuto dal WebSocket di Traccar (GET /api/socket).
// ─────────────────────────────────────────────────────────────────────────
// Differenza fondamentale rispetto alle risposte REST che abbiamo usato
// finora (GET /api/devices, GET /api/positions): quelle restituiscono
// SEMPRE l'elenco COMPLETO. Un messaggio del WebSocket, invece, contiene
// SOLO ciò che è cambiato in quel momento — può includere dispositivi,
// posizioni, eventi, oppure una combinazione qualsiasi di questi tre. Una
// chiave assente nel messaggio significa "nessuna novità di quel tipo",
// NON un array vuoto: per questo tutti i campi sono opzionali (?).
//
// Esempio di messaggio reale (arriva quando un solo veicolo si muove):
//   { "positions": [ { "deviceId": 3, "latitude": 44.3, ... } ] }
// Il campo "devices" qui è del tutto assente, non "devices: []".
//
// Fonte: https://www.traccar.org/traccar-api/ (sezione WebSocket).
import type { TraccarDeviceRaw } from './traccarDevice';
import type { TraccarPositionRaw } from './traccarPosition';

export interface TraccarSocketMessage {
  devices?: TraccarDeviceRaw[];
  positions?: TraccarPositionRaw[];
  // Gli eventi (allarmi, ingresso/uscita da un geofence, ecc.) arriveranno
  // in un prossimo step, insieme al collegamento reale della pagina
  // "Allarmi e regole". Per ora dichiariamo solo che la chiave PUÒ esistere
  // nel messaggio (così TypeScript non si lamenta se la incontriamo), ma
  // non la elaboriamo ancora: da qui "unknown[]" invece di un tipo preciso.
  events?: unknown[];
}

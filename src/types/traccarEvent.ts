// ─────────────────────────────────────────────────────────────────────────
// Forma "grezza" di un Evento Traccar, come arriva da:
//   - GET /api/events?deviceId=...&from=...&to=...   (chiamata REST)
//   - il campo "events" di un messaggio WebSocket      (tempo reale)
// ─────────────────────────────────────────────────────────────────────────
// Un "evento" in Traccar è qualunque cosa degna di nota accaduta a un
// dispositivo: un allarme (type: "alarm", con l'allarme specifico dentro
// attributes.alarm), l'ingresso/uscita da una zona geografica (type:
// "geofenceEnter"/"geofenceExit", con geofenceId compilato), un dispositivo
// che passa online/offline, ecc. Il campo "type" è una stringa libera
// definita da Traccar: i valori possibili sono documentati su
// https://www.traccar.org/api-reference/ ma non sono un enum chiuso lato
// TypeScript, quindi lo trattiamo come "string" e non come union di
// literal — un valore imprevisto non deve rompere la compilazione.
//
// NOTA: questo tipo esiste già (Step 6c) ma NON è ancora usato da nessuna
// pagina: la pagina "Allarmi e regole" (src/pages/Alarms) mostra ancora
// dati mock (src/data/mockAlarms.ts). Collegarla ai dati reali richiede di
// decidere come "tradurre" un TraccarEventRaw nel nostro tipo Alarm (es.
// serve il nome del veicolo, non solo il suo deviceId) — lo affronteremo
// in un prossimo step dedicato, per non appesantire questo.
export interface TraccarEventRaw {
  id: number;
  type: string;
  eventTime: string;
  deviceId: number;
  // 0 quando l'evento non è legato a quella particolare risorsa (es. un
  // evento "deviceOnline" non ha una posizione né una geofence associate).
  positionId: number;
  geofenceId: number;
  maintenanceId: number;
  // Contenuto variabile in base al "type" (es. attributes.alarm per gli
  // allarmi): stessa scelta di "unknown" già vista per Position.attributes.
  attributes: Record<string, unknown>;
}

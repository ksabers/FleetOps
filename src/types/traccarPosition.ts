// ─────────────────────────────────────────────────────────────────────────
// Forma "grezza" di una Position così come la restituisce Traccar.
// ─────────────────────────────────────────────────────────────────────────
// Stessa logica di src/types/traccarDevice.ts: fotografia del JSON che
// arriva da GET /api/positions, non ancora "tradotta" nel nostro Vehicle.
//
// NOTA IMPORTANTE sulla velocità: Traccar restituisce "speed" in NODI
// (unità nautica, "knots"), NON in km/h come il nostro campo Vehicle.speedKmh.
// La conversione (1 nodo = 1,852 km/h) avviene in fleetService.ts.
export interface TraccarPositionRaw {
  /** Identificativo numerico di questa specifica lettura di posizione. */
  id: number;
  /** Id del dispositivo (Device) a cui appartiene questa posizione. */
  deviceId: number;
  /** Data/ora (ISO 8601) in cui il dispositivo GPS ha registrato la posizione. */
  fixTime: string;
  /** true se il dispositivo GPS considera la lettura attendibile (fix valido). */
  valid: boolean;
  latitude: number;
  longitude: number;
  /** Velocità in NODI, non in km/h — vedi nota sopra. */
  speed: number;
  /** Direzione in gradi (0-360, 0 = nord), non ancora usata dalla nostra UI. */
  course: number;
  /**
   * Attributi extra legati a QUESTA posizione (diversi da quelli del
   * dispositivo): qui Traccar mette per esempio "ignition" (accensione),
   * "alarm" (tipo di allarme in corso, se presente), "battery", ecc. Il
   * contenuto dipende dal protocollo del dispositivo GPS, quindi anche qui
   * usiamo un "bag" generico invece di elencare campi che potrebbero non
   * esserci.
   */
  attributes: Record<string, unknown>;
}

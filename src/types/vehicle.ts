// ─────────────────────────────────────────────────────────────────────────
// Tipi condivisi legati al concetto di "veicolo".
// ─────────────────────────────────────────────────────────────────────────
// Li teniamo in un file separato (src/types/) perché più pagine li useranno:
// la Mappa operativa (questo passo), l'Anagrafica veicoli e lo Stato
// dispositivi (passi successivi). Un solo punto in cui è definita la "forma"
// dei dati evita che le pagine si mettano involontariamente d'accordo su
// campi diversi.
//
// In futuro, quando collegheremo il vero Traccar Server (Step 6), questo
// tipo dovrà assomigliare a una combinazione delle risposte di
// GET /api/devices (nome, stato, ultimo aggiornamento) e GET /api/positions
// (latitudine/longitudine, velocità...). Per ora rappresenta i dati "già
// uniti" che ci servono per disegnare la UI — la separazione device/position
// tipica di Traccar la introdurremo quando collegheremo l'API reale.

/**
 * Possibili stati operativi di un veicolo, usati per colorare badge, pallini
 * e marker sulla mappa. Sono una unione di stringhe letterali: TypeScript
 * impedisce di scrivere per errore uno stato che non esiste (es. "mossa"
 * invece di "moving") già mentre scriviamo il codice, senza aspettare di
 * vedere il bug nel browser.
 */
export type VehicleStatus = 'moving' | 'stopped' | 'alarm' | 'offline';

/** Un singolo veicolo della flotta, con la sua ultima posizione conosciuta. */
export interface Vehicle {
  id: string;
  /** Targa del veicolo, es. "AB123CD". */
  plate: string;
  /** Modello/descrizione, es. "Iveco Daily". */
  model: string;
  status: VehicleStatus;
  /** Coordinate dell'ultima posizione nota. */
  latitude: number;
  longitude: number;
  /** Velocità istantanea in km/h (0 se fermo). */
  speedKmh: number;
  /** Nome di chi è al momento alla guida, se assegnato. */
  driver?: string;
  /** Testo leggibile di quando è arrivato l'ultimo aggiornamento GPS. */
  lastUpdateLabel: string;
}

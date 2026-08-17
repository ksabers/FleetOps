// ─────────────────────────────────────────────────────────────────────────
// Forma "grezza" di un Device così come lo restituisce Traccar.
// ─────────────────────────────────────────────────────────────────────────
// Questo NON è il nostro tipo "Vehicle" (src/types/vehicle.ts): è la
// fotografia esatta del JSON che arriva da GET /api/devices, così com'è
// documentato su https://www.traccar.org/api-reference/. Teniamolo separato
// dal nostro Vehicle per due motivi:
//   1. Il JSON di Traccar ha MOLTI più campi di quelli che useremo davvero
//      (es. "phone", "groupId", "disabled"...): elencarli tutti qui, anche
//      se oggi ne ignoriamo alcuni, ci ricorda cosa esiste e ci evita di
//      "inquinare" il tipo Vehicle con dettagli che riguardano solo Traccar.
//   2. Se un giorno cambiassimo fornitore GPS (non più Traccar), basterebbe
//      scrivere un nuovo file "types/altroFornitoreDevice.ts" + una nuova
//      funzione di conversione in fleetService.ts: il tipo Vehicle e tutte
//      le pagine che lo usano non cambierebbero di una virgola.
//
// La conversione VERA in un oggetto Vehicle avviene in
// src/services/fleetService.ts (funzione toVehicle), non qui: questo file
// contiene solo la "forma dei dati", nessuna logica.
export interface TraccarDeviceRaw {
  /** Identificativo numerico assegnato da Traccar (univoco per dispositivo). */
  id: number;
  /** Nome/etichetta del dispositivo: nella pratica è spesso la targa del veicolo. */
  name: string;
  /** Identificativo hardware/protocollo (es. IMEI del modem GPS). Non lo usiamo ancora. */
  uniqueId: string;
  /** Stato della connessione di rete: "online" | "offline" | "unknown". */
  status: 'online' | 'offline' | 'unknown';
  /** true se un amministratore ha disabilitato il dispositivo su Traccar. */
  disabled: boolean;
  /** Data/ora (formato ISO 8601) dell'ultimo aggiornamento noto, o null. */
  lastUpdate: string | null;
  /** Id della sua ultima posizione nota (collega Device <-> Position), o null. */
  positionId: number | null;
  /** Modello del veicolo/dispositivo, se impostato su Traccar (può essere vuoto). */
  model: string | null;
  /**
   * "Contenitore" di attributi personalizzati configurabili su Traccar
   * (es. targa vera, reparto, VIN...). Lo tipizziamo in modo generico
   * ("bag" di chiavi/valori) perché il suo contenuto dipende da come è
   * configurato il server: non possiamo saperlo in anticipo.
   */
  attributes: Record<string, unknown>;
}

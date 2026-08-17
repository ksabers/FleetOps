// ─────────────────────────────────────────────────────────────────────────
// Tipi legati alla MANUTENZIONE (Step 5). In traccar-web esiste già il
// concetto di "Maintenance" agganciato a un dispositivo (vedi
// src/store/maintenances.js nel repo ufficiale): qui lo modelliamo in modo
// semplificato, con una scadenza chilometrica per intervento.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Stato della scadenza:
 *   overdue  -> già superata (km attuali oltre la soglia)
 *   due      -> vicina, entro un margine di attenzione
 *   upcoming -> ancora lontana, solo programmata
 */
export type MaintenanceStatus = 'overdue' | 'due' | 'upcoming';

export interface MaintenanceItem {
  id: string;
  plate: string;
  model: string;
  /** Tipo di intervento, es. "Tagliando", "Cambio olio". */
  item: string;
  odometerKm: number;
  dueText: string;
  status: MaintenanceStatus;
  /** Percentuale 0-100 di "quanto manca" alla scadenza, per la barra colorata. */
  progressPercent: number;
  // Campi mostrati solo quando la riga viene espansa (stessa idea della
  // scheda di dettaglio in Anagrafica veicoli, ma qui "in linea" nella
  // tabella invece che a pagina intera).
  department: string;
  vin: string;
  registrationYear: number;
  fuelType: string;
  trim: string;
  intervalText: string;
  lastServiceText: string;
}

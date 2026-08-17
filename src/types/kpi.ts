// ─────────────────────────────────────────────────────────────────────────
// Tipi legati alla pagina "KPI e report" (Step 5).
// ─────────────────────────────────────────────────────────────────────────
// traccar-web usa la libreria "recharts" per i grafici dei report: la
// valuteremo in un secondo momento. Per ora disegniamo i due grafici della
// PoC (eventi per ora, utilizzo flotta) con semplici <div> ridimensionate
// via CSS: bastano per lo scopo e non aggiungono una dipendenza esterna.

/** Le 4 card numeriche principali, in cima alla pagina. */
export interface FleetKpiSummary {
  activeVehicles: number;
  totalVehicles: number;
  /** Chilometri percorsi da tutta la flotta nella giornata corrente. */
  kmToday: number;
  activeAlarms: number;
  offlineDevices: number;
}

/** Una delle 6 mini-card secondarie (es. "Velocità media", "Tempo fermo"). */
export interface SecondaryKpi {
  label: string;
  value: string;
  /** Colore del valore; se omesso usa il colore di testo standard. */
  color?: string;
}

/** Un punto del grafico a barre "Eventi per ora". */
export interface HourlyEventCount {
  /** Etichetta dell'ora, es. "08" per le 8:00. */
  hourLabel: string;
  count: number;
}

/** Una riga del grafico a barre orizzontali "Utilizzo flotta per stato". */
export interface FleetUtilizationSlice {
  label: string;
  count: number;
  /** Percentuale 0-100 già calcolata, usata per la larghezza della barra. */
  percent: number;
  color: string;
}

/** Tutto ciò che serve alla pagina Report, restituito in un'unica chiamata. */
export interface KpiOverview {
  summary: FleetKpiSummary;
  secondary: SecondaryKpi[];
  hourlyEvents: HourlyEventCount[];
  utilization: FleetUtilizationSlice[];
}

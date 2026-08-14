// ─────────────────────────────────────────────────────────────────────────
// Aspetto visivo (etichetta + colore) per accensione e qualità GPS.
// ─────────────────────────────────────────────────────────────────────────
// Stesso pattern di common/vehicleStatus.ts: due Record<> che TypeScript
// obbliga a tenere completi. Li teniamo in un unico file perché sono due
// "dizionari" piccoli e strettamente legati alla card "Telemetria live"
// della scheda di dettaglio veicolo — non giustificano un file a testa.
import type { IgnitionState, GpsQuality } from '../types/vehicleRegistry';

interface TelemetryStyle {
  label: string;
  color: string;
}

export const ignitionStyles: Record<IgnitionState, TelemetryStyle> = {
  on: { label: 'Accesa', color: 'var(--color-status-moving)' },
  off: { label: 'Spenta', color: 'var(--color-text-secondary)' },
};

export const gpsQualityStyles: Record<GpsQuality, TelemetryStyle> = {
  good: { label: 'Ottima', color: 'var(--color-status-moving)' },
  medium: { label: 'Discreta', color: 'var(--color-status-warning)' },
  poor: { label: 'Scarsa', color: 'var(--color-status-alarm)' },
};

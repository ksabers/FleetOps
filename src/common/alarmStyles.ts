// ─────────────────────────────────────────────────────────────────────────
// Aspetto visivo di severità e stato di un Allarme (etichetta + colori).
// ─────────────────────────────────────────────────────────────────────────
// Stessa idea di common/vehicleStatus.ts: una "tabella di traduzione" unica
// per non ripetere gli stessi colori in più punti (card riepilogo, badge
// nella lista, bordo colorato di ogni riga).
import type { AlarmSeverity, AlarmStatus } from '../types/alarm';

export interface AlarmSeverityStyle {
  label: string;
  color: string;
  /** Sfondo "tenue" per il badge, coerente con il colore pieno. */
  background: string;
}

// "Record<AlarmSeverity, ...>" obbliga a coprire tutti e 3 i valori.
export const alarmSeverityStyles: Record<AlarmSeverity, AlarmSeverityStyle> = {
  critical: {
    label: 'Critico',
    color: 'var(--color-status-alarm)',
    background: 'var(--color-status-alarm-bg)',
  },
  warning: {
    label: 'Attenzione',
    color: 'var(--color-status-warning)',
    background: 'var(--color-status-warning-bg)',
  },
  info: {
    label: 'Informativo',
    color: 'var(--color-sidebar-active)',
    background: 'var(--color-status-info-bg)',
  },
};

export interface AlarmStatusStyle {
  label: string;
  color: string;
  background: string;
}

export const alarmStatusStyles: Record<AlarmStatus, AlarmStatusStyle> = {
  new: {
    label: 'Nuovo',
    color: '#ffffff',
    background: 'var(--color-status-alarm)',
  },
  ack: {
    label: 'In carico',
    color: '#ffffff',
    background: 'var(--color-status-warning)',
  },
  closed: {
    label: 'Chiuso',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-app-bg)',
  },
};

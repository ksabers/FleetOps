// ─────────────────────────────────────────────────────────────────────────
// Aspetto visivo di ogni MaintenanceStatus (etichetta + colori).
// ─────────────────────────────────────────────────────────────────────────
import type { MaintenanceStatus } from '../types/maintenanceItem';

export interface MaintenanceStatusStyle {
  label: string;
  color: string;
  background: string;
}

export const maintenanceStatusStyles: Record<MaintenanceStatus, MaintenanceStatusStyle> =
  {
    overdue: {
      label: 'Scaduta',
      color: 'var(--color-status-alarm)',
      background: 'var(--color-status-alarm-bg)',
    },
    due: {
      label: 'In scadenza',
      color: 'var(--color-status-warning)',
      background: 'var(--color-status-warning-bg)',
    },
    upcoming: {
      label: 'Programmata',
      color: 'var(--color-status-moving)',
      background: 'var(--color-status-moving-bg)',
    },
  };

// ─────────────────────────────────────────────────────────────────────────
// Aspetto visivo di InstallStatus e ConnectivityStatus (etichetta + colori).
// ─────────────────────────────────────────────────────────────────────────
import type { InstallStatus, ConnectivityStatus } from '../types/deviceStatus';

export interface InstallStatusStyle {
  label: string;
  color: string;
  background: string;
}

export const installStatusStyles: Record<InstallStatus, InstallStatusStyle> = {
  installed: {
    label: 'Installato',
    color: 'var(--color-status-moving)',
    background: 'var(--color-status-moving-bg)',
  },
  pending: {
    label: 'In verifica',
    color: 'var(--color-status-warning)',
    background: 'var(--color-status-warning-bg)',
  },
  issue: {
    label: 'Anomalia',
    color: 'var(--color-status-alarm)',
    background: 'var(--color-status-alarm-bg)',
  },
};

/** Qui basta un colore: la connettività si mostra come pallino + etichetta,
 * senza badge con sfondo (vedi DeviceStatusTable.tsx). */
export interface ConnectivityStyle {
  label: string;
  color: string;
}

export const connectivityStyles: Record<ConnectivityStatus, ConnectivityStyle> = {
  online: { label: 'Online', color: 'var(--color-status-moving)' },
  weak: { label: 'Segnale debole', color: 'var(--color-status-warning)' },
  offline: { label: 'Offline', color: 'var(--color-status-alarm)' },
};

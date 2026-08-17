// ─────────────────────────────────────────────────────────────────────────
// Aspetto visivo di ogni ActivityType (etichetta + colori del badge).
// ─────────────────────────────────────────────────────────────────────────
import type { ActivityType } from '../types/activityEntry';

export interface ActivityTypeStyle {
  label: string;
  color: string;
  background: string;
}

export const activityTypeStyles: Record<ActivityType, ActivityTypeStyle> = {
  ack: {
    label: 'Presa in carico',
    color: 'var(--color-status-warning)',
    background: 'var(--color-status-warning-bg)',
  },
  escalate: {
    label: 'Escalation',
    color: '#c2410c',
    background: 'var(--color-status-warning-bg)',
  },
  close: {
    label: 'Chiusura',
    color: 'var(--color-status-moving)',
    background: 'var(--color-status-moving-bg)',
  },
};

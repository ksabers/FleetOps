// ─────────────────────────────────────────────────────────────────────────
// Dati finti (mock) della pagina KPI e report.
// ─────────────────────────────────────────────────────────────────────────
// I numeri di riepilogo (veicoli attivi, allarmi attivi, dispositivi
// offline) sono calcolati "a mano" qui per restare coerenti con
// mockVehicles/mockAlarms/mockDevices, invece di essere inventati a caso:
//   - Veicoli attivi = i 6 su 7 NON offline (v5 è offline in mockVehicles).
//   - Allarmi attivi = i 5 su 7 allarmi con stato diverso da "closed".
//   - Dispositivi offline = v4 e v5 in mockDevices (connectivity: 'offline').
// In un secondo momento questi tre numeri potrebbero essere calcolati al
// volo leggendo direttamente gli altri mock invece di essere ripetuti qui;
// per ora li scriviamo esplicitamente per tenere il file semplice da capire.
import type { KpiOverview } from '../types/kpi';

export const mockKpiOverview: KpiOverview = {
  summary: {
    activeVehicles: 6,
    totalVehicles: 7,
    kmToday: 1284,
    activeAlarms: 5,
    offlineDevices: 2,
  },
  secondary: [
    { label: 'Velocità media flotta', value: '52 km/h' },
    { label: 'Tempo medio di sosta', value: '18 min' },
    { label: 'Allarmi chiusi oggi', value: '1', color: 'var(--color-status-moving)' },
    { label: 'Tempo medio di presa in carico', value: '6 min' },
    { label: 'Km medi per veicolo', value: '183 km' },
    { label: 'Interventi in scadenza', value: '2', color: 'var(--color-status-warning)' },
  ],
  hourlyEvents: [
    { hourLabel: '07', count: 3 },
    { hourLabel: '08', count: 6 },
    { hourLabel: '09', count: 5 },
    { hourLabel: '10', count: 8 },
    { hourLabel: '11', count: 4 },
    { hourLabel: '12', count: 2 },
    { hourLabel: '13', count: 1 },
    { hourLabel: '14', count: 3 },
    { hourLabel: '15', count: 7 },
    { hourLabel: '16', count: 9 },
    { hourLabel: '17', count: 5 },
    { hourLabel: '18', count: 2 },
  ],
  utilization: [
    { label: 'In movimento', count: 3, percent: 43, color: 'var(--color-status-moving)' },
    {
      label: 'Fermi (motore acceso)',
      count: 2,
      percent: 29,
      color: 'var(--color-status-stopped)',
    },
    { label: 'In allarme', count: 1, percent: 14, color: 'var(--color-status-alarm)' },
    { label: 'Offline', count: 1, percent: 14, color: 'var(--color-status-offline)' },
  ],
};

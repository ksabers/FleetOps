// ─────────────────────────────────────────────────────────────────────────
// Dati finti (mock) delle scadenze di MANUTENZIONE.
// ─────────────────────────────────────────────────────────────────────────
// Come già fatto in mockFleetRegistry.ts, partiamo dai veicoli/anagrafica
// già esistenti (mockFleetRegistry) e aggiungiamo solo i campi specifici
// della manutenzione (tipo intervento, scadenza, percentuale...). Così la
// riga espansa della tabella può mostrare Reparto/VIN/Alimentazione senza
// doverli riscrivere qui una seconda volta.
import type { MaintenanceItem, MaintenanceStatus } from '../types/maintenanceItem';
import { mockFleetRegistry } from './mockFleetRegistry';

/** Solo i campi che NON provengono già dall'anagrafica del veicolo. */
interface MaintenanceExtras {
  item: string;
  dueText: string;
  status: MaintenanceStatus;
  progressPercent: number;
  intervalText: string;
  lastServiceText: string;
}

const maintenanceExtrasById: Record<string, MaintenanceExtras> = {
  v1: {
    item: 'Tagliando 80.000 km',
    dueText: 'Scaduta da 4.210 km',
    status: 'overdue',
    progressPercent: 100,
    intervalText: 'Ogni 40.000 km',
    lastServiceText: '15/03/2024 — 40.000 km',
  },
  v2: {
    item: 'Revisione periodica',
    dueText: 'Scaduta da 12 giorni',
    status: 'overdue',
    progressPercent: 100,
    intervalText: 'Ogni 2 anni',
    lastServiceText: '02/2022',
  },
  v3: {
    item: 'Cambio olio e filtri',
    dueText: 'Entro 700 km',
    status: 'due',
    progressPercent: 88,
    intervalText: 'Ogni 30.000 km',
    lastServiceText: '10/06/2024 — 15.000 km',
  },
  v4: {
    item: 'Controllo freni',
    dueText: 'Entro 5 giorni',
    status: 'due',
    progressPercent: 82,
    intervalText: 'Ogni 12 mesi',
    lastServiceText: '20/08/2023',
  },
  v5: {
    item: 'Tagliando 160.000 km',
    dueText: 'Programmata: tra 3.300 km',
    status: 'upcoming',
    progressPercent: 40,
    intervalText: 'Ogni 40.000 km',
    lastServiceText: '05/01/2024 — 120.000 km',
  },
  v6: {
    item: 'Cambio pneumatici stagionali',
    dueText: 'Programmata: 15/11/2025',
    status: 'upcoming',
    progressPercent: 25,
    intervalText: 'Ogni 6 mesi',
    lastServiceText: '15/05/2025',
  },
  v7: {
    item: 'Cambio olio e filtri',
    dueText: 'Programmata: tra 9.100 km',
    status: 'upcoming',
    progressPercent: 15,
    intervalText: 'Ogni 30.000 km',
    lastServiceText: '02/02/2024 — 45.000 km',
  },
};

// Stessa tecnica di "map + spread" già vista in mockFleetRegistry.ts:
// prendiamo ogni voce di anagrafica e la trasformiamo in una voce di
// manutenzione unendo i campi comuni con quelli specifici sopra.
export const mockMaintenance: MaintenanceItem[] = mockFleetRegistry.map((vehicle) => ({
  id: `mnt-${vehicle.id}`,
  plate: vehicle.plate,
  model: vehicle.model,
  odometerKm: vehicle.odometerKm,
  department: vehicle.department,
  vin: vehicle.vin,
  registrationYear: vehicle.registrationYear,
  fuelType: vehicle.fuelType,
  trim: vehicle.trim,
  ...maintenanceExtrasById[vehicle.id],
}));

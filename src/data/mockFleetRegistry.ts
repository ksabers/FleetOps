// ─────────────────────────────────────────────────────────────────────────
// Dati finti (mock) dell'ANAGRAFICA veicoli, usati finché non parliamo con
// un vero Traccar Server.
// ─────────────────────────────────────────────────────────────────────────
// Invece di scrivere di nuovo targa/modello/stato/posizione per ognuno dei 7
// veicoli (dati già presenti in mockVehicles.ts, usato dalla Mappa
// operativa), qui partiamo da QUELLO stesso array e lo "arricchiamo" con i
// soli campi di anagrafica (VIN, reparto, alimentazione...). Vantaggi:
//   1. Un solo posto dove sono definiti targa/modello/stato per i 7 mezzi:
//      Mappa e Anagrafica mostrano sempre veicoli coerenti tra loro.
//   2. Quando allo Step 6 mockVehicles sarà sostituito dalla vera chiamata
//      a Traccar (GET /api/devices), basterà unire la sua risposta con i
//      dati di anagrafica (che probabilmente arriveranno da un'altra fonte,
//      es. un gestionale aziendale) con la stessa tecnica di "spread" usata
//      qui sotto.
import type {
  VehicleCategory,
  GpsQuality,
  IgnitionState,
  VehicleRegistryEntry,
} from '../types/vehicleRegistry';
import { mockVehicles } from './mockVehicles';

/** Solo i campi "aggiuntivi" di anagrafica, senza ripetere quelli di Vehicle. */
interface RegistryExtras {
  category: VehicleCategory;
  department: string;
  vin: string;
  registrationYear: number;
  fuelType: string;
  odometerKm: number;
  trim: string;
  ignition: IgnitionState;
  gpsQuality: GpsQuality;
}

// Una voce per ciascuno dei 7 id già definiti in mockVehicles.ts (v1..v7).
// "Record<string, ...>" qui non garantisce che TUTTI gli id di mockVehicles
// siano coperti (lo garantirebbe solo un'unione letterale 'v1' | 'v2' | ...,
// che non abbiamo perché Vehicle.id è un semplice string) — per dati finti
// va bene così, basta ricordarsi di aggiungere una riga per ogni nuovo
// veicolo mock.
const registryExtrasById: Record<string, RegistryExtras> = {
  v1: {
    category: 'truck',
    department: 'Logistica',
    vin: 'ZFA25000012345678',
    registrationYear: 2021,
    fuelType: 'Diesel',
    odometerKm: 84210,
    trim: 'Furgone chiuso',
    ignition: 'on',
    gpsQuality: 'good',
  },
  v2: {
    category: 'truck',
    department: 'Manutenzione',
    vin: 'ZFA25000098765432',
    registrationYear: 2019,
    fuelType: 'Diesel',
    odometerKm: 132840,
    trim: 'Cassone ribaltabile',
    ignition: 'off',
    gpsQuality: 'good',
  },
  v3: {
    category: 'truck',
    department: 'Logistica',
    vin: 'WDB9066331234567',
    registrationYear: 2022,
    fuelType: 'Diesel',
    odometerKm: 45300,
    trim: 'Furgone frigo',
    ignition: 'on',
    gpsQuality: 'medium',
  },
  v4: {
    category: 'special',
    department: 'Emergenze',
    vin: 'VF1MA000067891234',
    registrationYear: 2020,
    fuelType: 'Diesel',
    odometerKm: 67540,
    trim: 'Officina mobile',
    ignition: 'off',
    gpsQuality: 'poor',
  },
  v5: {
    category: 'light',
    department: 'Amministrazione',
    vin: 'WF0AXXTTGA1B23456',
    registrationYear: 2018,
    fuelType: 'Diesel',
    odometerKm: 156700,
    trim: 'Furgone chiuso',
    ignition: 'off',
    gpsQuality: 'poor',
  },
  v6: {
    category: 'truck',
    department: 'Logistica',
    vin: 'WV1ZZZ2EZLH123456',
    registrationYear: 2022,
    fuelType: 'Diesel',
    odometerKm: 38900,
    trim: 'Furgone chiuso',
    ignition: 'on',
    gpsQuality: 'good',
  },
  v7: {
    category: 'light',
    department: 'Manutenzione',
    vin: 'VF3XXXXXXXX123456',
    registrationYear: 2020,
    fuelType: 'GPL',
    odometerKm: 71260,
    trim: 'Furgone misto',
    ignition: 'off',
    gpsQuality: 'medium',
  },
};

// ".map()" costruisce un NUOVO array: per ogni veicolo "base" di
// mockVehicles crea un oggetto che unisce (con lo spread "...") i suoi campi
// originali a quelli di anagrafica trovati in registryExtrasById. Il
// risultato ha esattamente la forma di VehicleRegistryEntry.
export const mockFleetRegistry: VehicleRegistryEntry[] = mockVehicles.map((vehicle) => ({
  ...vehicle,
  ...registryExtrasById[vehicle.id],
}));

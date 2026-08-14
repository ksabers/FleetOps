// ─────────────────────────────────────────────────────────────────────────
// Dati finti (mock) della flotta, usati finché non parliamo con un vero
// Traccar Server.
// ─────────────────────────────────────────────────────────────────────────
// Le coordinate sono reali punti della provincia di Savona/Liguria, solo per
// rendere la mappa più realistica da guardare durante lo sviluppo. Quando
// arriveremo allo Step 6, questa costante smetterà di essere importata dalle
// pagine e il suo posto sarà preso dalla risposta di
// traccarApi.getDevices()/getPositions() — le pagine non dovranno cambiare
// quasi nulla, perché continueranno a ricevere un array di oggetti Vehicle
// con la stessa "forma".
import type { Vehicle } from '../types/vehicle';

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    plate: 'SV123AB',
    model: 'Iveco Daily',
    status: 'moving',
    latitude: 44.3086,
    longitude: 8.477,
    speedKmh: 47,
    driver: 'M. Rossi',
    lastUpdateLabel: '12 secondi fa',
  },
  {
    id: 'v2',
    plate: 'SV456CD',
    model: 'Fiat Ducato',
    status: 'stopped',
    latitude: 44.3477,
    longitude: 8.4128,
    speedKmh: 0,
    driver: 'L. Bianchi',
    lastUpdateLabel: '1 minuto fa',
  },
  {
    id: 'v3',
    plate: 'GE789EF',
    model: 'Mercedes Sprinter',
    status: 'moving',
    latitude: 44.4056,
    longitude: 8.9463,
    speedKmh: 63,
    driver: 'G. Verdi',
    lastUpdateLabel: '5 secondi fa',
  },
  {
    id: 'v4',
    plate: 'SV321GH',
    model: 'Renault Master',
    status: 'alarm',
    latitude: 44.3626,
    longitude: 8.5786,
    speedKmh: 0,
    driver: 'A. Neri',
    lastUpdateLabel: 'adesso',
  },
  {
    id: 'v5',
    plate: 'SV654IJ',
    model: 'Ford Transit',
    status: 'offline',
    latitude: 44.0538,
    longitude: 8.2129,
    speedKmh: 0,
    lastUpdateLabel: '3 ore fa',
  },
  {
    id: 'v6',
    plate: 'SV987KL',
    model: 'Volkswagen Crafter',
    status: 'moving',
    latitude: 44.1719,
    longitude: 8.3392,
    speedKmh: 38,
    driver: 'S. Colombo',
    lastUpdateLabel: '20 secondi fa',
  },
  {
    id: 'v7',
    plate: 'SV159MN',
    model: 'Peugeot Boxer',
    status: 'stopped',
    latitude: 44.3358,
    longitude: 8.7189,
    speedKmh: 0,
    driver: 'F. Russo',
    lastUpdateLabel: '4 minuti fa',
  },
];

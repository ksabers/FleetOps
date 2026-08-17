// ─────────────────────────────────────────────────────────────────────────
// Dati finti (mock) dello STATO DEI DISPOSITIVI GPS installati sui veicoli.
// ─────────────────────────────────────────────────────────────────────────
// Come in mockMaintenance.ts, partiamo dall'anagrafica esistente
// (mockFleetRegistry) per riusare targa e modello, e aggiungiamo qui solo i
// campi tecnici del dispositivo (IMEI, firmware, SIM, ecc.).
import type {
  DeviceStatusEntry,
  InstallStatus,
  ConnectivityStatus,
} from '../types/deviceStatus';
import { mockFleetRegistry } from './mockFleetRegistry';

interface DeviceExtras {
  deviceId: string;
  firmware: string;
  installStatus: InstallStatus;
  connectivity: ConnectivityStatus;
  lastContactText: string;
  installDateText: string;
  sim: string;
  gpsFix: string;
  voltage: string;
  ignitionSource: string;
  protocol: string;
  lastRebootText: string;
}

const deviceExtrasById: Record<string, DeviceExtras> = {
  v1: {
    deviceId: 'IMEI ...4521',
    firmware: 'v2.4.1',
    installStatus: 'installed',
    connectivity: 'online',
    lastContactText: '12 secondi fa',
    installDateText: '10/02/2021',
    sim: 'TIM M2M — attiva',
    gpsFix: '3D, 11 satelliti',
    voltage: '13,8 V (impianto)',
    ignitionSource: 'Filo accensione (+15)',
    protocol: 'Teltonika Codec8',
    lastRebootText: '3 giorni fa',
  },
  v2: {
    deviceId: 'IMEI ...7789',
    firmware: 'v2.4.1',
    installStatus: 'installed',
    connectivity: 'online',
    lastContactText: '1 minuto fa',
    installDateText: '02/05/2019',
    sim: 'Vodafone M2M — attiva',
    gpsFix: '3D, 9 satelliti',
    voltage: '13,6 V (impianto)',
    ignitionSource: 'Filo accensione (+15)',
    protocol: 'Teltonika Codec8',
    lastRebootText: '11 giorni fa',
  },
  v3: {
    deviceId: 'IMEI ...3312',
    firmware: 'v2.3.9',
    installStatus: 'installed',
    connectivity: 'weak',
    lastContactText: '5 secondi fa',
    installDateText: '18/01/2022',
    sim: 'TIM M2M — attiva',
    gpsFix: '3D, 6 satelliti',
    voltage: '12,9 V (batteria)',
    ignitionSource: 'Filo accensione (+15)',
    protocol: 'Teltonika Codec8',
    lastRebootText: '2 ore fa',
  },
  v4: {
    deviceId: 'IMEI ...9014',
    firmware: 'v2.2.0',
    installStatus: 'issue',
    connectivity: 'offline',
    lastContactText: 'adesso (allarme in corso)',
    installDateText: '25/09/2020',
    sim: 'Vodafone M2M — sospesa',
    gpsFix: 'Nessun fix',
    voltage: '11,2 V (batteria scarica)',
    ignitionSource: 'Filo accensione (+15)',
    protocol: 'Teltonika Codec8',
    lastRebootText: '6 ore fa',
  },
  v5: {
    deviceId: 'IMEI ...5540',
    firmware: 'v2.1.5',
    installStatus: 'installed',
    connectivity: 'offline',
    lastContactText: '3 ore fa',
    installDateText: '30/11/2018',
    sim: 'TIM M2M — attiva',
    gpsFix: 'Ultimo fix 3 ore fa',
    voltage: '12,1 V (batteria)',
    ignitionSource: 'Filo accensione (+15)',
    protocol: 'Teltonika Codec8',
    lastRebootText: '2 giorni fa',
  },
  v6: {
    deviceId: 'IMEI ...2287',
    firmware: 'v2.4.1',
    installStatus: 'installed',
    connectivity: 'online',
    lastContactText: '20 secondi fa',
    installDateText: '14/03/2022',
    sim: 'Vodafone M2M — attiva',
    gpsFix: '3D, 10 satelliti',
    voltage: '13,9 V (impianto)',
    ignitionSource: 'Filo accensione (+15)',
    protocol: 'Teltonika Codec8',
    lastRebootText: '5 giorni fa',
  },
  v7: {
    deviceId: 'IMEI ...6653',
    firmware: 'v2.4.0',
    installStatus: 'pending',
    connectivity: 'weak',
    lastContactText: '4 minuti fa',
    installDateText: '02/08/2025 (in verifica)',
    sim: 'TIM M2M — in attivazione',
    gpsFix: '2D, 4 satelliti',
    voltage: '12,7 V (batteria)',
    ignitionSource: 'Non ancora configurata',
    protocol: 'Teltonika Codec8',
    lastRebootText: 'oggi, 07:30',
  },
};

export const mockDevices: DeviceStatusEntry[] = mockFleetRegistry.map((vehicle) => ({
  id: `dev-${vehicle.id}`,
  plate: vehicle.plate,
  model: vehicle.model,
  ...deviceExtrasById[vehicle.id],
}));

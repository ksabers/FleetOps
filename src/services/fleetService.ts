// ─────────────────────────────────────────────────────────────────────────
// fleetService.ts — livello di accesso ai dati usato dalle PAGINE.
// ─────────────────────────────────────────────────────────────────────────
// Questo è il "modulo servizi API" dello Step 4: da qui in poi le pagine
// (MapView, VehicleRegistry, ...) NON importano più direttamente i file di
// dati mock (src/data/mockVehicles.ts, mockFleetRegistry.ts). Chiedono invece
// a QUESTO file "dammi i veicoli", tramite funzioni che restituiscono una
// Promise — esattamente come farebbe una vera chiamata di rete con fetch().
//
// Perché introdurre questo passaggio anche se sotto c'è ancora un mock?
//   1. Le pagine imparano FIN DA ORA a gestire un caricamento asincrono
//      (stato "sto caricando" / "ho un errore" / "ho i dati"), che è
//      obbligatorio con un vero server: la risposta non è mai istantanea.
//   2. Quando allo Step 6 collegheremo il vero Traccar Server, il cambiamento
//      sarà isolato QUI DENTRO (sostituire il mock con una chiamata alle
//      funzioni di src/services/traccarApi.ts): le pagine non dovranno
//      cambiare una sola riga, perché continueranno a ricevere una Promise
//      che si risolve in un array di Vehicle / VehicleRegistryEntry.
//
// Il ritardo artificiale (simulateNetworkDelay) serve solo a rendere
// visibile lo stato di caricamento durante lo sviluppo: un vero server
// risponderebbe comunque non istantaneamente, mai a "tempo zero".

import type { Vehicle } from '../types/vehicle';
import type { VehicleRegistryEntry } from '../types/vehicleRegistry';
import type { Alarm } from '../types/alarm';
import type { MaintenanceItem } from '../types/maintenanceItem';
import type { ActivityEntry } from '../types/activityEntry';
import type { DeviceStatusEntry } from '../types/deviceStatus';
import type { KpiOverview } from '../types/kpi';
import { mockVehicles } from '../data/mockVehicles';
import { mockFleetRegistry } from '../data/mockFleetRegistry';
import { mockAlarms } from '../data/mockAlarms';
import { mockMaintenance } from '../data/mockMaintenance';
import { mockActivity } from '../data/mockActivity';
import { mockDevices } from '../data/mockDevices';
import { mockKpiOverview } from '../data/mockKpi';

/**
 * Piccola utility che "aspetta" un tot di millisecondi prima di risolversi.
 * Serve solo a simulare la latenza di una vera chiamata di rete: senza
 * questo ritardo i dati mock arriverebbero così in fretta che lo stato di
 * caricamento non si vedrebbe mai a schermo durante i test.
 */
function simulateNetworkDelay(milliseconds = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Recupera l'elenco dei veicoli con la loro ultima posizione nota — usato
 * dalla pagina "Mappa operativa".
 *
 * Oggi: aspetta un attimo e restituisce mockVehicles.
 * Allo Step 6: chiamerà traccarApi.getDevices() + traccarApi.getPositions()
 * e unirà i due risultati in un array di Vehicle.
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  await simulateNetworkDelay();
  return mockVehicles;
}

/**
 * Recupera l'anagrafica completa della flotta — usato dalla pagina
 * "Anagrafica veicoli".
 *
 * Oggi: aspetta un attimo e restituisce mockFleetRegistry.
 * Allo Step 6: probabilmente unirà traccarApi.getDevices() con gli
 * "attributes" personalizzati che Traccar permette di associare a ogni
 * dispositivo (VIN, reparto, allestimento, ...).
 */
export async function fetchFleetRegistry(): Promise<VehicleRegistryEntry[]> {
  await simulateNetworkDelay();
  return mockFleetRegistry;
}

// ── Le 5 funzioni seguenti sono nuove dello Step 5: stessa forma delle due
// sopra (aspetta un attimo, poi restituisce l'array/oggetto mock), una per
// ciascuna delle nuove pagine. ────────────────────────────────────────────

/** Recupera l'elenco degli allarmi — usato dalla pagina "Allarmi". */
export async function fetchAlarms(): Promise<Alarm[]> {
  await simulateNetworkDelay();
  return mockAlarms;
}

/**
 * Recupera le scadenze di manutenzione — usato dalla pagina "Manutenzione".
 */
export async function fetchMaintenanceItems(): Promise<MaintenanceItem[]> {
  await simulateNetworkDelay();
  return mockMaintenance;
}

/** Recupera la cronologia interventi — usato dalla pagina "Attività". */
export async function fetchActivityLog(): Promise<ActivityEntry[]> {
  await simulateNetworkDelay();
  return mockActivity;
}

/**
 * Recupera lo stato dei dispositivi GPS installati — usato dalla pagina
 * "Stato dispositivi".
 */
export async function fetchDeviceStatuses(): Promise<DeviceStatusEntry[]> {
  await simulateNetworkDelay();
  return mockDevices;
}

/**
 * Recupera in un'unica chiamata tutto ciò che serve alla pagina "Report"
 * (card di riepilogo + dati dei due grafici) — usato dalla pagina "Report".
 */
export async function fetchKpiOverview(): Promise<KpiOverview> {
  await simulateNetworkDelay();
  return mockKpiOverview;
}

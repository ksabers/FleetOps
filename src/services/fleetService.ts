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
import { mockVehicles } from '../data/mockVehicles';
import { mockFleetRegistry } from '../data/mockFleetRegistry';

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

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

import type { Vehicle, VehicleStatus } from '../types/vehicle';
import type { VehicleRegistryEntry } from '../types/vehicleRegistry';
import type { Alarm } from '../types/alarm';
import type { MaintenanceItem } from '../types/maintenanceItem';
import type { ActivityEntry } from '../types/activityEntry';
import type { DeviceStatusEntry } from '../types/deviceStatus';
import type { KpiOverview } from '../types/kpi';
import type { TraccarDeviceRaw } from '../types/traccarDevice';
import type { TraccarPositionRaw } from '../types/traccarPosition';
import { mockFleetRegistry } from '../data/mockFleetRegistry';
import { mockAlarms } from '../data/mockAlarms';
import { mockMaintenance } from '../data/mockMaintenance';
import { mockActivity } from '../data/mockActivity';
import { mockDevices } from '../data/mockDevices';
import { mockKpiOverview } from '../data/mockKpi';
import { getDevices, getPositions } from './traccarApi';
import { formatRelativeTime } from '../utils/formatRelativeTime';

/**
 * Piccola utility che "aspetta" un tot di millisecondi prima di risolversi.
 * Serve solo a simulare la latenza di una vera chiamata di rete: senza
 * questo ritardo i dati mock arriverebbero così in fretta che lo stato di
 * caricamento non si vedrebbe mai a schermo durante i test.
 */
function simulateNetworkDelay(milliseconds = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// 1 nodo (unità di velocità usata da Traccar) equivale a 1,852 km/h.
const NODI_IN_KMH = 1.852;

// Sotto questa soglia (in km/h) consideriamo il veicolo "fermo" e non "in
// movimento", anche se la velocità letta da Traccar non è esattamente
// zero: il GPS oscilla leggermente anche da fermo ("jitter"), quindi una
// piccola soglia evita falsi "in movimento".
const SOGLIA_VELOCITA_IN_MOVIMENTO_KMH = 3;

/**
 * Traduce un dispositivo Traccar (TraccarDeviceRaw) + la sua ultima
 * posizione (TraccarPositionRaw) nel nostro tipo Vehicle — quello che le
 * pagine (MapView) si aspettano di ricevere.
 *
 * Isoliamo questa "traduzione" in una funzione sola perché Traccar non ha
 * un campo che corrisponda 1:1 al nostro Vehicle.status: lo deduciamo da
 * più informazioni insieme (stato di connessione + eventuale allarme +
 * velocità). Se un giorno la logica dovesse cambiare, si corregge qui, in
 * un punto solo.
 */
function toVehicle(device: TraccarDeviceRaw, position: TraccarPositionRaw): Vehicle {
  const speedKmh = Math.round(position.speed * NODI_IN_KMH);

  // "attributes.alarm" è una stringa (es. "sos", "overspeed"...) quando la
  // posizione ha un allarme attivo, assente/vuota altrimenti. Il tipo di
  // attributes è generico (Record<string, unknown>), quindi controlliamo a
  // runtime che sia davvero una stringa non vuota prima di fidarci.
  const allarmeAttivo =
    typeof position.attributes.alarm === 'string' && position.attributes.alarm.length > 0;

  let status: VehicleStatus;
  if (device.status !== 'online') {
    // Dispositivo non connesso al server: non importa cosa diceva l'ultima
    // posizione nota, dal punto di vista operativo il veicolo è "offline".
    status = 'offline';
  } else if (allarmeAttivo) {
    status = 'alarm';
  } else if (speedKmh > SOGLIA_VELOCITA_IN_MOVIMENTO_KMH) {
    status = 'moving';
  } else {
    status = 'stopped';
  }

  return {
    id: String(device.id),
    // Convenzione: usiamo il "nome" del dispositivo Traccar come targa. Se
    // sul tuo server i dispositivi hanno nomi diversi dalle targhe, questo
    // campo mostrerà quel nome finché non decidiamo una convenzione diversa
    // (es. un attributo personalizzato dedicato).
    plate: device.name,
    model:
      device.model && device.model.length > 0 ? device.model : 'Modello non specificato',
    status,
    latitude: position.latitude,
    longitude: position.longitude,
    speedKmh,
    // Il conducente non è ancora collegato: Traccar lo gestisce come
    // risorsa separata (GET /api/drivers) più un'associazione dispositivo↔
    // conducente che non abbiamo ancora implementato. Lasciamo il campo
    // vuoto (è opzionale in Vehicle) finché non affrontiamo quel passo.
    driver: undefined,
    lastUpdateLabel: formatRelativeTime(position.fixTime ?? device.lastUpdate),
  };
}

/**
 * Unisce un elenco di dispositivi Traccar con il rispettivo elenco di
 * posizioni in un array di Vehicle — la stessa "traduzione" che prima (Step
 * 6b) viveva solo dentro fetchVehicles(). La esportiamo come funzione a sé
 * stante perché dallo Step 6c serve ANCHE al hook useLiveVehicles.ts: sia il
 * primo caricamento via REST sia ogni aggiornamento ricevuto dal WebSocket
 * devono ricostruire l'elenco di Vehicle nello stesso identico modo, quindi
 * conviene avere un solo punto che sa farlo.
 *
 * Un dispositivo che non ha ancora nessuna posizione nota (caso raro: un
 * GPS che non ha mai comunicato) viene escluso dall'elenco, perché non
 * avremmo comunque coordinate da mostrare sulla mappa.
 */
export function buildVehicles(
  devices: TraccarDeviceRaw[],
  positions: TraccarPositionRaw[],
): Vehicle[] {
  // Trasformiamo l'array di posizioni in una Map indicizzata per deviceId:
  // così, per ogni dispositivo, troviamo la sua posizione con una ricerca
  // istantanea invece di scorrere l'intero array ogni volta (più efficiente
  // se la flotta cresce).
  const posizionePerDispositivo = new Map(
    positions.map((posizione) => [posizione.deviceId, posizione]),
  );

  return devices
    .map((device) => {
      const posizione = posizionePerDispositivo.get(device.id);
      // Se non troviamo una posizione per questo dispositivo, restituiamo
      // null: lo scartiamo nel passo successivo con .filter().
      return posizione ? toVehicle(device, posizione) : null;
    })
    .filter((vehicle): vehicle is Vehicle => vehicle !== null);
}

/**
 * Recupera l'elenco dei veicoli con la loro ultima posizione nota — usato
 * dalla pagina "Mappa operativa" al primissimo caricamento, PRIMA che il
 * WebSocket (Step 6c, vedi src/hooks/useLiveVehicles.ts) prenda in carico
 * gli aggiornamenti successivi.
 *
 * Dallo Step 6b: chiama DAVVERO Traccar (GET /api/devices + GET
 * /api/positions in parallelo con Promise.all, per non aspettare l'una
 * dopo l'altra) e delega a buildVehicles() la traduzione nel nostro tipo.
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  // Promise.all: lanciamo le due richieste INSIEME (non una dopo l'altra),
  // così il tempo di attesa totale è quello della più lenta delle due, non
  // la somma di entrambe.
  const [devices, positions] = await Promise.all([getDevices(), getPositions()]);
  return buildVehicles(devices, positions);
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

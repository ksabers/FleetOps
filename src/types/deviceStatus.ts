// ─────────────────────────────────────────────────────────────────────────
// Tipi legati allo STATO DEI DISPOSITIVI GPS installati sui veicoli
// (Step 5). Corrisponde grossomodo alla risorsa /api/devices di Traccar,
// con qualche campo tecnico aggiuntivo (SIM, fix GPS, tensione...) che nella
// PoC arriva dagli "attributes" personalizzati del dispositivo.
// ─────────────────────────────────────────────────────────────────────────

/** Stato dell'installazione fisica del dispositivo sul mezzo. */
export type InstallStatus = 'installed' | 'pending' | 'issue';

/** Qualità della connessione dati del dispositivo verso il server. */
export type ConnectivityStatus = 'online' | 'weak' | 'offline';

export interface DeviceStatusEntry {
  id: string;
  plate: string;
  model: string;
  /** Identificativo hardware del dispositivo (es. IMEI abbreviato). */
  deviceId: string;
  firmware: string;
  installStatus: InstallStatus;
  connectivity: ConnectivityStatus;
  lastContactText: string;
  // Campi mostrati solo quando la riga viene espansa.
  installDateText: string;
  sim: string;
  gpsFix: string;
  voltage: string;
  ignitionSource: string;
  protocol: string;
  lastRebootText: string;
}

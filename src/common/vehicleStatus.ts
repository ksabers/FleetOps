// ─────────────────────────────────────────────────────────────────────────
// Aspetto visivo associato a ogni VehicleStatus (etichetta + colore).
// ─────────────────────────────────────────────────────────────────────────
// Teniamo questa "tabella di traduzione" in un unico posto (cartella
// src/common/, come in traccar-web) perché sarà usata da più punti
// dell'app: la lista veicoli nella mappa, i marker sulla mappa stessa, e in
// futuro anche la pagina Anagrafica veicoli. Se un domani vogliamo cambiare
// il colore dell'"allarme" da rosso a un altro colore, lo cambiamo qui una
// sola volta.
import type { VehicleStatus } from '../types/vehicle';

export interface VehicleStatusStyle {
  label: string;
  /** Colore CSS (facciamo riferimento alle variabili definite in index.css). */
  color: string;
}

// "Record<VehicleStatus, ...>" è un dizionario tipizzato: TypeScript
// obbliga a specificare ESATTAMENTE una voce per ognuno dei 4 valori
// possibili di VehicleStatus, né uno di più né uno di meno. Se in futuro
// aggiungiamo un nuovo stato al tipo VehicleStatus e ci scordiamo di
// aggiungerlo qui, il progetto smette di compilare — un errore preso
// "prima" invece che scoperto a runtime.
export const vehicleStatusStyles: Record<VehicleStatus, VehicleStatusStyle> = {
  moving: { label: 'In marcia', color: 'var(--color-status-moving)' },
  stopped: { label: 'Fermo', color: 'var(--color-status-stopped)' },
  alarm: { label: 'Allarme', color: 'var(--color-status-alarm)' },
  offline: { label: 'Offline', color: 'var(--color-status-offline)' },
};

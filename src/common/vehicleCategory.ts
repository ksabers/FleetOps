// ─────────────────────────────────────────────────────────────────────────
// Etichetta leggibile per ogni VehicleCategory.
// ─────────────────────────────────────────────────────────────────────────
// Stessa idea di common/vehicleStatus.ts: una "tabella di traduzione" unica,
// così se domani vogliamo rinominare "light" in qualcosa di più chiaro per
// l'utente lo cambiamo in un solo punto. Il disegno dell'ICONA associata a
// ogni categoria vive invece in components/VehicleCategoryIcon.tsx: quel
// file contiene JSX (i tag <svg>), mentre questo resta "puro dato" (solo
// stringhe), per tenere la logica grafica separata dai semplici dizionari.
import type { VehicleCategory } from '../types/vehicleRegistry';

export interface VehicleCategoryStyle {
  label: string;
}

// "Record<VehicleCategory, ...>": come per gli stati dei veicoli, TypeScript
// obbliga a coprire ESATTAMENTE i 3 valori possibili — se in futuro
// aggiungiamo una quarta categoria e dimentichiamo di aggiornare questo
// file, la build fallisce subito invece di mostrare "undefined" in pagina.
export const vehicleCategoryStyles: Record<VehicleCategory, VehicleCategoryStyle> = {
  light: { label: 'Leggero' },
  truck: { label: 'Pesante' },
  special: { label: 'Speciale' },
};

// ─────────────────────────────────────────────────────────────────────────
// Tipi legati all'ANAGRAFICA dei veicoli (Step 3).
// ─────────────────────────────────────────────────────────────────────────
// "Vehicle" (in types/vehicle.ts) contiene solo i dati "live": posizione,
// velocità, stato. L'Anagrafica ha bisogno di informazioni AGGIUNTIVE che
// cambiano raramente (VIN, reparto, alimentazione...), quindi invece di
// duplicare i campi già esistenti "estendiamo" Vehicle con la parola chiave
// TypeScript "extends": VehicleRegistryEntry avrà TUTTI i campi di Vehicle
// (id, plate, model, status...) PIÙ quelli nuovi definiti qui sotto.
//
// Perché non mettere semplicemente questi campi dentro Vehicle stesso? Perché
// non tutte le pagine hanno bisogno dei dati di anagrafica (es. la Mappa
// operativa mostra solo posizione/velocità/stato): tenerli separati evita di
// "sporcare" il tipo Vehicle con campi che molte pagine non useranno mai.
import type { Vehicle } from './vehicle';

/**
 * Categoria del mezzo, usata per scegliere l'icona nella tabella e nel
 * dettaglio (vedi src/components/VehicleCategoryIcon.tsx). Ripresa 1:1 dai
 * flag "isLight / isTruck / isSpecial" della PoC originale.
 */
export type VehicleCategory = 'light' | 'truck' | 'special';

/** Stato del quadro/accensione del veicolo. */
export type IgnitionState = 'on' | 'off';

/** Qualità del segnale GPS ricevuto dal dispositivo di bordo. */
export type GpsQuality = 'good' | 'medium' | 'poor';

/**
 * Una riga completa dell'anagrafica: tutto ciò che serve per disegnare sia
 * la riga della tabella "Registro flotta" sia la scheda di dettaglio.
 */
export interface VehicleRegistryEntry extends Vehicle {
  category: VehicleCategory;
  /** Reparto/unità a cui è assegnato il mezzo, es. "Logistica". */
  department: string;
  /** Numero di telaio (Vehicle Identification Number). */
  vin: string;
  /** Anno di prima immatricolazione. */
  registrationYear: number;
  /** Tipo di alimentazione, es. "Diesel", "Elettrico". */
  fuelType: string;
  /** Chilometraggio totale letto dall'odometro. */
  odometerKm: number;
  /** Allestimento/carrozzeria, es. "Furgone chiuso", "Officina mobile". */
  trim: string;
  ignition: IgnitionState;
  gpsQuality: GpsQuality;
}

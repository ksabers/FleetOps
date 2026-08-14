// ─────────────────────────────────────────────────────────────────────────
// FleetRegistryTable: la tabella "Registro flotta" con tutti i veicoli.
// ─────────────────────────────────────────────────────────────────────────
// Componente "presentazionale" (come VehicleList in MapView): riceve i dati
// già pronti e una funzione da chiamare al click su una riga. Non sa cosa
// succede dopo il click (decide il genitore VehicleRegistry.tsx) né da dove
// arrivano i veicoli (per ora mockFleetRegistry, in futuro Traccar).
//
// Il layout a griglia (5 colonne di larghezza diversa: 1.2fr 1.3fr 1.1fr 1fr
// 0.9fr) ricalca esattamente la tabella della PoC: usiamo la stessa identica
// proporzione sia nell'intestazione sia in ogni riga, così le colonne
// restano allineate.
import type { VehicleRegistryEntry } from '../../types/vehicleRegistry';
import { vehicleStatusStyles } from '../../common/vehicleStatus';
import { vehicleCategoryStyles } from '../../common/vehicleCategory';
import VehicleCategoryIcon from '../../components/VehicleCategoryIcon';

interface FleetRegistryTableProps {
  vehicles: VehicleRegistryEntry[];
  onSelectVehicle: (vehicleId: string) => void;
}

// Le 5 colonne della tabella: le teniamo in una costante per non riscrivere
// la stessa stringa sia nell'intestazione sia in ogni riga (se domani
// cambiano le proporzioni, si modifica una volta sola).
const GRID_COLUMNS = '1.2fr 1.3fr 1.1fr 1fr 0.9fr';

export default function FleetRegistryTable({
  vehicles,
  onSelectVehicle,
}: FleetRegistryTableProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      {/* Titolo della card */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        Registro flotta{' '}
        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          — seleziona un veicolo per la scheda completa
        </span>
      </div>

      {/* Intestazione colonne */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID_COLUMNS,
          padding: '10px 18px',
          background: 'var(--color-app-bg)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>TARGA</span>
        <span>MODELLO</span>
        <span>TIPO</span>
        <span>ODOMETRO</span>
        <span style={{ textAlign: 'right' }}>STATO</span>
      </div>

      {/* Una riga per veicolo. Come nella lista della Mappa operativa,
          "key" aiuta React a riconoscere ogni riga quando l'elenco cambia. */}
      {vehicles.map((vehicle) => {
        const statusStyle = vehicleStatusStyles[vehicle.status];
        const categoryStyle = vehicleCategoryStyles[vehicle.category];

        return (
          <div
            key={vehicle.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectVehicle(vehicle.id)}
            // Anche da tastiera (Invio/Spazio) si deve poter aprire la
            // scheda: importante per l'accessibilità, non solo per il mouse.
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                onSelectVehicle(vehicle.id);
              }
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID_COLUMNS,
              padding: '12px 18px',
              borderBottom: '1px solid var(--color-app-bg)',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            {/* Colonna TARGA: quadratino colorato con icona categoria + targa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: 'var(--color-app-bg)',
                  color: statusStyle.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <VehicleCategoryIcon category={vehicle.category} size={15} />
              </span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
                {vehicle.plate}
              </span>
            </div>

            {/* Colonna MODELLO: modello + reparto come sottotitolo */}
            <div>
              <div style={{ fontSize: 13 }}>{vehicle.model}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                {vehicle.department}
              </div>
            </div>

            {/* Colonna TIPO: etichetta della categoria (Leggero/Pesante/Speciale) */}
            <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)' }}>
              {categoryStyle.label}
            </div>

            {/* Colonna ODOMETRO: km formattati con separatore delle migliaia */}
            <div className="mono" style={{ fontSize: 12.5 }}>
              {vehicle.odometerKm.toLocaleString('it-IT')} km
            </div>

            {/* Colonna STATO: pallino colorato + etichetta, allineati a destra */}
            <div style={{ textAlign: 'right' }}>
              <span
                className="badge"
                style={{
                  background: 'transparent',
                  color: statusStyle.color,
                  padding: 0,
                }}
              >
                ● {statusStyle.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

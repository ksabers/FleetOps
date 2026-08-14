// ─────────────────────────────────────────────────────────────────────────
// VehicleListItem: una singola riga della lista veicoli, a sinistra della
// mappa.
// ─────────────────────────────────────────────────────────────────────────
// Componente "presentazionale": non decide da solo cosa succede al click,
// si limita a mostrare i dati e ad avvisare il genitore (MapView) tramite la
// prop "onSelect". Questo pattern si chiama "lifting state up" (portare lo
// stato più in alto nell'albero dei componenti): MapView è l'unico a sapere
// QUALE veicolo è selezionato, e lo comunica sia a questa lista sia alla
// mappa, così restano sempre sincronizzati tra loro.
import type { Vehicle } from '../../types/vehicle';
import { vehicleStatusStyles } from '../../common/vehicleStatus';

interface VehicleListItemProps {
  vehicle: Vehicle;
  /** true se questo è il veicolo attualmente selezionato in MapView. */
  isSelected: boolean;
  /** Callback chiamata al click: MapView deciderà cosa farne. */
  onSelect: (vehicleId: string) => void;
}

export default function VehicleListItem({
  vehicle,
  isSelected,
  onSelect,
}: VehicleListItemProps) {
  const statusStyle = vehicleStatusStyles[vehicle.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(vehicle.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid',
        // Il bordo/sfondo cambiano quando la riga è selezionata, così
        // l'utente capisce a colpo d'occhio a quale marker corrisponde
        // sulla mappa.
        borderColor: isSelected ? 'var(--color-sidebar-active)' : 'var(--color-border)',
        background: isSelected ? '#eff6ff' : 'var(--color-surface)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14 }}>{vehicle.plate}</span>
        <span
          className="badge"
          style={{ background: 'transparent', color: statusStyle.color, padding: 0 }}
        >
          ● {statusStyle.label}
        </span>
      </div>

      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
        {vehicle.model}
        {vehicle.driver ? ` · ${vehicle.driver}` : ''}
      </span>

      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
        {vehicle.status === 'moving' ? `${vehicle.speedKmh} km/h · ` : ''}
        {vehicle.lastUpdateLabel}
      </span>
    </button>
  );
}

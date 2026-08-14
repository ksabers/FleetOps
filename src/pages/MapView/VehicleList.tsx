// ─────────────────────────────────────────────────────────────────────────
// VehicleList: la colonna scorrevole con l'elenco dei veicoli della flotta.
// ─────────────────────────────────────────────────────────────────────────
// Riceve semplicemente un array di veicoli e lo trasforma in una lista di
// <VehicleListItem>. Non conosce da dove arrivano i dati (per ora
// mockVehicles, in futuro traccarApi) né cosa succede quando si seleziona
// un veicolo: quella logica vive nel componente padre, MapView.
import type { Vehicle } from '../../types/vehicle';
import VehicleListItem from './VehicleListItem';

interface VehicleListProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
}

export default function VehicleList({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: VehicleListProps) {
  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
        paddingRight: 4,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {vehicles.length} veicoli
      </div>

      {/* .map() trasforma l'array di dati in un array di componenti JSX.
          "key" è una prop speciale richiesta da React su ogni elemento di
          una lista: gli serve per capire quale riga è quale quando la lista
          cambia, senza dover ridisegnare tutto da capo. */}
      {vehicles.map((vehicle) => (
        <VehicleListItem
          key={vehicle.id}
          vehicle={vehicle}
          isSelected={vehicle.id === selectedVehicleId}
          onSelect={onSelectVehicle}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// VehicleRegistry: pagina "Anagrafica veicoli" — orchestratore.
// ─────────────────────────────────────────────────────────────────────────
// Stesso pattern "lifting state up" già usato in MapView.tsx: questo
// componente possiede lo stato "selectedVehicleId" e decide, in base al suo
// valore, COSA mostrare:
//   - null            -> la tabella con tutti i veicoli (FleetRegistryTable)
//   - un id di veicolo -> la scheda di dettaglio (VehicleDetailView)
//
// Differenza rispetto a MapView: lì lista e mappa stanno SEMPRE affiancate
// (la selezione cambia solo il marker evidenziato); qui invece tabella e
// dettaglio si escludono a vicenda — coerente con la PoC, dove "Registro
// flotta" e la scheda veicolo occupano l'intera area, uno alla volta.
import { useState } from 'react';

import { mockFleetRegistry } from '../../data/mockFleetRegistry';
import FleetRegistryTable from './FleetRegistryTable';
import VehicleDetailView from './VehicleDetailView';

export default function VehicleRegistry() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // ".find()" cerca nell'array il primo elemento che soddisfa la condizione
  // e restituisce "undefined" se non lo trova (es. se selectedVehicleId è
  // null, la condizione non è mai vera per nessun elemento).
  const selectedVehicle = mockFleetRegistry.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );

  // Se c'è un veicolo selezionato E trovato nell'elenco, mostriamo il
  // dettaglio; altrimenti la tabella. Controllare ANCHE "selectedVehicle"
  // (non solo "selectedVehicleId") ci protegge da un id "orfano" (es. un
  // veicolo cancellato dai dati mentre la sua scheda era aperta).
  if (selectedVehicle) {
    return (
      <VehicleDetailView
        vehicle={selectedVehicle}
        onBack={() => setSelectedVehicleId(null)}
      />
    );
  }

  return (
    <FleetRegistryTable
      vehicles={mockFleetRegistry}
      onSelectVehicle={setSelectedVehicleId}
    />
  );
}

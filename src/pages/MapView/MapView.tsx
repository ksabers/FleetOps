// ─────────────────────────────────────────────────────────────────────────
// MapView: pagina "Mappa operativa" — lista veicoli + mappa affiancate.
// ─────────────────────────────────────────────────────────────────────────
// Questo componente è il "genitore" che coordina i due figli VehicleList e
// FleetMap: possiede lo stato "selectedVehicleId" e lo passa in giù a
// entrambi, così quando si clicca un veicolo (in lista o sulla mappa)
// entrambi i componenti si aggiornano restando sincronizzati.
//
// Per ora i veicoli arrivano da mockVehicles (dati finti, sempre uguali).
// Quando allo Step 6 collegheremo il vero Traccar Server, qui cambierà solo
// la RIGA che fornisce l'array "vehicles" (es. useState + useEffect che
// chiama traccarApi.getDevices()/getPositions(), o più avanti un vero store
// Redux) — VehicleList e FleetMap non dovranno cambiare, perché continuano a
// ricevere semplicemente un array di oggetti Vehicle.
import { useState } from 'react';

import { mockVehicles } from '../../data/mockVehicles';
import VehicleList from './VehicleList';
import FleetMap from './FleetMap';

export default function MapView() {
  // "string | null" perché all'inizio nessun veicolo è selezionato.
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <VehicleList
        vehicles={mockVehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
      />

      <FleetMap
        vehicles={mockVehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
      />
    </div>
  );
}

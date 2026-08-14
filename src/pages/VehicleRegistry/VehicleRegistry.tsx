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
//
// Novità dello Step 4: l'anagrafica non arriva più da un import diretto di
// mockFleetRegistry, ma da "useAsyncData(fetchFleetRegistry)" — lo stesso
// hook riutilizzabile usato anche da MapView.tsx. Finché i dati non sono
// arrivati mostriamo un caricamento; se qualcosa va storto, un messaggio di
// errore.
import { useState } from 'react';

import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchFleetRegistry } from '../../services/fleetService';
import PlaceholderSection from '../../components/PlaceholderSection';
import FleetRegistryTable from './FleetRegistryTable';
import VehicleDetailView from './VehicleDetailView';

export default function VehicleRegistry() {
  const { data: fleetRegistry, isLoading, error } = useAsyncData(fetchFleetRegistry);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Stato 1 di 3: caricamento in corso.
  if (isLoading) {
    return (
      <PlaceholderSection
        title="Caricamento anagrafica…"
        description="Recupero i dati della flotta dal registro."
      />
    );
  }

  // Stato 2 di 3: errore (o dati comunque assenti, per sicurezza).
  if (error || !fleetRegistry) {
    return (
      <PlaceholderSection
        title="Impossibile caricare l'anagrafica"
        description={error ?? 'Errore sconosciuto durante il caricamento.'}
      />
    );
  }

  // Stato 3 di 3: dati pronti. ".find()" cerca nell'array il primo elemento
  // che soddisfa la condizione e restituisce "undefined" se non lo trova
  // (es. se selectedVehicleId è null, la condizione non è mai vera).
  const selectedVehicle = fleetRegistry.find(
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
    <FleetRegistryTable vehicles={fleetRegistry} onSelectVehicle={setSelectedVehicleId} />
  );
}

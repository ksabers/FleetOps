// ─────────────────────────────────────────────────────────────────────────
// MapView: pagina "Mappa operativa" — lista veicoli + mappa affiancate.
// ─────────────────────────────────────────────────────────────────────────
// Questo componente è il "genitore" che coordina i due figli VehicleList e
// FleetMap: possiede lo stato "selectedVehicleId" e lo passa in giù a
// entrambi, così quando si clicca un veicolo (in lista o sulla mappa)
// entrambi i componenti si aggiornano restando sincronizzati.
//
// I veicoli arrivano da "useAsyncData(fetchVehicles)" — lo stesso hook
// riutilizzabile usato anche da VehicleRegistry.tsx. Finché i dati non sono
// arrivati mostriamo un caricamento; se qualcosa va storto, un messaggio di
// errore. Dallo Step 6b fetchVehicles() (dentro fleetService.ts) chiama
// per davvero il Traccar Server (GET /api/devices + GET /api/positions):
// questo file non è dovuto cambiare, perché continua a ricevere
// semplicemente un array di oggetti Vehicle, indipendentemente da dove
// arrivano i dati.
import { useState } from 'react';

import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchVehicles } from '../../services/fleetService';
import PlaceholderSection from '../../components/PlaceholderSection';
import VehicleList from './VehicleList';
import FleetMap from './FleetMap';

export default function MapView() {
  const { data: vehicles, isLoading, error } = useAsyncData(fetchVehicles);

  // "string | null" perché all'inizio nessun veicolo è selezionato.
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Stato 1 di 3: il caricamento è ancora in corso (i primi ~500ms, vedi
  // fleetService.ts). Mostriamo un semplice messaggio invece della UI vuota.
  if (isLoading) {
    return (
      <PlaceholderSection
        title="Caricamento flotta…"
        description="Recupero l'elenco veicoli e le posizioni più recenti."
      />
    );
  }

  // Stato 2 di 3: qualcosa è andato storto (o, per sicurezza, i dati sono
  // comunque assenti). Con un vero server questo capiterà per davvero, es.
  // rete assente o sessione scaduta.
  if (error || !vehicles) {
    return (
      <PlaceholderSection
        title="Impossibile caricare i veicoli"
        description={error ?? 'Errore sconosciuto durante il caricamento.'}
      />
    );
  }

  // Stato 3 di 3: dati pronti — la UI di sempre.
  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <VehicleList
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
      />

      <FleetMap
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
      />
    </div>
  );
}

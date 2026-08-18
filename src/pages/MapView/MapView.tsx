// ─────────────────────────────────────────────────────────────────────────
// MapView: pagina "Mappa operativa" — lista veicoli + mappa affiancate.
// ─────────────────────────────────────────────────────────────────────────
// Questo componente è il "genitore" che coordina i due figli VehicleList e
// FleetMap: possiede lo stato "selectedVehicleId" e lo passa in giù a
// entrambi, così quando si clicca un veicolo (in lista o sulla mappa)
// entrambi i componenti si aggiornano restando sincronizzati.
//
// I veicoli arrivavano, fino allo Step 6b, da "useAsyncData(fetchVehicles)"
// — una singola chiamata REST al montaggio, poi più nulla. Dallo Step 6c
// usiamo invece "useLiveVehicles()": fa la stessa chiamata REST iniziale,
// ma poi apre anche una connessione WebSocket verso Traccar e aggiorna i
// veicoli DA SOLO ogni volta che una posizione cambia sul server, senza che
// questa pagina debba fare nulla in più. VehicleList e FleetMap qui sotto
// non cambiano affatto: continuano a ricevere semplicemente un array di
// Vehicle, non sanno (e non devono sapere) se arriva da REST o da un
// socket — esattamente il vantaggio di aver isolato la logica in un hook.
import { useState } from 'react';

import { useLiveVehicles } from '../../hooks/useLiveVehicles';
import PlaceholderSection from '../../components/PlaceholderSection';
import VehicleList from './VehicleList';
import FleetMap from './FleetMap';

export default function MapView() {
  const { vehicles, isLoading, error, isLive } = useLiveVehicles();

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

  // Stato 3 di 3: dati pronti — la UI di sempre, con l'aggiunta di un
  // piccolo indicatore "Live"/"Riconnessione…" per far capire all'utente
  // se in questo momento la mappa si aggiorna da sola oppure se il
  // WebSocket si è interrotto e stiamo cercando di riconnetterci (in quel
  // caso i dati mostrati restano gli ultimi conosciuti, solo "congelati").
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            // Verde acceso quando il WebSocket è connesso, grigio spento
            // mentre stiamo tentando di riconnetterci.
            backgroundColor: isLive ? '#22c55e' : '#9ca3af',
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {isLive ? 'Live — aggiornamento in tempo reale' : 'Riconnessione in corso…'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
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
    </div>
  );
}

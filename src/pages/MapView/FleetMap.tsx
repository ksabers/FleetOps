// ─────────────────────────────────────────────────────────────────────────
// FleetMap: la mappa Leaflet con un marker colorato per ogni veicolo.
// ─────────────────────────────────────────────────────────────────────────
// Usiamo "react-leaflet", un pacchetto che avvolge la libreria Leaflet
// (JavaScript "puro", pensata per essere usata senza React) in componenti
// React (<MapContainer>, <TileLayer>, <CircleMarker>...). Più avanti, quando
// seguiremo più da vicino l'architettura di traccar-web (che usa MapLibre GL
// invece di Leaflet), potremo sostituire questo file senza dover cambiare le
// altre pagine: la "forma" dei dati che riceve (un array di Vehicle) resta
// la stessa.
//
// Nota importante su Leaflet + bundler come Vite: le icone "a goccia" di
// default di Leaflet caricano dei file immagine con un percorso che spesso
// si rompe una volta compilati da Vite. Per evitarlo del tutto, non usiamo
// icone-immagine ma <CircleMarker>, cioè semplici cerchi colorati disegnati
// via SVG/Canvas direttamente da Leaflet — niente immagini da caricare, e
// possiamo colorarli in base allo stato del veicolo riusando
// vehicleStatusStyles (la stessa "tabella colori" della lista veicoli).
import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import type { Vehicle } from '../../types/vehicle';
import { vehicleStatusStyles } from '../../common/vehicleStatus';

interface FleetMapProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
}

// Centro iniziale della mappa: una posizione a metà tra i veicoli mock,
// zona di Savona. Quando arriveranno dati reali da Traccar potremo invece
// calcolare il centro dinamicamente (es. media delle posizioni, o l'ultima
// posizione conosciuta dell'utente).
const DEFAULT_CENTER: [number, number] = [44.28, 8.55];
const DEFAULT_ZOOM = 10;

/**
 * Piccolo componente "di servizio" che non disegna nulla da solo: il suo
 * unico compito è spostare la mappa (con un'animazione) sul veicolo
 * selezionato ogni volta che "selectedVehicleId" cambia.
 *
 * "useMap()" è un hook fornito da react-leaflet che dà accesso all'istanza
 * Leaflet sottostante (quella con i metodi come .flyTo(), .setView()...)
 * dal componente React che la usa: deve stare DENTRO un <MapContainer> per
 * funzionare, per questo è un componente separato invece di codice scritto
 * direttamente in FleetMap.
 */
function FlyToSelected({
  vehicles,
  selectedVehicleId,
}: Omit<FleetMapProps, 'onSelectVehicle'>) {
  const map = useMap();

  useEffect(() => {
    if (!selectedVehicleId) {
      return;
    }
    const selected = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], 13, { duration: 0.6 });
    }
    // Il "dependency array" elenca tutto ciò da cui questo effetto dipende:
    // se selectedVehicleId (o l'array vehicles) cambia, l'effetto viene
    // rieseguito; altrimenti no.
  }, [selectedVehicleId, vehicles, map]);

  return null; // non disegna nulla: agisce solo "di lato" sulla mappa
}

export default function FleetMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: FleetMapProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ flex: 1, borderRadius: 'var(--radius-md)' }}
    >
      {/* Il livello di base (le "tile", cioè le mattonelle dell'immagine
          della mappa). Usiamo le tile standard di OpenStreetMap: sono
          gratuite, non richiedono una chiave API, e sono ben leggibili
          (contrasto alto), a differenza del basemap chiaro usato nella PoC
          originale, che era stato segnalato come poco leggibile. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles.map((vehicle) => {
        const statusStyle = vehicleStatusStyles[vehicle.status];
        const isSelected = vehicle.id === selectedVehicleId;

        return (
          <CircleMarker
            key={vehicle.id}
            center={[vehicle.latitude, vehicle.longitude]}
            // Il marker del veicolo selezionato è disegnato leggermente più
            // grande, così risulta facile da individuare sulla mappa.
            radius={isSelected ? 11 : 8}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: statusStyle.color,
              fillOpacity: 0.9,
            }}
            eventHandlers={{
              click: () => onSelectVehicle(vehicle.id),
            }}
          >
            <Popup>
              <strong>{vehicle.plate}</strong> — {vehicle.model}
              <br />
              Stato: {statusStyle.label}
              <br />
              {vehicle.status === 'moving' && <>Velocità: {vehicle.speedKmh} km/h</>}
            </Popup>
          </CircleMarker>
        );
      })}

      <FlyToSelected vehicles={vehicles} selectedVehicleId={selectedVehicleId} />
    </MapContainer>
  );
}

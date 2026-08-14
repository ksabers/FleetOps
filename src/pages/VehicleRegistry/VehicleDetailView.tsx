// ─────────────────────────────────────────────────────────────────────────
// VehicleDetailView: scheda di dettaglio di UN veicolo selezionato.
// ─────────────────────────────────────────────────────────────────────────
// Nota sull'ampiezza di questo Step: la PoC originale mostra qui anche una
// "Cronologia eventi" (timeline) e una lista "Disponibilità segnali". Li
// abbiamo VOLUTAMENTE lasciati fuori per ora, per mantenere il passo di
// dimensioni gestibili: li aggiungeremo in un prossimo step come ulteriore
// arricchimento di questa stessa pagina, senza dover toccare il resto
// dell'app (è proprio il vantaggio della modularità a componenti).
//
// Per ora la scheda mostra:
//   - intestazione (icona, targa, badge di stato, modello, pulsante
//     "Mostra su mappa")
//   - card "Telemetria live" semplificata (velocità, accensione, GPS)
//   - card "Assegnazione e anagrafica" completa
import { useNavigate } from 'react-router-dom';

import type { VehicleRegistryEntry } from '../../types/vehicleRegistry';
import { vehicleStatusStyles } from '../../common/vehicleStatus';
import { ignitionStyles, gpsQualityStyles } from '../../common/vehicleTelemetry';
import VehicleCategoryIcon from '../../components/VehicleCategoryIcon';

interface VehicleDetailViewProps {
  vehicle: VehicleRegistryEntry;
  /** Chiamata quando l'utente clicca "← Registro flotta" per tornare alla tabella. */
  onBack: () => void;
}

export default function VehicleDetailView({ vehicle, onBack }: VehicleDetailViewProps) {
  const statusStyle = vehicleStatusStyles[vehicle.status];
  const ignitionStyle = ignitionStyles[vehicle.ignition];
  const gpsStyle = gpsQualityStyles[vehicle.gpsQuality];

  // "useNavigate" è l'hook di react-router-dom per cambiare pagina via
  // codice (invece che con un <Link> cliccabile dall'utente). Ci serve per
  // il pulsante "Mostra su mappa".
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Link di ritorno alla tabella */}
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontSize: 12.5,
          fontWeight: 600,
          color: 'var(--color-sidebar-active)',
        }}
      >
        ← Registro flotta
      </button>

      {/* Intestazione: icona, targa, badge di stato, modello, pulsante mappa */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 13,
            background: 'var(--color-app-bg)',
            color: statusStyle.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <VehicleCategoryIcon category={vehicle.category} size={28} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 26, fontWeight: 600 }}>
              {vehicle.plate}
            </span>
            <span
              className="badge"
              style={{ color: '#fff', background: statusStyle.color }}
            >
              ● {statusStyle.label}
            </span>
          </div>
          <div
            style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}
          >
            {vehicle.model} · {vehicle.trim}
          </div>
        </div>

        {/* Il pulsante naviga alla pagina Mappa. NOTA: per ora si limita ad
            aprire /mappa, senza pre-selezionare questo veicolo lì — sincronizzare
            la selezione tra le due pagine è un miglioramento che rimandiamo a
            un passo successivo (richiede di "sollevare" lo stato selezionato
            fuori dalle singole pagine, es. in App.tsx o in un context React). */}
        <button
          type="button"
          onClick={() => navigate('/mappa')}
          style={{
            cursor: 'pointer',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontSize: 13,
            fontWeight: 600,
            padding: '9px 15px',
            borderRadius: 9,
          }}
        >
          Mostra su mappa
        </button>
      </div>

      {/* Card "Telemetria live" — versione semplificata (3 valori) */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 18,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          Telemetria live
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 11 }}>
          <TelemetryTile label="Velocità" value={`${vehicle.speedKmh} km/h`} />
          <TelemetryTile
            label="Accensione"
            value={ignitionStyle.label}
            color={ignitionStyle.color}
          />
          <TelemetryTile
            label="Qualità GPS"
            value={gpsStyle.label}
            color={gpsStyle.color}
          />
        </div>
      </div>

      {/* Card "Assegnazione e anagrafica" — completa, come nella PoC */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 18,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          Assegnazione e anagrafica
        </div>
        <RegistryRow label="Reparto" value={vehicle.department} />
        <RegistryRow label="Telaio (VIN)" value={vehicle.vin} mono />
        <RegistryRow label="Immatricolazione" value={String(vehicle.registrationYear)} />
        <RegistryRow label="Alimentazione" value={vehicle.fuelType} />
        <RegistryRow
          label="Odometro"
          value={`${vehicle.odometerKm.toLocaleString('it-IT')} km`}
          mono
        />
        <RegistryRow label="Allestimento" value={vehicle.trim} last />
      </div>
    </div>
  );
}

// ── Sotto-componenti locali ────────────────────────────────────────────
// Non esportati: servono solo a questo file, per evitare di ripetere lo
// stesso JSX tre/sei volte con piccole variazioni. Definirli qui invece che
// in file separati è una scelta ragionevole quando, come in questo caso,
// non hanno alcun senso "da soli" fuori da VehicleDetailView.

interface TelemetryTileProps {
  label: string;
  value: string;
  /** Colore del valore; se omesso usa il colore di testo standard. */
  color?: string;
}

function TelemetryTile({ label, value, color }: TelemetryTileProps) {
  return (
    <div
      style={{
        border: '1px solid var(--color-app-bg)',
        borderRadius: 10,
        padding: 12,
        background: 'var(--color-app-bg)',
      }}
    >
      <div
        style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}
      >
        {label}
      </div>
      <div
        className={color ? undefined : 'mono'}
        style={{ fontSize: color ? 16 : 20, fontWeight: 600, color: color ?? undefined }}
      >
        {value}
      </div>
    </div>
  );
}

interface RegistryRowProps {
  label: string;
  value: string;
  /** true per i valori tecnici (VIN, odometro) da mostrare in font monospace. */
  mono?: boolean;
  /** true per l'ultima riga, che non deve avere il bordo inferiore. */
  last?: boolean;
}

function RegistryRow({ label, value, mono, last }: RegistryRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: last ? 'none' : '1px solid var(--color-app-bg)',
        fontSize: 13,
      }}
    >
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span className={mono ? 'mono' : undefined} style={{ fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

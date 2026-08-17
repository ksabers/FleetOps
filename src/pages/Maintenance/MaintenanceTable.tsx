// ─────────────────────────────────────────────────────────────────────────
// MaintenanceTable: tabella "Manutenzione" con righe espandibili.
// ─────────────────────────────────────────────────────────────────────────
// CONCETTO NUOVO di questo step: le "righe espandibili". Invece di aprire
// una scheda separata come in Anagrafica veicoli (VehicleDetailView), qui
// cliccando una riga si apre/chiude un pannello di dettaglio ATTACCATO
// subito sotto la riga stessa, restando nella stessa tabella.
//
// Come si implementa: teniamo in "expandedId" l'id DI UNA SOLA riga aperta
// alla volta (non un array — vogliamo un accordion, non tante righe aperte
// insieme). Cliccando una riga:
//   - se il suo id è già quello aperto -> lo richiudiamo (torna a null)
//   - altrimenti -> diventa lui il nuovo aperto (e l'eventuale riga aperta
//     prima si richiude automaticamente, perché "expandedId" può contenere
//     un solo valore)
import { useState } from 'react';

import { maintenanceStatusStyles } from '../../common/maintenanceStatusStyles';
import type { MaintenanceItem } from '../../types/maintenanceItem';

interface MaintenanceTableProps {
  items: MaintenanceItem[];
}

const GRID_COLUMNS = '1.3fr 1.4fr 1fr 1.3fr 1fr';

export default function MaintenanceTable({ items }: MaintenanceTableProps) {
  // "expandedId" vale null quando nessuna riga è aperta, altrimenti
  // contiene l'id della riga (MaintenanceItem.id) attualmente espansa.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleRow(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
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
        <span>VEICOLO</span>
        <span>INTERVENTO</span>
        <span>ODOMETRO</span>
        <span>SCADENZA</span>
        <span style={{ textAlign: 'right' }}>STATO</span>
      </div>

      {/* Una riga (più il suo pannello di dettaglio, se espansa) per
          ciascun intervento di manutenzione. */}
      {items.map((item) => {
        const statusStyle = maintenanceStatusStyles[item.status];
        const isExpanded = expandedId === item.id;

        return (
          // "React.Fragment" (qui nella forma abbreviata <>...</>) ci
          // permette di restituire DUE elementi fratelli (la riga e,
          // sotto, il pannello) per ogni intervento, senza doverli
          // avvolgere in un <div> in più che romperebbe il layout a
          // griglia della tabella.
          <div key={item.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleRow(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  toggleRow(item.id);
                }
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLUMNS,
                padding: '12px 18px',
                borderBottom: isExpanded ? 'none' : '1px solid var(--color-app-bg)',
                alignItems: 'center',
                cursor: 'pointer',
                // Sfondo leggermente diverso quando la riga è aperta, per
                // farla percepire "collegata" al pannello sottostante.
                background: isExpanded ? 'var(--color-app-bg)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Freccetta che ruota di 90° quando la riga è aperta:
                    un piccolo dettaglio che comunica visivamente lo
                    stato "espanso/chiuso" senza bisogno di leggere testo. */}
                <span
                  style={{
                    display: 'inline-block',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                    color: 'var(--color-text-secondary)',
                    fontSize: 11,
                  }}
                >
                  ▶
                </span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
                  {item.plate}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 13 }}>{item.item}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {item.model}
                </div>
              </div>

              <div className="mono" style={{ fontSize: 12.5 }}>
                {item.odometerKm.toLocaleString('it-IT')} km
              </div>

              <div>
                <div style={{ fontSize: 12.5 }}>{item.dueText}</div>
                {/* Barra di avanzamento verso la scadenza: più è piena,
                    più siamo vicini (o oltre) alla soglia. */}
                <div
                  style={{
                    marginTop: 4,
                    height: 4,
                    borderRadius: 2,
                    background: 'var(--color-app-bg)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${item.progressPercent}%`,
                      background: statusStyle.color,
                    }}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  className="badge"
                  style={{ background: statusStyle.background, color: statusStyle.color }}
                >
                  {statusStyle.label}
                </span>
              </div>
            </div>

            {/* Pannello di dettaglio: renderizzato SOLO se la riga è
                espansa. Quando "isExpanded" torna false, questo blocco
                smette del tutto di esistere nel DOM (non è solo nascosto
                con CSS) — più semplice da ragionare, a costo di perdere
                un'eventuale animazione di apertura fluida. */}
            {isExpanded && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 16,
                  padding: '14px 18px 18px 46px',
                  background: 'var(--color-app-bg)',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: 12.5,
                }}
              >
                <DetailField label="Reparto" value={item.department} />
                <DetailField label="VIN" value={item.vin} mono />
                <DetailField
                  label="Immatricolazione"
                  value={String(item.registrationYear)}
                />
                <DetailField label="Alimentazione" value={item.fuelType} />
                <DetailField label="Allestimento" value={item.trim} />
                <DetailField label="Intervallo intervento" value={item.intervalText} />
                <DetailField label="Ultimo intervento" value={item.lastServiceText} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Coppia etichetta/valore riusata per ogni campo del pannello espanso. */
function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div
        style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginBottom: 2 }}
      >
        {label}
      </div>
      <div className={mono ? 'mono' : undefined}>{value}</div>
    </div>
  );
}

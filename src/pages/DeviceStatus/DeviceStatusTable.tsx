// ─────────────────────────────────────────────────────────────────────────
// DeviceStatusTable: tabella "Stato dispositivi" con righe espandibili.
// ─────────────────────────────────────────────────────────────────────────
// Stessa tecnica di MaintenanceTable.tsx: un solo "expandedId" in stato
// locale, che tiene traccia di quale riga (se una) è aperta. Vedi i
// commenti in MaintenanceTable.tsx per la spiegazione completa del
// funzionamento — qui non li ripetiamo per intero, solo dove cambia
// qualcosa di specifico per questa tabella.
import { useState } from 'react';

import { installStatusStyles, connectivityStyles } from '../../common/deviceStatusStyles';
import type { DeviceStatusEntry } from '../../types/deviceStatus';

interface DeviceStatusTableProps {
  devices: DeviceStatusEntry[];
}

const GRID_COLUMNS = '1.2fr 1.3fr 1.1fr 1.1fr 1fr';

export default function DeviceStatusTable({ devices }: DeviceStatusTableProps) {
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
        <span>DISPOSITIVO</span>
        <span>INSTALLAZIONE</span>
        <span>CONNETTIVITÀ</span>
        <span style={{ textAlign: 'right' }}>ULTIMO CONTATTO</span>
      </div>

      {devices.map((device) => {
        const installStyle = installStatusStyles[device.installStatus];
        const connectivityStyle = connectivityStyles[device.connectivity];
        const isExpanded = expandedId === device.id;

        return (
          <div key={device.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleRow(device.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  toggleRow(device.id);
                }
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLUMNS,
                padding: '12px 18px',
                borderBottom: isExpanded ? 'none' : '1px solid var(--color-app-bg)',
                alignItems: 'center',
                cursor: 'pointer',
                background: isExpanded ? 'var(--color-app-bg)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                  {device.plate}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 13 }}>{device.model}</div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
                >
                  {device.deviceId}
                </div>
              </div>

              <div>
                <span
                  className="badge"
                  style={{
                    background: installStyle.background,
                    color: installStyle.color,
                  }}
                >
                  {installStyle.label}
                </span>
              </div>

              {/* Connettività: qui, a differenza delle altre colonne, non
                  usiamo un badge con sfondo colorato ma solo un pallino +
                  etichetta — piccola variazione voluta per non appesantire
                  la riga con troppi badge fianco a fianco. */}
              <div
                style={{
                  fontSize: 12.5,
                  color: connectivityStyle.color,
                  fontWeight: 600,
                }}
              >
                ● {connectivityStyle.label}
              </div>

              <div
                style={{
                  textAlign: 'right',
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {device.lastContactText}
              </div>
            </div>

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
                <DetailField label="Data installazione" value={device.installDateText} />
                <DetailField label="SIM / connettività" value={device.sim} />
                <DetailField label="Fix GPS" value={device.gpsFix} />
                <DetailField label="Tensione alimentazione" value={device.voltage} />
                <DetailField label="Sorgente accensione" value={device.ignitionSource} />
                <DetailField label="Protocollo dati" value={device.protocol} />
                <DetailField label="Ultimo riavvio" value={device.lastRebootText} />
                <DetailField label="Firmware" value={device.firmware} mono />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Coppia etichetta/valore riusata per ogni campo del pannello espanso
 * (identica a quella di MaintenanceTable.tsx — se in futuro servisse in
 * una terza tabella, meglio spostarla in src/components/). */
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

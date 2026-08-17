// ─────────────────────────────────────────────────────────────────────────
// AlarmList: filtri a "chip" + elenco allarmi con azioni.
// ─────────────────────────────────────────────────────────────────────────
// Componente "presentazionale" (come FleetRegistryTable): riceve tutto
// tramite props e non sa da dove arrivano gli allarmi né dove va a
// finire il click su un bottone — decide tutto il genitore Alarms.tsx.
import { alarmSeverityStyles, alarmStatusStyles } from '../../common/alarmStyles';
import type { Alarm, AlarmStatus } from '../../types/alarm';

/** "all" in più rispetto ad AlarmStatus: il filtro "Tutti" non corrisponde
 * a nessuno stato reale di un allarme, quindi non può essere parte di
 * AlarmStatus — lo estendiamo qui con l'unione "|". */
export type AlarmFilter = AlarmStatus | 'all';

interface AlarmListProps {
  alarms: Alarm[];
  filter: AlarmFilter;
  onFilterChange: (filter: AlarmFilter) => void;
  onAck: (alarmId: string) => void;
  onClose: (alarmId: string) => void;
}

// Le 4 chip mostrate in cima alla lista: etichetta + valore di AlarmFilter
// da passare a onFilterChange quando vengono cliccate.
const FILTER_CHIPS: { label: string; value: AlarmFilter }[] = [
  { label: 'Tutti', value: 'all' },
  { label: 'Nuovi', value: 'new' },
  { label: 'In carico', value: 'ack' },
  { label: 'Chiusi', value: 'closed' },
];

export default function AlarmList({
  alarms,
  filter,
  onFilterChange,
  onAck,
  onClose,
}: AlarmListProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      {/* Barra dei filtri */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '14px 18px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.value === filter;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => onFilterChange(chip.value)}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 999,
                padding: '5px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                // Chip attivo: sfondo blu della sidebar, testo bianco.
                // Chip inattivo: sfondo trasparente, testo grigio.
                background: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                color: isActive
                  ? 'var(--color-text-inverse)'
                  : 'var(--color-text-secondary)',
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Messaggio se il filtro corrente non trova nessun allarme */}
      {alarms.length === 0 && (
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
          }}
        >
          Nessun allarme in questa categoria.
        </div>
      )}

      {/* Una riga per allarme */}
      {alarms.map((alarm) => {
        const severityStyle = alarmSeverityStyles[alarm.severity];
        const statusStyle = alarmStatusStyles[alarm.status];

        return (
          <div
            key={alarm.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              borderBottom: '1px solid var(--color-app-bg)',
              // Il bordo sinistro colorato secondo la gravità aiuta a
              // distinguere gli allarmi critici già a colpo d'occhio,
              // scorrendo la lista velocemente.
              borderLeft: `3px solid ${severityStyle.color}`,
            }}
          >
            {/* Titolo + sottotitolo (targa e regola) */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{alarm.title}</span>
                <span
                  className="badge"
                  style={{
                    background: severityStyle.background,
                    color: severityStyle.color,
                  }}
                >
                  {severityStyle.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  marginTop: 2,
                }}
              >
                <span className="mono">{alarm.plate}</span> — {alarm.rule}
              </div>
            </div>

            {/* Stato + orario, allineati verticalmente */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span
                className="badge"
                style={{ background: statusStyle.background, color: statusStyle.color }}
              >
                {statusStyle.label}
              </span>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-secondary)',
                  marginTop: 4,
                }}
              >
                {alarm.timeText}
              </div>
            </div>

            {/* Azioni disponibili: dipendono dallo stato corrente. Un
                allarme "closed" non ha più azioni da compiere. */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {alarm.status === 'new' && (
                <ActionButton label="Presa in carico" onClick={() => onAck(alarm.id)} />
              )}
              {alarm.status !== 'closed' && (
                <ActionButton
                  label="Chiudi"
                  variant="secondary"
                  onClick={() => onClose(alarm.id)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Piccolo bottone d'azione riusato per "Presa in carico" e "Chiudi",
 * per non ripetere due volte lo stesso blocco di stile. */
function ActionButton({
  label,
  onClick,
  variant = 'primary',
}: {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: isPrimary ? 'none' : '1px solid var(--color-border)',
        borderRadius: 6,
        padding: '6px 10px',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        background: isPrimary ? 'var(--color-sidebar-active)' : 'transparent',
        color: isPrimary ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
      }}
    >
      {label}
    </button>
  );
}

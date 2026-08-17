// ─────────────────────────────────────────────────────────────────────────
// KpiCharts: due grafici disegnati "a mano" con semplici <div>.
// ─────────────────────────────────────────────────────────────────────────
// Niente libreria di grafici esterna (es. "recharts", citata come idea
// futura nel vecchio placeholder di questa pagina): per due grafici così
// semplici — barre verticali e barre orizzontali — bastano dei <div> con
// altezza/larghezza calcolata in percentuale. Se in futuro servissero
// grafici più complessi (assi con scale automatiche, tooltip al passaggio
// del mouse, animazioni), a quel punto introdurre una libreria dedicata
// avrebbe più senso.
import type { HourlyEventCount, FleetUtilizationSlice } from '../../types/kpi';

interface KpiChartsProps {
  hourlyEvents: HourlyEventCount[];
  utilization: FleetUtilizationSlice[];
}

// Altezza fissa (in pixel) dell'area del grafico a barre verticali.
const HOURLY_CHART_HEIGHT_PX = 120;

export default function KpiCharts({ hourlyEvents, utilization }: KpiChartsProps) {
  // L'altezza di ogni barra è relativa al valore MASSIMO della serie: la
  // barra più alta arriva sempre a HOURLY_CHART_HEIGHT_PX, le altre sono
  // proporzionalmente più basse. "Math.max(...array)" richiede gli
  // argomenti separati (non un array), per questo usiamo lo spread "...".
  //
  // NOTA CSS: calcoliamo l'altezza in PIXEL (non in percentuale) di
  // proposito. Un'altezza in "%" avrebbe bisogno che il contenitore diretto
  // della barra abbia già un'altezza esplicita — qui invece il contenitore
  // è una colonna flex con altezza "automatica" (dipende dal contenuto), e
  // una percentuale calcolata su un'altezza automatica in CSS diventa 0:
  // tutte le barre risulterebbero invisibili. Usando i pixel evitiamo del
  // tutto il problema.
  const maxHourlyCount = Math.max(...hourlyEvents.map((point) => point.count));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
      {/* Grafico 1: eventi per ora, barre verticali */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          Eventi per ora — oggi
        </div>

        {/* "alignItems: flex-end" fa crescere le barre dal basso verso
            l'alto, come un normale grafico a barre. L'altezza del
            contenitore (120px) è fissa: le percentuali delle barre sono
            calcolate rispetto a QUESTA altezza. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            height: HOURLY_CHART_HEIGHT_PX,
          }}
        >
          {hourlyEvents.map((point) => {
            const heightPx =
              maxHourlyCount === 0
                ? 0
                : (point.count / maxHourlyCount) * HOURLY_CHART_HEIGHT_PX;
            return (
              <div
                key={point.hourLabel}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  title={`${point.count} eventi alle ${point.hourLabel}:00`}
                  style={{
                    width: '100%',
                    height: heightPx,
                    minHeight: 2,
                    borderRadius: '3px 3px 0 0',
                    background: 'var(--color-sidebar-active)',
                  }}
                />
                <div
                  style={{
                    fontSize: 9.5,
                    color: 'var(--color-text-secondary)',
                    marginTop: 4,
                  }}
                >
                  {point.hourLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grafico 2: utilizzo flotta per stato, barre orizzontali */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          Utilizzo flotta per stato
        </div>

        {utilization.map((slice) => (
          <div key={slice.label} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>{slice.label}</span>
              <span className="mono" style={{ fontWeight: 600 }}>
                {slice.count} · {slice.percent}%
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: 'var(--color-app-bg)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${slice.percent}%`,
                  background: slice.color,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Reports: pagina "KPI e report" — orchestratore.
// ─────────────────────────────────────────────────────────────────────────
// 4 card numeriche principali + 6 mini-card secondarie + due grafici
// (eventi per ora, utilizzo flotta). Tutta la pagina è in sola lettura:
// non ci sono azioni dell'operatore da gestire, solo dati da mostrare —
// per questo non serve uno stato mutabile come in Alarms.tsx.
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchKpiOverview } from '../../services/fleetService';
import PlaceholderSection from '../../components/PlaceholderSection';
import StatCard from '../../components/StatCard';
import KpiCharts from './KpiCharts';

export default function Reports() {
  const { data: overview, isLoading, error } = useAsyncData(fetchKpiOverview);

  // Stato 1 di 3: caricamento in corso.
  if (isLoading) {
    return (
      <PlaceholderSection
        title="Caricamento report…"
        description="Calcolo gli indicatori aggiornati della flotta."
      />
    );
  }

  // Stato 2 di 3: errore (o dati comunque assenti, per sicurezza).
  if (error || !overview) {
    return (
      <PlaceholderSection
        title="Impossibile caricare i report"
        description={error ?? 'Errore sconosciuto durante il caricamento.'}
      />
    );
  }

  // Stato 3 di 3: dati pronti.
  const { summary, secondary, hourlyEvents, utilization } = overview;

  return (
    <div>
      {/* 4 card principali */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <StatCard
          label="Veicoli attivi"
          value={`${summary.activeVehicles} / ${summary.totalVehicles}`}
        />
        <StatCard
          label="Km percorsi oggi"
          value={`${summary.kmToday.toLocaleString('it-IT')} km`}
        />
        <StatCard
          label="Allarmi attivi"
          value={summary.activeAlarms}
          valueColor="var(--color-status-alarm)"
        />
        <StatCard
          label="Dispositivi offline"
          value={summary.offlineDevices}
          valueColor="var(--color-status-offline)"
        />
      </div>

      {/* 6 mini-card secondarie, più piccole delle principali */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {secondary.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {kpi.label}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginTop: 2,
                color: kpi.color ?? 'var(--color-text-primary)',
              }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <KpiCharts hourlyEvents={hourlyEvents} utilization={utilization} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Maintenance: pagina "Manutenzione programmata" — orchestratore.
// ─────────────────────────────────────────────────────────────────────────
// 3 card di riepilogo (Scadute/In scadenza/Programmate) + tabella con
// righe espandibili: cliccando una riga si apre un pannello con i dettagli
// completi del veicolo (Reparto, VIN, Immatricolazione...), senza dover
// aprire una pagina separata come fa invece l'Anagrafica veicoli.
import { useMemo } from 'react';

import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchMaintenanceItems } from '../../services/fleetService';
import PlaceholderSection from '../../components/PlaceholderSection';
import StatCard from '../../components/StatCard';
import MaintenanceTable from './MaintenanceTable';

export default function Maintenance() {
  const { data: items, isLoading, error } = useAsyncData(fetchMaintenanceItems);

  // Le 3 card di riepilogo dipendono solo dai dati caricati (qui non c'è
  // uno stato mutabile come in Alarms: la manutenzione, in questo step, è
  // in sola lettura — non ci sono ancora azioni che cambiano lo stato di
  // un intervento). "useMemo" con dipendenza "items" evita di ricalcolare
  // i conteggi quando il componente si ridisegna per altri motivi.
  const counts = useMemo(() => {
    if (!items) return { overdue: 0, due: 0, upcoming: 0 };
    return {
      overdue: items.filter((item) => item.status === 'overdue').length,
      due: items.filter((item) => item.status === 'due').length,
      upcoming: items.filter((item) => item.status === 'upcoming').length,
    };
  }, [items]);

  // Stato 1 di 3: caricamento in corso.
  if (isLoading) {
    return (
      <PlaceholderSection
        title="Caricamento manutenzioni…"
        description="Recupero le scadenze programmate della flotta."
      />
    );
  }

  // Stato 2 di 3: errore (o dati comunque assenti, per sicurezza).
  if (error || !items) {
    return (
      <PlaceholderSection
        title="Impossibile caricare le manutenzioni"
        description={error ?? 'Errore sconosciuto durante il caricamento.'}
      />
    );
  }

  // Stato 3 di 3: dati pronti.
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatCard
          label="Scadute"
          value={counts.overdue}
          valueColor="var(--color-status-alarm)"
        />
        <StatCard
          label="In scadenza"
          value={counts.due}
          valueColor="var(--color-status-warning)"
        />
        <StatCard
          label="Programmate"
          value={counts.upcoming}
          valueColor="var(--color-status-moving)"
        />
      </div>

      <MaintenanceTable items={items} />
    </div>
  );
}

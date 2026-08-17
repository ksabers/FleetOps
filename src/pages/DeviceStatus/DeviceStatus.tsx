// ─────────────────────────────────────────────────────────────────────────
// DeviceStatus: pagina "Stato dispositivi" — orchestratore.
// ─────────────────────────────────────────────────────────────────────────
// 3 card di riepilogo (Online/Offline/In installazione) + tabella con
// righe espandibili — stesso identico pattern già introdotto in
// Maintenance.tsx/MaintenanceTable.tsx, applicato qui ai dispositivi GPS
// invece che agli interventi di manutenzione.
import { useMemo } from 'react';

import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchDeviceStatuses } from '../../services/fleetService';
import PlaceholderSection from '../../components/PlaceholderSection';
import StatCard from '../../components/StatCard';
import DeviceStatusTable from './DeviceStatusTable';

export default function DeviceStatus() {
  const { data: devices, isLoading, error } = useAsyncData(fetchDeviceStatuses);

  const counts = useMemo(() => {
    if (!devices) return { online: 0, offline: 0, pending: 0 };
    return {
      online: devices.filter((device) => device.connectivity === 'online').length,
      // "Offline-assenti" comprende sia i dispositivi realmente offline
      // sia quelli con segnale debole, che nella pratica sono comunque
      // "poco raggiungibili" e meritano attenzione.
      offline: devices.filter(
        (device) => device.connectivity === 'offline' || device.connectivity === 'weak',
      ).length,
      pending: devices.filter((device) => device.installStatus === 'pending').length,
    };
  }, [devices]);

  // Stato 1 di 3: caricamento in corso.
  if (isLoading) {
    return (
      <PlaceholderSection
        title="Caricamento stato dispositivi…"
        description="Verifico la connettività dei dispositivi installati."
      />
    );
  }

  // Stato 2 di 3: errore (o dati comunque assenti, per sicurezza).
  if (error || !devices) {
    return (
      <PlaceholderSection
        title="Impossibile caricare lo stato dei dispositivi"
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
          label="Dispositivi online"
          value={counts.online}
          valueColor="var(--color-status-moving)"
        />
        <StatCard
          label="Offline / assenti"
          value={counts.offline}
          valueColor="var(--color-status-alarm)"
        />
        <StatCard
          label="In installazione / verifica"
          value={counts.pending}
          valueColor="var(--color-status-warning)"
        />
      </div>

      <DeviceStatusTable devices={devices} />
    </div>
  );
}

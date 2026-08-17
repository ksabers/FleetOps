// ─────────────────────────────────────────────────────────────────────────
// Alarms: pagina "Allarmi e regole" — orchestratore.
// ─────────────────────────────────────────────────────────────────────────
// Corrisponde agli "Events" di Traccar (endpoint /api/events e/o
// notifiche via WebSocket). Mostra 4 card di riepilogo, dei filtri a
// "chip" (Tutti/Nuovi/In carico/Chiusi) e la lista degli allarmi con due
// azioni per operatore: "Presa in carico" e "Chiudi".
//
// NOVITÀ rispetto alle pagine degli step precedenti: qui, oltre a caricare
// i dati (come Mappa e Anagrafica), l'utente può anche MODIFICARLI (cambiare
// lo stato di un allarme cliccando un bottone). Serve quindi uno stato
// "mutabile" in più, oltre a quello di caricamento.
//
// Scelta di progettazione: separiamo il componente in due.
//   1. Alarms (qui sotto) si occupa SOLO del caricamento asincrono, con lo
//      stesso pattern a 3 stati già visto in MapView/VehicleRegistry.
//   2. AlarmsLoaded (sotto, nello stesso file) viene creato SOLO quando i
//      dati sono già arrivati, e possiede lo stato mutabile (l'elenco
//      allarmi modificabile + il filtro attivo).
// Perché non un solo componente con "useEffect" per copiare i dati
// caricati in uno stato locale? Funzionerebbe, ma richiederebbe di gestire
// il caso "i dati non sono ancora arrivati" anche nello stato mutabile.
// Creando AlarmsLoaded solo a dati pronti, "useState(initialAlarms)"
// riceve subito il valore giusto come valore iniziale, senza passaggi in
// più: è la tecnica "key/mount condizionale" per inizializzare uno stato
// da una prop, spesso più semplice di un useEffect di sincronizzazione.
import { useMemo, useState } from 'react';

import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAlarms } from '../../services/fleetService';
import PlaceholderSection from '../../components/PlaceholderSection';
import StatCard from '../../components/StatCard';
import AlarmList, { type AlarmFilter } from './AlarmList';
import type { Alarm, AlarmStatus } from '../../types/alarm';

export default function Alarms() {
  const { data: alarms, isLoading, error } = useAsyncData(fetchAlarms);

  // Stato 1 di 3: caricamento in corso.
  if (isLoading) {
    return (
      <PlaceholderSection
        title="Caricamento allarmi…"
        description="Recupero gli eventi più recenti dal server."
      />
    );
  }

  // Stato 2 di 3: errore (o dati comunque assenti, per sicurezza).
  if (error || !alarms) {
    return (
      <PlaceholderSection
        title="Impossibile caricare gli allarmi"
        description={error ?? 'Errore sconosciuto durante il caricamento.'}
      />
    );
  }

  // Stato 3 di 3: dati pronti — passiamo il testimone al componente che
  // gestisce filtri e azioni sull'elenco già caricato.
  return <AlarmsLoaded initialAlarms={alarms} />;
}

interface AlarmsLoadedProps {
  initialAlarms: Alarm[];
}

function AlarmsLoaded({ initialAlarms }: AlarmsLoadedProps) {
  // "alarms" è la nostra copia LOCALE e mutabile dell'elenco: le azioni
  // dell'operatore (presa in carico, chiusura) cambiano questo stato, non
  // i dati mock originali. In un'app reale, ogni cambiamento andrebbe
  // anche inviato al server (es. PUT /api/events/{id}) — passo che
  // lasciamo fuori da questo step per restare sul solo comportamento
  // dell'interfaccia.
  const [alarms, setAlarms] = useState<Alarm[]>(initialAlarms);
  const [filter, setFilter] = useState<AlarmFilter>('all');

  // Le 4 card di riepilogo si ricalcolano ogni volta che "alarms" cambia.
  // "useMemo" evita di ripetere questi conteggi a ogni render se
  // "alarms" non è cambiato — qui gli array sono piccoli e non sarebbe
  // un problema di performance reale, ma è un buon momento per introdurre
  // il concetto: memorizza il risultato di un calcolo finché le sue
  // dipendenze (il secondo argomento, in array) restano le stesse.
  const counts = useMemo(() => {
    const countByStatus = (status: AlarmStatus) =>
      alarms.filter((alarm) => alarm.status === status).length;

    return {
      new: countByStatus('new'),
      ack: countByStatus('ack'),
      // "Critici attivi" = severità critica E non ancora chiusi.
      criticalActive: alarms.filter(
        (alarm) => alarm.severity === 'critical' && alarm.status !== 'closed',
      ).length,
      closed: countByStatus('closed'),
    };
  }, [alarms]);

  // Lista filtrata da passare al componente presentazionale: "all" mostra
  // tutto, altrimenti solo gli allarmi con lo stato scelto.
  const filteredAlarms =
    filter === 'all' ? alarms : alarms.filter((alarm) => alarm.status === filter);

  /**
   * Cambia lo stato di UN SOLO allarme (identificato da "id") nel nuovo
   * stato passato. ".map()" ricostruisce l'intero array: per ogni allarme,
   * se l'id corrisponde restituisce una COPIA con lo stato aggiornato
   * (lo spread "...alarm" copia tutti i campi, poi "status" li sovrascrive),
   * altrimenti restituisce l'allarme originale, invariato.
   *
   * Perché non modificare direttamente "alarm.status = newStatus"? In React
   * non si modificano MAI oggetti/array di stato "sul posto": bisogna
   * sempre creare una copia nuova e passarla a setState, altrimenti React
   * non si accorge che qualcosa è cambiato e non ridisegna la pagina.
   */
  function updateAlarmStatus(id: string, newStatus: AlarmStatus) {
    setAlarms((currentAlarms) =>
      currentAlarms.map((alarm) =>
        alarm.id === id ? { ...alarm, status: newStatus } : alarm,
      ),
    );
  }

  return (
    <div>
      {/* Riga di 4 card di riepilogo, come nelle altre pagine con KPI. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatCard
          label="Nuovi"
          value={counts.new}
          valueColor="var(--color-status-alarm)"
        />
        <StatCard
          label="Presi in carico"
          value={counts.ack}
          valueColor="var(--color-status-warning)"
        />
        <StatCard
          label="Critici attivi"
          value={counts.criticalActive}
          valueColor="var(--color-status-alarm)"
        />
        <StatCard
          label="Chiusi"
          value={counts.closed}
          valueColor="var(--color-status-moving)"
        />
      </div>

      <AlarmList
        alarms={filteredAlarms}
        filter={filter}
        onFilterChange={setFilter}
        onAck={(id) => updateAlarmStatus(id, 'ack')}
        onClose={(id) => updateAlarmStatus(id, 'closed')}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Dati finti (mock) della cronologia ATTIVITÀ.
// ─────────────────────────────────────────────────────────────────────────
// Elenco già "registrato" di azioni passate sugli allarmi. Come spiegato in
// types/activityEntry.ts, questa cronologia NON è collegata dal vivo alla
// pagina Allarmi in questo step: sono due liste indipendenti.
import type { ActivityEntry } from '../types/activityEntry';

export const mockActivity: ActivityEntry[] = [
  {
    id: 'act1',
    timeText: 'oggi, 11:58',
    type: 'ack',
    plate: 'SV654IJ',
    rule: 'Dispositivo offline',
    note: 'Contattato il conducente, verifica in corso.',
  },
  {
    id: 'act2',
    timeText: 'oggi, 11:20',
    type: 'ack',
    plate: 'SV123AB',
    rule: 'Uscita da geofence',
  },
  {
    id: 'act3',
    timeText: 'oggi, 09:12',
    type: 'close',
    plate: 'SV159MN',
    rule: 'Eccesso di velocità',
    note: 'Falso allarme, tratto in discesa.',
  },
  {
    id: 'act4',
    timeText: 'ieri, 18:45',
    type: 'close',
    plate: 'SV456CD',
    rule: 'Sosta prolungata non autorizzata',
  },
  {
    id: 'act5',
    timeText: 'ieri, 16:30',
    type: 'escalate',
    plate: 'SV321GH',
    rule: 'Allarme di manomissione',
    note: 'Inoltrato al responsabile di reparto.',
  },
  {
    id: 'act6',
    timeText: 'ieri, 08:05',
    type: 'ack',
    plate: 'GE789EF',
    rule: 'Eccesso di velocità',
  },
];

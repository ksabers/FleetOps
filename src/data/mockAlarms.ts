// ─────────────────────────────────────────────────────────────────────────
// Dati finti (mock) degli ALLARMI, usati finché non arriva un vero
// Traccar Server (Step 6 collegherà qui GET /api/events o il WebSocket).
// ─────────────────────────────────────────────────────────────────────────
// Le targhe richiamano di proposito i 7 veicoli già definiti in
// mockVehicles.ts, così l'app resta coerente: un allarme su "SV321GH"
// corrisponde davvero al Renault Master mostrato in Mappa e Anagrafica.
import type { Alarm } from '../types/alarm';

export const mockAlarms: Alarm[] = [
  {
    id: 'al1',
    plate: 'SV321GH',
    title: 'Allarme di manomissione',
    rule: 'Tamper',
    severity: 'critical',
    status: 'new',
    timeText: '2 minuti fa',
  },
  {
    id: 'al2',
    plate: 'GE789EF',
    title: 'Eccesso di velocità',
    rule: 'Velocità > 90 km/h',
    severity: 'warning',
    status: 'new',
    timeText: '8 minuti fa',
  },
  {
    id: 'al3',
    plate: 'SV654IJ',
    title: 'Dispositivo offline',
    rule: 'Nessun contatto > 2h',
    severity: 'warning',
    status: 'ack',
    timeText: '35 minuti fa',
  },
  {
    id: 'al4',
    plate: 'SV123AB',
    title: 'Uscita da geofence',
    rule: 'Zona autorizzata "Deposito"',
    severity: 'info',
    status: 'ack',
    timeText: '1 ora fa',
  },
  {
    id: 'al5',
    plate: 'SV987KL',
    title: 'Possibile incidente',
    rule: 'Decelerazione brusca',
    severity: 'critical',
    status: 'new',
    timeText: '3 minuti fa',
  },
  {
    id: 'al6',
    plate: 'SV456CD',
    title: 'Sosta prolungata non autorizzata',
    rule: 'Fermo motore acceso > 20 min',
    severity: 'info',
    status: 'closed',
    timeText: 'ieri, 18:42',
  },
  {
    id: 'al7',
    plate: 'SV159MN',
    title: 'Eccesso di velocità',
    rule: 'Velocità > 90 km/h',
    severity: 'warning',
    status: 'closed',
    timeText: 'oggi, 09:10',
  },
];

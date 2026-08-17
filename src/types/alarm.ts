// ─────────────────────────────────────────────────────────────────────────
// Tipi legati agli ALLARMI (Step 5). Corrisponde alla risorsa /api/events
// di Traccar (o alle notifiche ricevute via WebSocket in tempo reale).
// ─────────────────────────────────────────────────────────────────────────

/**
 * Gravità dell'allarme, usata per scegliere colore del bordo/badge e per
 * calcolare il contatore "Critici attivi" nella pagina Allarmi.
 */
export type AlarmSeverity = 'critical' | 'warning' | 'info';

/**
 * Stato del ciclo di vita dell'allarme, gestito dall'operatore:
 *   new    -> appena arrivato, nessuno l'ha ancora visto
 *   ack    -> "presa in carico" da un operatore
 *   closed -> risolto/chiuso
 * Nella PoC originale esisteva anche l'escalation verso un responsabile:
 * l'abbiamo lasciata fuori da questo primo step per restare su un'azione
 * alla volta (presa in carico, chiusura); si può aggiungere in seguito.
 */
export type AlarmStatus = 'new' | 'ack' | 'closed';

export interface Alarm {
  id: string;
  /** Targa del veicolo che ha generato l'allarme. */
  plate: string;
  /** Titolo breve mostrato in grassetto, es. "Eccesso di velocità". */
  title: string;
  /** Nome della regola/soglia che ha scatenato l'allarme. */
  rule: string;
  severity: AlarmSeverity;
  status: AlarmStatus;
  /** Etichetta testuale già formattata, es. "3 minuti fa". */
  timeText: string;
}

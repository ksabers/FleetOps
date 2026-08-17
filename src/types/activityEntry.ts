// ─────────────────────────────────────────────────────────────────────────
// Tipi legati alla cronologia ATTIVITÀ (Step 5).
// ─────────────────────────────────────────────────────────────────────────
// Nella PoC originale questa cronologia si popolava dal vivo mentre
// l'operatore agiva sugli allarmi (presa in carico, chiusura...). In questo
// step la teniamo volutamente SEPARATA dalla pagina Allarmi — un elenco di
// eventi già registrati, letto in sola lettura — per non introdurre stato
// condiviso tra due pagine diverse in un colpo solo. Collegare le due
// pagine "dal vivo" (ogni azione su un allarme genera qui una nuova riga)
// è un miglioramento naturale per un prossimo step, quando probabilmente
// arriverà anche un contenitore di stato globale condiviso (es. Redux,
// come fa traccar-web).

/** Tipo di azione registrata: presa in carico, escalation o chiusura. */
export type ActivityType = 'ack' | 'escalate' | 'close';

export interface ActivityEntry {
  id: string;
  timeText: string;
  type: ActivityType;
  plate: string;
  rule: string;
  /** Nota facoltativa lasciata dall'operatore al momento dell'azione. */
  note?: string;
}

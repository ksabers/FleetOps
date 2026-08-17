// ─────────────────────────────────────────────────────────────────────────
// StatCard: card numerica di riepilogo riusabile ("Nuovi: 3", "Scadute: 2"…)
// ─────────────────────────────────────────────────────────────────────────
// Introdotto allo Step 5: Allarmi, Manutenzione, KPI e Stato dispositivi
// mostrano tutte, in cima alla pagina, una fila di card con la stessa
// identica forma (etichetta piccola sopra + numero grande sotto). Invece di
// ripetere lo stesso JSX/CSS in 4 pagine diverse, lo scriviamo una volta
// sola qui — stessa filosofia già vista con PlaceholderSection.

interface StatCardProps {
  label: string;
  value: string | number;
  /** Colore del numero; se omesso usa il colore di testo standard. */
  valueColor?: string;
  /** Colore del bordo superiore (striscia colorata); opzionale. */
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  valueColor,
  accentColor,
}: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTop: accentColor ? `3px solid ${accentColor}` : undefined,
        borderRadius: 'var(--radius-md)',
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</div>
      <div
        // I valori numerici usano il font monospace, come odometro e VIN
        // nell'Anagrafica: rende più leggibili colpo d'occhio le cifre.
        className={typeof value === 'number' ? 'mono' : undefined}
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: valueColor ?? 'var(--color-text-primary)',
          marginTop: 3,
        }}
      >
        {value}
      </div>
    </div>
  );
}

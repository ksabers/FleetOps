// ─────────────────────────────────────────────────────────────────────────
// Activity: pagina "Cronologia interventi" — in sola lettura.
// ─────────────────────────────────────────────────────────────────────────
// A differenza delle altre 4 pagine di questo step, qui non serve un
// componente presentazionale separato: la pagina è un semplice elenco,
// senza filtri, azioni o righe espandibili — un solo file basta e resta
// facile da leggere.
//
// NOTA IMPORTANTE (per un futuro step): questa cronologia NON è collegata
// "dal vivo" alle azioni della pagina Allarmi. Se allo Step 5 prendi in
// carico o chiudi un allarme, quell'azione non appare qui automaticamente
// — sono due elenchi di dati mock indipendenti. Collegarli davvero
// richiederebbe uno stato condiviso tra le due pagine (es. un Context
// React, o uno store centralizzato come Redux, usato proprio per questo
// da traccar-web): un miglioramento naturale per uno step successivo,
// quando servirà davvero far comunicare più pagine tra loro.
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchActivityLog } from '../../services/fleetService';
import PlaceholderSection from '../../components/PlaceholderSection';
import { activityTypeStyles } from '../../common/activityStyles';

export default function Activity() {
  const { data: entries, isLoading, error } = useAsyncData(fetchActivityLog);

  // Stato 1 di 3: caricamento in corso.
  if (isLoading) {
    return (
      <PlaceholderSection
        title="Caricamento cronologia…"
        description="Recupero gli interventi registrati."
      />
    );
  }

  // Stato 2 di 3: errore (o dati comunque assenti, per sicurezza).
  if (error || !entries) {
    return (
      <PlaceholderSection
        title="Impossibile caricare la cronologia"
        description={error ?? 'Errore sconosciuto durante il caricamento.'}
      />
    );
  }

  // Stato 3 di 3: dati pronti.
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        Cronologia interventi
      </div>

      {/* "Stato vuoto": se in futuro l'elenco fosse vuoto (es. nessun
          intervento oggi), mostriamo un messaggio invece di una tabella
          senza righe — buona pratica già vista nella PoC originale. */}
      {entries.length === 0 && (
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
          }}
        >
          Nessun intervento registrato.
        </div>
      )}

      {entries.map((entry) => {
        const typeStyle = activityTypeStyles[entry.type];

        return (
          <div
            key={entry.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '12px 18px',
              borderBottom: '1px solid var(--color-app-bg)',
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 11.5,
                color: 'var(--color-text-secondary)',
                width: 78,
                flexShrink: 0,
              }}
            >
              {entry.timeText}
            </div>

            <span
              className="badge"
              style={{
                background: typeStyle.background,
                color: typeStyle.color,
                flexShrink: 0,
              }}
            >
              {typeStyle.label}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13 }}>
                <span className="mono" style={{ fontWeight: 600 }}>
                  {entry.plate}
                </span>{' '}
                — {entry.rule}
              </div>
              {entry.note && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-secondary)',
                    marginTop: 2,
                  }}
                >
                  {entry.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

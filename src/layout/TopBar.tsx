// ─────────────────────────────────────────────────────────────────────────
// TopBar: la barra in alto (titolo pagina, ricerca, badge "PoC", orologio).
// ─────────────────────────────────────────────────────────────────────────
// Qui introduciamo i primi due "hook" di React, i mattoncini con cui i
// componenti gestiscono stato e "effetti collaterali":
//
//   useState(valoreIniziale) restituisce una coppia [valore, funzionePerCambiarlo].
//   Ogni volta che chiami la funzione per cambiare il valore, React ridisegna
//   (ri-renderizza) il componente con il nuovo valore.
//
//   useEffect(funzione, dipendenze) esegue "funzione" dopo che il componente
//   è stato disegnato. Con dipendenze = [] viene eseguita una sola volta,
//   quando il componente compare per la prima volta (utile per partire un
//   timer, una sottoscrizione, una chiamata di rete...).
//
// Li usiamo per un semplice orologio che si aggiorna ogni secondo, come
// quello visto in alto a destra nella PoC.

import { useEffect, useState } from 'react';

// title e subtitle sono le "props": i valori che il componente padre (in
// questo caso AppLayout) passa a TopBar per personalizzarne il contenuto,
// così ogni pagina può mostrare un titolo diverso riusando lo stesso TopBar.

// 1. Definiamo l'interfaccia per le props
interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  // Stato locale: l'orario corrente. Lo inizializziamo con "adesso".
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // setInterval richiama la funzione ogni 1000ms, aggiornando lo stato
    // "now" e quindi facendo ridisegnare l'orologio.
    const timerId = setInterval(() => setNow(new Date()), 1000);

    // La funzione ritornata da useEffect è la "pulizia": React la chiama
    // quando il componente viene smontato (es. l'utente cambia pagina),
    // per evitare che il timer continui a girare "a vuoto" in background.
    return () => clearInterval(timerId);
  }, []); // array di dipendenze vuoto = esegui solo al primo render

  const timeLabel = now.toLocaleTimeString('it-IT');

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Campo di ricerca: per ora è "muto" (non filtra nulla), esattamente
          come nella PoC. Lo collegheremo ai dati reali in un passo futuro. */}
      <input
        type="search"
        placeholder="Cerca targa, modello..."
        style={{
          flex: 1,
          maxWidth: 360,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
        }}
      />

      <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
        ● PoC · dati demo
      </span>

      <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
        {timeLabel}
      </span>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PlaceholderSection: componente "segnaposto" temporaneo.
// ─────────────────────────────────────────────────────────────────────────
// In questo primo passo, 6 delle 7 pagine mostrano solo un riquadro con un
// titolo e una breve nota di cosa conterranno. Invece di ripetere lo stesso
// JSX in ogni file di pagina, lo mettiamo una volta sola qui e lo importiamo
// ovunque serve: è il concetto di "componente riusabile", uno dei motivi
// principali per cui si usa React.
//
// "children" è una prop speciale: è tutto ciò che scrivi TRA il tag di
// apertura e chiusura del componente quando lo usi, es:
//   <PlaceholderSection title="Ciao">testo qui</PlaceholderSection>
// "testo qui" arriva dentro come props.children.

import React from 'react';

// 1. Definiamo l'interfaccia per le props
interface PlaceholderSectionProps {
  title: string;
  description?: string; // Il '?' lo rende opzionale se la descrizione non serve sempre
  children?: React.ReactNode; // Tipo standard per qualsiasi contenuto JSX superabile come child
}

// 2. Applichiamo l'interfaccia al componente
export default function PlaceholderSection({
  title,
  description,
  children,
}: PlaceholderSectionProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 32,
        color: 'var(--color-text-secondary)',
      }}
    >
      <h2 style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>{title}</h2>
      {description && <p style={{ margin: 0 }}>{description}</p>}
      {children}
    </div>
  );
}

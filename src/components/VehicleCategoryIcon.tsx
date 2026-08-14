// ─────────────────────────────────────────────────────────────────────────
// VehicleCategoryIcon: la piccola icona lineare che rappresenta la
// categoria di un veicolo (leggero / pesante / speciale).
// ─────────────────────────────────────────────────────────────────────────
// Le tre forme SVG qui sotto sono ricopiate esattamente dalla PoC originale
// (i blocchi "isLight" / "isTruck" / "isSpecial" dentro il file HTML), così
// il colpo d'occhio resta identico. "currentColor" è un valore CSS speciale:
// significa "usa il colore del testo di questo elemento", quindi l'icona
// eredita automaticamente il colore che le passiamo tramite lo style
// "color: ..." del contenitore — non dobbiamo scrivere tre varianti di
// colore per ogni icona.
//
// Nota per chi viene da C#: qui usiamo uno "switch" su un'unione di stringhe
// (VehicleCategory) per scegliere quale <svg> disegnare. È l'equivalente di
// uno switch su un enum, con il vantaggio che TypeScript sa già quali sono
// TUTTI i valori possibili di "category".
import type { VehicleCategory } from '../types/vehicleRegistry';

interface VehicleCategoryIconProps {
  category: VehicleCategory;
  /** Lato dell'icona in pixel (larghezza = altezza, è quadrata). */
  size?: number;
}

export default function VehicleCategoryIcon({
  category,
  size = 16,
}: VehicleCategoryIconProps) {
  // Props comuni a tutte e tre le varianti, per non ripeterle tre volte.
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (category === 'light') {
    // Veicolo leggero: sagoma di un'utilitaria/furgoncino piccolo.
    return (
      <svg {...commonProps}>
        <path d="M5 11l1.6-4.7A2 2 0 0 1 8.5 5h7a2 2 0 0 1 1.9 1.3L19 11" />
        <rect x="3" y="11" width="18" height="5" rx="1.2" />
        <circle cx="7.5" cy="17.5" r="1.4" />
        <circle cx="16.5" cy="17.5" r="1.4" />
      </svg>
    );
  }

  if (category === 'truck') {
    // Veicolo pesante: cabina + cassone.
    return (
      <svg {...commonProps}>
        <rect x="2" y="6" width="11" height="9" rx="1" />
        <path d="M13 9h4l3 3v3h-7z" />
        <circle cx="6" cy="17.5" r="1.5" />
        <circle cx="17" cy="17.5" r="1.5" />
      </svg>
    );
  }

  // category === 'special': mezzo attrezzato/speciale, rappresentato con un
  // ingranaggio (nella PoC indica allestimenti non standard, es. officina
  // mobile).
  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </svg>
  );
}

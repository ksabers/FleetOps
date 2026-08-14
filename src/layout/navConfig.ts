// ─────────────────────────────────────────────────────────────────────────
// Configurazione della barra di navigazione laterale (sidebar).
// ─────────────────────────────────────────────────────────────────────────
// Teniamo la lista delle voci di menu in un semplice array di dati, separato
// dal componente <Sidebar> che le disegna. Vantaggi:
//   - Per aggiungere/rinominare una voce di menu basta modificare questo
//     array, senza toccare il TSX del componente.
//   - In futuro potremo generare questa lista dinamicamente (es. in base ai
//     permessi dell'utente loggato su Traccar) senza cambiare la Sidebar.
//
// Ogni voce ha:
//   - "to":    il percorso della rotta (deve corrispondere a quelli definiti
//              in App.tsx dentro <Route path="..." />)
//   - "label": il testo mostrato all'utente
//   - "group": la sezione della sidebar in cui compare ("Monitoraggio" o
//              "Gestione"), esattamente come nella PoC originale.

export interface NavItem {
  to: string;
  label: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: 'Monitoraggio',
    items: [
      { to: '/mappa', label: 'Mappa operativa' },
      { to: '/veicoli', label: 'Anagrafica veicoli' },
      { to: '/allarmi', label: 'Allarmi e regole' },
    ],
  },
  {
    title: 'Gestione',
    items: [
      { to: '/manutenzione', label: 'Manutenzione' },
      { to: '/attivita', label: 'Attività' },
      { to: '/report', label: 'KPI e report' },
      { to: '/dispositivi', label: 'Stato dispositivi' },
    ],
  },
];

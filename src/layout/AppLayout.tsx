// ─────────────────────────────────────────────────────────────────────────
// AppLayout: il "guscio" comune a tutte le pagine.
// ─────────────────────────────────────────────────────────────────────────
// Struttura: Sidebar a sinistra + (TopBar sopra + contenuto della pagina
// sotto) a destra. Esattamente il layout a 2 colonne della PoC.
//
// <Outlet /> è un segnaposto speciale di react-router-dom: verrà sostituito
// automaticamente con il componente della rotta "figlia" attiva (definita in
// App.tsx). Grazie a questo, Sidebar e TopBar restano sempre visibili mentre
// solo il contenuto centrale cambia passando da una sezione all'altra —
// niente ricaricamenti di pagina, niente sidebar che "sfarfalla".

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { pageMeta } from './pageMeta';

export default function AppLayout() {
  // useLocation() restituisce informazioni sull'URL corrente (tra cui
  // "pathname", cioè il percorso, es. "/veicoli"). Lo usiamo per scegliere
  // titolo e sottotitolo corretti da passare alla TopBar.
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? { title: 'FleetOps' };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />

      {/* Colonna destra: TopBar fissa in alto + area contenuto scorrevole. */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title={meta.title} subtitle={meta.subtitle} />

        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 24,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

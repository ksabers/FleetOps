// ─────────────────────────────────────────────────────────────────────────
// Sidebar: il menu di navigazione scuro sul lato sinistro (come nella PoC).
// ─────────────────────────────────────────────────────────────────────────
// Riceve i dati da navConfig.js e li disegna. Usiamo il componente <NavLink>
// di react-router-dom invece di un normale <a>: si comporta come un link,
// ma sa automaticamente se il percorso a cui punta è quello "attivo" (cioè
// quello attualmente mostrato) e in tal caso ci permette di applicargli uno
// stile diverso (className tramite una funzione, vedi sotto).

import { NavLink } from 'react-router-dom';
import { navGroups } from './navConfig';

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0, // non si deve restringere se lo spazio scarseggia
        background: 'var(--color-sidebar-bg)',
        color: 'var(--color-text-inverse)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
      }}
    >
      {/* Intestazione con il nome del prodotto, come "FleetOps" nella PoC. */}
      <div style={{ padding: '0 20px 20px', fontWeight: 700, fontSize: 16 }}>
        FleetOps
        <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.6 }}>
          CENTRO OPERATIVO
        </div>
      </div>

      {/* .map() scorre l'array navGroups e per ognuno crea un blocco di menu.
          Questo è il modo standard in React di trasformare una lista di dati
          in una lista di elementi JSX. */}
      {navGroups.map((group) => (
        <div key={group.title} style={{ marginBottom: 20 }}>
          <div
            style={{
              padding: '4px 20px',
              fontSize: 11,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              opacity: 0.5,
            }}
          >
            {group.title}
          </div>

          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              // NavLink passa a questa funzione un oggetto { isActive } che
              // dice se il link corrisponde alla pagina corrente: lo usiamo
              // per applicare uno sfondo diverso alla voce selezionata.
              style={({ isActive }) => ({
                display: 'block',
                padding: '10px 20px',
                textDecoration: 'none',
                color: 'var(--color-text-inverse)',
                fontSize: 14,
                background: isActive ? 'var(--color-sidebar-active)' : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}

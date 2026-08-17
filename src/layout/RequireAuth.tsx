// ─────────────────────────────────────────────────────────────────────────
// RequireAuth — "guardia" per le rotte che richiedono un utente collegato.
// ─────────────────────────────────────────────────────────────────────────
// Idea: invece di scrivere il controllo "se non sono loggato, vai al login"
// dentro ognuna delle 7 pagine esistenti (Mappa, Veicoli, Allarmi...),
// scriviamo il controllo UNA SOLA VOLTA in questo componente, e lo usiamo
// in App.tsx avvolgendo l'intero <AppLayout> (che contiene tutte le pagine).
//
// Come funziona:
//   - Se stiamo ancora controllando se esiste una sessione valida
//     (isCheckingSession === true, appena l'app si è aperta), mostriamo un
//     messaggio neutro invece del contenuto: dura una frazione di secondo,
//     ma evita che l'utente veda un "lampo" di login seguito dall'app.
//   - Se il controllo è finito e NON c'è un utente, usiamo <Navigate> di
//     react-router-dom per reindirizzare automaticamente a "/login".
//   - Se c'è un utente, mostriamo il contenuto vero (i "children" passati).
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return (
      <div style={{ padding: 24, color: 'var(--color-text-secondary)' }}>
        Verifica sessione in corso…
      </div>
    );
  }

  if (!user) {
    // "replace" evita che il login finisca nella cronologia del browser:
    // premendo "indietro" dopo aver effettuato l'accesso non si torna al
    // login, ma alla pagina precedente a quella (comportamento più naturale).
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ─────────────────────────────────────────────────────────────────────────
// Login — la schermata di accesso, con le credenziali del server Traccar.
// ─────────────────────────────────────────────────────────────────────────
// È la prima pagina "fuori" dal layout principale (niente Sidebar/TopBar):
// non ha senso mostrare il menu di navigazione a chi non ha ancora effettuato
// l'accesso. In App.tsx viene registrata come rotta indipendente ("/login"),
// mentre tutte le altre pagine restano avvolte da <RequireAuth>.
//
// Nota di stile: come il resto del progetto (vedi TopBar.tsx, Sidebar.tsx),
// qui usiamo stili inline con style={{ ... }} invece di file .css separati
// per componente — è la convenzione già adottata in tutta l'app.
import { useState, type CSSProperties, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

// Stili condivisi tra i due campi email/password: evitiamo di ripetere lo
// stesso oggetto due volte definendolo una sola volta qui fuori dal
// componente (fuori, perché non dipende da nessuno stato/prop).
const fieldLabelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  color: 'var(--color-text-secondary)',
};

const fieldInputStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: 14,
  fontFamily: 'inherit',
};

export default function Login() {
  const { user, isCheckingSession, isLoggingIn, loginError, login } = useAuth();

  // Stato locale solo per i campi del form: non serve condividerlo con il
  // resto dell'app, quindi useState "normale" invece del Context.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mentre AuthContext sta ancora verificando se esiste già una sessione
  // valida, non mostriamo il form (evita un lampo "login poi già dentro").
  if (isCheckingSession) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'var(--color-text-secondary)',
        }}
      >
        Verifica sessione in corso…
      </div>
    );
  }

  // Se l'utente risulta già collegato (es. sessione da cookie ancora
  // valida) e per qualche motivo arriva su "/login", lo rimandiamo
  // direttamente alla Mappa operativa invece di fargli rivedere il form.
  if (user) {
    return <Navigate to="/mappa" replace />;
  }

  // Gestore dell'invio del form. "FormEvent<HTMLFormElement>" è il tipo
  // TypeScript dell'evento di submit di un <form>; preventDefault() evita
  // il comportamento predefinito del browser (ricaricare la pagina).
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    try {
      await login(email, password);
      // In caso di successo, "user" nel contesto cambierà da null a un
      // TraccarUser: il componente si ri-renderizza automaticamente e
      // scatta il redirect gestito qui sopra (if (user) ...). Non serve
      // navigare manualmente da qui.
    } catch {
      // L'errore è già stato salvato in "loginError" dal contesto: il
      // messaggio verrà mostrato sotto al form. Non serve fare altro qui;
      // catturiamo l'eccezione solo per evitare un "unhandled rejection"
      // in console (login() la rilancia deliberatamente, vedi AuthContext).
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--color-app-bg)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 320,
          padding: 32,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div>
          <div
            style={{ fontWeight: 700, fontSize: 20, color: 'var(--color-text-primary)' }}
          >
            FleetOps
          </div>
          <div
            style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}
          >
            Accedi con le credenziali del tuo server Traccar
          </div>
        </div>

        <label style={fieldLabelStyle}>
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoggingIn}
            style={fieldInputStyle}
          />
        </label>

        <label style={fieldLabelStyle}>
          <span>Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoggingIn}
            style={fieldInputStyle}
          />
        </label>

        {loginError && (
          <div style={{ fontSize: 13, color: 'var(--color-status-alarm)' }}>
            {loginError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoggingIn}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: isLoggingIn
              ? 'var(--color-status-stopped)'
              : 'var(--color-sidebar-active)',
            color: 'var(--color-text-inverse)',
            fontSize: 14,
            fontWeight: 600,
            cursor: isLoggingIn ? 'default' : 'pointer',
          }}
        >
          {isLoggingIn ? 'Accesso in corso…' : 'Accedi'}
        </button>
      </form>
    </div>
  );
}

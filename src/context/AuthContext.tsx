// ─────────────────────────────────────────────────────────────────────────
// AuthContext — lo "stato globale" di autenticazione dell'app.
// ─────────────────────────────────────────────────────────────────────────
// Concetto nuovo di questo passo: finora ogni pagina gestiva il proprio
// stato con useState, in modo completamente indipendente dalle altre (una
// pagina non sa nulla di cosa succede in un'altra pagina). L'informazione
// "chi è l'utente collegato" invece serve OVUNQUE nell'app: alla TopBar (per
// mostrare nome e pulsante "Esci"), a ogni pagina protetta (per sapere se
// mostrare il contenuto o rimandare al login), e in futuro anche ad altre
// funzionalità. Duplicare questa informazione in ogni componente sarebbe
// scomodo e rischierebbe di andare "fuori sincrono" tra un punto e l'altro.
//
// La Context API di React risolve esattamente questo: un unico "contenitore"
// di stato condiviso, accessibile da qualsiasi componente discendente senza
// doverlo passare manualmente di padre in figlio in figlio ("prop drilling").
// Funziona in due parti:
//   1. <AuthProvider> — il componente che POSSIEDE lo stato (con useState) e
//      lo rende disponibile a tutti i suoi figli tramite <AuthContext.Provider>.
//      Lo useremo una sola volta, avvolgendo tutta l'app in App.tsx.
//   2. useAuth() — un hook che ogni componente figlio chiama per LEGGERE lo
//      stato condiviso (e le funzioni per modificarlo), senza sapere come è
//      stato costruito. Nasconde i dettagli di createContext/useContext.
//
// La stessa web app ufficiale di Traccar usa Redux (uno strumento più
// potente ma anche più complesso) per lo stato globale. La Context API di
// React è la versione "semplice, già incorporata nella libreria" dello
// stesso concetto: sufficiente per ora; se in futuro lo stato condiviso
// crescerà molto (dispositivi, posizioni live, filtri...), potremo valutare
// di introdurre Redux Toolkit come fa il progetto ufficiale.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { TraccarUser } from '../types/traccarUser';
import {
  login as loginRequest,
  logout as logoutRequest,
  getSession,
} from '../services/traccarApi';

/** Tutto ciò che un componente può leggere/fare tramite useAuth(). */
interface AuthContextValue {
  /** L'utente collegato, oppure null se nessuno ha ancora effettuato il login. */
  user: TraccarUser | null;
  /**
   * true SOLO durante il controllo iniziale della sessione (al primo
   * caricamento dell'app, o dopo un refresh della pagina): stiamo chiedendo
   * al server "esiste già un cookie di sessione valido?" prima di decidere
   * se mostrare il login o l'app. Evita che l'utente veda per un istante la
   * schermata di login anche quando è già collegato.
   */
  isCheckingSession: boolean;
  /** true mentre è in corso una chiamata di login (per disabilitare il pulsante). */
  isLoggingIn: boolean;
  /** Messaggio d'errore dell'ultimo tentativo di login fallito, o null. */
  loginError: string | null;
  /** Effettua il login; in caso di errore lo salva in loginError e lo rilancia. */
  login: (email: string, password: string) => Promise<void>;
  /** Effettua il logout e pulisce lo stato locale. */
  logout: () => Promise<void>;
}

// createContext(null) crea il "contenitore" vuoto. Il valore reale verrà
// fornito solo da <AuthProvider>: se qualcuno chiama useAuth() FUORI da un
// AuthProvider (errore di programmazione), vogliamo un errore chiaro invece
// di un valore null passato in giro silenziosamente — vedi useAuth() più sotto.
const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<TraccarUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Al primo montaggio dell'intera app, controlliamo se esiste già una
  // sessione valida (cookie ancora presente da una visita precedente).
  // Stesso pattern di "cancellazione" già visto in useAsyncData.ts: se il
  // componente venisse smontato prima che la richiesta risponda, evitiamo
  // di aggiornare uno stato che non esiste più.
  useEffect(() => {
    let isCancelled = false;

    getSession()
      .then((sessionUser) => {
        if (!isCancelled) {
          setUser(sessionUser);
        }
      })
      .catch(() => {
        // Un errore qui (es. server irraggiungibile) equivale a "nessuna
        // sessione utilizzabile": mostriamo comunque il login, che a sua
        // volta segnalerà l'errore quando l'utente proverà ad accedere.
        if (!isCancelled) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  async function login(email: string, password: string): Promise<void> {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const loggedInUser = await loginRequest(email, password);
      setUser(loggedInUser);
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Errore di accesso.';
      setLoginError(message);
      // Rilanciamo l'errore: così la pagina di Login può, se vuole, reagire
      // ulteriormente (qui non ci serve, ma è più corretto non "ingoiarlo"
      // silenziosamente in un punto centrale come questo).
      throw caughtError;
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function logout(): Promise<void> {
    await logoutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isCheckingSession, isLoggingIn, loginError, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook da usare in QUALSIASI componente che debba leggere lo stato di
 * autenticazione o effettuare login/logout, es.:
 *   const { user, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    // Questo può succedere solo per un errore di programmazione (un
    // componente che chiama useAuth() senza essere avvolto da
    // <AuthProvider> in App.tsx): meglio un errore esplicito a runtime che
    // un bug silenzioso più difficile da rintracciare.
    throw new Error(
      'useAuth() deve essere chiamato da un componente dentro <AuthProvider>.',
    );
  }
  return value;
}

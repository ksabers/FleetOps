// ─────────────────────────────────────────────────────────────────────────
// useAsyncData — hook riutilizzabile per "vado a prendere dei dati altrove
// e nel frattempo mostro un caricamento".
// ─────────────────────────────────────────────────────────────────────────
// Concetto nuovo di questo passo: finora le pagine leggevano i dati mock in
// modo SINCRONO (erano già lì, pronti, importati in cima al file). Una vera
// chiamata di rete invece è ASINCRONA: passa del tempo prima che la risposta
// arrivi, e nel frattempo la pagina deve mostrare qualcosa (un caricamento)
// invece di restare vuota o rompersi.
//
// Questo hook incapsula il pattern che ripeteremmo identico in ogni pagina
// che carica dati da fleetService.ts:
//   1. Stato iniziale: isLoading = true, data = null, error = null.
//   2. Al "montaggio" del componente (useEffect), chiama la funzione
//      "fetcher" passata come argomento.
//   3. Quando la Promise si risolve: salva il risultato in "data" e imposta
//      isLoading = false.
//   4. Se la Promise viene rifiutata (throw/reject): salva un messaggio in
//      "error" e imposta comunque isLoading = false.
//
// Nota sulla "cancellazione": se il componente viene smontato (es. l'utente
// cambia pagina) PRIMA che la Promise si risolva, non dobbiamo chiamare
// setState su un componente che non esiste più (React avviserebbe con un
// warning in console, e in casi più complessi potrebbe causare bug sottili).
// La variabile "isCancelled", impostata a true dalla funzione di cleanup di
// useEffect, evita esattamente questo problema.

import { useEffect, useState } from 'react';

/** Le tre informazioni che ogni pagina "in attesa di dati" deve conoscere. */
interface AsyncDataState<TData> {
  data: TData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * @param fetcher Funzione che restituisce una Promise con i dati (es.
 *   fetchVehicles da fleetService.ts). IMPORTANTE: passare direttamente il
 *   riferimento alla funzione (`useAsyncData(fetchVehicles)`), non crearne
 *   una nuova a ogni render (`useAsyncData(() => fetchVehicles())`):
 *   altrimenti l'effetto sottostante ripartirebbe a ogni singolo render,
 *   perché per React una funzione "nuova" è sempre diversa dalla precedente.
 */
export function useAsyncData<TData>(
  fetcher: () => Promise<TData>,
): AsyncDataState<TData> {
  const [state, setState] = useState<AsyncDataState<TData>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;

    // Ripartiamo sempre da "sto caricando" quando la funzione "fetcher"
    // cambia (nelle nostre pagine non succede mai, ma è corretto gestirlo).
    setState({ data: null, isLoading: true, error: null });

    fetcher()
      .then((result) => {
        if (!isCancelled) {
          setState({ data: result, isLoading: false, error: null });
        }
      })
      .catch((caughtError: unknown) => {
        if (!isCancelled) {
          const message =
            caughtError instanceof Error ? caughtError.message : 'Errore sconosciuto.';
          setState({ data: null, isLoading: false, error: message });
        }
      });

    // Funzione di cleanup: React la esegue quando il componente viene
    // smontato (o prima di rieseguire l'effetto, se "fetcher" cambia).
    return () => {
      isCancelled = true;
    };
  }, [fetcher]);

  return state;
}

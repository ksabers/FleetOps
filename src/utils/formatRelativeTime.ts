// ─────────────────────────────────────────────────────────────────────────
// formatRelativeTime — trasforma una data ISO ("2026-08-17T10:15:00Z") in
// una frase leggibile in italiano tipo "12 secondi fa" / "3 ore fa".
// ─────────────────────────────────────────────────────────────────────────
// Perché serve: Traccar restituisce sempre date "assolute" (ISO 8601), ma
// nella nostra UI (campo Vehicle.lastUpdateLabel) vogliamo mostrare quanto
// tempo è passato, com'era già nei dati mock (vedi src/data/mockVehicles.ts).
// Questa funzione fa da "ponte" fra le due rappresentazioni ed è isolata
// qui, in src/utils/, perché non riguarda un tipo di dato specifico
// (veicoli, allarmi, dispositivi...): potrà servire a qualsiasi pagina che
// mostri "quanto tempo fa" partendo da una data del server.

/**
 * @param isoDate  Data in formato ISO 8601, oppure null/undefined se non
 *                 disponibile (Traccar a volte restituisce null quando un
 *                 dispositivo non ha ancora mai comunicato).
 * @returns Una breve frase in italiano pronta da mostrare in UI.
 */
export function formatRelativeTime(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return 'nessun dato';
  }

  const momentoPassato = new Date(isoDate).getTime();
  // new Date(...).getTime() restituisce NaN se la stringa non è una data
  // valida: succede raramente, ma meglio non far vedere "NaN secondi fa"
  // all'utente se Traccar invia qualcosa di inatteso.
  if (Number.isNaN(momentoPassato)) {
    return 'nessun dato';
  }

  const secondiTrascorsi = Math.max(0, Math.round((Date.now() - momentoPassato) / 1000));

  if (secondiTrascorsi < 5) {
    return 'adesso';
  }
  if (secondiTrascorsi < 60) {
    return `${secondiTrascorsi} secondi fa`;
  }

  const minutiTrascorsi = Math.round(secondiTrascorsi / 60);
  if (minutiTrascorsi < 60) {
    return `${minutiTrascorsi} minut${minutiTrascorsi === 1 ? 'o' : 'i'} fa`;
  }

  const oreTrascorse = Math.round(minutiTrascorsi / 60);
  if (oreTrascorse < 24) {
    return `${oreTrascorse} or${oreTrascorse === 1 ? 'a' : 'e'} fa`;
  }

  const giorniTrascorsi = Math.round(oreTrascorse / 24);
  return `${giorniTrascorsi} giorn${giorniTrascorsi === 1 ? 'o' : 'i'} fa`;
}

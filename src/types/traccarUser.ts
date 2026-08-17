// ─────────────────────────────────────────────────────────────────────────
// TraccarUser — il sottoinsieme di campi dell'oggetto "User" di Traccar che
// ci interessa davvero in FleetOps.
// ─────────────────────────────────────────────────────────────────────────
// Il vero server Traccar restituisce (in risposta a POST/GET /api/session)
// un oggetto JSON molto più ricco: contiene anche campi come "map",
// "coordinateFormat", "disabled", "expirationTime", "deviceLimit",
// "userLimit", "attributes" (impostazioni personalizzate), ecc. Per FleetOps
// in questo passo ci servono solo i dati per capire "chi è collegato" e
// mostrarlo nell'intestazione: nome, email e se è un amministratore.
//
// Definire QUI un tipo "ridotto" invece di usare l'oggetto grezzo che arriva
// dal server ha due vantaggi:
//   1. Il resto dell'app non deve preoccuparsi di decine di campi che non
//      usa: legge solo "TraccarUser", con i pochi campi che le servono.
//   2. Se in futuro ci interessasse un campo in più (es. "administrator"
//      per mostrare un badge "Admin"), lo aggiungiamo qui in un posto solo.
export interface TraccarUser {
  /** Identificativo numerico dell'utente lato Traccar. */
  id: number;
  /** Nome visualizzato (es. "Giorgio Borgo"). */
  name: string;
  /** Email usata per accedere. */
  email: string;
  /** true se l'utente ha permessi di amministratore sul server Traccar. */
  administrator: boolean;
}

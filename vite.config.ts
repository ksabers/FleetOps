// Configurazione di Vite (il "build tool" che compila e serve la nostra app React).
// Vite è molto più leggero e veloce di Webpack: in sviluppo usa moduli ES nativi del
// browser, quindi il riavvio/ricarica dopo una modifica è quasi istantaneo.
//
// Nota per chi viene da TypeScript "puro": questo file usa l'estensione .ts,
// non .tsx, perché non contiene JSX (niente tag simil-HTML), solo un oggetto
// di configurazione.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Il plugin "react" abilita il supporto a JSX/TSX e il "Fast Refresh"
  // (aggiorna il componente modificato senza ricaricare tutta la pagina,
  // mantenendo lo stato).
  plugins: [react()],

  // "base: './'" fa sì che i file compilati (JS/CSS) vengano referenziati
  // con percorsi RELATIVI (es. "./assets/index.js") invece che assoluti
  // (es. "/assets/index.js"). È indispensabile quando l'app viene ospitata
  // in una sottocartella qualsiasi invece che nella radice del dominio —
  // come nell'anteprima di questo ambiente, o su molti hosting statici.
  base: "./",

  server: {
    // Porta fissa per lo sviluppo locale: comoda da ricordare.
    port: 5173,

    // ─────────────────────────────────────────────────────────────────
    // Proxy verso il vero server Traccar (Step 6a).
    // ─────────────────────────────────────────────────────────────────
    // Il nostro codice (src/services/traccarApi.ts) chiama percorsi
    // RELATIVI come "/api/session": qui diciamo al server di sviluppo di
    // Vite "ogni richiesta che inizia con /api, non la gestire tu: passala
    // al vero server Traccar che gira su http://localhost:8082, e restituisci
    // al browser esattamente quello che risponde lui".
    //
    // Perché ci serve: il browser applica sempre le regole CORS (Cross-
    // Origin Resource Sharing) quando una pagina caricata da un indirizzo
    // (qui http://localhost:5173) chiama un'API su un indirizzo diverso
    // (http://localhost:8082) — a meno che il server di destinazione non
    // sia stato configurato apposta per permetterlo. Non sappiamo se/come
    // Traccar sia configurato per il CORS sulla macchina di Giorgio, quindi
    // evitiamo il problema alla radice: il browser vede TUTTO come se
    // arrivasse dalla stessa origine (localhost:5173), perché è Vite stesso
    // (lato server, non nel browser) a fare la richiesta "vera" a :8082 per
    // nostro conto e a ritrasmetterne la risposta.
    //
    // NOTA IMPORTANTE: questo proxy esiste SOLO durante "npm run dev". Una
    // build di produzione (npm run build + deploy) non ha un server Vite
    // in ascolto, quindi questo meccanismo non si applica: per pubblicare
    // l'app fuori dal proprio PC servirà una soluzione diversa (es. un
    // reverse proxy vero, o configurare il CORS sul server Traccar). Ne
    // parleremo quando arriveremo a quel punto — per ora l'obiettivo è far
    // funzionare lo sviluppo/test in locale.
    proxy: {
      "/api": {
        // Indirizzo del server Traccar confermato da Giorgio in questo Step.
        target: "http://localhost:8082",
        // Necessario perché il server di destinazione veda una richiesta
        // "credibile" (con l'header Host impostato sul target, non su
        // localhost:5173).
        changeOrigin: true,
        // "ws: true" instrada anche le connessioni WebSocket attraverso lo
        // stesso proxy: non ci serve ancora (arriverà nello Step 6c, quando
        // collegheremo /api/socket per gli aggiornamenti in tempo reale),
        // ma lasciarlo attivo da subito evita di doverci ripensare più avanti.
        ws: true,
      },
    },
  },
});

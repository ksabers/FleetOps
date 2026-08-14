// ─────────────────────────────────────────────────────────────────────────
// App: definisce le "rotte" (route), cioè quale pagina mostrare per ogni URL.
// ─────────────────────────────────────────────────────────────────────────
// Usiamo la libreria "react-router-dom", la stessa famiglia usata anche dalla
// web app ufficiale di Traccar. Il concetto chiave è semplice:
//   - <BrowserRouter> abilita la navigazione via URL (cambia indirizzo senza
//     ricaricare la pagina).
//   - <Routes> è un contenitore che guarda l'URL corrente e sceglie quale
//     <Route> mostrare.
//   - <Route path="..." element={<Componente />} /> associa un percorso a un
//     componente React da renderizzare.
//   - <AppLayout> è il "guscio" comune a tutte le pagine (sidebar + header);
//     al suo interno c'è un <Outlet /> dove viene disegnata la pagina attiva.
//
// Ogni sezione della PoC diventa qui una pagina indipendente, in un proprio
// file/cartella sotto src/pages. Per ora sono solo "scheletri" (segnaposto):
// li riempiremo uno alla volta nei prossimi passi.

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './layout/AppLayout';

import MapView from './pages/MapView/MapView';
import VehicleRegistry from './pages/VehicleRegistry/VehicleRegistry';
import Alarms from './pages/Alarms/Alarms';
import Maintenance from './pages/Maintenance/Maintenance';
import Activity from './pages/Activity/Activity';
import Reports from './pages/Reports/Reports';
import DeviceStatus from './pages/DeviceStatus/DeviceStatus';

export default function App() {
  return (
    // Usiamo HashRouter (URL del tipo "/#/veicoli") invece di BrowserRouter
    // (che userebbe "/veicoli" "puro"). Il motivo è pratico: quando l'app
    // viene mostrata dentro un iframe di anteprima (come quello di questo
    // ambiente) o pubblicata come semplice file statico, un percorso "puro"
    // richiede una configurazione lato server che non sempre è disponibile;
    // l'hash (#) invece funziona SEMPRE, perché il browser non lo manda mai
    // al server: è gestito interamente da JavaScript. Se in futuro ospiterai
    // l'app su un vero server con configurazione a piacere, potrai tornare a
    // BrowserRouter cambiando solo questa riga.
    <HashRouter>
      <Routes>
        {/* Tutte le pagine condividono lo stesso "guscio" AppLayout
            (sidebar a sinistra + intestazione in alto). Le rotte "figlie"
            (indentate qui sotto) vengono inserite al posto dell'<Outlet />
            dentro AppLayout. */}
        <Route path="/" element={<AppLayout />}>
          {/* "index" = pagina mostrata quando l'URL è esattamente "/" */}
          <Route index element={<Navigate to="/mappa" replace />} />

          <Route path="mappa" element={<MapView />} />
          <Route path="veicoli" element={<VehicleRegistry />} />
          <Route path="allarmi" element={<Alarms />} />
          <Route path="manutenzione" element={<Maintenance />} />
          <Route path="attivita" element={<Activity />} />
          <Route path="report" element={<Reports />} />
          <Route path="dispositivi" element={<DeviceStatus />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

/* import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
 */

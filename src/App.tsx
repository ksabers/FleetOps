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

import { AuthProvider } from './context/AuthContext';
import RequireAuth from './layout/RequireAuth';
import AppLayout from './layout/AppLayout';

import Login from './pages/Login/Login';
import MapView from './pages/MapView/MapView';
import VehicleRegistry from './pages/VehicleRegistry/VehicleRegistry';
import Alarms from './pages/Alarms/Alarms';
import Maintenance from './pages/Maintenance/Maintenance';
import Activity from './pages/Activity/Activity';
import Reports from './pages/Reports/Reports';
import DeviceStatus from './pages/DeviceStatus/DeviceStatus';

export default function App() {
  return (
    // AuthProvider avvolge TUTTA l'app (login incluso!): sia la pagina di
    // login sia le pagine protette hanno bisogno di leggere/scrivere lo
    // stato di autenticazione tramite useAuth() (vedi src/context/AuthContext.tsx).
    <AuthProvider>
      {/* Usiamo HashRouter (URL del tipo "/#/veicoli") invece di BrowserRouter
          (che userebbe "/veicoli" "puro"). Il motivo è pratico: quando l'app
          viene mostrata dentro un iframe di anteprima (come quello di questo
          ambiente) o pubblicata come semplice file statico, un percorso "puro"
          richiede una configurazione lato server che non sempre è disponibile;
          l'hash (#) invece funziona SEMPRE, perché il browser non lo manda mai
          al server: è gestito interamente da JavaScript. Se in futuro ospiterai
          l'app su un vero server con configurazione a piacere, potrai tornare a
          BrowserRouter cambiando solo questa riga. */}
      <HashRouter>
        <Routes>
          {/* Rotta indipendente, FUORI dal guscio AppLayout: chi non ha ancora
              effettuato il login non deve vedere sidebar/intestazione. */}
          <Route path="/login" element={<Login />} />

          {/* Tutte le pagine "vere" condividono lo stesso "guscio" AppLayout
              (sidebar a sinistra + intestazione in alto), avvolto da
              <RequireAuth>: se nessuno ha effettuato il login, RequireAuth
              reindirizza automaticamente a "/login" invece di mostrare
              <AppLayout>. Le rotte "figlie" (indentate qui sotto) vengono
              inserite al posto dell'<Outlet /> dentro AppLayout. */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
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
    </AuthProvider>
  );
}

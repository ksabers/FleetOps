// Pagina "Stato dispositivi" — stato tecnico dei dispositivi GPS installati
// sui veicoli (connettività, SIM, firmware...). Corrisponde grossomodo alla
// risorsa /api/devices di Traccar, con qualche campo aggiuntivo (SIM, fix
// GPS) che nella PoC arriva da "attributes" del dispositivo.
import PlaceholderSection from '../../components/PlaceholderSection';

export default function DeviceStatus() {
  return (
    <PlaceholderSection
      title="Stato dispositivi"
      description="Da costruire più avanti: tabella dispositivi GPS con stato connettività e dettagli tecnici."
    />
  );
}

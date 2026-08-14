// Piccola tabella "percorso -> titolo/sottotitolo" mostrati nella TopBar.
// Tenerla separata da navConfig.js non è strettamente necessario, ma separa
// due responsabilità diverse: navConfig descrive la SIDEBAR, pageMeta
// descrive l'INTESTAZIONE di ogni pagina (che in futuro potrebbe contenere
// anche altre info, es. azioni contestuali per pagina).

export interface PageMetaInfo {
  title: string;
  subtitle?: string; // Il '?' rende subtitle opzionale
}

export const pageMeta: Record<string, PageMetaInfo> = {
  '/mappa': { title: 'Mappa operativa', subtitle: 'flotta in tempo reale' },
  '/veicoli': { title: 'Anagrafica veicoli', subtitle: 'registro flotta' },
  '/allarmi': { title: 'Allarmi e regole' },
  '/manutenzione': { title: 'Manutenzione' },
  '/attivita': { title: 'Attività', subtitle: 'cronologia interventi' },
  '/report': { title: 'KPI e report' },
  '/dispositivi': { title: 'Stato dispositivi' },
};

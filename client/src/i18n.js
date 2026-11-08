// Textos da interface (vue-i18n) + tx() para os campos bilíngues {en, pt} dos dados.
import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    act: 'Act', part: 'Part', story: 'The story', quests: 'Quest log', main: 'Main quests', side: 'Side quests',
    bosses: 'Bosses', npcs: 'Town', level: 'Area Level', waypoint: 'Waypoint', town: 'Town', also: 'Also includes',
    here: 'In this area', nothing: 'No recorded quest or boss here.',
    unverified: 'Node position inferred from area connections; not yet confirmed in game.',
    select: 'Select an area on the map', musicOn: 'Music on', musicOff: 'Music off', volume: 'Volume',
    noWaypoint: 'Area without waypoint', toConfirm: 'position to confirm',
    loading: 'Loading Wraeclast…', loadError: 'Failed to load data',
  },
  pt: {
    act: 'Ato', part: 'Parte', story: 'A história', quests: 'Diário de missões', main: 'Missões principais', side: 'Missões secundárias',
    bosses: 'Chefes', npcs: 'Cidade', level: 'Nível da Área', waypoint: 'Waypoint', town: 'Cidade', also: 'Inclui também',
    here: 'Nesta área', nothing: 'Nenhuma missão ou chefe registrado aqui.',
    unverified: 'Posição do nó deduzida pelas conexões entre áreas; ainda não confirmada no jogo.',
    select: 'Selecione uma área no mapa', musicOn: 'Música ligada', musicOff: 'Música desligada', volume: 'Volume',
    noWaypoint: 'Área sem waypoint', toConfirm: 'posição a confirmar',
    loading: 'Carregando Wraeclast…', loadError: 'Falha ao carregar os dados',
  },
};

const saved = (() => { try { return localStorage.getItem('lang'); } catch { return null; } })();
export const i18n = createI18n({ legacy: false, locale: saved === 'en' ? 'en' : 'pt', fallbackLocale: 'en', messages });

const locale = i18n.global.locale;
const syncHtmlLang = () => { document.documentElement.lang = locale.value === 'pt' ? 'pt-BR' : 'en'; };
syncHtmlLang();

export function setLocale(l) {
  locale.value = l;
  try { localStorage.setItem('lang', l); } catch {}
  syncHtmlLang();
}

export const tx = (o) => (o == null ? '' : typeof o === 'string' ? o : o[locale.value] || o.en || '');

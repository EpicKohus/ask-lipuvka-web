const logoRules = [
  { src: '/loga/rdr-akademie.png', alt: 'RDR Akademie', patterns: ['rdr'] },
  { src: '/loga/fsa-kras.png', alt: 'FSA Kras', patterns: ['fsa', 'kras'] },
  { src: '/loga/fk-blansko.png', alt: 'FK Blansko', patterns: ['blansko'] },
  {
    src: '/loga/boskovice-letovice.png',
    alt: 'FC Boskovice–Letovice',
    patterns: ['boskovice', 'letovice'],
  },
  { src: '/loga/lipovec.png', alt: 'Sokol Lipovec', patterns: ['lipovec'] },
  { src: '/loga/ostrov.png', alt: 'TJ Ostrov u Macochy', patterns: ['ostrov', 'vilemovice'] },
  { src: '/loga/olomoucany.png', alt: 'TJ Sokol Olomučany', patterns: ['olomoucany'] },
  {
    src: '/loga/babice.png',
    alt: 'SK Babice nad Svitavou',
    patterns: ['babice', 'adamov'],
  },
  { src: '/loga/cerna-hora.png', alt: 'FK Černá Hora', patterns: ['cerna hora'] },
  { src: '/loga/drnovice.png', alt: 'TJ Sokol Drnovice', patterns: ['drnovice'] },
  { src: '/loga/kunstat.png', alt: 'FK Kunštát', patterns: ['kunstat', 'zh'] },
  { src: '/loga/olesnice.png', alt: 'FC Olešnice', patterns: ['olesnice'] },
  { src: '/loga/vrchovina.png', alt: 'FKM Vrchovina', patterns: ['vrchovina'] },
  { src: '/loga/kninice.png', alt: 'TJ Malá Haná Knínice', patterns: ['kninice'] },
  {
    src: '/loga/vavrinec.png',
    alt: 'TJ Vavřinec',
    patterns: ['vavrinec', 'vysocany', 'sosuvka'],
  },
  { src: '/loga/obrany.png', alt: 'SK Obřany', patterns: ['obrany'] },
];

const normalizeTeamName = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const getOpponentLogos = (matchOrName) => {
  const names =
    typeof matchOrName === 'string'
      ? [matchOrName]
      : [matchOrName?.matchLabel1, matchOrName?.matchLabel2].filter((value) => value?.trim());

  if (names.length === 0 && matchOrName?.opponent) names.push(matchOrName.opponent);

  const normalizedNames = names.map(normalizeTeamName);
  const matches = logoRules.filter((rule) =>
    normalizedNames.some((name) => rule.patterns.some((pattern) => name.includes(pattern)))
  );

  return matches.filter(
    (logo, index, allLogos) => allLogos.findIndex((item) => item.src === logo.src) === index
  );
};

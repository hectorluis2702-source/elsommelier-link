/**
 * Regiones Vitivinícolas del Mundo para el Mapa Interactivo de Vinotipos
 */
export const REGIONS_DATA = [
  {
    id: 'champagne',
    name: 'Champagne',
    country: 'Francia 🇫🇷',
    flag: '🍾',
    coords: { x: 30, y: 35 },
    unlocked: true,
    description: 'La cuna mundial del vino espumoso de alta gama y el método tradicional.',
    terroirInfo: {
      suelo: 'Tiza pura (chalke) que retiene la humedad y aporta mineralidad alta.',
      clima: 'Oceanográfico frío con influencia continental.',
      varietales: ['Pinot Noir', 'Chardonnay', 'Meunier']
    },
    lessonsCount: 3
  },
  {
    id: 'toscana',
    name: 'Toscana',
    country: 'Italia 🇮🇹',
    flag: '🍷',
    coords: { x: 42, y: 48 },
    unlocked: true,
    description: 'Tierra del legendario Chianti Classico y la variedad reina Sangiovese.',
    terroirInfo: {
      suelo: 'Galestro (arcilla esquistosa) y Alberese (piedra caliza).',
      clima: 'Mediterráneo cálido con brisas marinas y noches frescas.',
      varietales: ['Sangiovese', 'Cabernet Sauvignon', 'Merlot']
    },
    lessonsCount: 3
  },
  {
    id: 'rioja',
    name: 'La Rioja',
    country: 'España 🇪🇸',
    flag: '🍇',
    coords: { x: 22, y: 52 },
    unlocked: true,
    description: 'Referente mundial en crianzas prolongadas en barricas de roble americano y francés.',
    terroirInfo: {
      suelo: 'Arcillo-caláreo en Rioja Alta y arcillo-ferruginoso en Rioja Baja.',
      clima: 'Transición entre el Atlántico y el Mediterráneo.',
      varietales: ['Tempranillo', 'Garnacha', 'Graciano', 'Mazuelo']
    },
    lessonsCount: 3
  },
  {
    id: 'mendoza',
    name: 'Mendoza',
    country: 'Argentina 🇦🇷',
    flag: '🏔️',
    coords: { x: 75, y: 80 },
    unlocked: false,
    reqXP: 250,
    description: 'Viticultura de extrema altitud al pie de la Cordillera de los Andes.',
    terroirInfo: {
      suelo: 'Aluvial con cantos rodados, grava y calcáreo.',
      clima: 'Continental desértico con sol radiante y gran amplitud térmica.',
      varietales: ['Malbec', 'Cabernet Franc', 'Torrontés']
    },
    lessonsCount: 3
  },
  {
    id: 'napa',
    name: 'Napa Valley',
    country: 'EE.UU. 🇺🇸',
    flag: '🌄',
    coords: { x: 15, y: 38 },
    unlocked: false,
    reqXP: 500,
    description: 'El epicentro de los míticos Cabernet Sauvignon de culto de California.',
    terroirInfo: {
      suelo: 'Volcánico en las laderas y sedimentario aluvial en el valle.',
      clima: 'Mediterráneo costero con nieblas matutinas de la bahía.',
      varietales: ['Cabernet Sauvignon', 'Chardonnay', 'Zinfandel']
    },
    lessonsCount: 3
  }
];

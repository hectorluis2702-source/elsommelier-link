/**
 * Regiones Vitivinícolas del Mundo para el Mapa Interactivo de Vinotipos
 */

/**
 * Fase 2 (prompt 3) — Bandera `isPremium` por región.
 *
 * ⚠️ Es SOLO arquitectura de datos para preparar el terreno de una futura
 * monetización. Hoy no hace nada: `GameState.checkRegionUnlocks()` sigue
 * usando únicamente `reqXP` + el gate de 80% de aciertos, sin leer este campo
 * en ningún lado. Nadie queda bloqueado por esto todavía.
 *
 * Intención a futuro (NO implementada): las regiones marcadas `isPremium:true`
 * podrían requerir una suscripción/compra además de XP+precisión. Champagne,
 * Toscana y Rioja (el tramo inicial, ya desbloqueado desde el registro) quedan
 * como el "free tier"; Mendoza y Napa (el tramo avanzado, con mayor reqXP) son
 * los candidatos naturales a contenido premium.
 */


/**
 * Fase 2 — Estructura de dificultad progresiva por región.
 * Cada región define 3 niveles; el CourseEngine (fuera de alcance por ahora)
 * sera quien genere las preguntas reales sobre esta estructura.
 *
 *  - Nivel 1 "reconocimiento": pregunta con imagen y 2 opciones.
 *  - Nivel 2 "distractores": pregunta con imagen y 4 opciones (distractores plausibles).
 *  - Nivel 3 "produccion_libre": sin imagen, solo descripcion textual; el jugador
 *    produce/selecciona la respuesta sin apoyo visual.
 */
function buildDifficultyLevels() {
  return [
    {
      level: 1,
      mode: 'reconocimiento',
      label: 'Reconocimiento',
      optionsCount: 2,
      hasImage: true,
      description: 'Corchito muestra una imagen y el jugador elige entre 2 opciones.'
    },
    {
      level: 2,
      mode: 'distractores',
      label: 'Distractores',
      optionsCount: 4,
      hasImage: true,
      description: 'Imagen con 4 opciones, incluyendo distractores plausibles de regiones o varietales cercanos.'
    },
    {
      level: 3,
      mode: 'produccion_libre',
      label: 'Producción Libre',
      optionsCount: 0,
      hasImage: false,
      description: 'Sin imagen: solo una descripción textual del terroir/varietal. El jugador produce la respuesta sin apoyo visual.'
    }
  ];
}

export const REGIONS_DATA = [
  {
    id: 'champagne',
    name: 'Champagne',
    country: 'Francia 🇫🇷',
    flag: '🍾',
    coords: { x: 30, y: 35 },
    unlocked: true,
    isPremium: false, // free tier — sin efecto hoy, ver nota de arquitectura arriba
    description: 'La cuna mundial del vino espumoso de alta gama y el método tradicional.',
    terroirInfo: {
      suelo: 'Tiza pura (chalke) que retiene la humedad y aporta mineralidad alta.',
      clima: 'Oceanográfico frío con influencia continental.',
      varietales: ['Pinot Noir', 'Chardonnay', 'Meunier']
    },
    lessonsCount: 3,
    difficultyLevels: buildDifficultyLevels(),
    // Fase 2 (prompt 2) — hechos compactos usados por questionGenerator.js para
    // construir preguntas reales sin duplicar/inventar datos: son la misma
    // información de terroirInfo, solo en formato de opción de respuesta corta.
    facts: {
      varietalPrincipal: 'Pinot Noir',
      sueloTag: 'Tiza pura (Craie)'
    }
  },
  {
    id: 'toscana',
    name: 'Toscana',
    country: 'Italia 🇮🇹',
    flag: '🍷',
    coords: { x: 42, y: 48 },
    unlocked: true,
    isPremium: false, // free tier — sin efecto hoy
    description: 'Tierra del legendario Chianti Classico y la variedad reina Sangiovese.',
    terroirInfo: {
      suelo: 'Galestro (arcilla esquistosa) y Alberese (piedra caliza).',
      clima: 'Mediterráneo cálido con brisas marinas y noches frescas.',
      varietales: ['Sangiovese', 'Cabernet Sauvignon', 'Merlot']
    },
    lessonsCount: 3,
    difficultyLevels: buildDifficultyLevels(),
    facts: {
      varietalPrincipal: 'Sangiovese',
      sueloTag: 'Galestro y Alberese'
    }
  },
  {
    id: 'rioja',
    name: 'La Rioja',
    country: 'España 🇪🇸',
    flag: '🍇',
    coords: { x: 22, y: 52 },
    unlocked: true,
    isPremium: false, // free tier — sin efecto hoy
    description: 'Referente mundial en crianzas prolongadas en barricas de roble americano y francés.',
    terroirInfo: {
      suelo: 'Arcillo-caláreo en Rioja Alta y arcillo-ferruginoso en Rioja Baja.',
      clima: 'Transición entre el Atlántico y el Mediterráneo.',
      varietales: ['Tempranillo', 'Garnacha', 'Graciano', 'Mazuelo']
    },
    lessonsCount: 3,
    difficultyLevels: buildDifficultyLevels(),
    facts: {
      varietalPrincipal: 'Tempranillo',
      sueloTag: 'Arcillo-calcáreo'
    }
  },
  {
    id: 'mendoza',
    name: 'Mendoza',
    country: 'Argentina 🇦🇷',
    flag: '🏔️',
    coords: { x: 75, y: 80 },
    unlocked: false,
    reqXP: 250,
    isPremium: true, // candidato a contenido premium futuro — hoy se desbloquea igual que cualquier otra region (reqXP + 80%)
    description: 'Viticultura de extrema altitud al pie de la Cordillera de los Andes.',
    terroirInfo: {
      suelo: 'Aluvial con cantos rodados, grava y calcáreo.',
      clima: 'Continental desértico con sol radiante y gran amplitud térmica.',
      varietales: ['Malbec', 'Cabernet Franc', 'Torrontés']
    },
    lessonsCount: 3,
    difficultyLevels: buildDifficultyLevels(),
    facts: {
      varietalPrincipal: 'Malbec',
      sueloTag: 'Aluvial de altura'
    }
  },
  {
    id: 'napa',
    name: 'Napa Valley',
    country: 'EE.UU. 🇺🇸',
    flag: '🌄',
    coords: { x: 15, y: 38 },
    unlocked: false,
    reqXP: 500,
    isPremium: true, // candidato a contenido premium futuro — hoy se desbloquea igual que cualquier otra region (reqXP + 80%)
    description: 'El epicentro de los míticos Cabernet Sauvignon de culto de California.',
    terroirInfo: {
      suelo: 'Volcánico en las laderas y sedimentario aluvial en el valle.',
      clima: 'Mediterráneo costero con nieblas matutinas de la bahía.',
      varietales: ['Cabernet Sauvignon', 'Chardonnay', 'Zinfandel']
    },
    lessonsCount: 3,
    difficultyLevels: buildDifficultyLevels(),
    facts: {
      varietalPrincipal: 'Cabernet Sauvignon',
      sueloTag: 'Volcánico y aluvial'
    }
  }
];

/**
 * Fase 2 (prompt 3) — Catálogo de "Vinotipos": el puente de marca hacia el
 * libro "Dime tu Carácter" de Héctor García, El Sommelier RD.
 *
 * Al dominar (80%+) las 5 regiones del programa, GameState.computeVinotipo()
 * calcula cuál de estos 4 arquetipos encaja mejor con el patrón REAL de
 * respuestas del jugador (region_answer_history) — no es aleatorio ni
 * decorativo, aunque tampoco pretende ser un test psicométrico riguroso: es
 * una lectura narrativa simple sobre datos reales.
 */
export const VINOTIPOS_CATALOG = {
  guardian: {
    id: 'guardian',
    name: 'El Guardián',
    emoji: '🛡️',
    tagline: 'Domina el terroir sin apoyo visual',
    description: 'Aciertas incluso en producción libre, sin imágenes ni pistas. Memoria, atención al detalle y paciencia son tu fuerte: prefieres profundizar antes que ir rápido.'
  },
  nomada: {
    id: 'nomada',
    name: 'El Nómada',
    emoji: '🧭',
    tagline: 'Explora el mundo del vino con curiosidad amplia',
    description: 'Te mueves entre regiones sin quedarte solo en una: Champagne, Toscana, Rioja, Mendoza, Napa... el terroir del mundo entero te llama por igual.'
  },
  anfitrion: {
    id: 'anfitrion',
    name: 'El Anfitrión',
    emoji: '🍽️',
    tagline: 'Aprende con precisión y generosidad',
    description: 'Pocas veces fallas, y cuando dominas algo lo haces con soltura. El tipo de persona que hace que cualquier mesa se sienta bien acompañada.'
  },
  alquimista: {
    id: 'alquimista',
    name: 'El Alquimista',
    emoji: '⚗️',
    tagline: 'Convierte cada error en aprendizaje',
    description: 'Tus mejores aciertos llegan justo después de un tropiezo. No le temes a equivocarte: la transformación del error en maestría es tu don.'
  }
};

export const BOOK_BRIDGE = {
  title: 'Dime tu Carácter',
  author: 'Héctor García, El Sommelier RD',
  line: 'Profundiza en tu Vinotipo en el libro'
};

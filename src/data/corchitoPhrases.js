/**
 * Fase 2 (prompt 2) — Frases contextuales de Corchito.
 *
 * Motivación real, no volumen: aquí solo hay texto/expresión, nunca XP/gemas
 * extra. El cierre de sesión "3+ retos hoy" invita a descansar a propósito —
 * no otorga ningún bono por completar muchos módulos en un día.
 */

export const PHRASES = {
  // Al acertar una sola vez (racha de aciertos < 2)
  acierto: [
    '¡Exacto! Ese es un gran paladar en formación.',
    '¡Correcto! Corchito aprueba con una copa en alto.',
    '¡Así se cata! Vas afinando el olfato.',
    '¡Perfecto! Esa nota se te quedó grabada.'
  ],

  // Racha de 2+ aciertos seguidos
  rachaAciertos2: [
    '¡Dos al hilo! Corchito ya no puede seguirte el ritmo.',
    '¡Vas encadenando aciertos! Se nota que estudiaste el terroir.',
    '¡Racha de aciertos! Esto ya parece cata profesional.'
  ],

  // Racha de 4+ aciertos seguidos
  rachaAciertos4: [
    '¡Imparable! Corchito está tomando notas de TU técnica.',
    '¡Nivel sommelier! Cuatro aciertos seguidos no son casualidad.',
    '¡Estás en llamas! (Metafóricamente, el vino se sirve frío 🍾)'
  ],

  // Un solo fallo — animo, nunca regaño
  fallo: [
    'No pasa nada, hasta los mejores confunden un Malbec con un Cabernet.',
    'Casi. Vuelve a mirar el terroir con calma, ahí está la pista.',
    'Un tropiezo no arruina la cata. Probemos otra vez.',
    'Eso se aprende con la lengua y con el mapa. ¡Seguimos!'
  ],

  // 2+ fallos seguidos — animo mas fuerte, cero regaño
  rachaFallos: [
    'Respira. Repasemos el terroir juntos antes de seguir.',
    'Corchito también se equivocó mucho al empezar a catar. Vamos con calma.',
    'No te frenes por un par de fallos: es parte de afinar el paladar.'
  ],

  // Al llegar a 0 copas de vida
  sinVidas: [
    'Se acabaron las copas por ahora. Descansa el paladar y vuelve pronto.',
    'Corchito cierra la barra por hoy. ¡Nos vemos en la próxima ronda!'
  ],

  // Al desbloquear una region nueva
  desbloqueoRegion: [
    '¡Nueva región desbloqueada! Corchito ya está haciendo la maleta.',
    '¡Lo lograste! Un nuevo terroir se abre en el mapa.',
    '¡Excelente dominio! Esta región estaba esperando por ti.'
  ],

  // Bienvenida al entrar a una region (ya existia en WorldMap, ahora centralizada)
  bienvenidaRegion: (regionName) => [
    `¡Bienvenido a ${regionName}!`,
    `Aterrizamos en ${regionName}. ¿Listo para catar?`,
    `${regionName} nos espera. Corchito ya sacó el sacacorchos.`
  ],

  // Cierre de sesion normal (1-2 retos completados hoy)
  cierreSesionNormal: [
    '¡Buen reto! Cuando quieras, seguimos explorando el mapa.',
    'Sesión guardada. Tu progreso ya vive en la nube.',
    '¡Gran trabajo hoy! Corchito guarda tu avance con cariño.'
  ],

  // Cierre de sesion tras 3+ retos en el mismo dia — invita a descansar, SIN bonus.
  cierreSesionLarga: [
    'Gran sesión, vuelve mañana. El paladar también necesita descansar.',
    '¡Ya diste varios retos hoy! Corchito te invita a parar y volver mañana.',
    'Con esto ya tuviste una sesión completa. Descansa, mañana seguimos.'
  ],

  // Racha en riesgo (no jugó hoy y tiene racha activa)
  rachaEnRiesgo: (streak) => [
    `Tu racha de ${streak} días está en riesgo. ¡Un reto hoy la salva!`,
    `¡Cuidado! Si no completas un reto hoy, tu racha de ${streak} días se reinicia.`,
    `Corchito está nervioso por tu racha de ${streak} días. ¿Jugamos uno rapidito?`
  ],

  // Revelacion de botella (Cava con suspenso)
  revelacionBotella: [
    '¡Mira lo que trajo Corchito de la bodega!',
    '¡Sorpresa! Esto acaba de llegar a tu Cava.',
    '¡Descorchando tu nueva botella!'
  ],

  revelacionBotellaSorpresa: [
    '¡Espera! Corchito se distrajo y sacó otra joya de tu Cava.',
    'Sorpresa inesperada: esto también es tuyo.',
    '¡Cambio de planes! Mira esta otra botella que ya tienes.'
  ]
};

/**
 * Elige una frase al azar de un array (o del resultado de una función que
 * recibe args, para las frases que necesitan interpolar datos).
 */
export function pickPhrase(entry, ...args) {
  const list = typeof entry === 'function' ? entry(...args) : entry;
  if (!Array.isArray(list) || list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)];
}

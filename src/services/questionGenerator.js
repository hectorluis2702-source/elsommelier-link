import { REGIONS_DATA } from '../data/regionsData.js';

/**
 * Fase 2 (prompt 2) — Generador de preguntas reales de maridaje/terroir.
 *
 * No hay un banco de preguntas estático: cada pregunta se arma "al vuelo" a
 * partir de la info que ya vive en regionsData.js (terroirInfo, varietales,
 * facts). Los distractores se sacan de OTRAS regiones reales — nunca se
 * inventan datos — así que cada llamada produce una variación distinta y el
 * contenido es coherente con lo que Corchito ya enseñó en la parada educativa.
 */

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function otherRegions(regionId) {
  return REGIONS_DATA.filter(r => r.id !== regionId && r.facts);
}

function pickRandom(array, count) {
  return shuffle(array).slice(0, count);
}

// Nivel 1 — Reconocimiento: imagen (bandera/insignia) + 2 opciones.
function buildRecognitionQuestion(region) {
  const templates = [
    () => {
      const [distractor] = pickRandom(otherRegions(region.id), 1);
      const correct = region.facts.varietalPrincipal;
      const wrong = distractor ? distractor.facts.varietalPrincipal : 'Riesling';
      return {
        prompt: `¿Cuál es el varietal insignia de ${region.name}?`,
        options: shuffle([correct, wrong]),
        correctAnswer: correct
      };
    },
    () => {
      const [distractor] = pickRandom(otherRegions(region.id), 1);
      return {
        prompt: `Corchito está en ${region.flag} ${region.country.split(' ')[0]}. ¿Qué región vitivinícola es esta?`,
        options: shuffle([region.name, distractor ? distractor.name : 'Otra región']),
        correctAnswer: region.name
      };
    }
  ];

  const build = templates[Math.floor(Math.random() * templates.length)];
  const q = build();

  return {
    level: 1,
    mode: 'reconocimiento',
    regionId: region.id,
    hasImage: true,
    imageEmoji: region.flag,
    inputType: 'choice',
    ...q
  };
}

// Nivel 2 — Distractores: imagen + 4 opciones plausibles de regiones cercanas.
function buildDistractorQuestion(region) {
  const templates = [
    () => {
      const correct = region.facts.sueloTag;
      const distractors = pickRandom(otherRegions(region.id), 3).map(r => r.facts.sueloTag);
      return {
        prompt: `¿Qué tipo de suelo caracteriza el terroir de ${region.name}?`,
        options: shuffle([correct, ...distractors]),
        correctAnswer: correct
      };
    },
    () => {
      const correct = region.facts.varietalPrincipal;
      const otherVarietales = otherRegions(region.id).map(r => r.facts.varietalPrincipal);
      const distractors = pickRandom(otherVarietales, 3);
      return {
        prompt: `De estos 4 varietales, ¿cuál es la insignia de ${region.name}?`,
        options: shuffle([correct, ...distractors]),
        correctAnswer: correct
      };
    }
  ];

  const build = templates[Math.floor(Math.random() * templates.length)];
  const q = build();

  return {
    level: 2,
    mode: 'distractores',
    regionId: region.id,
    hasImage: true,
    imageEmoji: region.flag,
    inputType: 'choice',
    ...q
  };
}

// Nivel 3 — Producción libre: sin imagen, solo descripción; el jugador escribe la respuesta.
function buildFreeProductionQuestion(region) {
  const correct = region.facts.varietalPrincipal;
  const acceptable = [correct, ...region.terroirInfo.varietales].map(v => v.toLowerCase().trim());

  return {
    level: 3,
    mode: 'produccion_libre',
    regionId: region.id,
    hasImage: false,
    inputType: 'text',
    prompt: `Lee el terroir y escribe el varietal insignia de esta región.`,
    descriptionText: `${region.name} (${region.country}). Clima: ${region.terroirInfo.clima} Suelo: ${region.terroirInfo.suelo}`,
    correctAnswer: correct,
    acceptableAnswers: [...new Set(acceptable)]
  };
}

/**
 * Genera una pregunta fresca para una región y nivel dados.
 */
export function generateQuestion(region, level) {
  if (level === 2) return buildDistractorQuestion(region);
  if (level === 3) return buildFreeProductionQuestion(region);
  return buildRecognitionQuestion(region);
}

/**
 * Arma la tanda de preguntas de una sesión de reto: mezcla los 3 niveles de
 * la región activa y, si se pasa una región de repaso (repetición espaciada),
 * inyecta 1 pregunta de esa región en una posición aleatoria del set.
 */
export function buildSessionQuestions(region, { reviewRegion = null, count = 5 } = {}) {
  const levels = [1, 2, 3, 1, 2, 3, 1, 2, 3];
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateQuestion(region, levels[i % levels.length]));
  }

  if (reviewRegion) {
    const reviewLevel = 1 + Math.floor(Math.random() * 2); // repaso mas ligero: nivel 1 o 2
    const reviewQuestion = { ...generateQuestion(reviewRegion, reviewLevel), isReview: true };
    const insertAt = 1 + Math.floor(Math.random() * (questions.length - 1));
    questions.splice(insertAt, 0, reviewQuestion);
  }

  return questions;
}

/**
 * Compara la respuesta libre del jugador contra las respuestas aceptables,
 * normalizando acentos/mayúsculas para no penalizar errores tipográficos triviales.
 */
export function isFreeAnswerCorrect(question, rawAnswer) {
  const normalize = (s) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos (diacriticos combinados tras NFD)
    .trim();

  const answer = normalize(rawAnswer || '');
  if (!answer) return false;
  return (question.acceptableAnswers || []).some(a => normalize(a) === answer);
}

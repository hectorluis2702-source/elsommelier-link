/**
 * "El Restaurante de Corchito" — Etapa 1: Trivia de Maridaje.
 *
 * 15 combinaciones plato-vino curadas a mano (cocina dominicana + algunos
 * clásicos internacionales para variar el mecanismo SAT). Igual que
 * regionsData.js con questionGenerator.js: este catálogo es la ÚNICA fuente
 * de verdad — `justification` se muestra tal cual como feedback educativo,
 * nunca se inventa ni se parafrasea.
 *
 * `difficulty` ('uva' | 'copa' | 'barrica') mapea 1:1 a los niveles de
 * dificultad 1/2/3 que ya usa questionGenerator.js/CourseEngine.js — mismo
 * XP/Gemas por nivel (10/2, 15/3, 25/5), sin inventar una escala paralela.
 * Ver DIFFICULTY_TO_LEVEL en questionGenerator.js.
 */
export const PAIRINGS_CATALOG = [
  {
    id: 'mangu_salami',
    emoji: '🍌',
    dish: 'Mangú con cebollita encurtida y salami frito',
    wine: 'Espumoso Brut (Chardonnay/Xarel·lo), acidez alta',
    mechanism: 'Contraste — acidez/burbuja corta grasa',
    justification: 'La burbuja y la acidez despejan la grasa del salami sin competir con el ácido de la cebollita',
    difficulty: 'uva'
  },
  {
    id: 'sancocho',
    emoji: '🍲',
    dish: 'Sancocho dominicano (7 carnes)',
    wine: 'Tinto cuerpo medio(+), acidez media(+), taninos suaves — estilo Garnacha joven',
    mechanism: 'Congruencia de intensidad + freno de umami',
    justification: 'El cuerpo iguala la intensidad del caldo sin que el umami endurezca los taninos',
    difficulty: 'copa'
  },
  {
    id: 'chicharron',
    emoji: '🥓',
    dish: 'Chicharrón de cerdo',
    wine: 'Blanco acidez alta, sin madera — estilo Verdejo/Albariño',
    mechanism: 'Contraste — acidez corta grasa',
    justification: 'Caso clásico de acidez limpiando grasa frita',
    difficulty: 'uva'
  },
  {
    id: 'mofongo',
    emoji: '🥘',
    dish: 'Mofongo con chicharrón y caldo de pollo',
    wine: 'Blanco cuerpo medio(+), crianza breve — estilo Chardonnay',
    mechanism: 'Congruencia de textura',
    justification: 'El volumen del vino acompaña la densidad del plátano sin desaparecer frente al ajo',
    difficulty: 'copa'
  },
  {
    id: 'pescado_coco',
    emoji: '🐟',
    dish: 'Pescado guisado con coco',
    wine: 'Blanco semiseco, acidez media(+) — estilo Chenin Blanc/Riesling Kabinett',
    mechanism: 'Congruencia de dulzor',
    justification: 'El dulzor de la bebida debe igualar o superar al del plato',
    difficulty: 'barrica'
  },
  {
    id: 'moro_guandules',
    emoji: '🫘',
    dish: 'Moro de guandules con carne de cerdo',
    wine: 'Tinto ligero-medio, afrutado — estilo Pinot Noir/Tempranillo joven',
    mechanism: 'Congruencia de peso',
    justification: 'Un tinto ligero no opaca lo terroso del guandul ni pelea con la grasa del cerdo',
    difficulty: 'copa'
  },
  {
    id: 'habichuelas_dulce',
    emoji: '🍮',
    dish: 'Habichuelas con dulce',
    wine: 'Vino de licor dulce — estilo Moscatel',
    mechanism: 'Freno de dulzor',
    justification: 'El vino debe ser más dulce que el postre, o se percibe plano',
    difficulty: 'uva'
  },
  {
    id: 'yaniqueque',
    emoji: '🫓',
    dish: 'Yaniqueque con salsa picante y limón',
    wine: 'Blanco muy fresco, grado moderado',
    mechanism: 'Freno picante-alcohol',
    justification: 'El picante amplifica el alcohol; se evita alta graduación',
    difficulty: 'copa'
  },
  {
    id: 'locrio_pollo',
    emoji: '🍗',
    dish: 'Locrio de pollo con aceitunas',
    wine: 'Rosado seco, herbáceo — estilo Provenza',
    mechanism: 'Congruencia aromática',
    justification: 'Las notas herbáceas dialogan con el sofrito; la acidez equilibra la sal',
    difficulty: 'copa'
  },
  {
    id: 'chivo_picante',
    emoji: '🐐',
    dish: 'Chivo guisado picante',
    wine: 'Tinto cuerpo medio, taninos suaves, fruta madura',
    mechanism: 'Freno picante-alcohol',
    justification: 'Se evita alto tanino/graduación porque el picante amplificaría ambos',
    difficulty: 'barrica'
  },
  {
    id: 'casabe_queso',
    emoji: '🧀',
    dish: 'Casabe con queso de freír y aguacate',
    wine: 'Blanco joven, acidez media — estilo Verdejo',
    mechanism: 'Contraste — acidez corta grasa',
    justification: 'La acidez despeja la grasa del queso sin competir con la sequedad del casabe',
    difficulty: 'uva'
  },
  {
    id: 'risotto_porcini',
    emoji: '🍄',
    dish: 'Risotto ai funghi porcini',
    wine: 'Tinto taninos suaves, notas terrosas — estilo Pinot Noir',
    mechanism: 'Freno de umami',
    justification: 'El umami endurece los taninos; se elige un tinto de taninos redondeados',
    difficulty: 'barrica'
  },
  {
    id: 'curry_tailandes',
    emoji: '🍛',
    dish: 'Curry tailandés verde de pollo',
    wine: 'Blanco aromático semiseco — estilo Gewürztraminer/Riesling',
    mechanism: 'Freno picante-alcohol + congruencia aromática',
    justification: 'El dulzor controla el picor; la aromática floral dialoga con las especias',
    difficulty: 'barrica'
  },
  {
    id: 'ossobuco',
    emoji: '🍖',
    dish: 'Ossobuco alla milanese',
    wine: 'Tinto cuerpo medio(+), taninos integrados — estilo Sangiovese',
    mechanism: 'Congruencia de intensidad',
    justification: 'El cuerpo iguala la intensidad; la acidez corta la untuosidad del colágeno',
    difficulty: 'copa'
  },
  {
    id: 'tres_golpes',
    emoji: '🍳',
    dish: 'Tres golpes (mangú+salami+queso frito+huevo)',
    wine: 'Espumoso Brut rosado, cuerpo ligero',
    mechanism: 'Congruencia de textura',
    justification: 'Cuerpo ligero que no compite con ninguna de las tres frituras a la vez',
    difficulty: 'uva'
  }
];

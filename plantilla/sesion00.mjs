// Plantilla reutilizable · Coach WSET Nivel 3 · Sesión 0
import * as S from '/home/user/.perplexity/skills/office/pptx/scripts/framework.mjs';

const VINO = '7B1E3A';
S.setTheme({
  colors: { accent: VINO },
  series: [VINO, 'B8BCB6', '1B474D', 'BCE2E7', '944454'],
  stackSeries: [VINO, '1B474D', '944454', '848456', '6E522B'],
});
const deck = S.newDeck();
deck.title = 'WSET Nivel 3 · Sesión 0 · Mapa del examen';

const SPEC = { name: 'WSET, Especificaciones Nivel 3 en Vinos (2.0.1, 2023)', url: 'https://www.wsetglobal.com/media/13205/wset_l3wines_specification_es_highres_aug2023_issue201.pdf' };
const TOC = { name: 'Índice del libro Understanding Wines (Scribd)', url: 'https://www.scribd.com/document/523376460/WSET-3-Table-of-Content-Divided' };
const K = 'WSET 3 · SESIÓN 0 · ';

// 1 Portada
S.layouts.photoCover(deck.addSlide(), {
  image: { path: '../img/cover.png', width: 1672, height: 941, altText: 'Viñedo en ladera al atardecer con racimos de uva tinta' },
  title: 'Sesión 0: cómo se ganan los puntos del WSET Nivel 3',
  subtitle: 'Mapa del examen, resultados de aprendizaje y palabras clave de la Specification',
  kicker: 'COACH DE ESTUDIO · WSET LEVEL 3 AWARD IN WINES',
  presenter: 'Hector Garcia',
  date: 'Noviembre 2026',
  overlay: { color: '000000', opacity: 0.45 },
});

// 2 Estructura del examen
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'FORMATO DEL EXAMEN', headline: 'Aprobar exige 55 % en cada parte del examen', sources: [SPEC], page: 2 },
  table: {
    headers: ['Parte', 'Formato', 'Tiempo', 'Nota mínima'],
    rows: [
      ['Unidad 1 · Parte 1', '50 preguntas de opción múltiple, 1 punto cada una', '2 horas (ambas partes)', '55 %'],
      ['Unidad 1 · Parte 2', '4 preguntas de respuesta breve de 25 puntos', 'Incluido en las 2 horas', '55 %'],
      ['Unidad 2 · Cata', 'Cata a ciegas de 2 vinos tranquilos (blanco 20 pts, tinto 21 pts)', '30 minutos', '55 %'],
      ['Calificación final', 'Distinción ≥ 80 % · Mérito 65–79 % · Aprobado 55–64 %', 'Promedio de unidades', 'Ambas unidades'],
    ],
    colW: [0.2, 0.42, 0.2, 0.18],
  },
});

// 3 Peso de las preguntas de opción múltiple
S.layouts.single(deck.addSlide(), {
  frame: { kicker: K + 'DÓNDE ESTÁN LOS PUNTOS', headline: 'Las regiones (RA2) aportan 28 de las 50 preguntas de opción múltiple', sources: [SPEC], page: 3 },
  chart: {
    type: 'bar',
    labels: ['RA2 · Vinos tranquilos del mundo', 'RA1 · Factores de viña y bodega', 'RA3 · Vinos espumosos', 'RA4 · Vinos generosos', 'RA5 · Asesorar a clientes'],
    values: [28, 8, 5, 5, 4],
    highlight: 0,
    meta: {
      metric: 'Preguntas de opción múltiple por resultado de aprendizaje',
      unit: 'de 50 preguntas',
      population: 'Examen teórico, Unidad 1, Parte 1',
      geography: { notApplicable: 'Examen estándar WSET' },
      period: { kind: 'snapshot', label: 'Specification 2.0.1 (2023)' },
      baseline: { notApplicable: 'Distribución fija' },
      status: 'actual',
    },
  },
});

// 4 Preguntas de respuesta breve
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'RESPUESTA BREVE', headline: 'Las cuatro preguntas largas exigen aplicar la lógica del RA1', sources: [SPEC], page: 4 },
  table: {
    headers: ['Pregunta', 'Resultados evaluados', 'Qué esperar'],
    rows: [
      ['1', 'RA1 y RA2', 'Región o variedad explicada con clima, viña y bodega'],
      ['2', 'RA1 y RA2', 'Segunda región o comparación de estilos'],
      ['3', 'RA1, RA2 y RA5 (bloque 1)', 'Región + recomendación, almacenamiento o servicio'],
      ['4', 'RA1, RA3, RA4 y RA5 (bloque 1)', 'Espumoso o generoso + asesoría al cliente'],
      ['Reparto', 'RA2 70 pts · RA3 y RA4 20 pts · RA5 10 pts', 'RA1 se evalúa dentro de las cuatro preguntas'],
    ],
    colW: [0.14, 0.36, 0.5],
  },
});

// 5 Bloques del RA1
S.layouts.takeaways(deck.addSlide(), {
  frame: { kicker: K + 'RESULTADO DE APRENDIZAJE 1', headline: 'Tres bloques de factores explican estilo, calidad y precio', sources: [SPEC], page: 5 },
  cards: [
    { heading: 'Naturales en la viña', body: 'Calor, luz solar, agua, nutrientes, CO2; ciclo de la vid; clima, latitud, altitud, amplitud térmica diurna, suelo, añada.' },
    { heading: 'Humanos en la viña', body: 'Conducción, poda, gestión de la canopia, densidad, vendimia; heladas, estrés hídrico, filoxera, hongos; enfoques de cultivo.' },
    { heading: 'Humanos en la bodega', body: 'Oxígeno, SO2, recipientes, fermentación, conversión maloláctica, crianza en roble, lías, mezcla, clarificación, tapones.' },
  ],
});

// 6 Cadena causal (diagrama nativo + imagen)
{
  const s = deck.addSlide();
  const f = { kicker: K + 'CÓMO RESPONDER', headline: 'Las respuestas que puntúan siguen la cadena factor, uva, vino', sources: [SPEC, { name: 'Imagen ilustrativa generada con IA', kind: 'internal' }], page: 6 };
  const b = S.frame(s, f);
  const top = b.top + 10;
  const steps = [
    ['1 · FACTOR', 'Noches frescas (amplitud térmica diurna amplia)'],
    ['2 · EFECTO EN LA UVA', 'La uva conserva acidez mientras madura el azúcar'],
    ['3 · EFECTO EN EL VINO', 'Acidez alta, fruta fresca y precisa'],
    ['4 · CALIDAD O PRECIO', 'Mejor equilibrio, potencial de guarda'],
  ];
  const bw = 720, bh = 92, gap = 22;
  steps.forEach(([h, t], i) => {
    const y = top + i * (bh + gap);
    S.R(s, `paso_${i + 1}_fondo`, 76, y, bw, bh, i === 0 ? S.C.accent : S.C.surface);
    S.T(s, `paso_${i + 1}_titulo`, h, { x: 96, y: y + 32, w: bw - 40, role: 'label', bold: true, color: i === 0 ? 'FFFFFF' : S.C.accent });
    S.T(s, `paso_${i + 1}_texto`, t, { x: 96, y: y + 68, w: bw - 40, role: 'body', color: i === 0 ? 'FFFFFF' : S.C.ink });
    if (i < steps.length - 1) S.T(s, `flecha_${i + 1}`, '↓', { x: 76 + bw / 2 - 10, y: y + bh + 18, w: 30, role: 'label', bold: true, color: S.C.accent });
  });
  const ih = 4 * bh + 3 * gap, iw = Math.round(ih * 1024 / 1536);
  s.addImage({ path: '../img/racimo.png', x: S.px(1204 - iw), y: S.px(top), w: S.px(iw), h: S.px(ih), altText: 'Racimo de uva tinta bajo la canopia con luz solar filtrada' });
}

// 7 Ejemplo oficial desglosado
S.layouts.paired(deck.addSlide(), {
  frame: { kicker: K + 'EJEMPLO OFICIAL · CHARDONNAY', headline: 'La pregunta modelo reparte 25 puntos entre clima, viña, bodega y servicio', note: 'Preguntas tomadas de la Specification; las respuestas son modelo del coach, no la clave oficial.', sources: [SPEC], page: 7 },
  leftHeading: 'Parte de la pregunta (puntos)',
  rightHeading: 'Ideas y palabras clave que suman',
  pairs: [
    { left: '1a · Clima fresco y cálido en Australia (3 + 3)', right: 'Fresco (Yarra Valley): fruta verde y cítrica, acidez alta. Cálido (Riverland): fruta tropical, más alcohol' },
    { left: '1b · Por qué usar espaldera (4)', right: 'Más luz solar en uvas, más aireación, menos enfermedades fúngicas, permite mecanizar' },
    { left: '2a · Dos técnicas para mantequilla y tostado (5 + 5)', right: 'Conversión maloláctica: mantequilla, textura redonda. Roble nuevo: vainilla, tostado' },
    { left: '2b y 2c · Recomendación y conservación (2 + 3)', right: 'Meursault a 10–13 °C. Gas inerte o vacío: retira el oxígeno y frena la oxidación' },
  ],
});

// 8 Palabras clave maestras
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'PALABRAS CLAVE', headline: 'Estas palabras clave convierten una idea correcta en puntos', sources: [SPEC], page: 8 },
  table: {
    headers: ['Palabra clave (ES / EN)', 'Por qué puntúa'],
    rows: [
      ['Luz solar y energía / sunlight, energy', 'La fotosíntesis produce el azúcar de la uva'],
      ['Canopia / canopy', 'Controla sombra, aireación y riesgo de hongos'],
      ['Amplitud térmica diurna / diurnal range', 'Noches frescas conservan acidez y aromas'],
      ['Madurez fenólica / phenolic ripeness', 'Taninos maduros y color, distinta del azúcar'],
      ['Estrés hídrico / water stress', 'Leve concentra; severo detiene la maduración'],
      ['Rendimiento / yield', 'Menos uva por vid suele dar más concentración'],
      ['Conversión maloláctica / MLC', 'Baja la acidez y aporta mantequilla (diacetilo)'],
      ['Contacto con lías / lees contact', 'Textura cremosa y notas de levadura'],
    ],
    colW: [0.45, 0.55],
  },
});

// 9 Alertas de examen
S.layouts.takeaways(deck.addSlide(), {
  frame: { kicker: K + 'ALERTAS DE EXAMEN', headline: 'Tres errores de redacción cuestan más que olvidar un dato', page: 9 },
  cards: [
    { heading: 'Describir sin explicar', body: 'Decir "clima cálido" no suma. Explica la consecuencia: más azúcar, más alcohol, menos acidez, fruta madura.' },
    { heading: 'Usar términos vagos', body: 'Evita "mucho sol" o "buena uva". Usa luz solar, fotosíntesis, madurez fenólica o bajo rendimiento.' },
    { heading: 'Ignorar los puntos', body: 'Una parte de 5 puntos pide unas 5 ideas distintas. Cuenta tus ideas antes de pasar a la siguiente.' },
  ],
});

// 10 SAT
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'CATA · SAT NIVEL 3', headline: 'En la cata solo puntúan los términos exactos de las escalas de la SAT', sources: [SPEC], page: 10 },
  table: {
    headers: ['Elemento', 'Escala oficial'],
    rows: [
      ['Intensidad en nariz', 'ligera – media(-) – media – media(+) – pronunciada'],
      ['Dulzor', 'seco – casi seco – semiseco – semidulce – dulce – muy dulce'],
      ['Acidez y tanino', 'bajo/a – medio/a(-) – medio/a – medio/a(+) – alto/a'],
      ['Alcohol', 'bajo – medio – alto'],
      ['Cuerpo', 'poco – medio(-) – medio – medio(+) – mucho'],
      ['Final', 'corto – medio(-) – medio – medio(+) – largo'],
      ['Evolución', 'joven – en evolución – evolucionado – cansado'],
    ],
    colW: [0.28, 0.72],
  },
});

// 11 Plan de sesiones
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'PLAN DE ESTUDIO', headline: 'El plan sigue el libro, de factores a regiones', note: 'La numeración de capítulos puede variar entre ediciones del libro; se ajustará con tus fotos.', sources: [TOC, SPEC], page: 11 },
  table: {
    headers: ['Sesión', 'Capítulos del libro', 'RA'],
    rows: [
      ['1', '1–3 · Cata SAT, vino y comida, almacenamiento y servicio', 'RA5 · U2'],
      ['2', '4–6 · La vid, el entorno de cultivo, manejo del viñedo', 'RA1'],
      ['3', '7–11 · Vinificación, crianza, precio y legislación', 'RA1 · RA2'],
      ['4', '12–20 · Francia', 'RA2'],
      ['5', '21–27 · Alemania, Austria, Tokaj, Grecia, Italia', 'RA2'],
      ['6', '28–29 · España y Portugal', 'RA2'],
      ['7', '30–37 · EE. UU., Canadá, Chile, Argentina, Sudáfrica, Australia, NZ', 'RA2'],
      ['8', '38–42 · Espumosos, Jerez, Oporto, moscateles', 'RA3 · RA4'],
    ],
    colW: [0.1, 0.72, 0.18],
  },
});

// 12 Progreso
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'TU PROGRESO', headline: 'Tu material previo cubre conceptos del RA1; faltan bodega y regiones', note: 'Archivos encontrados en tu Mac (carpeta Sommelier y Vinos e iCloud Drive).', sources: [{ name: 'Archivos locales de Hector', kind: 'user' }], page: 12 },
  table: {
    headers: ['Material en tu Mac', 'Conceptos cubiertos', 'Estado'],
    rows: [
      ['WSET-L3-Semana-2026-W43', 'Canopia, amplitud térmica, luz solar, madurez fenólica', 'Repasar'],
      ['Water stress y malolactic', 'Estrés hídrico, conversión maloláctica', 'Repasar'],
      ['El Origen de los Aromas', 'Aromas primarios, secundarios, terciarios, defectos', 'Repasar'],
      ['Examen Australia', 'Regiones y clima de Australia', 'Corregir'],
    ],
    colW: [0.32, 0.5, 0.18],
  },
});

// 13 Mini-examen (preguntas)
{
  const s = deck.addSlide();
  const f = { kicker: K + 'MINI-EXAMEN', headline: 'Cinco preguntas para comprobar lo aprendido', note: 'La pregunta 3 es un ejemplo oficial de la Specification; las demás son del coach.', sources: [SPEC], page: 13 };
  const b = S.frame(s, f);
  const Q = [
    ['1. ¿Qué conserva la acidez en una región cálida?', 'a) Plantación densa  b) Amplitud térmica diurna', 'c) Riego por inundación  d) Poda en pulgar'],
    ['2. ¿Qué proceso convierte ácido málico en láctico?', 'a) Fermentación alcohólica  b) Conversión maloláctica', 'c) Encolado  d) Estabilización tartárica'],
    ['3. ¿Qué garantiza la estabilidad microbiológica?', 'a) Filtración esterilizante  b) Trasiego', 'c) Filtración en profundidad  d) Fermentación en frío'],
    ['4. ¿Qué método protege de heladas primaverales?', 'a) Mallas  b) Aspersores', 'c) Acollo  d) Riego por goteo'],
    ['5. ¿Qué nota exige aprobar la Parte 2 de la Unidad 1?', 'a) 50 % del total  b) 55 % en esa parte', 'c) 65 %  d) 55 % de promedio'],
  ];
  const colW = 540, lh = 25;
  Q.forEach((q, i) => {
    const col = i < 3 ? 0 : 1, row = i < 3 ? i : i - 3;
    const x = 76 + col * (colW + 48), y = b.top + 26 + row * 140;
    S.T(s, `pregunta_${i + 1}`, q[0], { x, y, w: colW, role: 'body', bold: true, lines: 2, lh });
    S.T(s, `opciones_${i + 1}_a`, q[1], { x, y: y + 2 * lh + 6, w: colW, role: 'compact', color: S.C.secondary });
    S.T(s, `opciones_${i + 1}_b`, q[2], { x, y: y + 3 * lh + 6, w: colW, role: 'compact', color: S.C.secondary });
  });
}

// 14 Respuestas
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'MINI-EXAMEN · RESPUESTAS', headline: 'Cada respuesta se apoya en una palabra clave que debes escribir', sources: [SPEC], page: 14 },
  table: {
    headers: ['N.º', 'Correcta', 'Por qué'],
    rows: [
      ['1', 'b', 'Noches frescas frenan la pérdida de acidez (amplitud térmica diurna)'],
      ['2', 'b', 'Bacterias lácticas transforman el málico: menos acidez, notas lácticas'],
      ['3', 'a', 'Solo la filtración esterilizante retira levaduras y bacterias'],
      ['4', 'b', 'Trampa: el acollo protege de la congelación invernal, no de heladas'],
      ['5', 'b', 'Se exige 55 % en cada parte por separado'],
    ],
    colW: [0.08, 0.14, 0.78],
  },
});

// 15 Cierre
S.layouts.closing(deck.addSlide(), {
  kicker: 'PRÓXIMOS PASOS',
  headline: 'Empezamos por los capítulos 4 a 6 porque el RA1 sostiene todas las respuestas largas',
  steps: [
    { text: 'Enviar fotos de los capítulos 4 a 6', owner: 'Hector', due: 'Próxima clase' },
    { text: 'Generar Sesión 2: resumen, examen y PPT', owner: 'Coach', due: 'Con fotos' },
    { text: 'Conectar GitHub para versionar el material', owner: 'Hector', due: 'Opcional' },
  ],
  contact: 'Coach de Estudio WSET Nivel 3',
});

await deck.writeFile({ fileName: '../sesiones/WSET3_Sesion00_Mapa_del_Examen.pptx' });
console.log('WARN', JSON.stringify(S.warnings, null, 1));
console.log('DIAG', JSON.stringify(S.diagnostics, null, 1));

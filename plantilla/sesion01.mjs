// Coach WSET Nivel 3 · Sesión 1 · Cata SAT, vino y comida, almacenamiento y servicio
import * as S from '/home/user/.perplexity/skills/office/pptx/scripts/framework.mjs';

const VINO = '7B1E3A';
S.setTheme({
  colors: { accent: VINO },
  series: [VINO, 'B8BCB6', '1B474D', 'BCE2E7', '944454'],
  stackSeries: [VINO, '1B474D', '944454', '848456', '6E522B'],
});
const deck = S.newDeck();
deck.title = 'WSET Nivel 3 · Sesión 1 · Cata, comida y servicio';

const SPEC = { name: 'WSET, Especificaciones Nivel 3 en Vinos (2.0.1, 2023)', url: 'https://www.wsetglobal.com/media/13205/wset_l3wines_specification_es_highres_aug2023_issue201.pdf' };
const TEMP = { name: 'WSET, temperaturas de servicio y almacenamiento', url: 'https://www.wsetglobal.com/knowledge-centre/blog/2022/april/26/ideal-serving-temperatures-and-top-tips-for-wine-storage/' };
const FALLOS = { name: 'WSET, defectos comunes del vino', url: 'https://www.wsetglobal.com/knowledge-centre/blog/2023/august/24/common-wine-faults-and-how-to-spot-them/' };
const COMIDA = { name: 'WSET, armonía de vino y comida', url: 'https://www.wsetglobal.com/knowledge-centre/blog/2020/december/21/winter-wine-and-food-matching' };
const IA = { name: 'Imagen ilustrativa generada con IA', kind: 'internal' };
const K = 'WSET 3 · SESIÓN 1 · ';
let page = 1;

// Diapositiva con imagen a la derecha y bloques de texto a la izquierda
function imageSlide(f, blocks, img) {
  const s = deck.addSlide();
  const b = S.frame(s, f);
  const top = b.top + 8, avail = b.bottom - top - 8;
  const iw = img.w;
  const imgH = Math.min(avail, Math.round(iw * img.hpx / img.wpx));
  s.addImage({ path: img.path, x: S.px(1204 - iw), y: S.px(top), w: S.px(iw), h: S.px(imgH), altText: img.alt });
  const tw = 1204 - iw - 48 - 76;
  const step = Math.floor(avail / blocks.length);
  blocks.forEach(([h, t], i) => {
    const y = top + i * step;
    S.T(s, `bloque_${i + 1}_titulo`, h, { x: 76, y: y + 4, w: tw, role: 'label', bold: true, color: S.C.accent });
    S.T(s, `bloque_${i + 1}_texto`, t, { x: 76, y: y + 40, w: tw, role: 'body', lines: 2 });
  });
  return s;
}

function quizSlide(f, Q, offset) {
  const s = deck.addSlide();
  const b = S.frame(s, f);
  const colW = 540, lh = 25;
  Q.forEach((q, i) => {
    const col = i < 3 ? 0 : 1, row = i < 3 ? i : i - 3;
    const x = 76 + col * (colW + 48), y = b.top + 26 + row * 140;
    S.T(s, `pregunta_${offset + i}`, q[0], { x, y, w: colW, role: 'body', bold: true, lines: 2, lh });
    S.T(s, `opciones_${offset + i}_a`, q[1], { x, y: y + 2 * lh + 6, w: colW, role: 'compact', color: S.C.secondary });
    S.T(s, `opciones_${offset + i}_b`, q[2], { x, y: y + 3 * lh + 6, w: colW, role: 'compact', color: S.C.secondary });
  });
}

// 1 Portada
S.layouts.photoCover(deck.addSlide(), {
  image: { path: '../img/s1_cover.png', width: 1672, height: 940, altText: 'Mesa de cata profesional con copas de vino blanco y tinto' },
  title: 'Sesión 1: cata con la SAT, vino y comida, servicio',
  subtitle: 'Capítulos 1 a 3 del libro · Unidad 2 y Resultado de Aprendizaje 5',
  kicker: 'COACH DE ESTUDIO · WSET LEVEL 3 AWARD IN WINES',
  presenter: 'Hector Garcia',
  date: 'Noviembre 2026',
  overlay: { color: '000000', opacity: 0.5 },
});

// 2 Qué se evalúa
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'QUÉ SE EVALÚA', headline: 'Estos temas valen la cata completa y parte de las preguntas', sources: [SPEC], page: ++page },
  table: {
    headers: ['Tema', 'Dónde puntúa', 'Peso'],
    rows: [
      ['Cata con la SAT (cap. 1)', 'Unidad 2: cata a ciegas de 2 vinos', 'Blanco 20 + tinto 21 puntos'],
      ['Vino y comida (cap. 2)', 'RA5 bloque 3', 'Dentro de 4 preguntas de opción múltiple'],
      ['Almacenamiento y servicio (cap. 3)', 'RA5 bloque 1', 'Opción múltiple y 10 puntos de respuesta breve'],
      ['Defectos del vino', 'RA5 bloque 2 y Unidad 2', 'Opción múltiple y nivel de calidad "defectuoso"'],
      ['Salud y consumo excesivo', 'RA5 bloque 4', 'Opción múltiple'],
    ],
    colW: [0.32, 0.34, 0.34],
  },
});

// 3 SAT aspecto y nariz
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'SAT · ASPECTO Y NARIZ', headline: 'Aspecto y nariz: escribe siempre un término de cada escala', sources: [SPEC], page: ++page },
  table: {
    headers: ['Elemento', 'Escala oficial SAT Nivel 3'],
    rows: [
      ['Intensidad del color', 'pálida – media – profunda'],
      ['Color blanco', 'verde limón – amarillo limón – dorado – ámbar – marrón'],
      ['Color tinto', 'púrpura – rubí – granate – teja – marrón'],
      ['Color rosado', 'rosado – salmón – naranja'],
      ['Condición en nariz', 'limpia – no limpia (¿defectuosa?)'],
      ['Intensidad en nariz', 'ligera – media(-) – media – media(+) – pronunciada'],
      ['Evolución', 'joven – en evolución – evolucionado – cansado'],
    ],
    colW: [0.3, 0.7],
  },
});

// 4 SAT boca
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'SAT · BOCA', headline: 'En boca puntúa cada elemento estructural por separado', sources: [SPEC], page: ++page },
  table: {
    headers: ['Elemento', 'Escala oficial SAT Nivel 3'],
    rows: [
      ['Dulzor', 'seco – casi seco – semiseco – semidulce – dulce – muy dulce'],
      ['Acidez', 'baja – media(-) – media – media(+) – alta'],
      ['Tanino (solo tintos)', 'bajo – medio(-) – medio – medio(+) – alto'],
      ['Alcohol', 'bajo – medio – alto'],
      ['Cuerpo', 'poco – medio(-) – medio – medio(+) – mucho'],
      ['Intensidad del sabor', 'ligera – media(-) – media – media(+) – pronunciada'],
      ['Final', 'corto – medio(-) – medio – medio(+) – largo'],
    ],
    colW: [0.3, 0.7],
  },
});

// 5 Aromas
S.layouts.takeaways(deck.addSlide(), {
  frame: { kicker: K + 'AROMAS Y SABORES', headline: 'Clasifica cada aroma por su origen: uva, bodega o crianza', note: 'Amplía con tu presentación "El Origen de los Aromas del Vino - WSET 3".', sources: [SPEC], page: ++page },
  cards: [
    { heading: 'Primarios', body: 'De la uva y la fermentación alcohólica: fruta, flores, hierbas, pimienta, mineral. Ej.: limón, grosella negra, violeta.' },
    { heading: 'Secundarios', body: 'De la bodega: levadura y lías (pan, galleta), conversión maloláctica (mantequilla), roble (vainilla, tostado).' },
    { heading: 'Terciarios', body: 'De la crianza: oxidativa (nuez, caramelo) o en botella (cuero, sotobosque, champiñón, miel).' },
  ],
});

// 6 Conclusiones de calidad (BLIC)
S.layouts.paired(deck.addSlide(), {
  frame: { kicker: K + 'CONCLUSIONES', headline: 'La nota de calidad se justifica con BLIC, no con opiniones', note: 'BLIC (balance, length, intensity, complexity) es la regla mnemotécnica del curso.', sources: [SPEC], page: ++page },
  leftHeading: 'Criterio (en inglés y español)',
  rightHeading: 'Qué escribir para sumar puntos',
  pairs: [
    { left: 'B · Equilibrio (balance)', right: 'Fruta, acidez, tanino y alcohol en armonía; ninguno domina' },
    { left: 'L · Final (length)', right: 'Final largo y agradable en boca' },
    { left: 'I · Intensidad (intensity)', right: 'Sabores concentrados y pronunciados' },
    { left: 'C · Complejidad (complexity)', right: 'Variedad de aromas primarios, secundarios y terciarios' },
  ],
});

// 7 Alertas de cata
S.layouts.takeaways(deck.addSlide(), {
  frame: { kicker: K + 'ALERTAS DE CATA', headline: 'Tres errores de cata que cuestan puntos fáciles', sources: [SPEC], page: ++page },
  cards: [
    { heading: 'Descriptores genéricos', body: '"Fruta roja" suma menos que "fresa, frambuesa, cereza". Da al menos 3 descriptores concretos por grupo.' },
    { heading: 'Calidad sin justificar', body: 'Escribir "muy bueno" no basta. Explica con BLIC: equilibrio, final largo, intensidad, complejidad.' },
    { heading: 'Saltar términos', body: 'Cada elemento tiene su escala. Si dejas en blanco tanino o final, pierdes esos puntos.' },
  ],
});

// 8 Comida que endurece vs suaviza (imagen)
imageSlide(
  { kicker: K + 'VINO Y COMIDA', headline: 'Dulzor y umami endurecen el vino; sal y acidez lo suavizan', sources: [COMIDA, SPEC, IA], page: ++page },
  [
    ['ENDURECEN EL VINO', 'Dulzor y umami: más amargor, astringencia, acidez y ardor del alcohol.'],
    ['SUAVIZAN EL VINO', 'Sal y acidez: menos amargor y acidez, más cuerpo y fruta.'],
    ['REGLA DE ORO', 'El vino debe ser tan dulce o más dulce que el plato.'],
    ['PICANTE', 'El alcohol alto aumenta el ardor del picante.'],
  ],
  { path: '../img/s1_maridaje.png', w: 330, wpx: 1024, hpx: 1536, alt: 'Mesa con carne a la parrilla con sal y vino tinto, pescado con limón y vino blanco' },
);

// 9 Tabla de componentes
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'COMPONENTES DE LA COMIDA', headline: 'Cada componente del plato cambia la percepción del vino', sources: [COMIDA, SPEC], page: ++page },
  table: {
    headers: ['En la comida', 'Efecto en el vino', 'Recomendación'],
    rows: [
      ['Dulzor', 'Menos dulce y frutal; más ácido y amargo', 'Vino igual o más dulce'],
      ['Umami', 'Más amargo y astringente; menos frutal', 'Vino frutal, poco tanino'],
      ['Acidez', 'Menos ácido; más frutal y redondo', 'Vino de acidez alta'],
      ['Sal', 'Menos amargo y ácido; más cuerpo', 'Componente amigable'],
      ['Amargor', 'Aumenta el amargor del vino', 'Blancos o tintos poco tánicos'],
      ['Picante', 'Más ardor del alcohol, amargor, astringencia', 'Alcohol bajo, algo de dulzor'],
      ['Grasa', 'La acidez y el tanino la equilibran', 'Acidez alta o tanino'],
    ],
    colW: [0.18, 0.47, 0.35],
  },
});

// 10 Almacenamiento (imagen)
imageSlide(
  { kicker: K + 'ALMACENAMIENTO', headline: 'El vino se conserva bien con frescor, oscuridad y calma', sources: [TEMP, SPEC, IA], page: ++page },
  [
    ['TEMPERATURA', 'Fresca y constante, 10–15 °C. Evita la cocina: cambia mucho.'],
    ['LUZ', 'Oscuridad. La luz UV acelera el envejecimiento y crea defectos.'],
    ['POSICIÓN', 'Botellas con corcho acostadas: el corcho no se seca.'],
    ['VIBRACIÓN Y OLORES', 'Sin vibraciones ni olores fuertes cerca.'],
  ],
  { path: '../img/s1_cava.png', w: 420, wpx: 1536, hpx: 1024, alt: 'Bodega subterránea con botellas acostadas en estanterías de madera' },
);

// 11 Temperaturas
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'TEMPERATURAS DE SERVICIO', headline: 'Memoriza seis rangos de temperatura de servicio', note: 'Por debajo de 6 °C se ocultan los aromas; por encima de 18 °C el tinto pierde frescura.', sources: [TEMP, SPEC], page: ++page },
  table: {
    headers: ['Estilo', 'Ejemplo', 'Temperatura'],
    rows: [
      ['Dulces', 'Sauternes, Tokaji Aszú', '6–8 °C (muy frío)'],
      ['Espumosos', 'Champagne, Cava', '6–10 °C (muy frío)'],
      ['Blancos ligeros a medios', 'Pinot Grigio, Sancerre', '7–10 °C (frío)'],
      ['Blancos con cuerpo y roble', 'Meursault, Chardonnay con roble', '10–13 °C (ligeramente frío)'],
      ['Tintos ligeros', 'Beaujolais, Valpolicella', 'Unos 13 °C (ligeramente frío)'],
      ['Tintos medios y con cuerpo', 'Rioja Reserva, Barolo', '15–18 °C (temperatura ambiente)'],
    ],
    colW: [0.34, 0.36, 0.3],
  },
});

// 12 Servicio
S.layouts.paired(deck.addSlide(), {
  frame: { kicker: K + 'SERVICIO', headline: 'Decantar, conservar y elegir la copa tienen razones de examen', sources: [SPEC], page: ++page },
  leftHeading: 'Situación',
  rightHeading: 'Qué hacer y por qué',
  pairs: [
    { left: 'Vino con sedimento (Oporto Vintage)', right: 'Botella de pie antes, decantar despacio con luz; separa el sedimento' },
    { left: 'Tinto joven y cerrado', right: 'Decantar para airear; el oxígeno abre los aromas' },
    { left: 'Botella abierta', right: 'Vacío o gas inerte; quitan el oxígeno y frenan la oxidación' },
    { left: 'Espumoso abierto', right: 'Tapón para espumosos y frío; conserva la burbuja' },
  ],
});

// 13 Defectos
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'DEFECTOS', headline: 'Siete defectos del temario y la pista para detectarlos', sources: [FALLOS, SPEC], page: ++page },
  table: {
    headers: ['Defecto', 'Causa', 'Pista en nariz o boca'],
    rows: [
      ['Corcho (TCA)', 'Tricloroanisol, a menudo del corcho', 'Cartón mojado, moho; fruta apagada'],
      ['Oxidación', 'Exceso de oxígeno', 'Color marrón, fruta perdida, notas de nuez'],
      ['Reducción', 'Falta de oxígeno, compuestos de azufre', 'Huevo podrido, col, desagüe'],
      ['Acidez volátil', 'Bacterias acéticas con oxígeno', 'Vinagre, quitaesmalte'],
      ['Brettanomyces', 'Levadura de alteración', 'Establo, medicinal, cuero'],
      ['En mal estado', 'Calor, luz o vino demasiado viejo', 'Fruta cocida o apagada, sin frescura'],
      ['SO2 alto', 'Exceso de anhídrido sulfuroso', 'Fósforo quemado, irrita la nariz'],
    ],
    colW: [0.2, 0.38, 0.42],
  },
});

// 14 Recomendar y salud
S.layouts.takeaways(deck.addSlide(), {
  frame: { kicker: K + 'RECOMENDAR Y SALUD', headline: 'Recomendar bien combina vino, cliente, ocasión y salud', sources: [SPEC], page: ++page },
  cards: [
    { heading: 'Criterios de elección', body: 'Estilo, calidad, preferencias y sensibilidades del cliente, precio y ocasión. Justifica cada recomendación.' },
    { heading: 'Explicar la elección', body: 'Une el vino al plato o al cliente con una razón: "acidez alta que equilibra la grasa del plato".' },
    { heading: 'Consumo excesivo', body: 'Tiene riesgos sociales y de salud. Sigue las pautas oficiales de consumo de cada país.' },
  ],
});

// 15 Palabras clave
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'PALABRAS CLAVE', headline: 'Palabras clave nuevas que entran a tu lista maestra', sources: [SPEC], page: ++page },
  table: {
    headers: ['Palabra clave (ES / EN)', 'Por qué puntúa'],
    rows: [
      ['Equilibrio, final, intensidad, complejidad / BLIC', 'Justifican el nivel de calidad en la cata'],
      ['Estado para el consumo / readiness for drinking', 'Segunda conclusión obligatoria de la SAT'],
      ['Primario, secundario, terciario', 'Organizan los descriptores y muestran complejidad'],
      ['Umami / umami', 'Endurece el vino: más amargor y astringencia'],
      ['Tan dulce o más dulce', 'Regla para platos dulces'],
      ['Gas inerte, vacío / inert gas, vacuum', 'Conservación de botellas abiertas'],
      ['TCA, reducción, Brettanomyces, acidez volátil', 'Defectos del temario por su nombre exacto'],
    ],
    colW: [0.5, 0.5],
  },
});

// 16 Pregunta de respuesta breve
S.layouts.paired(deck.addSlide(), {
  frame: { kicker: K + 'RESPUESTA BREVE · PRÁCTICA', headline: 'Practica una pregunta de 25 puntos sobre comida y servicio', note: 'Pregunta del coach en estilo de examen. Clave modelo en la diapositiva 17.', sources: [SPEC], page: ++page },
  leftHeading: 'Pregunta (puntos)',
  rightHeading: 'Pista',
  pairs: [
    { left: 'a) Recomienda y justifica un vino para cerdo glaseado con miel y chile (8)', right: 'Piensa en dulzor y picante del plato' },
    { left: 'b) Explica por qué Barolo choca con champiñones y queso curado (6)', right: 'Umami + tanino' },
    { left: 'c) Indica temperatura de servicio y copa para un Meursault (3)', right: 'Blanco con cuerpo y roble' },
    { left: 'd) Cómo conservar el Meursault abierto y almacenar las botellas cerradas (8)', right: 'Oxígeno, luz, temperatura, posición' },
  ],
});

// 17 Clave modelo
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'RESPUESTA BREVE · CLAVE', headline: 'Una idea con su consecuencia vale cada punto', note: 'Respuesta modelo del coach; no es la clave oficial de WSET.', sources: [SPEC, COMIDA, TEMP], page: ++page },
  table: {
    headers: ['Parte', 'Ideas que suman puntos'],
    rows: [
      ['a) 8', 'Riesling semiseco: dulzor ≥ glaseado; alcohol bajo no aviva el chile; acidez alta corta la grasa; fruta intensa'],
      ['b) 6', 'Umami aumenta amargor y astringencia; tanino alto de Nebbiolo se endurece; fruta parece menor'],
      ['c) 3', '10–13 °C, ligeramente frío; copa de vino blanco limpia y sin olores'],
      ['d) 8', 'Abierto: vacío o gas inerte, tapar, nevera. Cerradas: 10–15 °C constantes, oscuridad, acostadas, sin vibración ni olores'],
    ],
    colW: [0.12, 0.88],
  },
});

// 18-19 Mini-examen
quizSlide({ kicker: K + 'MINI-EXAMEN · 1 DE 2', headline: 'Opción múltiple, preguntas 1 a 5', sources: [SPEC], page: ++page }, [
  ['1. ¿Qué componente de la comida suaviza el vino?', 'a) Dulzor  b) Umami', 'c) Sal  d) Amargor'],
  ['2. ¿A qué huele un vino con TCA?', 'a) Vinagre  b) Cartón mojado', 'c) Huevo podrido  d) Fósforo quemado'],
  ['3. ¿Temperatura para un Beaujolais?', 'a) 6–8 °C  b) Unos 13 °C', 'c) 15–18 °C  d) 20 °C'],
  ['4. ¿Qué causa la acidez volátil?', 'a) Bacterias acéticas  b) Falta de oxígeno', 'c) Corcho  d) SO2 alto'],
  ['5. ¿Qué vino va con un postre muy dulce?', 'a) Brut  b) Seco con roble', 'c) Igual o más dulce  d) Tinto tánico'],
], 1);
quizSlide({ kicker: K + 'MINI-EXAMEN · 2 DE 2', headline: 'Opción múltiple, preguntas 6 a 10', sources: [SPEC], page: ++page }, [
  ['6. ¿Por qué acostar botellas con corcho?', 'a) Separar sedimento  b) Evitar que el corcho se seque', 'c) Enfriar  d) Airear'],
  ['7. ¿Qué escala de color es de tinto?', 'a) Limón – dorado  b) Púrpura – rubí – granate', 'c) Salmón – naranja  d) Pálido – ámbar'],
  ['8. ¿Qué aroma es secundario?', 'a) Grosella negra  b) Cuero', 'c) Mantequilla  d) Violeta'],
  ['9. ¿Qué indica BLIC en la cata?', 'a) Estado de consumo  b) Nivel de calidad', 'c) Aroma  d) Color'],
  ['10. ¿Riesgo del alcohol alto con picante?', 'a) Más ardor  b) Menos amargor', 'c) Más fruta  d) Más dulzor'],
], 6);

// 20 Respuestas
S.layouts.table(deck.addSlide(), {
  frame: { kicker: K + 'MINI-EXAMEN · RESPUESTAS', headline: 'Revisa por qué cada respuesta es la correcta', sources: [SPEC, FALLOS, TEMP], page: ++page },
  table: {
    headers: ['Preguntas 1 a 5', 'Preguntas 6 a 10'],
    rows: [
      ['1 · c · La sal baja amargor y acidez del vino', '6 · b · El corcho húmedo mantiene el cierre'],
      ['2 · b · El TCA da cartón mojado y apaga la fruta', '7 · b · Tinto: púrpura, rubí, granate, teja, marrón'],
      ['3 · b · Tinto ligero: unos 13 °C', '8 · c · Mantequilla: conversión maloláctica'],
      ['4 · a · Bacterias acéticas con oxígeno', '9 · b · BLIC justifica el nivel de calidad'],
      ['5 · c · Tan dulce o más dulce que el postre', '10 · a · El alcohol aviva el picante'],
    ],
    colW: [0.5, 0.5],
  },
});

// 21 Cierre
S.layouts.closing(deck.addSlide(), {
  kicker: 'PRÓXIMOS PASOS',
  headline: 'Practica la SAT con dos vinos esta semana y pasamos al viñedo',
  steps: [
    { text: 'Catar un blanco y un tinto con la SAT completa', owner: 'Hector', due: 'Esta semana' },
    { text: 'Enviar fotos de los capítulos 1 a 3 para afinar', owner: 'Hector', due: 'Opcional' },
    { text: 'Sesión 2: la vid, el entorno y el viñedo', owner: 'Coach', due: 'Próxima clase' },
  ],
  contact: 'Coach de Estudio WSET Nivel 3',
});

await deck.writeFile({ fileName: '../sesiones/WSET3_Sesion01_Cata_Comida_Servicio.pptx' });
console.log('WARN', JSON.stringify(S.warnings, null, 1));
console.log('DIAG', JSON.stringify(S.diagnostics, null, 1));

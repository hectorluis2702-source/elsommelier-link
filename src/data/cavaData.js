/**
 * Catálogo de Botellas Coleccionables de la Cava Digital de Vinotipos
 */
export const BOTTLES_CATALOG = [
  {
    id: 'b1_champagne',
    name: 'Dom Pérignon Vintage',
    region: 'Champagne, Francia',
    type: 'Espumoso Brut',
    rarity: 'Legendaria',
    unlocked: true,
    imageIcon: '🍾',
    notes: 'Aromas a almendras tostadas, brioche fresco, flores blancas y notas cítricas de pomelo. Burbuja finísima y crema impecable.'
  },
  {
    id: 'b2_chianti',
    name: 'Chianti Classico Gran Selezione',
    region: 'Toscana, Italia',
    type: 'Tinto Seco',
    rarity: 'Épica',
    unlocked: true,
    imageIcon: '🍷',
    notes: 'Dominio de cereza negra, violetas secas, notas de cuero suave, balsámicos y acidez vibrante propia de la Sangiovese.'
  },
  {
    id: 'b3_rioja_gran_reserva',
    name: 'Viña Tondonia Gran Reserva',
    region: 'La Rioja, España',
    type: 'Tinto de Crianza Prolongada',
    rarity: 'Épica',
    unlocked: false,
    reqXP: 200,
    imageIcon: '🍇',
    notes: 'Sedoso, elegante, con recuerdos a vainilla, tabaco de pipa, especias dulces y un final eterno en boca.'
  },
  {
    id: 'b4_malbec_mendoza',
    name: 'Catena Zapata Malbec Argentino',
    region: 'Mendoza, Argentina',
    type: 'Tinto de Altura',
    rarity: 'Rara',
    unlocked: false,
    reqXP: 350,
    imageIcon: '🏔️',
    notes: 'Explosión de frutos negros (mora, arándano), violetas intensas, cacao puro y taninos aterciopelados.'
  },
  {
    id: 'b5_napa_cabernet',
    name: 'Opus One Cabernet Sauvignon',
    region: 'Napa Valley, EE.UU.',
    type: 'Tinto Icónico',
    rarity: 'Mítica',
    unlocked: false,
    reqXP: 600,
    imageIcon: '👑',
    notes: 'Poderoso y estructurado. Casis, cassis, cedro, grafito y chocolate negro con potencial de guarda de décadas.'
  }
];

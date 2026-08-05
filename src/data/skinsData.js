/**
 * Catálogo de Disfraces con Buffs y Habilidades Pasivas para 'Corchito'
 */
export const SKINS_CATALOG = [
  {
    id: 'skin_default',
    name: 'Corchito Clásico',
    price: 0,
    purchased: true,
    equipped: true,
    icon: '🍾',
    buffTitle: 'Sin Buff',
    buffDesc: 'El Corchito amigable original listo para aprender.',
    hatColor: '#D4AF37'
  },
  {
    id: 'skin_sommelier',
    name: 'Master Sommelier',
    price: 150,
    purchased: false,
    equipped: false,
    icon: '🤵🏻‍♂️',
    buffTitle: '+20% XP en Catas',
    buffDesc: 'Gana más experiencia en el protocolo de servicio y análisis sensorial.',
    hatColor: '#1A1A1A',
    accessory: 'Tastevin de Plata'
  },
  {
    id: 'skin_enologo',
    name: 'Enólogo de Alquimia',
    price: 300,
    purchased: false,
    equipped: false,
    icon: '🥼',
    buffTitle: 'Pista Química Gratis',
    buffDesc: 'Oculta una opción incorrecta en ejercicios de maridaje y acidez.',
    hatColor: '#E6E6E6',
    accessory: 'Pipeta de Laboratorio'
  },
  {
    id: 'skin_vendimiador',
    name: 'Vendimiador Tradicional',
    price: 200,
    purchased: false,
    equipped: false,
    icon: '🧺',
    buffTitle: 'Escudo de Racha',
    buffDesc: 'Permite 1 fallo extra sin activar la racha de errores torpes.',
    hatColor: '#8B4513',
    accessory: 'Cesta de Uvas'
  },
  {
    id: 'skin_magnate',
    name: 'Magnate de la Bodega',
    price: 500,
    purchased: false,
    equipped: false,
    icon: '🎩',
    buffTitle: 'Multiplicador x2 Gemas',
    buffDesc: 'Duplica todas las Gemas obtenidas al finalizar un nivel con 100% de precisión.',
    hatColor: '#2B1B17',
    accessory: 'Monóculo de Oro'
  }
];

// Motor de Maridaje - Sistema de compatibilidad entre vinos y comidas dominicanas

class MaridajeEngine {
  constructor() {
    // Reglas de maridaje basadas en caracteristicas
    this.reglasMaridaje = {
      carneRoja: {
        vinosIdeales: ['reds', 'port'],
        caracteristicas: ['taninos altos', 'cuerpo completo', 'robusto'],
        puntuacion: 95
      },
      carneBlanca: {
        vinosIdeales: ['whites', 'rose'],
        caracteristicas: ['acidez media', 'cuerpo ligero', 'frutal'],
        puntuacion: 90
      },
      pescado: {
        vinosIdeales: ['whites', 'sparkling'],
        caracteristicas: ['acidez alta', 'mineral', 'fresco'],
        puntuacion: 92
      },
      picante: {
        vinosIdeales: ['whites', 'rose', 'sparkling'],
        caracteristicas: ['dulce', 'bajo alcohol', 'refrescante'],
        puntuacion: 85
      },
      postre: {
        vinosIdeales: ['dessert', 'sparkling'],
        caracteristicas: ['dulce', 'aromatico', 'elegante'],
        puntuacion: 93
      },
      queso: {
        vinosIdeales: ['reds', 'whites', 'port'],
        caracteristicas: ['estructurado', 'complejo'],
        puntuacion: 88
      },
      frito: {
        vinosIdeales: ['sparkling', 'whites'],
        caracteristicas: ['acidez alta', 'burbujas', 'limpio'],
        puntuacion: 87
      },
      guiso: {
        vinosIdeales: ['reds'],
        caracteristicas: ['cuerpo medio-alto', 'tanico', 'especiado'],
        puntuacion: 91
      }
    };

    // Maridajes especificos para platos dominicanos con vinos reales
    this.platosDominicanos = {
      'mofongo': {
        tipo: 'frito',
        intensidad: 'alta',
        proteina: 'cerdo',
        consejo: 'El mofongo, con su base de platano verde frito y chicharron, necesita un vino con buena acidez que corte la grasa y complemente los sabores intensos del ajo.',
        vinosRecomendados: [
          { tipo: 'whites', variedad: 'Chardonnay', vino: 'Catena Chardonnay', bodega: 'Bodega Catena Zapata', region: 'Mendoza, Argentina', compatibilidad: 88, descripcion: 'Blanco con cuerpo, notas de frutas tropicales y mantequilla que complementa la textura del platano' },
          { tipo: 'sparkling', variedad: 'Prosecco', vino: 'Mionetto Prosecco Brut', bodega: 'Mionetto', region: 'Veneto, Italia', compatibilidad: 85, descripcion: 'Espumoso ligero y refrescante que limpia el paladar entre cada bocado' },
          { tipo: 'rose', variedad: 'Rose seco', vino: 'Whispering Angel Rose', bodega: "Chateau d'Esclans", region: 'Provence, Francia', compatibilidad: 82, descripcion: 'Rose provenzal elegante con acidez que equilibra la grasa del chicharron' }
        ]
      },
      'sancocho': {
        tipo: 'guiso',
        intensidad: 'alta',
        proteina: 'mixta',
        consejo: 'El sancocho dominicano, con sus siete carnes y viveres, pide un tinto robusto que soporte la complejidad de sabores y la intensidad del caldo.',
        vinosRecomendados: [
          { tipo: 'reds', variedad: 'Malbec', vino: 'Luigi Bosca Malbec Reserva', bodega: 'Luigi Bosca', region: 'Lujan de Cuyo, Argentina', compatibilidad: 92, descripcion: 'Tinto robusto con notas de ciruela y especias que abraza el sancocho' },
          { tipo: 'reds', variedad: 'Tempranillo', vino: 'Muga Reserva', bodega: 'Bodegas Muga', region: 'Rioja, Espana', compatibilidad: 90, descripcion: 'Rioja clasico con taninos suaves y notas de cuero que armoniza con las carnes' },
          { tipo: 'reds', variedad: 'Syrah', vino: 'E. Guigal Crozes-Hermitage', bodega: 'E. Guigal', region: 'Rhone, Francia', compatibilidad: 88, descripcion: 'Syrah especiado con pimienta negra que complementa el cilantro del sancocho' }
        ]
      },
      'la bandera': {
        tipo: 'carneRoja',
        intensidad: 'media',
        proteina: 'res',
        consejo: 'La Bandera Dominicana — arroz blanco, habichuelas y carne guisada — es nuestro plato nacional. Un tinto medio que respete cada componente sin dominar.',
        vinosRecomendados: [
          { tipo: 'reds', variedad: 'Merlot', vino: 'Casillero del Diablo Merlot', bodega: 'Concha y Toro', region: 'Valle Central, Chile', compatibilidad: 89, descripcion: 'Tinto suave con notas de cereza que se funde con las habichuelas guisadas' },
          { tipo: 'reds', variedad: 'Pinot Noir', vino: 'Cono Sur Bicicleta Pinot Noir', bodega: 'Cono Sur', region: 'Valle de Casablanca, Chile', compatibilidad: 85, descripcion: 'Tinto ligero y frutal que no opaca los sabores del guiso' },
          { tipo: 'rose', variedad: 'Rose robusto', vino: 'Mateus Rose', bodega: 'Sogrape', region: 'Portugal', compatibilidad: 80, descripcion: 'Rose con cuerpo que acompana la combinacion de arroz y carne' }
        ]
      },
      'pastelon': {
        tipo: 'carneRoja',
        intensidad: 'alta',
        proteina: 'res',
        consejo: 'El pastelon, nuestra lasana de platano maduro con carne molida y queso, tiene dulzor natural que pide un tinto con fruta madura.',
        vinosRecomendados: [
          { tipo: 'reds', variedad: 'Cabernet Sauvignon', vino: 'Marques de Casa Concha Cabernet', bodega: 'Concha y Toro', region: 'Puente Alto, Chile', compatibilidad: 91, descripcion: 'Cabernet estructurado con notas de cassis que complementa la dulzura del platano' },
          { tipo: 'reds', variedad: 'Malbec', vino: 'Trapiche Malbec Reserva', bodega: 'Trapiche', region: 'Mendoza, Argentina', compatibilidad: 89, descripcion: 'Malbec con fruta madura que armoniza con el queso gratinado' },
          { tipo: 'reds', variedad: 'Zinfandel', vino: 'Ravenswood Old Vine Zinfandel', bodega: 'Ravenswood', region: 'Sonoma, California', compatibilidad: 87, descripcion: 'Zinfandel con mermelada de frutas que baila con el dulzor del maduro' }
        ]
      },
      'chivo guisado': {
        tipo: 'carneRoja',
        intensidad: 'muy alta',
        proteina: 'chivo',
        consejo: 'El chivo guisado liniero es el plato mas intenso de nuestra cocina. Necesita un tinto poderoso con taninos que soporten el oregano y el sabor profundo del chivo.',
        vinosRecomendados: [
          { tipo: 'reds', variedad: 'Cabernet Sauvignon', vino: 'Antigal Uno Cabernet Sauvignon', bodega: 'Antigal', region: 'Mendoza, Argentina', compatibilidad: 94, descripcion: 'Cabernet potente con taninos firmes que doman la intensidad del chivo' },
          { tipo: 'reds', variedad: 'Syrah', vino: 'Penfolds Bin 28 Shiraz', bodega: 'Penfolds', region: 'South Australia', compatibilidad: 92, descripcion: 'Shiraz especiado con pimienta que complementa el oregano del guiso' },
          { tipo: 'port', variedad: 'Oporto Ruby', vino: "Graham's Fine Ruby Port", bodega: "W. & J. Graham's", region: 'Douro, Portugal', compatibilidad: 88, descripcion: 'Oporto con fruta concentrada que equilibra la rusticidad del chivo' }
        ]
      },
      'yaroa': {
        tipo: 'frito',
        intensidad: 'alta',
        proteina: 'mixta',
        consejo: 'La yaroa es pura indulgencia dominicana — platano frito, carne, queso y salsas. Un espumoso o blanco fresco corta la grasa y refresca.',
        vinosRecomendados: [
          { tipo: 'sparkling', variedad: 'Cava', vino: 'Freixenet Cordon Negro Brut', bodega: 'Freixenet', region: 'Penedes, Espana', compatibilidad: 86, descripcion: 'Cava con burbujas finas que limpian el paladar de la grasa' },
          { tipo: 'rose', variedad: 'Rose seco', vino: 'Meiomi Rose', bodega: 'Meiomi', region: 'California, USA', compatibilidad: 84, descripcion: 'Rose con cuerpo y frescura para equilibrar queso y salsas' },
          { tipo: 'whites', variedad: 'Sauvignon Blanc', vino: 'Cloudy Bay Sauvignon Blanc', bodega: 'Cloudy Bay', region: 'Marlborough, Nueva Zelanda', compatibilidad: 81, descripcion: 'Blanco herbal y citrico que refresca entre cada bocado' }
        ]
      },
      'locrio de pollo': {
        tipo: 'carneBlanca',
        intensidad: 'media',
        proteina: 'pollo',
        consejo: 'El locrio dominicano es nuestro arroz con pollo, sazonado con sofrito y aceitunas. Un blanco con cuerpo o un tinto ligero lo complementa perfecto.',
        vinosRecomendados: [
          { tipo: 'whites', variedad: 'Chardonnay', vino: 'Kendall-Jackson Vintners Reserve Chardonnay', bodega: 'Kendall-Jackson', region: 'California, USA', compatibilidad: 90, descripcion: 'Chardonnay con toques de roble que abraza los sabores del sofrito' },
          { tipo: 'whites', variedad: 'Viognier', vino: 'Yalumba The Y Series Viognier', bodega: 'Yalumba', region: 'South Australia', compatibilidad: 87, descripcion: 'Viognier aromatico con notas de durazno que realza el pollo' },
          { tipo: 'rose', variedad: 'Rose frutal', vino: 'Minuty M Rose', bodega: 'Chateau Minuty', region: 'Provence, Francia', compatibilidad: 85, descripcion: 'Rose elegante con frutilla que acompana las aceitunas del locrio' }
        ]
      },
      'locrio': {
        tipo: 'carneBlanca',
        intensidad: 'media',
        proteina: 'pollo',
        consejo: 'El locrio dominicano es nuestro arroz con pollo, sazonado con sofrito y aceitunas. Un blanco con cuerpo o un tinto ligero lo complementa perfecto.',
        vinosRecomendados: [
          { tipo: 'whites', variedad: 'Chardonnay', vino: 'Kendall-Jackson Vintners Reserve Chardonnay', bodega: 'Kendall-Jackson', region: 'California, USA', compatibilidad: 90, descripcion: 'Chardonnay con toques de roble que abraza los sabores del sofrito' },
          { tipo: 'whites', variedad: 'Viognier', vino: 'Yalumba The Y Series Viognier', bodega: 'Yalumba', region: 'South Australia', compatibilidad: 87, descripcion: 'Viognier aromatico con notas de durazno que realza el pollo' },
          { tipo: 'rose', variedad: 'Rose frutal', vino: 'Minuty M Rose', bodega: 'Chateau Minuty', region: 'Provence, Francia', compatibilidad: 85, descripcion: 'Rose elegante con frutilla que acompana las aceitunas del locrio' }
        ]
      },
      'mangu': {
        tipo: 'carneBlanca',
        intensidad: 'media',
        proteina: 'mixta',
        consejo: 'El mangu con los tres golpes — salami, queso y huevo — es el desayuno dominicano por excelencia. Un espumoso brut o un blanco fresco lo elevan.',
        vinosRecomendados: [
          { tipo: 'sparkling', variedad: 'Champagne Brut', vino: 'Veuve Clicquot Yellow Label Brut', bodega: 'Veuve Clicquot', region: 'Champagne, Francia', compatibilidad: 88, descripcion: 'Champagne clasico con burbujas que cortan la grasa del salami frito' },
          { tipo: 'whites', variedad: 'Albarino', vino: 'Martin Codax Albarino', bodega: 'Martin Codax', region: 'Rias Baixas, Espana', compatibilidad: 85, descripcion: 'Blanco mineral con citricos que refresca el paladar del mangu' },
          { tipo: 'rose', variedad: 'Rose', vino: 'Domaines Ott By.Ott Rose', bodega: 'Domaines Ott', region: 'Provence, Francia', compatibilidad: 83, descripcion: 'Rose provenzal delicado que equilibra huevo y queso' }
        ]
      },
      'pollo guisado': {
        tipo: 'carneBlanca',
        intensidad: 'media',
        proteina: 'pollo',
        consejo: 'El pollo guisado dominicano, con su salsa espesa de tomate y especias, pide un blanco con cuerpo o un tinto ligero que respete el sofrito.',
        vinosRecomendados: [
          { tipo: 'whites', variedad: 'Chardonnay', vino: 'Santa Rita 120 Chardonnay', bodega: 'Santa Rita', region: 'Valle Central, Chile', compatibilidad: 89, descripcion: 'Chardonnay accesible con fruta tropical que complementa el sofrito' },
          { tipo: 'reds', variedad: 'Pinot Noir', vino: 'Meiomi Pinot Noir', bodega: 'Meiomi', region: 'California, USA', compatibilidad: 86, descripcion: 'Pinot Noir sedoso con cereza que abraza el guiso sin dominarlo' },
          { tipo: 'rose', variedad: 'Rose', vino: 'Gerard Bertrand Cote des Roses Rose', bodega: 'Gerard Bertrand', region: 'Languedoc, Francia', compatibilidad: 84, descripcion: 'Rose aromatico con frescura que acompana el pollo perfectamente' }
        ]
      },
      'pescado al coco': {
        tipo: 'pescado',
        intensidad: 'media',
        proteina: 'pescado',
        consejo: 'El pescado en salsa de coco samanena combina lo marino con la cremosidad tropical. Un blanco aromatico con cuerpo es la eleccion perfecta.',
        vinosRecomendados: [
          { tipo: 'whites', variedad: 'Gewurztraminer', vino: 'Trimbach Gewurztraminer', bodega: 'Trimbach', region: 'Alsacia, Francia', compatibilidad: 93, descripcion: 'Blanco aromatico con notas de lichi que se funde con la leche de coco' },
          { tipo: 'whites', variedad: 'Viognier', vino: 'Concha y Toro Casillero Viognier', bodega: 'Concha y Toro', region: 'Valle Central, Chile', compatibilidad: 90, descripcion: 'Viognier con durazno y flores que complementa la cremosidad del coco' },
          { tipo: 'whites', variedad: 'Sauvignon Blanc', vino: 'Kim Crawford Sauvignon Blanc', bodega: 'Kim Crawford', region: 'Marlborough, Nueva Zelanda', compatibilidad: 87, descripcion: 'Blanco citrico y mineral que realza la frescura del pescado' }
        ]
      },
      'chicharron': {
        tipo: 'frito',
        intensidad: 'alta',
        proteina: 'cerdo',
        consejo: 'El chicharron dominicano crujiente y jugoso necesita burbujas o acidez para cortar la grasa y refrescar el paladar.',
        vinosRecomendados: [
          { tipo: 'sparkling', variedad: 'Cava Brut', vino: 'Segura Viudas Brut Reserva', bodega: 'Segura Viudas', region: 'Penedes, Espana', compatibilidad: 90, descripcion: 'Cava con burbujas persistentes que limpian la grasa del chicharron' },
          { tipo: 'whites', variedad: 'Riesling', vino: 'Dr. Loosen Blue Slate Riesling', bodega: 'Dr. Loosen', region: 'Mosel, Alemania', compatibilidad: 87, descripcion: 'Riesling con acidez vibrante que corta la grasa y refresca' },
          { tipo: 'sparkling', variedad: 'Prosecco', vino: 'La Marca Prosecco', bodega: 'La Marca', region: 'Veneto, Italia', compatibilidad: 85, descripcion: 'Prosecco ligero y festivo, perfecto para picar chicharron' }
        ]
      },
      'asopao': {
        tipo: 'guiso',
        intensidad: 'media',
        proteina: 'pollo',
        consejo: 'El asopao dominicano, caldoso y reconfortante, necesita un vino que acompane sin competir con su sabor delicado de pollo y arroz.',
        vinosRecomendados: [
          { tipo: 'whites', variedad: 'Verdejo', vino: 'Marques de Riscal Verdejo', bodega: 'Marques de Riscal', region: 'Rueda, Espana', compatibilidad: 88, descripcion: 'Blanco herbal y fresco que acompana el caldo sin dominarlo' },
          { tipo: 'whites', variedad: 'Pinot Grigio', vino: 'Santa Margherita Pinot Grigio', bodega: 'Santa Margherita', region: 'Alto Adige, Italia', compatibilidad: 86, descripcion: 'Blanco ligero y mineral perfecto para un asopao reconfortante' },
          { tipo: 'reds', variedad: 'Pinot Noir', vino: 'Montes Alpha Pinot Noir', bodega: 'Montes', region: 'Valle de Casablanca, Chile', compatibilidad: 83, descripcion: 'Tinto ligero con frutos rojos que abraza el caldo del asopao' }
        ]
      },
      'habichuelas con dulce': {
        tipo: 'postre',
        intensidad: 'dulce',
        proteina: 'ninguna',
        consejo: 'Las habichuelas con dulce, tradicion de Semana Santa, piden un vino dulce que acompane la leche de coco, las especias y las galletitas.',
        vinosRecomendados: [
          { tipo: 'dessert', variedad: 'Late Harvest', vino: 'Concha y Toro Late Harvest Sauvignon Blanc', bodega: 'Concha y Toro', region: 'Valle del Maule, Chile', compatibilidad: 93, descripcion: 'Cosecha tardia con miel y frutas que abraza las especias del dulce' },
          { tipo: 'dessert', variedad: 'Moscato', vino: "Castello del Poggio Moscato d'Asti", bodega: 'Castello del Poggio', region: 'Piemonte, Italia', compatibilidad: 91, descripcion: 'Moscato dulce y aromatico con burbujas suaves que complementa la canela' },
          { tipo: 'sparkling', variedad: 'Moscato Espumoso', vino: 'Barefoot Bubbly Moscato', bodega: 'Barefoot', region: 'California, USA', compatibilidad: 89, descripcion: 'Espumoso dulce y festivo que celebra con las habichuelas con dulce' }
        ]
      }
    };
  }

  // Calcular compatibilidad entre un vino y un plato
  calcularCompatibilidad(vino, plato) {
    const platoKey = this.normalizarNombre(plato.nombre);
    const configPlato = this.platosDominicanos[platoKey];

    if (!configPlato) {
      return this.compatibilidadGenerica(vino, plato);
    }

    const vinoRecomendado = configPlato.vinosRecomendados.find(
      v => v.tipo === vino.tipo
    );

    if (vinoRecomendado) {
      return {
        compatibilidad: vinoRecomendado.compatibilidad,
        explicacion: `${vino.nombre} es un excelente maridaje para ${plato.nombre}. ${this.generarExplicacion(vino, plato, vinoRecomendado.compatibilidad)}`,
        recomendacion: vinoRecomendado.variedad,
        nivel: this.obtenerNivelCompatibilidad(vinoRecomendado.compatibilidad)
      };
    }

    return {
      compatibilidad: 60,
      explicacion: `${vino.nombre} puede acompanar ${plato.nombre}, pero hay opciones mas adecuadas.`,
      recomendacion: configPlato.vinosRecomendados[0].variedad,
      nivel: 'media'
    };
  }

  // Compatibilidad generica para platos no dominicanos
  compatibilidadGenerica(vino, plato) {
    let puntuacion = 70;

    const categoriaPlato = this.detectarCategoria(plato);
    const regla = this.reglasMaridaje[categoriaPlato];

    if (regla && regla.vinosIdeales.includes(vino.tipo)) {
      puntuacion = regla.puntuacion;
    }

    return {
      compatibilidad: puntuacion,
      explicacion: this.generarExplicacion(vino, plato, puntuacion),
      recomendacion: regla ? regla.vinosIdeales[0] : 'whites',
      nivel: this.obtenerNivelCompatibilidad(puntuacion)
    };
  }

  // Recomendar vinos para un plato especifico
  recomendarVinosParaPlato(nombrePlato) {
    const platoKey = this.normalizarNombre(nombrePlato);
    const configPlato = this.platosDominicanos[platoKey];

    if (!configPlato) {
      return {
        plato: nombrePlato,
        recomendaciones: [],
        mensaje: 'Plato no encontrado en la base de maridajes dominicanos'
      };
    }

    return {
      plato: nombrePlato,
      tipo: configPlato.tipo,
      intensidad: configPlato.intensidad,
      consejo: configPlato.consejo,
      recomendaciones: configPlato.vinosRecomendados.map(v => ({
        tipo: v.tipo,
        variedad: v.variedad,
        vino: v.vino,
        bodega: v.bodega,
        region: v.region,
        compatibilidad: v.compatibilidad,
        nivel: this.obtenerNivelCompatibilidad(v.compatibilidad),
        descripcion: v.descripcion
      }))
    };
  }

  // Recomendar platos para un vino especifico
  recomendarPlatosParaVino(tipoVino) {
    const platosRecomendados = [];

    for (const [nombrePlato, config] of Object.entries(this.platosDominicanos)) {
      if (nombrePlato === 'locrio') continue; // Evitar duplicado con locrio de pollo
      const vinoCompatible = config.vinosRecomendados.find(v => v.tipo === tipoVino);
      
      if (vinoCompatible) {
        platosRecomendados.push({
          plato: nombrePlato,
          compatibilidad: vinoCompatible.compatibilidad,
          nivel: this.obtenerNivelCompatibilidad(vinoCompatible.compatibilidad),
          tipo: config.tipo,
          intensidad: config.intensidad
        });
      }
    }

    platosRecomendados.sort((a, b) => b.compatibilidad - a.compatibilidad);

    return platosRecomendados;
  }

  // Normalizar nombre de plato
  normalizarNombre(nombre) {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Detectar categoria de un plato basado en sus caracteristicas
  detectarCategoria(plato) {
    const nombre = (typeof plato === 'string' ? plato : plato.nombre || '').toLowerCase();
    const categoria = (typeof plato === 'object' && plato.categoria) ? plato.categoria.toLowerCase() : '';

    if (nombre.includes('carne') || nombre.includes('res') || nombre.includes('chivo') || categoria.includes('beef')) return 'carneRoja';
    if (nombre.includes('pollo') || nombre.includes('chicken') || nombre.includes('pavo')) return 'carneBlanca';
    if (nombre.includes('pescado') || nombre.includes('fish') || nombre.includes('marisco') || nombre.includes('camaron')) return 'pescado';
    if (nombre.includes('postre') || nombre.includes('dessert') || nombre.includes('dulce') || nombre.includes('flan') || nombre.includes('bizcocho')) return 'postre';
    if (nombre.includes('frito') || nombre.includes('fried') || nombre.includes('tostones') || nombre.includes('chicharron')) return 'frito';
    if (nombre.includes('guiso') || nombre.includes('stew') || nombre.includes('guisado') || nombre.includes('sancocho')) return 'guiso';
    if (nombre.includes('queso') || nombre.includes('cheese')) return 'queso';
    if (nombre.includes('picante') || nombre.includes('spicy')) return 'picante';

    return 'carneBlanca';
  }

  // Generar explicacion de maridaje
  generarExplicacion(vino, plato, compatibilidad) {
    if (compatibilidad >= 90) return 'Maridaje excepcional. Los sabores se complementan perfectamente.';
    if (compatibilidad >= 80) return 'Muy buena combinacion. El vino realza los sabores del plato.';
    if (compatibilidad >= 70) return 'Buena opcion. El vino acompana bien el plato.';
    return 'Maridaje aceptable, aunque hay mejores opciones disponibles.';
  }

  // Obtener nivel de compatibilidad textual
  obtenerNivelCompatibilidad(puntuacion) {
    if (puntuacion >= 90) return 'excelente';
    if (puntuacion >= 80) return 'muy buena';
    if (puntuacion >= 70) return 'buena';
    if (puntuacion >= 60) return 'aceptable';
    return 'baja';
  }

  // Obtener todos los platos dominicanos disponibles
  obtenerPlatosDominicanos() {
    return Object.keys(this.platosDominicanos)
      .filter(key => key !== 'locrio') // Evitar duplicado
      .map(key => ({
        id: key,
        nombre: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
        tipo: this.platosDominicanos[key].tipo,
        intensidad: this.platosDominicanos[key].intensidad
      }));
  }
}

module.exports = new MaridajeEngine();

